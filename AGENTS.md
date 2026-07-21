# AGENTS.md — WonderQuest (fctp)

> **阅读时间：5分钟。** 这是你接手这个项目需要的全部上下文。
> **最后更新：2026-07-21 18:00 CST。** 任何重大变更后必须更新此文件。

---

## 🎯 这是什么项目

**WonderQuest** — 外国人来华旅游指南网站。

| 项目 | 信息 |
|------|------|
| 线上地址 | wonderquest.xyz |
| 域名注册 | Spaceship |
| 部署平台 | Vercel |
| 部署方式 | Git push master → Vercel 自动构建 ✅ (验证通过 2026-07-03) |
| 仓库 | github.com/AnquinFox/fctp |
| 技术栈 | Astro 5 (SSG 静态生成) |
| 产品负责人 | Anquin (老板 / Boss) |
| 内容创作者 | Fire (独立写手，不碰代码) |

---

## 📂 项目结构

```
fctp/
├── AGENTS.md                          ← 你正在读的文件
├── astro.config.mjs                   ← Astro 配置
├── package.json                       ← 依赖列表
├── vercel.json                        ← Vercel 部署配置
├── src/
│   ├── pages/
│   │   ├── index.astro                ← 首页：「双面中国」三区块滚动叙事
│   │   ├── guides.astro               ← 攻略列表页 (双语筛选)
│   │   ├── guides/[city].astro        ← 城市分类页
│   │   ├── guides/[...slug].astro     ← 单篇攻略页 (含排版系统)
│   │   ├── privacy.astro              ← Privacy Policy 页面 (/privacy)
│   │   └── seo/                       ← SEO 落地页 (3页)
│   ├── components/
│   │   ├── PrepSection.astro          ← 首页 Section 1: 极简准备区
│   │   ├── FuturisticSection.astro    ← 首页 Section 2: 科幻UI城市
│   │   └── TraditionalSection.astro   ← 首页 Section 3: 羊皮纸传统
│   ├── layouts/
│   │   └── BaseLayout.astro           ← 全局布局 (含 header/footer)
│   └── content/
│       ├── config.ts                  ← Content Collection 配置
│       └── guides/                    ← 所有攻略 Markdown (共91篇, 58个目录 → 155页)
│           ├── shanghai/              ← 上海 (10篇) — 最大城市目录
│           ├── beijing/               ← 北京 (4篇)
│           ├── chongqing/             ← 重庆 (3篇)
│           ├── chengdu/               ← 成都 (3篇)
│           ├── foreigners/            ← 来华实用信息 (10篇)
│           ├── zhangjiajie/           ← 张家界 (3篇)
│           ├── ... (完整列表: 58个城市/景区目录)
│           └── 具体列表见 npm run build 输出
├── scripts/
│   ├── populate-meta.mjs              ← 自动提取封面+标签元数据
│   └── sync-all.mjs                   ← 批量同步 wonder-quest → fctp
└── public/
    └── images/                        ← 攻略用图片 (58个城市图片目录)
```

---

## 🔄 内容生产流水线

**核心原则：Fire 只管写内容，不需要关心网站怎么工作。**

```
E:\AIProject_Common\wonder-quest\     ← Fire 的工作区（真相来源）
├── guides/                            ← Fire 写 MD 攻略
│   └── {city}/{slug}.md
├── images/                            ← Fire 放图片
│   └── {city}/xxx.jpg

        ↓ 手动同步（这是你的工作）

E:\AIProject_Common\fctp\             ← 网站项目
├── src/content/guides/                ← 攻略 MD 从 wonder-quest 复制过来
│   └── {city}/{slug}.md
└── public/images/                     ← 图片物理复制过来
    └── {city}/xxx.jpg

        ↓ git commit + push

Vercel 自动构建 → wonderquest.xyz 上线
```

### 新攻略上线的 SOP

1. Fire 在 `wonder-quest/guides/{city}/` 写好 `.md`
2. Fire 把图片放到 `wonder-quest/images/{city}/`
3. **你**把 MD 拖进 `fctp/src/content/guides/{city}/`
4. **你**把图片复制到 `fctp/public/images/{city}/`
5. ⚠️ **必跑** `node scripts/populate-meta.mjs` — 自动生成所有攻略的封面和标签元数据（如果内容创作者不写 frontmatter，跳过这步线上就没有封面和标签）
6. `git add -A` → `git commit -m "feat: add {city} guide"` → `git push origin master`
7. Vercel 自动构建，1-2 分钟后线上可见

### 图片引用规范

- 攻略 MD 里的图片路径：`![alt](/images/shanghai/xxx.jpg)`
- 以 `/images/` 开头 → Astro 从 `public/images/` 提供
- ⚠️ **不要用相对路径，不要用 `./` 开头**
- ⚠️ **Linux 大小写敏感**：确认文件名大小写与 MD 引用完全一致

### ⚠️ 常见坑

| 问题 | 原因 | 解决 |
|------|------|------|
| 新攻略上线后 404 | Content Collection schema 字段不匹配 | 检查 `src/content/config.ts`，确保新 MD 的 frontmatter 字段在 schema 里 |
| 图片 404 | 图片没复制到 `public/images/` | 每加新图都要物理复制到 fctp |
| Windows Junction 不能用 | Vercel 是 Linux，不支持 Junction | 部署前图片必须物理存在 |
| 中文攻略不显示 | frontmatter 里 `lang` 字段写错了 | 必须是 `zh` 或 `en` |

---

## 🎨 首页设计：双面中国

首页是一个**三区块滚动叙事**，不是简单的链接列表。

```
┌─────────────────────────────┐
│  HERO                       │
│  "China. Two Sides."        │
│  Scroll ↓                   │
├─────────────────────────────┤
│  Section 1: PrepSection     │  极简准备区
│  黑白配色，6件事             │  Visa, eSIM, Payment, VPN,
│                             │  Transport, Language
├─────────────────────────────┤
│  Section 2: Futuristic      │  科幻 UI (v2: 6城市)
│  城市节点 + 坐标 + 数据      │  Shanghai, Beijing,
│  AI 生成封面图               │  Chongqing, Chengdu,
│  暗色背景 + 霓虹线条         │  Xi'an, Guangzhou
├─────────────────────────────┤
│  Section 3: Traditional     │  羊皮纸风格
│  古城/景区角标 + 暖色调       │  对应城市的传统/自然一面
└─────────────────────────────┘
```

**设计决策**：首页不直接列攻略链接。它讲一个故事——"中国有两面：未来和传统"。每个城市节点点击后进入 `/guides` 列表页。

**v2 更新 (2026-07-08)**：FuturisticSection 扩展到6城市，全部使用 AI 生成的城市封面图，Beijing 替换 Shenzhen。

---

## 📝 攻略 Content Collection Schema

在 `src/content/config.ts` 中定义。每篇攻略的 frontmatter：

```yaml
title: "攻略标题"
description: "短描述"
pubDate: 2026-07-01
city: "shanghai"
lang: "zh"          # zh 或 en
tags: ["food", "culture"]
image: "/images/shanghai/bund.jpg"  # 封面图
readingTime: "8 min"
```

⚠️ **Schema 是强类型的**。如果 frontmatter 多了或少了一个字段，构建会报错。

---

## 🌐 双语策略

- 每篇中文攻略都有对应的英文版
- 中文：`{slug}.md`，英文：`{slug}-en.md` 或独立 slug
- 文件名区分：中文用 `_zh` 后缀或中文标题，英文直接 city-days-theme 格式
- 列表页 (`guides.astro`) 支持筛选：All / 中文 / English

---

## 🔗 Affiliate 变现

| 平台 | 状态 | 链接位置 |
|------|------|---------|
| Trip.com | ✅ 已嵌入 | 上海攻略文末住宿建议段 |
| NordVPN | ✅ 已嵌入 | internet-vpn 攻略 |
| Klook | 🔴 待注册 | 待定 |

- Affiliate 链接以自然推荐形式嵌入，不做硬广告
- 写法原则：给真正的建议，链接是可选的增值

---

## 📈 SEO & 分析

### SEO Landing Pages（3页）

纯静态 SEO 落地页，目标英文搜索流量：

| 页面 | 路径 | 目标关键词 |
|------|------|-----------|
| Ultimate China Travel Guide | `/seo/ultimate-china-travel-guide/` | china travel guide, china trip planning |
| China VPN & eSIM Guide | `/seo/china-vpn-esim-guide/` | china vpn, china esim |
| First Time in China | `/seo/first-time-in-china/` | first time in china, china survival guide |

- 每页含结构化数据 (JSON-LD Schema)
- hreflang 自动检测（根据攻略语言标识）

### 分析统计

- **Plausible Analytics**: 隐私友好的网站统计
- 脚本: `<script defer data-domain="wonderquest.xyz" src="https://plausible.io/js/script.js">`
- 注入位置: `src/layouts/BaseLayout.astro`

### Sitemap

- `@astrojs/sitemap` 自动生成 `sitemap-index.xml` 到 `dist/`
- 所有静态路由自动收录

---

## ⚙️ 技术架构与运维

> **这一章是给 AI agent 的。老板不懂技术，所有技术操作都是 agent 完成。**
> **如果你的开发者不是马督工，这一章是你活下来的全部知识。**

### 整体架构图

```
[Fire 写 MD]                   [Anquin 审批]
      ↓                              ↓
wonder-quest/guides/           OpenclawWorkspace/
(内容源，不参与构建)              wonderquest-roadmap.md
                                       ↓
      手动同步 ────────────→  马督工 (AI agent)
                                       ↓
                              fctp/  ← 这是你 / 新 agent 的操作目标
                                   ↓
                              npm run build
                                   ↓
                              dist/ (纯静态 HTML)
                                   ↓
                              git push origin master
                                   ↓
                              Vercel 自动构建 + 部署
                                   ↓
                              wonderquest.xyz
```

### 技术栈详情 (为什么选这些)

| 层 | 技术 | 选型理由 |
|----|------|---------|
| 框架 | Astro ^5.7.0 | 静态站最佳选择，默认 zero JS，build 输出纯 HTML |
| 构建模式 | SSG (Static Site Generation) | 纯内容站不需要 SSR，静态最快、最安全 |
| 内容管理 | Content Collections (Markdown) | Fire 只需要会写 MD，不需要学任何 CMS |
| 样式方案 | 纯 CSS (组件级 scoped) | 无框架依赖，简单可控，bundle 极小 |
| 部署平台 | Vercel (Hobby 免费计划) | 免费，Git push 自动构建，全球 CDN，SSL 自动 |
| 域名 | Spaceship 注册 + Cloudflare DNS | 独立注册商，不绑定部署平台，方便迁移 |
| 版本控制 | Git + GitHub | github.com/AnquinFox/fctp |
| 包管理 | npm | Node 生态标配 |
| 类型检查 | astro check (TypeScript 5.7) | 构建前类型检查，0 errors 要求 |
| 站点地图 | @astrojs/sitemap ^3.7.3 | 自动生成 sitemap-index.xml |
| 编码处理 | iconv-lite ^0.7.3 | 处理 GBK 编码的 MD 文件 |
| Frontmatter | gray-matter ^4.0.3 | scripts/populate-meta.mjs 依赖 |

### 本地开发环境 (从头搭建)

**前置条件：**
- Windows 10/11 x64
- Node.js >= 18.x (当前项目使用)
- Git for Windows (已安装)
- GitHub 账号: AnquinFox

**完整设置流程：**

```bash
# 1. 确保在正确的工作目录
cd E:\AIProject_Common\fctp

# 2. 安装依赖 (首次或 package.json 有变化时)
npm install
# → 此命令读取 package.json，下载所有依赖到 node_modules/
# → 正常输出：added XXX packages in Xs
# → 错误处理：如报 network error，重试 npm install

# 3. 启动本地开发服务器
npm run dev
# → 浏览器打开 http://localhost:4321
# → 热更新 (HMR)：修改代码 → 浏览器自动刷新
# → Ctrl+C 停止

# 4. 生产构建 (上线前必须跑)
npm run build
# → Astro 编译所有 .astro 文件 → 生成纯 HTML/CSS 到 dist/
# → 必须 0 errors！有 warning 最好也修掉
# → 同时检查 Content Collection schema 校验
# → 成功输出示例：
#   18:02:09 [build] 153 page(s) built in 1.31s
#   18:02:09 [build] Complete!

# 5. 本地预览生产构建 (验证 build 产物)
npm run preview
# → 启动一个本地服务器，提供 dist/ 目录内容
# → 相当于在本地模拟线上环境
# → 用于最终确认所有页面正常
```

### Git 与部署 (完整流程)

**从修改到上线，每一步都写清楚了：**

```bash
# === Step 0: 确认你在正确的目录 ===
cd E:\AIProject_Common\fctp

# === Step 1: 查看当前状态 ===
git status
# → 红色文件 = 修改了但还没 staged
# → 绿色文件 = staged，准备 commit
# → 如果没有任何改动，输出 "nothing to commit, working tree clean"

# === Step 2: 构建验证 (上线前必须跑) ===
npm run build
# → 如果报错，修复后再继续。永远不要 push 有构建错误的代码。

# === Step 3: 添加所有改动 ===
git add -A
# → -A 表示添加所有改动 (新增 + 修改 + 删除)
# → 如果只想添加特定文件: git add src/content/guides/shanghai/new.md

# === Step 4: 提交 ===
git commit -m "描述你做了什么"
# → commit message 用英文，简洁明了
# → 格式参考:
#   feat: add Shanghai 3-day food tour guide
#   fix: broken city card links on homepage
#   chore: update AGENTS.md with tech details
#   style: adjust hero section spacing

# === Step 5: 推送上线 ===
git push origin master
# → 这条命令之后，Vercel 自动开始构建
# → 浏览器打开 vercel.com 查看构建进度
```

**push 之后发生了什么？**

```
你的电脑                    GitHub                     Vercel
   │                          │                          │
   ├─ git push ──────────────→│                          │
   │                          ├─ webhook ───────────────→│
   │                          │                          ├─ 拉取代码
   │                          │                          ├─ npm install
   │                          │                          ├─ npm run build
   │                          │                          ├─ 构建成功？
   │                          │                          │   ├─ YES → 部署到 CDN
   │                          │                          │   └─ NO  → 保留旧版本
   │                          │                          ├─ 发通知 (可选)
```

**关键事实：**
- Vercel 和 GitHub 是通过 GitHub Integration 连接的 (不是 Webhook，是更深的集成)
- 每次 push 到 master 分支 → Vercel 自动构建
- 构建失败 → 线上仍然是上一个成功版本，**不会挂掉**
- 整个流程约 1-2 分钟
- 可以在 vercel.com 实时查看构建日志

### 分支策略

- **主分支：`master`** — 直接在上面工作 (单人项目，不需要 PR)
- **大改动可以建分支：**
  ```bash
  git checkout -b redesign          # 创建并切换到新分支
  # ... 做改动 ...
  git push origin redesign          # 推送分支
  # 在 GitHub 上合并到 master
  ```
- **Vercel 预览部署**：推送到非 master 分支 → Vercel 生成预览 URL (如 redesign-fctp.vercel.app)

### 怎么回滚 (出问题了怎么办)

```bash
# 方案 1: 回退到上一个版本 (最安全)
git revert HEAD                    # 创建一个新 commit 来撤销上一个 commit
git push origin master             # 推送撤销

# 方案 2: 回退到特定版本
git log --oneline                  # 查看历史，找到你要回退到哪个 commit
# 输出示例:
#   f7d1212 feat: restore homepage
#   836320a feat: add Trip.com link
#   f01b248 chore: add AGENTS.md
git revert 836320a                 # 撤销指定的 commit
git push origin master

# 方案 3: Vercel 后台直接回滚 (最快)
# 1. 打开 vercel.com → fctp → Deployments
# 2. 找到上一个成功的部署
# 3. 点击 "..." → "Promote to Production"
# 4. 立即生效，不需要改代码
```

### Vercel 后台 (怎么访问和操作)

| 操作 | 怎么做 |
|------|--------|
| 登录 | vercel.com → 用 AnquinFox 的 GitHub 账号登录 |
| 查看项目 | Dashboard → fctp |
| 查看部署历史 | fctp → Deployments |
| 查看构建日志 | 点击某个部署 → 看 Build Logs |
| 手动重新部署 | Deployments → 点击 "Redeploy" |
| 回滚 | 找到老版本 → "..." → Promote to Production |
| 查看域名配置 | Settings → Domains |
| 查看环境变量 | Settings → Environment Variables |
| 查看用量 | Settings → Usage (免费计划 100GB 带宽/月) |

**vercel.json 内容 (项目根目录)：**
```json
{
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### 域名 & DNS (完整配置)

**当前配置链：**
```
用户浏览器
    ↓ DNS 查询
Cloudflare (DNS 管理)
    ↓ A 记录: wonderquest.xyz → Vercel IP (76.76.21.21)
    ↓ CNAME: www.wonderquest.xyz → cname.vercel-dns.com
Vercel (接收请求 → 返回静态文件)
```

**域名信息：**

| 配置项 | 值 | 在哪改 |
|--------|-----|--------|
| 注册商 | Spaceship | spaceship.com |
| DNS 托管 | Cloudflare | dash.cloudflare.com |
| A 记录 | wonderquest.xyz → 76.76.21.21 | Cloudflare DNS 面板 |
| CNAME | www → cname.vercel-dns.com | Cloudflare DNS 面板 |
| SSL | Vercel 自动管理 (Let's Encrypt) | 无需手动操作 |
| NS 服务器 | Cloudflare 的 NS | Spaceship 域名管理面板 |

⚠️ **DNS 操作风险等级：**
- 🟢 **改 A 记录 / CNAME** → 低风险，几分钟生效
- 🟡 **改 NS 服务器** → 中风险，DNS 传播最长 48 小时，期间可能间歇性不可访问
- 🔴 **转移域名注册商** → 高风险，有 60 天锁定限制，可能导致停机

**原则：除非有明确收益，否则不要动 DNS。**

### 图片同步 (完整说明)

**问题背景：** 图片源在 `wonder-quest/images/`，但网站需要从 `fctp/public/images/` 提供。两张皮。

**为什么不用软链接 / Junction？**
```
Windows NTFS Junction 原理:
  fctp/public/images/ → (Junction) → wonder-quest/images/
  看起来像一个真实目录，实际是指向源目录的"快捷方式"

本地开发: ✅ 可以工作，Astro dev server 能跟踪过去
Vercel 构建: ❌ Vercel 是 Linux，不认识 Windows Junction
  → 构建时 public/images/ 为空
  → 所有图片引用返回 404
  → 线上网站所有图片不显示
```

**正确做法 (唯一可行方案)：**

```bash
# 每次 Fire 加了新图片后，物理复制到 fctp
# 方式 1: 命令行
xcopy E:\AIProject_Common\wonder-quest\images\* E:\AIProject_Common\fctp\public\images\ /E /Y

# 方式 2: Windows 资源管理器
# 打开两个窗口 → 拖拽复制 → 选择"覆盖"

# 方式 3: 只复制新增的图片 (如果图很多)
robocopy E:\AIProject_Common\wonder-quest\images E:\AIProject_Common\fctp\public\images /MIR
```

**什么时候需要同步图片：**
- ✅ Fire 为新攻略添加了图片 → 必须复制
- ✅ Fire 替换了旧图 → 复制覆盖
- ✅ Fire 新增了城市 → 新建目录 + 复制图片
- ❌ 只修改 MD 文字 → 不需要
- ❌ 只改样式/布局 → 不需要

### 构建故障排查手册

| 错误信息 | 原因分析 | 解决步骤 |
|---------|---------|---------|
| `Module not found: xxx` | 删了文件但其他地方还在 import | `grep -r "import.*xxx" src/` 找到引用，更新或删除 |
| `frontmatter does not match schema` | MD 文件头部字段与 config.ts 不一致 | 1) 打开报错的 .md 2) 检查 frontmatter 字段 3) 对比 `src/content/config.ts` 的 schema |
| `astro:content collection "guides" not found` | MD 放在了错误的目录 | 确认路径是 `src/content/guides/{city}/{slug}.md` |
| 图片本地正常，线上 404 | 文件名大小写不一致 | Linux 区分大小写，`Bund.jpg` ≠ `bund.jpg` |
| `JavaScript heap out of memory` | Vercel 免费计划内存 1GB 不够 | 压缩超大图片 (>5MB → <1MB)，移除未使用的图片 |
| 构建超时 (超过 45s) | 图片太多或太大 | 压缩图片，删除 `public/images/` 中不再使用的旧图 |
| `Error: 404 at /guides/xxx` | 攻略列表页链接指向不存在的 slug | 检查 MD 文件名是否与列表中的链接一致 |

### 新增城市 (完整 Checklist)

当 Fire 写了一个新城市的内容 (如成都)：

```
□ 1. 创建城市目录
     fctp/src/content/guides/chengdu/

□ 2. 创建图片目录
     fctp/public/images/chengdu/

□ 3. 同步攻略 MD
     从 wonder-quest/guides/chengdu/*.md → fctp/src/content/guides/chengdu/

□ 4. 同步图片
     从 wonder-quest/images/chengdu/* → fctp/public/images/chengdu/

□ 5. 检查首页组件是否需要更新
     src/components/FuturisticSection.astro (城市节点)
     src/components/TraditionalSection.astro (传统对应)

□ 6. 检查攻略列表页
     src/pages/guides.astro (语言筛选逻辑)

□ 7. 构建验证
     npm run build → 0 errors

□ 8. 提交上线
     git add -A → git commit → git push origin master
```

### 环境变量

当前项目**没有任何环境变量**。

如果未来需要 (如第三方 API key)：

**本地开发：** 在 `fctp/` 根目录创建 `.env` 文件
```bash
# .env (不要 commit 到 Git！)
API_KEY=sk-xxxxx
```

**线上：** Vercel Dashboard → fctp → Settings → Environment Variables
- Key: `API_KEY`
- Value: `sk-xxxxx`
- 选择环境: Production, Preview, Development (全选)

⚠️ `.env` 文件必须在 `.gitignore` 中，确保不会意外提交到 GitHub。

### 依赖管理

```bash
# 查看当前依赖
npm list --depth=0

# 安装新依赖
npm install package-name

# 更新依赖 (谨慎，可能引入 breaking changes)
npm update

# 如果 node_modules 出问题，完全重装
rm -r node_modules package-lock.json
npm install
```

**当前核心依赖 (见 package.json，实际安装版本以 npm list 为准)：**

```json
{
  "dependencies": {
    "@astrojs/check": "^0.9.4",
    "@astrojs/sitemap": "^3.7.3",
    "astro": "^5.7.0",
    "iconv-lite": "^0.7.3",
    "typescript": "^5.7.0"
  },
  "devDependencies": {
    "gray-matter": "^4.0.3"
  }
}
```

> 实际安装版本 (npm list 2026-07-17):
> - `@astrojs/check@0.9.9` | `@astrojs/sitemap@3.7.3` | `astro@5.18.2` | `gray-matter@4.0.3` | `iconv-lite@0.7.3` | `typescript@5.9.3`

---

## 🚀 关键决策记录

| 日期 | 决策 | 理由 |
|------|------|------|
| 2026-07-01 | Astro 5 静态生成 | 纯内容站不需要 SSR，静态最快 |
| 2026-07-01 | Content Collections 而非 CMS | 简单，Fire 只需要会写 MD |
| 2026-07-01 | homepage 三区块叙事而非卡片列表 | 制造 "wow moment"，不是 another travel blog |
| 2026-07-01 | MD 文档做任务计划，不做网页 | 计划表追踪进度，不是展示。MD 满足需求 |
| 2026-07-03 | 图片物理复制而非 Junction | Vercel Linux 不支持 Windows Junction |
| 2026-07-03 | BaseLayout 加 noHeader/noFooter props | 首页需要独立的全屏体验 |
| 2026-07-07 | 大规模城市攻略扩展 (20+城市) | 内容密度 = SEO 竞争力 |
| 2026-07-08 | 景区独立攻略 (20篇景点深度) | 长尾关键词覆盖，与城市攻略互补 |
| 2026-07-08 | FuturisticSection v2: AI 封面 + 6城市 | 首页视觉升级，6城比4城更有代表性 |
| 2026-07-09 | SEO 落地页 (3页) + Plausible Analytics | 开始做英文搜索流量获取 |
| 2026-07-09 | NordVPN affiliate 链接 | 第二个变现渠道，与 VPN 攻略自然契合 |
| 2026-07-11 | Privacy Policy 页面 (/privacy) | 合规要求，Trip.com/Airalo 等 affiliate 项目需要 |

---

## ❌ 不要做的事情

1. **不要改 Content Collection schema** — 除非 Fire 需要新字段，改了必须通知所有相关方
2. **不要删攻略** — 除非老板明确说
3. **不要在 wonder-quest 目录里直接编辑 fctp 的内容** — 两个目录是分离的
4. **不要用相对路径引用图片** — 永远用 `/images/...`
5. **不要改首页设计方向** — 「双面中国」是老板确认的核心方向
6. **不要在没检查构建的情况下 push** — 先 `npm run build`，0 errors 再 push
7. **不要动 DNS 配置** — 除非有明确的、讨论过的收益
8. **不要 commit .env 文件** — API key 泄露后果严重
9. **不要跳过 populate-meta.mjs** — Fire 不写 frontmatter，跳过导致封面/标签丢失
10. **不要添加大型依赖** — 保持 bundle 小，构建快。装新包前质疑必要性

---

## 🤝 相关资源

| 资源 | 位置 |
|------|------|
| 任务计划表 | `E:\AIProject_Common\OpenclawWorkspace-madugong\wonderquest-roadmap.md` |
| 产品决策记录 | `E:\AIProject_Common\OpenclawWorkspace-madugong\MEMORY.md` |
| 内容源 | `E:\AIProject_Common\wonder-quest\` |
| GitHub 仓库 | github.com/AnquinFox/fctp |
| Vercel 后台 | vercel.com (AnquinFox 账号) |
| Cloudflare DNS | dash.cloudflare.com |

---

_此文件由马督工维护。每两天自动审查一次 (定时任务 18:00 CST)。_
_上一次审查: 2026-07-21 — 91篇, 155页, 依赖版本无变化, 构建 0 错误。_
_AI agent 接手这个项目时，请先完整阅读此文件 (5分钟)，然后检查 wonderquest-roadmap.md 了解当前进度。_

# AGENTS.md — WonderQuest (fctp)

> **阅读时间：3分钟。** 这是你接手这个项目需要的全部上下文。

---

## 🎯 这是什么项目

**WonderQuest** — 外国人来华旅游指南网站。

| 项目 | 信息 |
|------|------|
| 线上地址 | wonderquest.xyz |
| 域名注册 | Spaceship |
| 部署平台 | Vercel |
| 部署方式 | Git push master → Vercel 自动构建 |
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
│   │   └── guides/[...slug].astro     ← 单篇攻略页 (含排版系统)
│   ├── components/
│   │   ├── PrepSection.astro          ← 首页 Section 1: 极简准备区
│   │   ├── FuturisticSection.astro    ← 首页 Section 2: 科幻UI城市
│   │   └── TraditionalSection.astro   ← 首页 Section 3: 羊皮纸传统
│   ├── layouts/
│   │   └── BaseLayout.astro           ← 全局布局 (含 header/footer)
│   └── content/
│       ├── config.ts                  ← Content Collection 配置
│       └── guides/                    ← 所有攻略 Markdown
│           ├── shanghai/              ← 上海 (5中+5英=10篇)
│           ├── beijing/               ← 北京 (1中+1英=2篇)
│           ├── chongqing/             ← 重庆 (1中+1英=2篇)
│           └── xian/                  ← 西安 (待创建)
└── public/
    └── images/                        ← 攻略用图片 (含旧图 + Fire 同步过来的新图)
        ├── shanghai/
        ├── beijing/
        ├── chongqing/
        ├── xian/
        └── general/
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
5. `git add` → `git commit` → `git push origin master`
6. Vercel 自动构建，2分钟后线上可见

### 图片引用规范

- 攻略 MD 里的图片路径：`![alt](/images/shanghai/xxx.jpg)`
- 以 `/images/` 开头 → Astro 从 `public/images/` 提供
- ⚠️ **不要用相对路径，不要用 `./` 开头**

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
│  Section 2: Futuristic      │  科幻 UI
│  城市节点 + 坐标 + 数据      │  Shanghai, Beijing, 
│  暗色背景 + 霓虹线条         │  Chongqing, Xi'an
├─────────────────────────────┤
│  Section 3: Traditional     │  羊皮纸风格
│  古城角标 + 暖色调           │  对应城市的传统一面
└─────────────────────────────┘
```

**设计决策**：首页不直接列攻略链接。它讲一个故事——"中国有两面：未来和传统"。每个城市节点点击后进入 `/guides` 列表页。

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
| Klook | 🔴 待注册 | 待定 |

- Affiliate 链接以自然推荐形式嵌入，不做硬广告
- 写法原则：给真正的建议，链接是可选的增值

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

---

## 🛠 常用命令

```bash
# 本地开发
cd E:\AIProject_Common\fctp
npm run dev          # 启动 dev server，localhost:4321

# 构建检查
npm run build        # 生产构建，所有错误会在这里暴露

# 部署
git add -A
git commit -m "描述"
git push origin master   # Vercel 自动部署
```

---

## ❌ 不要做的事情

1. **不要改 Content Collection schema** — 除非 Fire 需要新字段
2. **不要删攻略** — 除非老板明确说
3. **不要在 wonder-quest 目录里直接编辑 fctp 的内容** — 两个目录是分离的
4. **不要用相对路径引用图片** — 永远用 `/images/...`
5. **不要改首页设计方向** — 「双面中国」是老板确认的核心方向
6. **不要在没检查构建的情况下 push** — 先 `npm run build`，0 errors 再 push

---

## 🤝 相关资源

| 资源 | 位置 |
|------|------|
| 任务计划表 | `E:\AIProject_Common\OpenclawWorkspace-madugong\wonderquest-roadmap.md` |
| 产品决策记录 | `E:\AIProject_Common\OpenclawWorkspace-madugong\MEMORY.md` |
| 内容源 | `E:\AIProject_Common\wonder-quest\` |
| GitHub 仓库 | github.com/AnquinFox/fctp |

---

_最后更新：2026-07-03。任何重大变更后请更新此文件。_

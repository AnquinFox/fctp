import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const guidesDir = join(__dirname, '..', 'src', 'content', 'guides');

// === CONFIG: Slug mappings for all guides ===
const slugMap = {
  // Beijing - Chinese
  '01_北京4日游_皇城根下的时间切面.md': 'beijing-4-day-imperial',
  // Beijing - English
  '01_Beijing_4Day_Travel_Guide.md': 'beijing-4-day-travel-guide',
  // Chongqing - Chinese
  '01_重庆3日游_跟着本地人走.md': 'chongqing-3-day-local',
  // Chongqing - English
  '01_Chongqing_3Day_Travel_Guide.md': 'chongqing-3-day-travel-guide',
  // Chengdu - English AI
  '01_Chengdu_3Day_AI_Visual_Story.md': 'chengdu-3-day-ai-visual-story',
  // Hangzhou - English AI
  '01_Hangzhou_3Day_AI_Visual_Story.md': 'hangzhou-3-day-ai-visual-story',
  // Xi'an - English AI
  '01_Xian_3Day_AI_Visual_Story.md': 'xian-3-day-ai-visual-story',
  // Shanghai - Chinese
  '01_上海3日游_一个过来人的碎碎念.md': 'shanghai-3-day-casual',
  '01_上海经典3日游攻略.md': 'shanghai-classic-3-day',
  '02_上海必游景点TOP15排名.md': 'shanghai-top-15-must-see',
  '03_上海深度全攻略_景点详解.md': 'shanghai-deep-dive',
  '04_上海三天两夜_本地朋友私藏路线.md': 'shanghai-local-hidden-gems',
  // Shanghai - English
  '01_Shanghai_3Day_A_Prose.md': 'shanghai-3-day-honest-ramblings',
  '01_Shanghai_Classic_3Day_Itinerary.md': 'shanghai-classic-3-day-itinerary',
  '02_Shanghai_Top15_Attractions.md': 'shanghai-top-15-attractions',
  '03_Shanghai_Deep_Dive_Guide.md': 'shanghai-deep-dive-guide',
  '04_Shanghai_3Day_Local_Tips.md': 'shanghai-3d2n-insider-route',
};

// Title extraction from content
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  if (!match) return 'Untitled';
  return match[1].replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}]\s*/u, '').trim();
}

// Extract duration from title
function extractDuration(title) {
  const patterns = [
    /(\d+)\s*天\s*\d*\s*夜/,
    /(\d+)\s*Days?\s*\d*\s*Nights?/i,
    /(\d+)\s*天/,
    /(\d+)\s*Days?/i,
  ];
  for (const p of patterns) {
    const m = title.match(p);
    if (m) return m[0];
  }
  return '';
}

// Restore frontmatter for English files that lost it (Fire's encoding fix)
function restoreEnglishFrontmatter(cityDir, rawFile, slug) {
  const filePath = join(cityDir, rawFile);
  if (!existsSync(filePath)) return false;
  
  const content = readFileSync(filePath, 'utf-8');
  
  // Check if frontmatter already exists
  if (content.startsWith('---')) {
    console.log(`  SKIP (has frontmatter): ${rawFile}`);
    return false;
  }
  
  const title = extractTitle(content);
  const duration = extractDuration(title);
  
  const frontmatter = {
    title,
    pageSlug: slug,
    city: cityDir.split('\\').pop(),
    country: 'china',
    tags: [],
    draft: false,
  };
  if (duration) frontmatter.duration = duration;
  
  const body = content.replace(/^#\s+.+\n/, '').trim();
  const updated = matter.stringify(body, frontmatter);
  writeFileSync(filePath, updated, 'utf-8');
  console.log(`  RESTORED frontmatter: ${rawFile} → ${slug}`);
  return true;
}

// Create processed file from raw file
function createProcessedFile(cityDir, rawFile, slug) {
  const rawPath = join(cityDir, rawFile);
  if (!existsSync(rawPath)) {
    console.log(`  MISSING: ${rawFile}`);
    return false;
  }
  
  const content = readFileSync(rawPath, 'utf-8');
  const title = extractTitle(content);
  const duration = extractDuration(title);
  const city = cityDir.split('\\').pop();
  
  // Remove first heading line for body
  const body = content.replace(/^#\s+.+\n/, '').trim();
  
  const frontmatter = {
    title,
    pageSlug: slug,
    city,
    country: 'china',
    tags: [],
    draft: false,
  };
  if (duration) frontmatter.duration = duration;
  
  const slugPath = join(cityDir, `${slug}.md`);
  const updated = matter.stringify(body, frontmatter);
  writeFileSync(slugPath, updated, 'utf-8');
  console.log(`  CREATED: ${slug}.md ← ${rawFile}`);
  return true;
}

// Fix image paths (Fire changed /images/ to ../../images/)
function fixImagePaths(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const old = content;
  content = content.replace(/\]\(\.\.\/\.\.\/images\//g, '](/images/');
  if (content !== old) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`  FIXED paths: ${filePath.split('\\').pop()}`);
  }
}

// === MAIN ===

// Step 1: Restore frontmatter for modified English files
console.log('\n=== Step 1: Restore English frontmatter ===');
const modifiedFiles = [
  { city: 'beijing', file: '01_Beijing_4Day_Travel_Guide.md', slug: 'beijing-4-day-travel-guide' },
  { city: 'chongqing', file: '01_Chongqing_3Day_Travel_Guide.md', slug: 'chongqing-3-day-travel-guide' },
  { city: 'shanghai', file: '01_Shanghai_3Day_A_Prose.md', slug: 'shanghai-3-day-honest-ramblings' },
  { city: 'shanghai', file: '01_Shanghai_Classic_3Day_Itinerary.md', slug: 'shanghai-classic-3-day-itinerary' },
  { city: 'shanghai', file: '02_Shanghai_Top15_Attractions.md', slug: 'shanghai-top-15-attractions' },
  { city: 'shanghai', file: '03_Shanghai_Deep_Dive_Guide.md', slug: 'shanghai-deep-dive-guide' },
  { city: 'shanghai', file: '04_Shanghai_3Day_Local_Tips.md', slug: 'shanghai-3d2n-insider-route' },
];

for (const { city, file, slug } of modifiedFiles) {
  restoreEnglishFrontmatter(join(guidesDir, city), file, slug);
}

// Step 2: Create processed files for new city guides (chengdu, hangzhou, xian)
console.log('\n=== Step 2: Create new city processed files ===');
const newCityFiles = [
  { city: 'chengdu', file: '01_Chengdu_3Day_AI_Visual_Story.md', slug: 'chengdu-3-day-ai-visual-story' },
  { city: 'hangzhou', file: '01_Hangzhou_3Day_AI_Visual_Story.md', slug: 'hangzhou-3-day-ai-visual-story' },
  { city: 'xian', file: '01_Xian_3Day_AI_Visual_Story.md', slug: 'xian-3-day-ai-visual-story' },
];

for (const { city, file, slug } of newCityFiles) {
  createProcessedFile(join(guidesDir, city), file, slug);
}

// Step 3: Restore/create Chinese processed files that already exist but need update
console.log('\n=== Step 3: Update Chinese processed files ===');
const chineseMappings = [
  { city: 'beijing', file: '01_北京4日游_皇城根下的时间切面.md', slug: 'beijing-4-day-imperial' },
  { city: 'chongqing', file: '01_重庆3日游_跟着本地人走.md', slug: 'chongqing-3-day-local' },
  { city: 'shanghai', file: '01_上海3日游_一个过来人的碎碎念.md', slug: 'shanghai-3-day-casual' },
  { city: 'shanghai', file: '01_上海经典3日游攻略.md', slug: 'shanghai-classic-3-day' },
  { city: 'shanghai', file: '02_上海必游景点TOP15排名.md', slug: 'shanghai-top-15-must-see' },
  { city: 'shanghai', file: '03_上海深度全攻略_景点详解.md', slug: 'shanghai-deep-dive' },
  { city: 'shanghai', file: '04_上海三天两夜_本地朋友私藏路线.md', slug: 'shanghai-local-hidden-gems' },
];

for (const { city, file, slug } of chineseMappings) {
  createProcessedFile(join(guidesDir, city), file, slug);
}

// Step 4: Handle foreigners - add frontmatter
console.log('\n=== Step 4: Add frontmatter to foreigners guides ===');
const foreignersDir = join(guidesDir, 'foreigners');
const foreignerSlugs = {
  'visa-entry.md': 'visa-entry',
  'payment-setup.md': 'payment-setup',
  'internet-vpn.md': 'internet-vpn',
  'essential-apps.md': 'essential-apps',
  'transportation.md': 'transportation',
  'health-emergency.md': 'health-emergency',
  'culture-tips.md': 'culture-tips',
};

for (const [file, slug] of Object.entries(foreignerSlugs)) {
  const filePath = join(foreignersDir, file);
  if (!existsSync(filePath)) continue;
  
  let content = readFileSync(filePath, 'utf-8');
  
  // Skip if already has frontmatter
  if (content.startsWith('---')) {
    console.log(`  SKIP (has frontmatter): ${file}`);
    continue;
  }
  
  const title = extractTitle(content);
  const body = content.replace(/^#\s+.+\n/, '').trim();
  
  const frontmatter = {
    title,
    pageSlug: slug,
    city: 'foreigners',
    country: 'china',
    tags: ['foreigners', 'practical'],
    draft: false,
  };
  
  const updated = matter.stringify(body, frontmatter);
  writeFileSync(filePath, updated, 'utf-8');
  console.log(`  ADDED frontmatter: ${file} → ${slug}`);
}

// Step 5: Fix image paths in all processed files
console.log('\n=== Step 5: Fix image paths ===');
const allDirs = readdirSync(guidesDir, { withFileTypes: true }).filter(d => d.isDirectory());
for (const d of allDirs) {
  const dirPath = join(guidesDir, d.name);
  const files = readdirSync(dirPath).filter(f => f.endsWith('.md') && !f.startsWith('0') && f !== 'INDEX.md' && f !== 'index.md');
  for (const f of files) {
    fixImagePaths(join(dirPath, f));
  }
}

// Also fix raw files (they'll be deleted later but fix them first for proper processing)
for (const d of allDirs) {
  const dirPath = join(guidesDir, d.name);
  const files = readdirSync(dirPath).filter(f => f.startsWith('0') && f.endsWith('.md'));
  for (const f of files) {
    fixImagePaths(join(dirPath, f));
  }
}

console.log('\n✅ sync-all.mjs complete');

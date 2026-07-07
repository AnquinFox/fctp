import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const guidesDir = join(__dirname, '..', 'src', 'content', 'guides');

function getCityDir(city) {
  return join(guidesDir, city);
}

function extractFirstImage(body) {
  const match = body.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
}

function extractLocationTags(title, body, primaryCity) {
  const tags = new Set([primaryCity]);
  
  // city name mappings for detection
  const cityPatterns = {
    'beijing': /北京|beijing/gi,
    'shanghai': /上海|shanghai/gi,
    'chongqing': /重庆|chongqing/gi,
    'chengdu': /成都|chengdu/gi,
    'xian': /西安|xi[\s]?an/gi,
    'hangzhou': /杭州|hangzhou/gi,
    'shenzhen': /深圳|shenzhen/gi,
    'guangzhou': /广州|guangzhou/gi,
  };

  for (const [city, pattern] of Object.entries(cityPatterns)) {
    if (city === primaryCity) continue;
    if (pattern.test(title) || pattern.test(body)) {
      tags.add(city);
    }
  }

  return [...tags];
}

// City name tags for display
const cityDisplayNames = {
  'beijing': 'Beijing',
  'shanghai': 'Shanghai',
  'chongqing': 'Chongqing',
  'chengdu': 'Chengdu',
  'xian': "Xi'an",
  'hangzhou': 'Hangzhou',
  'shenzhen': 'Shenzhen',
  'guangzhou': 'Guangzhou',
};

// Topic tag mappings for foreigners guides (slug → tags)
const foreignersTopicTags = {
  'visa-entry': ['visa', 'entry', 'passport'],
  'payment-setup': ['payment', 'alipay', 'wechat'],
  'internet-vpn': ['internet', 'vpn', 'esim'],
  'essential-apps': ['apps', 'essential'],
  'transportation': ['transport', 'metro', 'taxi'],
  'health-emergency': ['health', 'emergency', 'hospital'],
  'culture-tips': ['culture', 'food', 'etiquette'],
};

function extractForeignersTags(fileName) {
  const slug = fileName.replace('.md', '');
  if (slug === 'index') return ['overview', 'survival-kit'];
  return ['survival-kit', ...(foreignersTopicTags[slug] || [])];
}

let totalUpdated = 0;
let totalCovers = 0;

const cityDirs = readdirSync(guidesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const city of cityDirs) {
  const cityDir = getCityDir(city);
  const files = readdirSync(cityDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = join(cityDir, file);
    const raw = readFileSync(filePath, 'utf-8');
    const doc = matter(raw);

    let changed = false;

    // Ensure correct pageSlug for foreigners guides
    if (city === 'foreigners' && doc.data.pageSlug && !doc.data.pageSlug.startsWith('foreigners/')) {
      doc.data.pageSlug = `foreigners/${doc.data.pageSlug}`;
      changed = true;
    }

    // For foreigners guides: ensure title + pageSlug + city (schema required fields)
    const isForeigners = city === 'foreigners';
    
    // Ensure required schema fields: title, pageSlug, city (for all guides)
    if (!doc.data.title) {
      const titleMatch = doc.content.match(/^#\s+(.+)/m);
      if (titleMatch) {
        doc.data.title = titleMatch[1];
        changed = true;
        console.log(`  📝 title: ${doc.data.title.slice(0, 60)}...`);
      }
    }
    if (!doc.data.pageSlug) {
      let slug = file.replace('.md', '');
      // Strip numbered prefix like "02_" or "01_"
      slug = slug.replace(/^\d+_/, '');
      // Convert to lowercase, replace underscores with dashes
      slug = slug.toLowerCase().replace(/_/g, '-');
      if (isForeigners) {
        doc.data.pageSlug = slug === 'index' ? 'foreigners' : `foreigners/${slug}`;
      } else {
        doc.data.pageSlug = slug;
      }
      changed = true;
      console.log(`  🔗 pageSlug: ${doc.data.pageSlug}`);
    }
    if (!doc.data.city) {
      doc.data.city = isForeigners ? 'foreigners' : city;
      changed = true;
      console.log(`  🏙 city: ${doc.data.city}`);
    }

    // Extract cover image from first image in body
    if (!doc.data.cover || doc.data.cover === '') {
      const cover = extractFirstImage(doc.content);
      if (cover) {
        doc.data.cover = cover;
        changed = true;
        totalCovers++;
        console.log(`  📷 cover: ${cover}`);
      }
    }

    // Add tags if empty (or force-regenerate for foreigners)
    if (!doc.data.tags || doc.data.tags.length === 0 || isForeigners) {
      let tags;
      if (isForeigners) {
        tags = extractForeignersTags(file);
      } else {
        tags = extractLocationTags(doc.data.title || '', doc.content, city);
      }
      doc.data.tags = tags;
      changed = true;
      console.log(`  🏷 tags: [${tags.join(', ')}]`);
    }

    if (changed) {
      const updated = matter.stringify(doc.content, doc.data);
      writeFileSync(filePath, updated, 'utf-8');
      totalUpdated++;
    }
  }
}

console.log(`\n✅ Done: ${totalUpdated} files updated, ${totalCovers} covers extracted`);

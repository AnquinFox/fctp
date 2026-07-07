import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const guidesDir = join(__dirname, '..', 'src', 'content', 'guides');

let fixed = 0;

const cityDirs = readdirSync(guidesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

for (const city of cityDirs) {
  const cityDir = join(guidesDir, city);
  const files = readdirSync(cityDir).filter(f => f.endsWith('.md') && f !== 'index.md');

  for (const file of files) {
    const filePath = join(cityDir, file);
    const raw = readFileSync(filePath, 'utf-8');
    const doc = matter(raw);

    // Fix pageSlug: strip NN- prefix
    if (doc.data.pageSlug) {
      const oldSlug = doc.data.pageSlug;
      // Match patterns like "01-something" or "02-something"
      const cleaned = oldSlug.replace(/^\d{2}-/, '');
      if (cleaned !== oldSlug) {
        doc.data.pageSlug = cleaned;
        const updated = matter.stringify(doc.content, doc.data);
        writeFileSync(filePath, updated, 'utf-8');
        fixed++;
        console.log(`  ✏️ ${city}/${file}: "${oldSlug}" → "${cleaned}"`);
      }
    }
  }
}

console.log(`\n✅ Fixed ${fixed} pageSlugs`);

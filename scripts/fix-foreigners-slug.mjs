import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const dir = 'E:\\AIProject_Common\\fctp\\src\\content\\guides\\foreigners';
const files = readdirSync(dir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const raw = readFileSync(join(dir, file), 'utf8');
  const doc = matter(raw);
  const oldSlug = doc.data.pageSlug;
  if (!oldSlug || oldSlug.startsWith('foreigners/')) {
    console.log(`SKIP: ${file} (already: ${oldSlug})`);
    continue;
  }
  doc.data.pageSlug = `foreigners/${oldSlug}`;
  writeFileSync(join(dir, file), matter.stringify(doc.content, doc.data), 'utf8');
  console.log(`FIXED: ${file} → pageSlug: foreigners/${oldSlug}`);
}

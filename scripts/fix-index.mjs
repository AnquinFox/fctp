import { readFileSync, writeFileSync } from 'fs';
import matter from 'gray-matter';

const raw = readFileSync('src/content/guides/foreigners/index.md', 'utf8');
const doc = matter(raw);

doc.data.title = 'Foreigners Coming to China — Complete Guide Series';
doc.data.pageSlug = 'foreigners-index';
doc.data.city = 'foreigners';
doc.data.country = 'china';
doc.data.draft = false;
if (!doc.data.tags || doc.data.tags.length === 0) {
  doc.data.tags = ['foreigners', 'practical'];
}

writeFileSync('src/content/guides/foreigners/index.md', matter.stringify(doc.content, doc.data), 'utf8');
console.log('Fixed index.md frontmatter');

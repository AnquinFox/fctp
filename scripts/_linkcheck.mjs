import fs from 'fs';
import path from 'path';

const dir = 'src/content/guides';
const slugs = new Set();
const files = [];

function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.md')) {
      files.push(p);
      const t = fs.readFileSync(p, 'utf8');
      const m = t.match(/^pageSlug:\s*(.+)$/m);
      if (m) slugs.add(m[1].trim().replace(/^['"]|['"]$/g, ''));
    }
  }
}
walk(dir);

console.log('total slugs:', slugs.size);

// collect physical paths too
function physExists(slug) {
  // allow /guides/<slug>/ to map to any md file (city page etc.)
  return slugs.has(slug);
}

const bad = [];
const mdLinks = [];
for (const p of files) {
  const t = fs.readFileSync(p, 'utf8');
  const re = /\]\(([^)\s]+)\)/g;
  let m;
  while ((m = re.exec(t))) {
    const u = m[1];
    if (u.includes('.md')) mdLinks.push(p + ' -> ' + u);
    if (!u.startsWith('/guides/')) continue;
    const s = u.replace(/^\/guides\//, '').replace(/\/$/, '');
    if (!slugs.has(s)) bad.push(p + ' -> ' + u);
  }
}

console.log('\n.md links total:', mdLinks.length);
[...new Set(mdLinks)].forEach((b) => console.log('  ' + b));

console.log('\nbroken internal /guides/ links vs pageSlug set:', bad.length);
[...new Set(bad)].forEach((b) => console.log('  ' + b));

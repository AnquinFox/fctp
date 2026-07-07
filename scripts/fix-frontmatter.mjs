import fs from 'fs';
import path from 'path';

const dirs = ['guilin','hongkong','suzhou','yunnan','zhangjiajie','huangshan','jiuzhaigou','guangzhou','macau'];

dirs.forEach(city => {
  const cityDir = path.join('E:/AIProject_Common/fctp/src/content/guides', city);
  if (!fs.existsSync(cityDir)) return;
  fs.readdirSync(cityDir).filter(f => f.endsWith('.md')).forEach(file => {
    const filePath = path.join(cityDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // extract title from first # heading
    const titleMatch = content.match(/^# (.+)$/m);
    if (!titleMatch) { console.log(file + ': NO TITLE'); return; }
    const title = titleMatch[1].trim();
    
    // pageSlug from filename
    const pageSlug = file.replace(/\.md$/, '').toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
    
    // check if frontmatter exists
    if (!content.startsWith('---')) { console.log(file + ': NO FRONTMATTER'); return; }
    const fmEnd = content.indexOf('---', 3);
    const existingFm = content.substring(3, fmEnd).trim();
    
    // build new frontmatter
    const newFm = `title: "${title}"\npageSlug: "${pageSlug}"\ncity: "${city}"\n${existingFm}`;
    const newContent = '---\n' + newFm + '\n---' + content.substring(fmEnd + 3);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(file + ': OK title=' + title + ' city=' + city);
  });
});

// also fix chengdu 02
const chengduFile = 'E:/AIProject_Common/fctp/src/content/guides/chengdu/02_Chengdu_3Day_Local_Insider_Guide.md';
if (fs.existsSync(chengduFile)) {
  const content = fs.readFileSync(chengduFile, 'utf8');
  const titleMatch = content.match(/^# (.+)$/m);
  if (titleMatch && content.startsWith('---')) {
    const title = titleMatch[1].trim();
    const pageSlug = '02-chengdu-3day-local-insider-guide';
    const fmEnd = content.indexOf('---', 3);
    const existingFm = content.substring(3, fmEnd).trim();
    const newFm = `title: "${title}"\npageSlug: "${pageSlug}"\ncity: "chengdu"\n${existingFm}`;
    const newContent = '---\n' + newFm + '\n---' + content.substring(fmEnd + 3);
    fs.writeFileSync(chengduFile, newContent, 'utf8');
    console.log('chengdu 02: OK');
  }
}

console.log('Done');

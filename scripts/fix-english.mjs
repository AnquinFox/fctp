import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const wq = 'E:\\AIProject_Common\\wonder-quest\\guides';
const fctp = 'E:\\AIProject_Common\\fctp\\src\\content\\guides';

const englishMappings = [
  { city: 'beijing', wqFile: '01_Beijing_4Day_Travel_Guide.md', slug: 'beijing-4-day-travel-guide' },
  { city: 'chongqing', wqFile: '01_Chongqing_3Day_Travel_Guide.md', slug: 'chongqing-3-day-travel-guide' },
  { city: 'shanghai', wqFile: '01_Shanghai_3Day_A_Prose.md', slug: 'shanghai-3-day-honest-ramblings' },
  { city: 'shanghai', wqFile: '01_Shanghai_Classic_3Day_Itinerary.md', slug: 'shanghai-classic-3-day-itinerary' },
  { city: 'shanghai', wqFile: '02_Shanghai_Top15_Attractions.md', slug: 'shanghai-top-15-attractions' },
  { city: 'shanghai', wqFile: '03_Shanghai_Deep_Dive_Guide.md', slug: 'shanghai-deep-dive-guide' },
  { city: 'shanghai', wqFile: '04_Shanghai_3Day_Local_Tips.md', slug: 'shanghai-3d2n-insider-route' },
];

for (const { city, wqFile, slug } of englishMappings) {
  const src = join(wq, city, wqFile);
  if (!existsSync(src)) { console.log('MISSING:', src); continue; }
  let content = readFileSync(src, 'utf8');
  
  // Fix image paths (Fire changed them to ../../images/)
  content = content.replace(/\]\(\.\.\/\.\.\/images\//g, '](/images/');
  
  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}]\s*/u, '').trim() : 'Untitled';
  
  // Extract duration
  let duration = '';
  const durMatch = title.match(/(\d+)\s*(Days?|天)\s*(\d*)\s*(Nights?|夜)?/i);
  if (durMatch) duration = durMatch[0];
  
  const body = content.replace(/^#\s+.+\n/, '').trim();
  
  const fm = { title, pageSlug: slug, city, country: 'china', tags: [], draft: false };
  if (duration) fm.duration = duration;
  
  const outPath = join(fctp, city, `${slug}.md`);
  writeFileSync(outPath, matter.stringify(body, fm), 'utf8');
  console.log('CREATED:', `${city}/${slug}.md`);
}
console.log('Done');

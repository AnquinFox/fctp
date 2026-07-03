import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wonderquest.xyz',
  output: 'static',
  integrations: [sitemap()],
});

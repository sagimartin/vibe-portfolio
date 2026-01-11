/* global process */
import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml')
const today = new Date().toISOString().slice(0, 10)

async function updateSitemap() {
  let content = ''
  try {
    content = await fs.readFile(sitemapPath, 'utf8')
  } catch {
    console.warn('[sitemap] file not found, skipping update.')
    return
  }

  const updated = content.replace(/<lastmod>.*?<\/lastmod>/g, '<lastmod>' + today + '</lastmod>')

  if (updated !== content) {
    await fs.writeFile(sitemapPath, updated, 'utf8')
  }
}

updateSitemap()

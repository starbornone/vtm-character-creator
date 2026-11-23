import { access, readFile, writeFile } from 'node:fs/promises'

const dist = new URL('../dist/', import.meta.url)
const origin = 'https://vtm.astralarchives.games'
const absolute = path => new URL(path, origin).href

// Add public pages here once Vite emits their standalone HTML.
const publicPages = [{
  path: '/',
  output: 'index.html',
  title: 'Vampire: The Masquerade V5 Character Creator',
  description: 'Create a Vampire: The Masquerade Fifth Edition character for free. Check starting choices, track XP, and print a character sheet.',
  socialImage: {
    path: '/social/v5-character-creator.jpg',
    width: 1200,
    height: 630,
    alt: 'A nocturnal city skyline',
  },
  schema: webApplication,
}]

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const escapeMarkup = value => String(value).replace(/[&<>"']/g, char => entities[char])
const meta = (attribute, key, value) =>
  `<meta ${attribute}="${key}" content="${escapeMarkup(value)}">`

function webApplication(page, canonical) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${canonical}#app`,
    name: page.title,
    url: canonical,
    description: page.description,
    applicationCategory: 'GameApplication',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: 0 },
  }
}

function renderJsonLd(data) {
  // Prevent a literal closing script tag from entering the generated HTML.
  const json = JSON.stringify(data).replaceAll('<', '\\u003c')
  return `<script type="application/ld+json">${json}</script>`
}

function renderHead(page) {
  const canonical = absolute(page.path)
  const image = absolute(page.socialImage.path)

  return [
    `<title>${escapeMarkup(page.title)}</title>`,
    meta('name', 'description', page.description),
    `<link rel="canonical" href="${escapeMarkup(canonical)}">`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:url', canonical),
    meta('property', 'og:title', page.title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:image', image),
    meta('property', 'og:image:width', page.socialImage.width),
    meta('property', 'og:image:height', page.socialImage.height),
    meta('property', 'og:image:alt', page.socialImage.alt),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', page.title),
    meta('name', 'twitter:description', page.description),
    meta('name', 'twitter:image', image),
    meta('name', 'twitter:image:alt', page.socialImage.alt),
    ...(page.schema ? [renderJsonLd(page.schema(page, canonical))] : []),
  ].join('\n    ')
}

const headMarker = /<!-- seo:begin -->[\s\S]*?<!-- seo:end -->/

for (const page of publicPages) {
  const output = new URL(page.output, dist)
  await access(new URL(page.socialImage.path.slice(1), dist))

  const html = await readFile(output, 'utf8')
  if (!headMarker.test(html)) {
    throw new Error(`Missing SEO head marker in ${page.output}`)
  }

  await writeFile(output, html.replace(headMarker, () => renderHead(page)))
}

const sitemapEntries = publicPages.map(({ path }) =>
  `  <url><loc>${escapeMarkup(absolute(path))}</loc></url>`,
)

await Promise.all([
  writeFile(new URL('sitemap.xml', dist), [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapEntries,
    '</urlset>',
    '',
  ].join('\n')),
  writeFile(new URL('robots.txt', dist), [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${absolute('/sitemap.xml')}`,
    '',
  ].join('\n')),
])

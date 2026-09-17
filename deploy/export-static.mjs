import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';

const origin = process.env.SITE_ORIGIN || 'http://localhost:2368';
const output = join(process.cwd(), 'static-site');
const routes = [
  '/',
  '/services/',
  '/lawyers/',
  '/gallery/',
  '/laws/',
  '/blog/',
  '/information/',
  '/faq/',
  '/contact/',
  '/privacy/'
];

const downloaded = new Set();

async function saveAsset(pathname) {
  const cleanPath = pathname.split('?')[0];
  if (!cleanPath.startsWith('/assets/') && !cleanPath.startsWith('/public/')) return;
  if (downloaded.has(cleanPath)) return;
  downloaded.add(cleanPath);

  const response = await fetch(new URL(cleanPath, origin));
  if (!response.ok) throw new Error(`${response.status} ${cleanPath}`);
  const destination = join(output, cleanPath);
  await mkdir(dirname(destination), {recursive: true});
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

for (const route of routes) {
  const response = await fetch(new URL(route, origin));
  if (!response.ok) throw new Error(`${response.status} ${route}`);

  let html = await response.text();
  html = html.replaceAll(`${origin}/`, '/');
  html = html.replaceAll('http://localhost:2368', '');

  const references = [
    ...[...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)].map((match) => match[1]),
    ...[...html.matchAll(/url\(['"]?(\/[^)'"#]+)['"]?\)/g)].map((match) => match[1])
  ];
  for (const reference of references) await saveAsset(reference);

  const cssReferences = [...html.matchAll(/href="(\/assets\/css\/[^"#]+)"/g)].map((match) => match[1]);
  for (const cssReference of cssReferences) {
    const cssResponse = await fetch(new URL(cssReference, origin));
    if (!cssResponse.ok) throw new Error(`${cssResponse.status} ${cssReference}`);
    const css = await cssResponse.text();
    const backgroundAssets = [...css.matchAll(/url\(\s*['"]?\.\.\/images\/([^'"#]+\.(?:png|jpe?g|webp|gif))['"]?\s*\)/gi)]
      .map((match) => `/assets/images/${match[1]}`);
    for (const asset of backgroundAssets) await saveAsset(asset);
  }

  const destination = route === '/'
    ? join(output, 'index.html')
    : join(output, route.slice(1), 'index.html');
  await mkdir(dirname(destination), {recursive: true});
  await writeFile(destination, html);
  console.log(`Exported ${route}`);
}

console.log(`Export complete: ${routes.length} pages, ${downloaded.size} assets`);

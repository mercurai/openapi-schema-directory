import path from 'node:path';
import { writeJson } from './lib.mjs';

const url = 'https://api.apis.guru/v2/list.json';
const res = await fetch(url);
if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
const data = await res.json();

const index = {};
const seedsPreferred = [];

for (const [id, entry] of Object.entries(data)) {
  const preferred = entry.preferred || Object.keys(entry.versions || {})[0];
  const versions = {};
  for (const [ver, meta] of Object.entries(entry.versions || {})) {
    versions[ver] = {
      openapiUrl: meta.openapiUrl || null,
      swaggerUrl: meta.swaggerUrl || null,
      info: { title: meta.info?.title || id }
    };
  }
  index[id] = { id, preferredVersion: preferred, title: entry.info?.title || id, versions };

  const p = versions[preferred] || {};
  const schemaUrl = p.openapiUrl || p.swaggerUrl;
  if (schemaUrl) seedsPreferred.push({ id, schemaUrl, title: p.info?.title || id, source: 'apis.guru', preferredVersion: preferred });
}

await writeJson(path.join(process.cwd(), 'sources/apis-guru-index.json'), index);
await writeJson(path.join(process.cwd(), 'sources/seeds.apis-guru.json'), seedsPreferred);
console.log(`seeded index: ${Object.keys(index).length} apis`);
console.log(`seeded preferred urls: ${seedsPreferred.length}`);

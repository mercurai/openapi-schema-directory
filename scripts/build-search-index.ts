import fs from 'node:fs/promises';
import path from 'node:path';
import { CATALOG_DIR, SCHEMAS_DIR, writeJson } from './lib.js';

const entries = [];
async function walk(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) await walk(p);
    else if (it.isFile() && p.endsWith('.json')) {
      const raw = JSON.parse(await fs.readFile(p, 'utf8'));
      entries.push({
        id: path.basename(path.dirname(p)),
        version: path.basename(p, '.json'),
        title: raw?.info?.title || path.basename(path.dirname(p)),
        description: raw?.info?.description || '',
        openapi: raw?.openapi || raw?.swagger || null,
        schemaPath: path.relative(process.cwd(), p)
      });
    }
  }
}

await walk(SCHEMAS_DIR).catch(() => {});

// Algolia-compatible search index
const searchIndex = {
  updatedAt: new Date().toISOString(),
  count: entries.length,
  records: entries.map(e => ({
    objectID: `${e.id}:${e.version}`,
    id: e.id,
    version: e.version,
    title: e.title,
    description: e.description,
    openapi: e.openapi,
    _tags: [e.id, e.version, e.openapi ? 'openapi3' : 'swagger']
  }))
};

await writeJson(path.join(CATALOG_DIR, 'search-index.json'), searchIndex);

console.log(`search index: ${searchIndex.records.length} records`);

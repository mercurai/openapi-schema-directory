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
      const rel = path.relative(process.cwd(), p);
      const raw = JSON.parse(await fs.readFile(p, 'utf8'));
      entries.push({
        id: path.basename(path.dirname(p)),
        version: path.basename(p, '.json'),
        title: raw?.info?.title || path.basename(path.dirname(p)),
        openapi: raw?.openapi || raw?.swagger || null,
        schemaPath: rel
      });
    }
  }
}

await walk(SCHEMAS_DIR).catch(() => {});

// Standard index
await writeJson(path.join(CATALOG_DIR, 'index.json'), { 
  updatedAt: new Date().toISOString(), 
  count: entries.length, 
  entries 
});

// Bridge-compatible catalog export
const bridgeCatalog = {
  updatedAt: new Date().toISOString(),
  schemas: entries.map(e => ({
    id: e.id,
    version: e.version,
    title: e.title,
    schemaUrl: `/schemas/${e.id}/${e.version}.json`,
    openapi: e.openapi
  }))
};
await writeJson(path.join(CATALOG_DIR, 'bridge-catalog.json'), bridgeCatalog);

console.log(`indexed ${entries.length} schemas`);
console.log(`bridge catalog: ${bridgeCatalog.schemas.length} schemas`);

import path from 'node:path';
import { ensureDirs, loadJson, normalizeAndValidate, writeJson, slug, CATALOG_DIR } from './lib.js';

const targets: any = await loadJson(path.join(process.cwd(), 'sources/discovery-targets.json'), []);
const suffixes = ['/openapi.json', '/swagger.json', '/v1/openapi.json', '/api-docs', '/.well-known/openapi.json'];

await ensureDirs();
const found = [];

for (const base of targets) {
  for (const s of suffixes) {
    const candidate = `${base.replace(/\/$/, '')}${s}`;
    try {
      const normalized: any = await normalizeAndValidate(candidate);
      const title = normalized?.info?.title || base;
      found.push({ id: new URL(base).host, schemaUrl: candidate, title, openapi: normalized.openapi || null });
      break;
    } catch {
      // ignore
    }
  }
}

await writeJson(path.join(CATALOG_DIR, 'discovered.json'), { updatedAt: new Date().toISOString(), count: found.length, items: found });
console.log(`discovered ${found.length} schemas`);

import fs from 'node:fs/promises';
import path from 'node:path';
import { normalizeAndValidate, writeJson, slug } from './lib.mjs';

const indexPath = path.join(process.cwd(), 'sources/apis-guru-index.json');
const statePath = path.join(process.cwd(), '.cache/fetch-all-versions-state.json');
const max = Number(process.env.MAX_SCHEMAS || '0'); // 0 = unlimited

const raw = JSON.parse(await fs.readFile(indexPath, 'utf8'));
let processed = 0;
let ok = 0;
let failed = 0;

let state = { done: {} };
try { state = JSON.parse(await fs.readFile(statePath, 'utf8')); } catch {}

for (const [id, entry] of Object.entries(raw)) {
  for (const [ver, meta] of Object.entries(entry.versions || {})) {
    const key = `${id}@${ver}`;
    if (state.done[key]) continue;
    const schemaUrl = meta.openapiUrl || meta.swaggerUrl;
    if (!schemaUrl) continue;

    if (max && processed >= max) break;
    processed++;

    try {
      const normalized = await normalizeAndValidate(schemaUrl);
      const out = path.join(process.cwd(), 'schemas', slug(id), `${slug(ver)}.json`);
      await fs.mkdir(path.dirname(out), { recursive: true });
      await fs.writeFile(out, JSON.stringify(normalized, null, 2) + '\n', 'utf8');
      state.done[key] = { ok: true, schemaPath: path.relative(process.cwd(), out), updatedAt: new Date().toISOString() };
      ok++;
      console.log(`ok ${key}`);
    } catch (e) {
      state.done[key] = { ok: false, error: String(e), updatedAt: new Date().toISOString() };
      failed++;
      console.log(`fail ${key}`);
    }

    await fs.mkdir(path.dirname(statePath), { recursive: true });
    await fs.writeFile(statePath, JSON.stringify(state, null, 2) + '\n', 'utf8');
  }
}

await writeJson(path.join(process.cwd(), 'catalog/fetch-report.json'), {
  updatedAt: new Date().toISOString(),
  processed,
  ok,
  failed,
  max,
});

console.log(`processed=${processed} ok=${ok} failed=${failed}`);

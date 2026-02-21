import path from 'node:path';
import fs from 'node:fs/promises';
import { ensureDirs, loadJson, normalizeAndValidate, writeJson, slug, SCHEMAS_DIR, CATALOG_DIR } from './lib.mjs';

await ensureDirs();
const seeds = await loadJson(path.join(process.cwd(), 'sources/seeds.json'), []);
const guruSeeds = await loadJson(path.join(process.cwd(), 'sources/seeds.apis-guru.json'), []);
const discovered = (await loadJson(path.join(CATALOG_DIR, 'discovered.json'), { items: [] }))?.items || [];
const community = (await loadJson(path.join(process.cwd(), 'sources/community-candidates.json'), { items: [] }))?.items || [];

const merged = [...seeds, ...guruSeeds, ...discovered, ...community].reduce((acc, cur) => {
  if (!acc.find(x => x.id === cur.id)) acc.push(cur);
  return acc;
}, []);

const entries = [];
for (const source of merged) {
  try {
    const normalized = await normalizeAndValidate(source.schemaUrl);
    const id = slug(source.id);
    const version = normalized?.info?.version || 'latest';
    const out = path.join(SCHEMAS_DIR, id, `${slug(version)}.json`);
    await fs.mkdir(path.dirname(out), { recursive: true });
    await fs.writeFile(out, JSON.stringify(normalized, null, 2) + '\n', 'utf8');

    entries.push({
      id: source.id,
      title: normalized?.info?.title || source.title || source.id,
      version,
      openapi: normalized?.openapi || null,
      schemaPath: path.relative(process.cwd(), out),
      sourceUrl: source.schemaUrl,
      updatedAt: new Date().toISOString()
    });
    console.log(`ok ${source.id}`);
  } catch (e) {
    console.log(`skip ${source.id}`);
  }
}

await writeJson(path.join(CATALOG_DIR, 'index.json'), { updatedAt: new Date().toISOString(), count: entries.length, entries });

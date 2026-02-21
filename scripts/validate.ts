import fs from 'node:fs/promises';
import path from 'node:path';
import { normalizeAndValidate, SCHEMAS_DIR } from './lib.mjs';

let failed = 0;
async function walk(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) await walk(p);
    else if (it.isFile() && p.endsWith('.json')) {
      try {
        await normalizeAndValidate(p);
        console.log(`ok ${p}`);
      } catch (e) {
        failed++;
        console.error(`fail ${p}`);
      }
    }
  }
}

await walk(SCHEMAS_DIR).catch(() => {});
if (failed) process.exit(1);

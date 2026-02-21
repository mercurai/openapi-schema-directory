import fs from 'node:fs/promises';
import path from 'node:path';
import OASNormalize from 'oas-normalize';

export const ROOT = process.cwd();
export const SCHEMAS_DIR = path.join(ROOT, 'schemas');
export const CATALOG_DIR = path.join(ROOT, 'catalog');

export async function ensureDirs() {
  await fs.mkdir(SCHEMAS_DIR, { recursive: true });
  await fs.mkdir(CATALOG_DIR, { recursive: true });
}

export async function loadJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

export async function writeJson(file, obj) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

export async function normalizeAndValidate(schemaInput) {
  const oas = new OASNormalize(schemaInput, { enablePaths: true });
  const normalized = await oas.validate({ convertToLatest: true });
  return normalized;
}

export function slug(id) {
  return id.replace(/[^a-zA-Z0-9._-]/g, '_');
}

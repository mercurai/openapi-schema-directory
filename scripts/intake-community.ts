import fs from 'node:fs/promises';
import path from 'node:path';

const repo = 'mercurai/openapi-schema-directory';

async function gh(pathname: string) {
  const r = await fetch(`https://api.github.com${pathname}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (!r.ok) throw new Error(`GitHub API ${pathname} failed: ${r.status}`);
  return r.json();
}

function extractUrls(text: string = '') {
  const m = text.match(/https?:\/\/[^\s)\]>]+/g) || [];
  return Array.from(new Set(m));
}

const issues: any = await gh(`/repos/${repo}/issues?state=all&per_page=100`);
const candidates = [];

for (const it of issues) {
  // Pull requests are included in issues endpoint; keep both for signal.
  const urls = [
    ...extractUrls(it.title || ''),
    ...extractUrls(it.body || '')
  ].filter(u => /openapi|swagger|api\.json|\.ya?ml/i.test(u));

  for (const u of urls) {
    const id = (it.title || `issue-${it.number}`).toLowerCase().replace(/[^a-z0-9._-]+/g, '_').slice(0, 64);
    candidates.push({
      id,
      schemaUrl: u,
      source: 'community-issue',
      issueNumber: it.number,
      issueUrl: it.html_url,
      state: it.state,
      updatedAt: it.updated_at,
    });
  }
}

const out = { updatedAt: new Date().toISOString(), count: candidates.length, items: candidates };
await fs.writeFile(path.join(process.cwd(), 'sources/community-candidates.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`community candidates: ${candidates.length}`);

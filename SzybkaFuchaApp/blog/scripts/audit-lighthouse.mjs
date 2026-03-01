#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(BLOG_ROOT, 'public');
const REPORTS_DIR = path.join(BLOG_ROOT, 'audit', 'lighthouse');
const HOST = '127.0.0.1';
const PORT = Number(process.env.LIGHTHOUSE_PORT || 4173);
const LIGHTHOUSE_CMD = process.env.LIGHTHOUSE_CMD || 'lighthouse';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function hasCommand(command) {
  const result = spawnSync('which', [command], { stdio: 'ignore' });
  return result.status === 0;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getAuditUrls() {
  const urls = [`http://${HOST}:${PORT}/`];
  const postsDir = path.join(PUBLIC_DIR, 'blog');

  if (!fs.existsSync(postsDir)) {
    return urls;
  }

  const posts = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.html'))
    .sort();

  for (const file of posts) {
    urls.push(`http://${HOST}:${PORT}/blog/${file}`);
  }

  return urls;
}

function extractScores(reportJson) {
  const categories = reportJson.categories || {};
  return Object.fromEntries(
    ['performance', 'accessibility', 'best-practices', 'seo'].map(key => [
      key,
      typeof categories[key]?.score === 'number' ? Math.round(categories[key].score * 100) : null,
    ]),
  );
}

async function runLighthouse(urls) {
  const summary = [];

  for (const url of urls) {
    const slug = url.endsWith('/') ? 'home' : path.basename(url, '.html');
    const reportPath = path.join(REPORTS_DIR, `${slug}.report.json`);
    const htmlPath = path.join(REPORTS_DIR, `${slug}.report.html`);

    const result = spawnSync(
      LIGHTHOUSE_CMD,
      [
        url,
        '--quiet',
        '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage',
        '--preset=desktop',
        '--only-categories=performance,accessibility,best-practices,seo',
        '--output=json',
        '--output=html',
        `--output-path=${path.join(REPORTS_DIR, slug)}`
      ],
      { encoding: 'utf-8' },
    );

    if (result.status !== 0) {
      throw new Error((result.stderr || result.stdout || '').trim() || `Lighthouse failed for ${url}`);
    }

    const json = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    summary.push({
      url,
      reportJson: path.relative(BLOG_ROOT, reportPath),
      reportHtml: path.relative(BLOG_ROOT, htmlPath),
      scores: extractScores(json),
    });
  }

  return summary;
}

async function main() {
  if (!hasCommand(LIGHTHOUSE_CMD)) {
    console.error(`Missing "${LIGHTHOUSE_CMD}" command. Install Lighthouse or set LIGHTHOUSE_CMD.`);
    process.exit(1);
  }

  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('Missing blog/public. Run npm run build first.');
    process.exit(1);
  }

  ensureDir(REPORTS_DIR);

  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', HOST], {
    cwd: PUBLIC_DIR,
    stdio: 'ignore',
  });

  try {
    await wait(2000);
    const urls = getAuditUrls();
    const summary = await runLighthouse(urls);
    const summaryPath = path.join(REPORTS_DIR, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Lighthouse reports written to ${REPORTS_DIR}`);
    console.log(`📊 Summary: ${path.relative(BLOG_ROOT, summaryPath)}`);
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error(`Lighthouse audit failed: ${error.message}`);
  process.exit(1);
});

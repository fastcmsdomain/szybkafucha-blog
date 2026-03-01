#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_ROOT = path.join(__dirname, '..');
const IMAGES_SRC = path.join(BLOG_ROOT, 'content', 'images');
const VARIANTS_DIR = path.join(BLOG_ROOT, '.cache', 'image-variants');

const WEBP_QUALITY = Number(process.env.BLOG_WEBP_QUALITY || 82);
const AVIF_MIN = Number(process.env.BLOG_AVIF_MIN || 24);
const AVIF_MAX = Number(process.env.BLOG_AVIF_MAX || 34);

const args = new Set(process.argv.slice(2));
const force = args.has('--force');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function hasCommand(command) {
  const result = spawnSync('which', [command], { stdio: 'ignore' });
  return result.status === 0;
}

function isRasterSource(fileName) {
  return /\.(jpe?g|png)$/i.test(fileName);
}

function isFreshEnough(sourcePath, outputPath) {
  if (!fs.existsSync(outputPath)) return false;
  const srcTime = fs.statSync(sourcePath).mtimeMs;
  const outTime = fs.statSync(outputPath).mtimeMs;
  return outTime >= srcTime;
}

function runTool(command, toolArgs) {
  const result = spawnSync(command, toolArgs, { stdio: 'pipe', encoding: 'utf-8' });
  if (result.status !== 0) {
    const stderr = (result.stderr || result.stdout || '').trim();
    throw new Error(stderr || `Command failed: ${command}`);
  }
}

function optimizeFile(sourceName, capabilities) {
  const sourcePath = path.join(IMAGES_SRC, sourceName);
  const baseName = path.parse(sourceName).name;
  const outputs = [];

  if (capabilities.webp) {
    const webpPath = path.join(VARIANTS_DIR, `${baseName}.webp`);
    if (force || !isFreshEnough(sourcePath, webpPath)) {
      runTool('cwebp', ['-quiet', '-q', String(WEBP_QUALITY), sourcePath, '-o', webpPath]);
    }
    outputs.push(path.basename(webpPath));
  }

  if (capabilities.avif) {
    const avifPath = path.join(VARIANTS_DIR, `${baseName}.avif`);
    if (force || !isFreshEnough(sourcePath, avifPath)) {
      runTool('avifenc', ['--min', String(AVIF_MIN), '--max', String(AVIF_MAX), sourcePath, avifPath]);
    }
    outputs.push(path.basename(avifPath));
  }

  return outputs;
}

function main() {
  ensureDir(VARIANTS_DIR);

  if (!fs.existsSync(IMAGES_SRC)) {
    console.log('ℹ️  No images source directory found. Skipping optimization.');
    return;
  }

  const capabilities = {
    webp: hasCommand('cwebp'),
    avif: hasCommand('avifenc'),
  };

  if (!capabilities.webp && !capabilities.avif) {
    console.log('ℹ️  No image optimization tools found. Install cwebp and/or avifenc to generate variants.');
    return;
  }

  const files = fs.readdirSync(IMAGES_SRC).filter(isRasterSource).sort();

  if (files.length === 0) {
    console.log('ℹ️  No JPG/PNG source images found. Skipping optimization.');
    return;
  }

  console.log(`🗜️  Optimizing ${files.length} image(s)...`);

  for (const file of files) {
    try {
      const outputs = optimizeFile(file, capabilities);
      if (outputs.length > 0) {
        console.log(`✅ ${file} -> ${outputs.join(', ')}`);
      }
    } catch (error) {
      console.error(`❌ Failed to optimize ${file}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

main();

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, 'content', 'posts');
const IMAGES_DIR = path.join(BLOG_ROOT, 'content', 'images');
const ENV_FILE = path.join(BLOG_ROOT, '.env');

function printUsage() {
  console.log(`
Usage:
  node scripts/generate-hero-image.mjs --post <slug|filename>
  node scripts/generate-hero-image.mjs --missing

Options:
  --post <slug|filename>     Post slug or markdown filename
  --missing                  Generate images for all posts missing a local image
  --provider <name>          replicate | pollinations (default: replicate)
  --model <name>             Provider model override
  --seed <number>            Deterministic seed
  --force                    Replace existing image
  --dry-run                  Print prompt and target only

Examples:
  node scripts/generate-hero-image.mjs --post komposter-domowy
  node scripts/generate-hero-image.mjs --missing
  node scripts/generate-hero-image.mjs --post 2026-03-01-komposter-domowy.md --provider replicate
`);
}

function parseArgs(argv) {
  const args = {
    provider: process.env.BLOG_IMAGE_PROVIDER || 'replicate',
    force: false,
    dryRun: false,
    missing: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--force') {
      args.force = true;
      continue;
    }

    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (token === '--missing') {
      args.missing = true;
      continue;
    }

    if (!token.startsWith('--')) continue;

    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    index += 1;
  }

  if (!args.post && !args.missing) {
    printUsage();
    throw new Error('Missing required --post argument or --missing flag');
  }

  return args;
}

function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return;

  const lines = fs.readFileSync(ENV_FILE, 'utf-8').split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const [key, ...valueParts] = line.split('=');
    if (!key || valueParts.length === 0) continue;

    let value = valueParts.join('=').trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  for (const rawLine of match[1].split('\n')) {
    const [key, ...valueParts] = rawLine.split(':');
    if (!key || valueParts.length === 0) continue;
    let value = valueParts.join(':').trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map(item => item.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
    }

    frontmatter[key.trim()] = value;
  }

  return { frontmatter, body: match[2] };
}

function stringifyFrontmatter(frontmatter) {
  const lines = Object.entries(frontmatter).map(([key, value]) => {
    if (Array.isArray(value)) {
      const arrayValue = value.map(item => `"${item}"`).join(', ');
      return `${key}: [${arrayValue}]`;
    }

    return `${key}: "${String(value)}"`;
  });

  return `---\n${lines.join('\n')}\n---\n`;
}

function resolvePostFile(input) {
  const directPath = path.isAbsolute(input) ? input : path.join(POSTS_DIR, input);
  if (fs.existsSync(directPath)) return directPath;

  const candidates = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
  const match = candidates.find(file => file === `${input}.md` || file.endsWith(`-${input}.md`));

  if (!match) {
    throw new Error(`Post not found for "${input}"`);
  }

  return path.join(POSTS_DIR, match);
}

function listPostFiles() {
  return fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort()
    .map(file => path.join(POSTS_DIR, file));
}

function slugifyFilename(frontmatter, postFilePath) {
  if (frontmatter.image) return frontmatter.image;

  const datePart = frontmatter.date || path.basename(postFilePath).slice(0, 10);
  const slug = frontmatter.slug || path.basename(postFilePath, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return `${datePart}-${slug}.jpg`;
}

function buildPrompt(frontmatter, body) {
  const summary = frontmatter.description || frontmatter.excerpt || body.split('\n').find(line => line.trim()) || '';
  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.join(', ')
    : (frontmatter.category || '');

  return [
    'Editorial hero image for a Polish DIY and home improvement blog article.',
    `Topic: ${frontmatter.title || frontmatter.slug}.`,
    summary ? `Context: ${summary}` : '',
    tags ? `Tags: ${tags}.` : '',
    'Create a realistic, clean, warm lifestyle scene.',
    'Show the main task clearly, with natural light and practical home-or-garden details.',
    'No text, no letters, no watermark, no logo, no UI, no split screen, no collage.',
    'Cinematic wide composition, 16:9, suitable as a website hero image.',
  ].filter(Boolean).join(' ');
}

function createSeed(input) {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return Number.parseInt(hash.slice(0, 8), 16);
}

async function fetchBinary(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} for ${url}${body ? `: ${body.slice(0, 200)}` : ''}`);
  }

  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  if (!contentType.startsWith('image/')) {
    const body = await response.text().catch(() => '');
    throw new Error(`Expected image response but got ${contentType}${body ? `: ${body.slice(0, 200)}` : ''}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}

async function generateWithPollinations({ prompt, model, seed }) {
  const modelName = model || 'flux';
  const urls = [
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1600&height=900&model=${encodeURIComponent(modelName)}&seed=${seed}&nologo=true`,
    `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1600&height=900&model=${encodeURIComponent(modelName)}&seed=${seed}&nologo=true`,
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      return await fetchBinary(url);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Pollinations request failed');
}

async function pollReplicatePrediction(predictionUrl, token) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await fetch(predictionUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Replicate poll failed: HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ''}`);
    }

    const prediction = await response.json();
    if (prediction.status === 'succeeded') {
      const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      if (!outputUrl) {
        throw new Error('Replicate returned no output URL');
      }
      return fetchBinary(outputUrl);
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(`Replicate prediction ${prediction.status}`);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Replicate prediction timed out');
}

async function generateWithReplicate({ prompt, model, seed }) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('Missing REPLICATE_API_TOKEN for provider=replicate');
  }

  const modelRef = model || process.env.REPLICATE_IMAGE_MODEL || 'black-forest-labs/flux-schnell';
  const [owner, name] = modelRef.split('/');
  if (!owner || !name) {
    throw new Error(`Invalid Replicate model "${modelRef}". Use owner/name.`);
  }

  const response = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio: '16:9',
        output_format: 'jpg',
        seed,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Replicate create failed: HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ''}`);
  }

  const prediction = await response.json();
  if (prediction.status === 'succeeded') {
    const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!outputUrl) {
      throw new Error('Replicate returned no output URL');
    }
    return fetchBinary(outputUrl);
  }

  if (!prediction.urls?.get) {
    throw new Error('Replicate response missing polling URL');
  }

  return pollReplicatePrediction(prediction.urls.get, token);
}

function extensionFromContentType(contentType) {
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('webp')) return '.webp';
  return '.jpg';
}

function replaceImageField(content, nextImageName) {
  if (/^image:\s*.*$/m.test(content)) {
    return content.replace(/^image:\s*.*$/m, `image: "${nextImageName}"`);
  }

  return content.replace(/^---\n/, `---\nimage: "${nextImageName}"\n`);
}

async function generateForPost(postFilePath, args) {
    const postContent = fs.readFileSync(postFilePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(postContent);

    if (!frontmatter.slug) {
      throw new Error(`Missing slug in ${path.basename(postFilePath)}`);
    }

    const prompt = buildPrompt(frontmatter, body);
    const seed = Number.parseInt(args.seed || `${createSeed(frontmatter.slug)}`, 10);
    const baseImageName = slugifyFilename(frontmatter, postFilePath).replace(/\.(jpg|jpeg|png|webp)$/i, '');

    if (frontmatter.image && !args.force) {
      const currentImagePath = path.join(IMAGES_DIR, frontmatter.image);
      if (fs.existsSync(currentImagePath)) {
        console.log(`Image already exists for ${frontmatter.slug}: ${frontmatter.image}`);
        console.log('Use --force to replace it.');
        return;
      }
    }

    console.log(`Provider: ${args.provider}`);
    console.log(`Post: ${path.basename(postFilePath)}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Seed: ${seed}`);

    if (args.dryRun) {
      return;
    }

    const binary = args.provider === 'replicate'
      ? await generateWithReplicate({ prompt, model: args.model, seed })
      : await generateWithPollinations({ prompt, model: args.model, seed });

    const extension = extensionFromContentType(binary.contentType);
    const imageName = `${baseImageName}${extension}`;
    const imagePath = path.join(IMAGES_DIR, imageName);

    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    fs.writeFileSync(imagePath, binary.buffer);

    const updatedContent = replaceImageField(postContent, imageName);
    fs.writeFileSync(postFilePath, updatedContent, 'utf-8');

    console.log(`Saved image: ${imagePath}`);
    console.log(`Updated post frontmatter: ${path.basename(postFilePath)}`);
}

function postNeedsImage(postFilePath) {
  const postContent = fs.readFileSync(postFilePath, 'utf-8');
  const { frontmatter } = parseFrontmatter(postContent);
  if (!frontmatter.slug) return false;

  if (!frontmatter.image) return true;

  const imagePath = path.join(IMAGES_DIR, frontmatter.image);
  return !fs.existsSync(imagePath);
}

async function main() {
  loadEnvFile();

  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.missing) {
      const postsToProcess = listPostFiles().filter(postNeedsImage);

      if (postsToProcess.length === 0) {
        console.log('All posts already have local hero images.');
        return;
      }

      for (const postFilePath of postsToProcess) {
        await generateForPost(postFilePath, args);
      }
      return;
    }

    const postFilePath = resolvePostFile(args.post);
    await generateForPost(postFilePath, args);
  } catch (error) {
    console.error(`Image generation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

main();

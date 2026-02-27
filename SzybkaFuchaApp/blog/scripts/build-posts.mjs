#!/usr/bin/env node

/**
 * build-posts.mjs
 * 
 * Converts Markdown posts (with YAML frontmatter) to HTML.
 * - Reads from: blog/content/posts/*.md
 * - Writes to: blog/public/blog/*.html
 * - Copies images to: blog/public/images/
 * - Updates: blog/public/index.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(BLOG_ROOT, 'content', 'posts');
const IMAGES_SRC = path.join(BLOG_ROOT, 'content', 'images');
const PUBLIC_BLOG = path.join(BLOG_ROOT, 'public', 'blog');
const PUBLIC_IMAGES = path.join(BLOG_ROOT, 'public', 'images');
const TEMPLATES_DIR = path.join(BLOG_ROOT, 'templates');
const POST_TEMPLATE = fs.readFileSync(path.join(TEMPLATES_DIR, 'post.html'), 'utf-8');
const INDEX_TEMPLATE = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.html'), 'utf-8');

// Ensure output directories exist
[PUBLIC_BLOG, PUBLIC_IMAGES].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Parse YAML frontmatter
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim();
      // Remove quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/"/g, ''));
      }
      frontmatter[key.trim()] = value;
    }
  }

  return { frontmatter, body: match[2] };
}

/**
 * Convert Markdown to HTML (simple converter)
 */
function markdownToHtml(md) {
  let html = md
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/^\- (.*?)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li>$1. $2</li>')
    .replace(/(?:<li>.*?<\/li>\n?)+/s, match => '<ul>' + match + '</ul>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>');

  return html;
}

/**
 * Build a single post
 */
function buildPost(filename) {
  const filePath = path.join(POSTS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter.slug || !frontmatter.date) {
    console.error(`❌ Missing slug or date in ${filename}`);
    return null;
  }

  const bodyHtml = markdownToHtml(body);
  
  // Build tags HTML
  const tagsHtml = frontmatter.tags
    ? frontmatter.tags.map(tag => `<span class="category-badge">${tag}</span>`).join('')
    : '';

  // Featured image
  let imageHtml = '';
  if (frontmatter.image) {
    imageHtml = `<div class="featured-image"><img src="/blog/images/${frontmatter.image}" alt="${frontmatter.title}"></div>`;
  }

  // Copy image to public folder
  if (frontmatter.image) {
    const srcImg = path.join(IMAGES_SRC, frontmatter.image);
    const destImg = path.join(PUBLIC_IMAGES, frontmatter.image);
    if (fs.existsSync(srcImg)) {
      fs.copyFileSync(srcImg, destImg);
    }
  }

  // Build HTML
  let html = POST_TEMPLATE
    .replace('{{TITLE}}', frontmatter.title || 'Bez tytułu')
    .replace('{{DATE}}', frontmatter.date || 'Brak daty')
    .replace('{{TIME}}', frontmatter.time || '—')
    .replace('{{COST}}', frontmatter.cost || '—')
    .replace('{{DIFFICULTY}}', frontmatter.difficulty || '?')
    .replace('{{TAGS}}', tagsHtml)
    .replace('{{FEATURED_IMAGE}}', imageHtml)
    .replace('{{DESCRIPTION}}', frontmatter.description || 'SzybkaFucha')
    .replace('{{CONTENT}}', bodyHtml);

  // Write HTML
  const outPath = path.join(PUBLIC_BLOG, `${frontmatter.slug}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`✅ Built: ${outPath}`);

  return {
    title: frontmatter.title,
    slug: frontmatter.slug,
    date: frontmatter.date,
    description: frontmatter.description,
    image: frontmatter.image,
    time: frontmatter.time,
    cost: frontmatter.cost,
    tags: frontmatter.tags || [],
  };
}

/**
 * Build index
 */
function buildIndex(posts) {
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const postsGrid = sortedPosts.map(post => `
    <div class="post-card" onclick="window.location.href='/blog/${post.slug}.html'">
      ${post.image ? `<img src="/blog/images/${post.image}" alt="${post.title}">` : ''}
      <div class="post-card-content">
        <h2>${post.title}</h2>
        <p>${post.description}</p>
        <div class="post-meta">
          <span>📅 ${post.date}</span>
          <span>⏱️ ${post.time}</span>
        </div>
      </div>
    </div>
  `).join('\n');

  const indexHtml = INDEX_TEMPLATE.replace('{{POSTS_GRID}}', postsGrid);
  const indexPath = path.join(BLOG_ROOT, 'public', 'index.html');
  fs.writeFileSync(indexPath, indexHtml, 'utf-8');
  console.log(`✅ Built: ${indexPath}`);
}

/**
 * Main
 */
function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('📁 No posts directory yet. Creating...');
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    return;
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  
  if (files.length === 0) {
    console.log('📝 No posts found. Skipping build.');
    return;
  }

  console.log(`\n🔨 Building ${files.length} post(s)...\n`);

  const posts = [];
  for (const file of files) {
    const post = buildPost(file);
    if (post) posts.push(post);
  }

  buildIndex(posts);
  console.log(`\n✨ Build complete! ${posts.length} post(s) published.\n`);
}

main();

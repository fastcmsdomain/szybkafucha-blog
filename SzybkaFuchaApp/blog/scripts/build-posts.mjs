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
const SITE_URL = 'https://fastcmsdomain.github.io/szybkafucha-blog';

function fillTemplate(template, values) {
  return Object.entries(values).reduce((output, [key, value]) => {
    return output.replaceAll(`{{${key}}}`, value);
  }, template);
}

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
 * Minimal markdown utilities for blog posts.
 */
function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function applyInlineFormatting(text) {
  const escaped = escapeHtml(text);

  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function normalizeMarkdown(md) {
  return md
    .replace(/\r\n/g, '\n')
    .replace(/^# .*\n+/m, '')
    .replace(/\n---\s*\n\*\*Potrzebujesz[\s\S]*$/m, '')
    .trim();
}

function formatDatePl(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue || 'Brak daty';
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function estimateReadingTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min czytania`;
}

function markdownToArticle(md) {
  const normalized = normalizeMarkdown(md);
  const lines = normalized.split('\n');
  const blocks = [];

  let paragraph = [];
  let listType = null;
  let listItems = [];
  let lead = '';
  let awaitingLead = false;

  function flushParagraph() {
    if (paragraph.length === 0) return;

    const text = paragraph.join(' ').trim();
    if (!text) {
      paragraph = [];
      return;
    }

    if (!lead && awaitingLead) {
      lead = text;
      awaitingLead = false;
    } else {
      blocks.push(`<p>${applyInlineFormatting(text)}</p>`);
    }

    paragraph = [];
  }

  function flushList() {
    if (!listType || listItems.length === 0) return;

    const tag = listType === 'ol' ? 'ol' : 'ul';
    const items = listItems.map(item => `<li>${applyInlineFormatting(item)}</li>`).join('');
    blocks.push(`<${tag}>${items}</${tag}>`);
    listType = null;
    listItems = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    const unorderedMatch = line.match(/^- (.*)$/);
    const h2Match = line.match(/^##\s+(.*)$/);
    const h3Match = line.match(/^###\s+(.*)$/);

    if (h2Match) {
      flushParagraph();
      flushList();

      const heading = h2Match[1].trim();
      if (!lead && heading.toLowerCase() === 'wstęp') {
        awaitingLead = true;
      } else {
        awaitingLead = false;
        blocks.push(`<h2>${applyInlineFormatting(heading)}</h2>`);
      }
      continue;
    }

    if (h3Match) {
      flushParagraph();
      flushList();
      awaitingLead = false;
      blocks.push(`<h3>${applyInlineFormatting(h3Match[1].trim())}</h3>`);
      continue;
    }

    if (orderedMatch) {
      flushParagraph();
      awaitingLead = false;
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(orderedMatch[2].trim());
      continue;
    }

    if (unorderedMatch) {
      flushParagraph();
      awaitingLead = false;
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(unorderedMatch[1].trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  if (!lead) {
    const firstParagraphIndex = blocks.findIndex(block => block.startsWith('<p>'));
    if (firstParagraphIndex >= 0) {
      lead = blocks[firstParagraphIndex]
        .replace(/^<p>/, '')
        .replace(/<\/p>$/, '')
        .replace(/<[^>]+>/g, '');
      blocks.splice(firstParagraphIndex, 1);
    }
  }

  return {
    lead: applyInlineFormatting(lead || 'Praktyczny poradnik krok po kroku dla osób, które chcą szybko uporać się z zadaniem.'),
    bodyHtml: blocks
      .join('\n')
      .replace(/<\/ol>\s*<ol>/g, '')
      .replace(/<\/ul>\s*<ul>/g, ''),
  };
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

  if (!frontmatter.description && frontmatter.excerpt) {
    frontmatter.description = frontmatter.excerpt;
  }

  if (!frontmatter.tags && frontmatter.category) {
    frontmatter.tags = [frontmatter.category];
  }

  const article = markdownToArticle(body);
  const description = frontmatter.description || article.lead.replace(/<[^>]+>/g, '');
  const readingTime = estimateReadingTime(body);
  const timeLabel = frontmatter.time ? 'Czas pracy' : 'Czas czytania';
  const timeValue = frontmatter.time || readingTime;
  const difficultyValue = frontmatter.difficulty || '1';
  const postUrl = `${SITE_URL}/blog/${frontmatter.slug}.html`;
  const imageUrl = frontmatter.image ? `${SITE_URL}/images/${frontmatter.image}` : '';
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
  
  // Build tags HTML
  const tagsHtml = tags
    .map(tag => `<span class="article-tag">${escapeHtml(tag)}</span>`)
    .join('');

  // Featured image
  let imageHtml = '';
  if (frontmatter.image) {
    imageHtml = `
      <div class="article-cover">
        <img src="../images/${frontmatter.image}" alt="${escapeHtml(frontmatter.title)}" loading="eager">
      </div>
    `;
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
  let html = fillTemplate(POST_TEMPLATE, {
    TITLE: frontmatter.title || 'Bez tytułu',
    DATE: frontmatter.date || 'Brak daty',
    FORMATTED_DATE: formatDatePl(frontmatter.date),
    TIME: timeValue,
    TIME_LABEL: timeLabel,
    COST: frontmatter.cost || 'Według materiałów',
    DIFFICULTY: difficultyValue,
    TAGS: tagsHtml,
    FEATURED_IMAGE: imageHtml,
    NO_COVER_CLASS: frontmatter.image ? '' : ' article-card--no-cover',
    DESCRIPTION: description,
    CONTENT: article.bodyHtml,
    LEAD: article.lead,
    POST_URL: postUrl,
    IMAGE_URL: imageUrl,
    TAGS_TEXT: escapeHtml(tags.join(', ') || 'dom, ogród, poradniki'),
  });

  // Write HTML
  const outPath = path.join(PUBLIC_BLOG, `${frontmatter.slug}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`✅ Built: ${outPath}`);

  return {
    title: frontmatter.title,
    slug: frontmatter.slug,
    date: frontmatter.date,
    description,
    image: frontmatter.image,
    time: timeValue,
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
    <div class="post-card" onclick="window.location.href='blog/${post.slug}.html'">
      ${post.image ? `<img src="images/${post.image}" alt="${post.title}">` : ''}
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

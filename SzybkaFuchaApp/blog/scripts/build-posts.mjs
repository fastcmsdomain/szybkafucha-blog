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
const IMAGE_VARIANTS_DIR = path.join(BLOG_ROOT, '.cache', 'image-variants');
const PUBLIC_BLOG = path.join(BLOG_ROOT, 'public', 'blog');
const PUBLIC_IMAGES = path.join(BLOG_ROOT, 'public', 'images');
const TEMPLATES_DIR = path.join(BLOG_ROOT, 'templates');
const POST_TEMPLATE = fs.readFileSync(path.join(TEMPLATES_DIR, 'post.html'), 'utf-8');
const INDEX_TEMPLATE = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.html'), 'utf-8');
const SITE_URL = 'https://fastcmsdomain.github.io/szybkafucha-blog';
const SITE_NAME = 'SzybkaFucha Blog';
const SITE_LOCALE = 'pl_PL';
const SITE_LANGUAGE = 'pl';
const PUBLISHER_NAME = 'SzybkaFucha';
const PUBLISHER_LOGO_URL = `${SITE_URL}/images/logo-512.png`;

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

function jsonLd(data) {
  return JSON.stringify(data, null, 2).replaceAll('</script>', '<\\/script>');
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

function getWarsawDateTime(dateValue) {
  const base = new Date(`${dateValue}T09:00:00Z`);
  if (Number.isNaN(base.getTime())) {
    return dateValue || '';
  }

  const timeZoneName = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Warsaw',
    timeZoneName: 'longOffset',
    hour: '2-digit',
  }).formatToParts(base).find(part => part.type === 'timeZoneName')?.value || 'GMT+00:00';

  const offset = timeZoneName.replace('GMT', '');
  return `${dateValue}T09:00:00${offset}`;
}

function readImageSize(filePath) {
  if (!fs.existsSync(filePath)) return null;

  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 24) return null;

  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1];
      const size = buffer.readUInt16BE(offset + 2);

      if (
        [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)
      ) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }

      offset += 2 + size;
    }
  }

  return null;
}

function copyFileIfExists(sourcePath, destinationPath) {
  if (!fs.existsSync(sourcePath)) return false;
  fs.copyFileSync(sourcePath, destinationPath);
  return true;
}

function getImageVariantNames(imageName) {
  const baseName = path.parse(imageName).name;
  const variants = {
    avif: `${baseName}.avif`,
    webp: `${baseName}.webp`,
  };

  return Object.fromEntries(
    Object.entries(variants).map(([format, fileName]) => [
      format,
      fs.existsSync(path.join(IMAGE_VARIANTS_DIR, fileName)) ? fileName : '',
    ]),
  );
}

function copyImageAssets(imageName) {
  const copied = {
    original: '',
    avif: '',
    webp: '',
  };

  const originalSource = path.join(IMAGES_SRC, imageName);
  const originalDest = path.join(PUBLIC_IMAGES, imageName);
  if (copyFileIfExists(originalSource, originalDest)) {
    copied.original = imageName;
  }

  const variants = getImageVariantNames(imageName);
  for (const [format, fileName] of Object.entries(variants)) {
    if (!fileName) continue;
    const sourcePath = path.join(IMAGE_VARIANTS_DIR, fileName);
    const destPath = path.join(PUBLIC_IMAGES, fileName);
    if (copyFileIfExists(sourcePath, destPath)) {
      copied[format] = fileName;
    }
  }

  return copied;
}

function buildResponsiveImageMarkup({ imageName, alt, srcPrefix, imageWidth, imageHeight, loading = 'lazy', decoding = 'async', fetchPriority = '' }) {
  if (!imageName) return '';

  const variants = getImageVariantNames(imageName);
  const sourceTags = [
    variants.avif ? `<source srcset="${srcPrefix}${variants.avif}" type="image/avif">` : '',
    variants.webp ? `<source srcset="${srcPrefix}${variants.webp}" type="image/webp">` : '',
  ].filter(Boolean).join('');

  return `<picture>${sourceTags}<img src="${srcPrefix}${imageName}" alt="${escapeHtml(alt)}" loading="${loading}"${fetchPriority ? ` fetchpriority="${fetchPriority}"` : ''} decoding="${decoding}"${imageWidth ? ` width="${imageWidth}"` : ''}${imageHeight ? ` height="${imageHeight}"` : ''}></picture>`;
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
  const publishedDateTime = formatDatePl(frontmatter.date) ? getWarsawDateTime(frontmatter.date) : '';
  
  // Build tags HTML
  const tagsHtml = tags
    .map(tag => `<span class="article-tag">${escapeHtml(tag)}</span>`)
    .join('');

  // Featured image
  let imageHtml = '';
  let imagePreload = '';
  let imageMetaTags = '';
  let articleMetaTags = '';
  let imageStructuredData = '[]';
  let imageWidth = '';
  let imageHeight = '';
  if (frontmatter.image) {
    const sourceImagePath = path.join(IMAGES_SRC, frontmatter.image);
    const imageSize = readImageSize(sourceImagePath);
    imageWidth = imageSize?.width ? String(imageSize.width) : '';
    imageHeight = imageSize?.height ? String(imageSize.height) : '';
    copyImageAssets(frontmatter.image);

    imageHtml = `
      <div class="article-cover">
        ${buildResponsiveImageMarkup({
          imageName: frontmatter.image,
          alt: frontmatter.title,
          srcPrefix: '../images/',
          imageWidth,
          imageHeight,
          loading: 'eager',
          decoding: 'async',
          fetchPriority: 'high',
        })}
      </div>
    `;

    imagePreload = `<link rel="preload" href="../images/${frontmatter.image}" as="image" fetchpriority="high">`;
    imageMetaTags = [
      `<meta property="og:image" content="${imageUrl}">`,
      imageWidth ? `<meta property="og:image:width" content="${imageWidth}">` : '',
      imageHeight ? `<meta property="og:image:height" content="${imageHeight}">` : '',
      `<meta name="twitter:image" content="${imageUrl}">`,
    ].filter(Boolean).join('\n    ');

    imageStructuredData = jsonLd([
      {
        '@type': 'ImageObject',
        url: imageUrl,
        ...(imageWidth ? { width: Number(imageWidth) } : {}),
        ...(imageHeight ? { height: Number(imageHeight) } : {}),
      },
    ]);
  }

  articleMetaTags = [
    publishedDateTime ? `<meta property="article:published_time" content="${publishedDateTime}">` : '',
    publishedDateTime ? `<meta property="article:modified_time" content="${publishedDateTime}">` : '',
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    ...tags.map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}">`),
  ].filter(Boolean).join('\n    ');
  // Build HTML
  let html = fillTemplate(POST_TEMPLATE, {
    TITLE: frontmatter.title || 'Bez tytułu',
    DATE: frontmatter.date || 'Brak daty',
    FORMATTED_DATE: formatDatePl(frontmatter.date),
    DATE_TIME: publishedDateTime || frontmatter.date || '',
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
    SITE_URL,
    SITE_NAME,
    SITE_LOCALE,
    SITE_LANGUAGE,
    PUBLISHER_NAME,
    PUBLISHER_LOGO_URL,
    IMAGE_PRELOAD: imagePreload,
    IMAGE_META_TAGS: imageMetaTags,
    ARTICLE_META_TAGS: articleMetaTags,
    ARTICLE_STRUCTURED_DATA: jsonLd({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': postUrl,
      },
      headline: frontmatter.title || 'Bez tytułu',
      description,
      inLanguage: SITE_LANGUAGE,
      datePublished: publishedDateTime || frontmatter.date,
      dateModified: publishedDateTime || frontmatter.date,
      author: {
        '@type': 'Organization',
        name: PUBLISHER_NAME,
      },
      publisher: {
        '@type': 'Organization',
        name: PUBLISHER_NAME,
        logo: {
          '@type': 'ImageObject',
          url: PUBLISHER_LOGO_URL,
        },
      },
      articleSection: tags[0] || 'poradniki',
      keywords: tags.join(', '),
      image: frontmatter.image
        ? JSON.parse(imageStructuredData)
        : undefined,
    }),
    BREADCRUMB_STRUCTURED_DATA: jsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Start',
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${SITE_URL}/#posts`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: frontmatter.title || 'Bez tytułu',
          item: postUrl,
        },
      ],
    }),
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
    imageWidth,
    imageHeight,
  };
}

/**
 * Build index
 */
function buildIndex(posts) {
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const postsGrid = sortedPosts.map(post => `
    <a class="post-card" href="blog/${post.slug}.html" aria-label="Czytaj wpis: ${escapeHtml(post.title)}">
      ${post.image ? buildResponsiveImageMarkup({
        imageName: post.image,
        alt: post.title,
        srcPrefix: 'images/',
        imageWidth: post.imageWidth,
        imageHeight: post.imageHeight,
        loading: 'lazy',
        decoding: 'async',
      }) : ''}
      <div class="post-card-content">
        <h2>${escapeHtml(post.title)}</h2>
        <p>${escapeHtml(post.description || '')}</p>
        <div class="post-meta">
          <span>📅 ${escapeHtml(post.date || '')}</span>
          <span>⏱️ ${escapeHtml(post.time || 'Czas czytania w budowie')}</span>
        </div>
      </div>
    </a>
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

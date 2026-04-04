#!/usr/bin/env node

/**
 * Survey script for https://www.anthropic.com/
 * Captures screenshots, extracts design tokens, interactions, and page topology.
 */

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

const DESIGN_REFS = resolve(PROJECT_ROOT, 'docs', 'design-references');
const RESEARCH = resolve(PROJECT_ROOT, 'docs', 'research');

mkdirSync(DESIGN_REFS, { recursive: true });
mkdirSync(RESEARCH, { recursive: true });

const TARGET_URL = 'https://www.anthropic.com/';

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });

  try {
    // ---- Desktop screenshots (1440px) ----
    console.log('\n=== Desktop (1440px) ===');
    const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopCtx.newPage();
    await desktopPage.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await desktopPage.waitForTimeout(2000);

    // Scroll to trigger lazy content
    console.log('Scrolling to trigger lazy content...');
    await autoScroll(desktopPage);
    await desktopPage.waitForTimeout(1000);

    // Full-page screenshot
    await desktopPage.screenshot({ path: resolve(DESIGN_REFS, 'anthropic-desktop-full.png'), fullPage: true });
    console.log('Saved desktop full-page screenshot');

    // Viewport screenshot
    await desktopPage.evaluate(() => window.scrollTo(0, 0));
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: resolve(DESIGN_REFS, 'anthropic-desktop-viewport.png') });
    console.log('Saved desktop viewport screenshot');

    // ---- Extract design tokens ----
    console.log('\n=== Extracting design tokens ===');
    const tokens = await desktopPage.evaluate(() => {
      // Fonts
      const fontFaces = [];
      try {
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              if (rule instanceof CSSFontFaceRule) {
                fontFaces.push({
                  family: rule.style.fontFamily,
                  src: rule.style.src,
                  weight: rule.style.fontWeight,
                  style: rule.style.fontStyle,
                });
              }
            }
          } catch {}
        }
      } catch {}

      const googleFonts = [...document.querySelectorAll('link[href*="fonts.googleapis"]')].map(l => l.href);
      const computedFonts = [...new Set(
        [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,span,button,input,label,code,div')]
          .slice(0, 100)
          .map(el => getComputedStyle(el).fontFamily)
      )];

      // Colors
      const colors = new Set();
      [...document.querySelectorAll('*')].slice(0, 200).forEach(el => {
        const cs = getComputedStyle(el);
        [cs.color, cs.backgroundColor, cs.borderColor].forEach(c => {
          if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') colors.add(c);
        });
      });

      // Favicons & meta
      const favicons = [...document.querySelectorAll('link[rel*="icon"],link[rel="apple-touch-icon"],link[rel="manifest"]')]
        .map(l => ({ rel: l.rel, href: l.href, sizes: l.sizes?.toString(), type: l.type }));

      const meta = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        ogImage: document.querySelector('meta[property="og:image"]')?.content,
        themeColor: document.querySelector('meta[name="theme-color"]')?.content,
        lang: document.documentElement.lang,
      };

      return {
        fonts: { fontFaces, googleFonts, computedFonts },
        colors: [...colors],
        favicons,
        meta,
      };
    });

    writeFileSync(resolve(RESEARCH, 'design-tokens.json'), JSON.stringify(tokens, null, 2));
    console.log('Saved design-tokens.json');
    console.log(`  Fonts found: ${tokens.fonts.computedFonts.length}`);
    console.log(`  Colors found: ${tokens.colors.length}`);
    console.log(`  Lang: ${tokens.meta.lang}`);

    // ---- Extract page topology ----
    console.log('\n=== Extracting page topology ===');
    const topology = await desktopPage.evaluate(() => {
      const sections = [];
      // Get all direct children of body or main that look like sections
      const mainEl = document.querySelector('main') || document.body;
      const candidates = [...mainEl.children];

      candidates.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (rect.height < 10) return; // skip tiny elements

        sections.push({
          index: i,
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          classes: el.className?.toString?.().split(' ').filter(Boolean).slice(0, 5) || [],
          position: cs.position,
          height: Math.round(rect.height),
          top: Math.round(rect.top + window.scrollY),
          childCount: el.children.length,
          textPreview: el.textContent?.trim().slice(0, 120) || '',
          hasVideo: !!el.querySelector('video'),
          hasImages: el.querySelectorAll('img').length,
          hasSVGs: el.querySelectorAll('svg').length,
        });
      });

      // Also get header/nav and footer
      const header = document.querySelector('header,nav,[role="navigation"]');
      const footer = document.querySelector('footer');

      return {
        totalHeight: document.body.scrollHeight,
        sections,
        headerTag: header?.tagName?.toLowerCase(),
        headerClasses: header?.className?.toString?.().split(' ').filter(Boolean).slice(0, 5),
        footerTag: footer?.tagName?.toLowerCase(),
        footerClasses: footer?.className?.toString?.().split(' ').filter(Boolean).slice(0, 5),
      };
    });

    writeFileSync(resolve(RESEARCH, 'topology.json'), JSON.stringify(topology, null, 2));
    console.log('Saved topology.json');
    console.log(`  Page height: ${topology.totalHeight}px`);
    console.log(`  Sections found: ${topology.sections.length}`);

    // ---- Extract all assets ----
    console.log('\n=== Discovering assets ===');
    const assets = await desktopPage.evaluate(() => {
      return {
        images: [...document.querySelectorAll('img')].map(img => ({
          src: img.currentSrc || img.src,
          alt: img.alt,
          width: img.naturalWidth,
          height: img.naturalHeight,
        })),
        videos: [...document.querySelectorAll('video')].map(v => ({
          src: v.src || v.querySelector('source')?.src,
          poster: v.poster,
          autoplay: v.autoplay,
          loop: v.loop,
          muted: v.muted,
        })),
        backgroundImages: [...document.querySelectorAll('*')].filter(el => {
          const bg = getComputedStyle(el).backgroundImage;
          return bg && bg !== 'none';
        }).slice(0, 50).map(el => ({
          url: getComputedStyle(el).backgroundImage,
          element: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.toString().split(' ')[0] : ''),
        })),
        svgCount: document.querySelectorAll('svg').length,
        linkTags: [...document.querySelectorAll('link[rel*="icon"],link[rel="apple-touch-icon"]')].map(l => l.href),
      };
    });

    writeFileSync(resolve(RESEARCH, 'assets.json'), JSON.stringify(assets, null, 2));
    console.log('Saved assets.json');
    console.log(`  Images: ${assets.images.length}`);
    console.log(`  Videos: ${assets.videos.length}`);
    console.log(`  Background images: ${assets.backgroundImages.length}`);
    console.log(`  SVGs: ${assets.svgCount}`);

    // ---- Extract full HTML structure for analysis ----
    console.log('\n=== Extracting HTML structure ===');
    const htmlStructure = await desktopPage.evaluate(() => {
      function walkDOM(el, depth = 0) {
        if (depth > 4) return null;
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || undefined,
          classes: el.className?.toString?.().split(' ').filter(Boolean).slice(0, 8) || [],
          text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
            ? el.textContent.trim().slice(0, 200)
            : undefined,
          rect: { x: Math.round(rect.x), y: Math.round(rect.y + window.scrollY), w: Math.round(rect.width), h: Math.round(rect.height) },
          styles: {
            display: cs.display,
            position: cs.position,
            bg: cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : undefined,
            color: cs.color,
            fontSize: cs.fontSize,
            fontFamily: cs.fontFamily?.split(',')[0]?.trim(),
          },
          children: [...el.children].slice(0, 20).map(c => walkDOM(c, depth + 1)).filter(Boolean),
        };
      }
      const body = document.body;
      return walkDOM(body, 0);
    });

    writeFileSync(resolve(RESEARCH, 'html-structure.json'), JSON.stringify(htmlStructure, null, 2));
    console.log('Saved html-structure.json');

    // ---- Mobile screenshots (390px) ----
    console.log('\n=== Mobile (390px) ===');
    const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileCtx.newPage();
    await mobilePage.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await mobilePage.waitForTimeout(2000);
    await autoScroll(mobilePage);
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: resolve(DESIGN_REFS, 'anthropic-mobile-full.png'), fullPage: true });
    console.log('Saved mobile full-page screenshot');

    // ---- Interactive sweep ----
    console.log('\n=== Interactive element sweep ===');
    await desktopPage.evaluate(() => window.scrollTo(0, 0));
    await desktopPage.waitForTimeout(500);

    const interactiveElements = await desktopPage.evaluate(() => {
      const buttons = [...document.querySelectorAll('a, button, [role="button"]')].slice(0, 50).map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim().slice(0, 80),
        href: el.href || null,
        classes: el.className?.toString?.().split(' ').filter(Boolean).slice(0, 5),
      }));

      const navItems = [...document.querySelectorAll('nav a, header a, [role="navigation"] a')].map(el => ({
        text: el.textContent?.trim(),
        href: el.href,
      }));

      return { buttons, navItems };
    });

    writeFileSync(resolve(RESEARCH, 'interactive-elements.json'), JSON.stringify(interactiveElements, null, 2));
    console.log('Saved interactive-elements.json');
    console.log(`  Buttons/links: ${interactiveElements.buttons.length}`);
    console.log(`  Nav items: ${interactiveElements.navItems.length}`);

    await desktopCtx.close();
    await mobileCtx.close();

    console.log('\n=== Survey complete ===');
    console.log('Files generated:');
    console.log('  docs/design-references/anthropic-desktop-full.png');
    console.log('  docs/design-references/anthropic-desktop-viewport.png');
    console.log('  docs/design-references/anthropic-mobile-full.png');
    console.log('  docs/research/design-tokens.json');
    console.log('  docs/research/topology.json');
    console.log('  docs/research/assets.json');
    console.log('  docs/research/html-structure.json');
    console.log('  docs/research/interactive-elements.json');

  } finally {
    await browser.close();
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    const totalHeight = document.body.scrollHeight;
    const step = window.innerHeight / 2;
    for (let y = 0; y < totalHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 400));
    }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 500));
  });
}

main().catch(err => {
  console.error('Survey failed:', err);
  process.exit(1);
});

import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the instagram-feed block
 *
 * Expected authored structure:
 *   Row 1: heading + a link (the @handle button)
 *   Following rows: images (the scattered gram photos) — any number; the first
 *     five are positioned around the centered content, extras are hidden.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const images = [];
  let contentRow = null;

  rows.forEach((row) => {
    const imgs = row.querySelectorAll('img');
    if (imgs.length && row.textContent.trim() === '') {
      imgs.forEach((img) => images.push(img));
    } else if (!contentRow && (row.querySelector('h1,h2,h3,h4,h5,h6') || row.querySelector('a'))) {
      contentRow = row;
    } else if (imgs.length) {
      imgs.forEach((img) => images.push(img));
    }
  });

  // ===== centered content (heading + handle button) =====
  const content = document.createElement('div');
  content.className = 'instagram-feed-content';

  if (contentRow) {
    const heading = contentRow.querySelector('h1,h2,h3,h4,h5,h6');
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      content.append(h2);
    }
    const link = contentRow.querySelector('a');
    if (link) {
      const btn = document.createElement('a');
      btn.className = 'instagram-feed-handle';
      btn.href = link.getAttribute('href') || '#';
      btn.textContent = link.textContent.trim();
      if (/^https?:/.test(btn.href)) {
        btn.target = '_blank';
        btn.rel = 'noopener';
      }
      content.append(btn);
    }
  }

  // ===== scattered images =====
  const gallery = document.createElement('div');
  gallery.className = 'instagram-feed-gallery';
  images.slice(0, 5).forEach((img, i) => {
    const fig = document.createElement('div');
    fig.className = `instagram-feed-img instagram-feed-img-${i + 1}`;
    fig.append(createOptimizedPicture(img.src, img.alt || 'instagram', false, [{ width: '500' }]));
    gallery.append(fig);
  });

  block.replaceChildren(gallery, content);
}

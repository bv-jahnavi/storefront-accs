import { createOptimizedPicture } from '../../scripts/aem.js';

const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z"/></svg>';
const QUOTE_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M20 10c-6.6 0-12 5.4-12 12v16h16V22h-8c0-4.4 3.6-8 8-8V10zm20 0c-6.6 0-12 5.4-12 12v16h16V22h-8c0-4.4 3.6-8 8-8V10z"/></svg>';
const CARET_LEFT = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const CARET_RIGHT = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

/**
 * Build the star rating row.
 * @param {number} count number of filled stars (default 5)
 */
function buildRating(count = 5) {
  const rating = document.createElement('div');
  rating.className = 'testimonials-rating';
  rating.setAttribute('aria-label', `${count} out of 5 stars`);
  rating.innerHTML = STAR_SVG.repeat(count);
  return rating;
}

/**
 * loads and decorates the testimonials block
 *
 * Expected authored structure:
 *   Row 1: single cell — heading ("Testimonials")
 *   Rows 2..n where the row has TWO cells: [quote text] | [author + purchased item link]
 *     -> treated as a review slide
 *   A row whose cell contains only images -> gallery images (any number)
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const reviews = [];
  const galleryImgs = [];
  let heading = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    const imgs = row.querySelectorAll('img');

    // gallery row: a cell that is only images
    if (imgs.length && row.textContent.trim() === '') {
      imgs.forEach((img) => galleryImgs.push(img));
      return;
    }

    // heading row: single cell, has a heading or short text, no author link structure
    if (cells.length === 1 && !heading && !imgs.length) {
      [heading] = cells;
      return;
    }

    // review row: quote + author
    if (cells.length >= 2) {
      reviews.push({ quote: cells[0], author: cells[1] });
    } else if (cells.length === 1 && cells[0].textContent.trim()) {
      reviews.push({ quote: cells[0], author: null });
    }
  });

  // ===== build left column: heading + review carousel =====
  const left = document.createElement('div');
  left.className = 'testimonials-content';

  const headingWrap = document.createElement('div');
  headingWrap.className = 'testimonials-heading';
  const icon = document.createElement('span');
  icon.className = 'testimonials-quote-icon';
  icon.innerHTML = QUOTE_SVG;
  headingWrap.append(icon);
  if (heading) {
    const h = heading.querySelector('h1,h2,h3,h4,h5,h6') || heading;
    const h2 = document.createElement('h2');
    h2.textContent = h.textContent.trim() || 'Testimonials';
    headingWrap.append(h2);
  }
  left.append(headingWrap);

  const viewport = document.createElement('div');
  viewport.className = 'testimonials-viewport';
  const track = document.createElement('div');
  track.className = 'testimonials-track';

  reviews.forEach(({ quote, author }) => {
    const slide = document.createElement('div');
    slide.className = 'testimonials-slide';
    const item = document.createElement('blockquote');
    item.className = 'testimonials-item';
    item.append(buildRating(5));

    const desc = document.createElement('p');
    desc.className = 'testimonials-desc';
    // strip any leading/trailing straight or curly quotes, then wrap consistently
    const rawQuote = quote.textContent.trim().replace(/^["“”']+|["“”']+$/g, '').trim();
    desc.textContent = `“${rawQuote}”`;
    item.append(desc);

    if (author) {
      const authorEl = document.createElement('div');
      authorEl.className = 'testimonials-author';
      // wrap a leading bare text node (the name) in a styled element
      const first = author.firstChild;
      if (first && first.nodeType === Node.TEXT_NODE && first.textContent.trim()) {
        const name = document.createElement('span');
        name.className = 'testimonials-name';
        name.textContent = first.textContent.trim();
        authorEl.append(name);
        first.remove();
      }
      // preserve remaining author markup (purchased item line)
      while (author.firstChild) authorEl.append(author.firstChild);
      item.append(authorEl);
    }
    slide.append(item);
    track.append(slide);
  });

  viewport.append(track);
  left.append(viewport);

  // nav buttons
  const nav = document.createElement('div');
  nav.className = 'testimonials-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'testimonials-btn testimonials-prev';
  prev.setAttribute('aria-label', 'Previous testimonial');
  prev.innerHTML = CARET_LEFT;
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'testimonials-btn testimonials-next';
  next.setAttribute('aria-label', 'Next testimonial');
  next.innerHTML = CARET_RIGHT;
  nav.append(prev, next);
  if (reviews.length > 1) left.append(nav);

  // carousel logic
  let index = 0;
  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    prev.disabled = index === 0;
    next.disabled = index === reviews.length - 1;
  };
  prev.addEventListener('click', () => { index = Math.max(0, index - 1); update(); });
  next.addEventListener('click', () => {
    index = Math.min(reviews.length - 1, index + 1);
    update();
  });
  update();

  // ===== build right column: two infinite-scroll image galleries =====
  const right = document.createElement('div');
  right.className = 'testimonials-gallery';

  if (galleryImgs.length) {
    const optimized = galleryImgs.map((img) => createOptimizedPicture(
      img.src,
      img.alt || 'testimonial',
      false,
      [{ width: '568' }],
    ));

    // split into two columns
    const mid = Math.ceil(optimized.length / 2);
    const colA = optimized.slice(0, mid);
    const colB = optimized.slice(mid).length ? optimized.slice(mid) : optimized.slice(0, mid);

    [['up', colA], ['down', colB]].forEach(([dir, pics]) => {
      const col = document.createElement('div');
      col.className = `testimonials-gallery-col testimonials-gallery-${dir}`;
      const strip = document.createElement('div');
      strip.className = 'testimonials-gallery-strip';
      // duplicate the set so the scroll loops seamlessly
      [...pics, ...pics].forEach((pic) => {
        const cell = document.createElement('div');
        cell.className = 'testimonials-gallery-item';
        cell.append(pic.cloneNode(true));
        strip.append(cell);
      });
      col.append(strip);
      right.append(col);
    });
  }

  block.replaceChildren(left, right);
}

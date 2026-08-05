import { createOptimizedPicture } from '../../scripts/aem.js';

const UNITS = [
  { label: 'Days', ms: 24 * 60 * 60 * 1000 },
  { label: 'Hours', ms: 60 * 60 * 1000 },
  { label: 'Mins', ms: 60 * 1000 },
  { label: 'Secs', ms: 1000 },
];

/**
 * Parse the target end time from the authored countdown text.
 * Accepts either an ISO/date string or a number of seconds from now.
 * @param {string} raw
 * @returns {number} target timestamp in ms
 */
function resolveTarget(raw) {
  const text = (raw || '').trim();
  const asNumber = Number(text);
  if (text && !Number.isNaN(asNumber)) {
    // treat as seconds from load time
    return Date.now() + asNumber * 1000;
  }
  const parsed = Date.parse(text);
  if (!Number.isNaN(parsed)) return parsed;
  // fallback: 7 days from now
  return Date.now() + 7 * UNITS[0].ms;
}

/**
 * Build the countdown timer element and start ticking.
 * @param {string} raw authored value (seconds-from-now or a date)
 * @returns {Element}
 */
function buildCountdown(raw) {
  const target = resolveTarget(raw);
  const timer = document.createElement('div');
  timer.className = 'promo-banner-countdown';

  const values = UNITS.map((unit, i) => {
    const item = document.createElement('div');
    item.className = 'promo-banner-countdown-item';
    const value = document.createElement('span');
    value.className = 'promo-banner-countdown-value';
    value.textContent = '0';
    const label = document.createElement('span');
    label.className = 'promo-banner-countdown-label';
    label.textContent = unit.label;
    item.append(value, label);
    timer.append(item);
    if (i < UNITS.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'promo-banner-countdown-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = ':';
      timer.append(sep);
    }
    return value;
  });

  const tick = () => {
    let remaining = Math.max(0, target - Date.now());
    UNITS.forEach((unit, i) => {
      const count = Math.floor(remaining / unit.ms);
      remaining -= count * unit.ms;
      values[i].textContent = i === 0 ? String(count) : String(count).padStart(2, '0');
    });
  };

  tick();
  const interval = setInterval(() => {
    tick();
    if (target - Date.now() <= 0) clearInterval(interval);
  }, 1000);

  return timer;
}

/**
 * loads and decorates the promo banner
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Row 1: image. Row 2: title / subtitle / countdown value / CTA
  const imageRow = rows[0];
  const contentRow = rows[1];

  // --- image column ---
  const imgWrap = document.createElement('div');
  imgWrap.className = 'promo-banner-image';
  const img = imageRow?.querySelector('img');
  if (img) {
    imgWrap.append(
      createOptimizedPicture(img.src, img.alt || '', false, [{ width: '960' }]),
    );
  }

  // --- content column ---
  const content = document.createElement('div');
  content.className = 'promo-banner-content';

  if (contentRow) {
    const cell = contentRow.firstElementChild || contentRow;
    const nodes = [...cell.children];

    // find the countdown seed: a paragraph that is just a number or a date,
    // otherwise the CTA and text are kept in order.
    nodes.forEach((node) => {
      const link = node.querySelector?.('a');
      const text = node.textContent.trim();
      const isCountdownSeed = node.dataset?.countdown !== undefined
        || (/^\d+$/.test(text) && node.tagName === 'P');

      if (link) {
        link.classList.add('button');
        const wrapper = document.createElement('p');
        wrapper.className = 'button-wrapper';
        wrapper.append(link);
        content.append(wrapper);
      } else if (isCountdownSeed) {
        content.append(buildCountdown(text));
      } else {
        content.append(node);
      }
    });
  }

  block.replaceChildren(imgWrap, content);
}

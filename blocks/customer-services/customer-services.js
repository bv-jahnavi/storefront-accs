// Inline SVG icons for the service features (stroke-based, inherit currentColor).
// Icons match the reference: 3D box, credit card, return box, life-ring.
const ICONS = {
  shipping: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M16 4l11 6v12l-11 6-11-6V10z"/><path d="M5 10l11 6 11-6"/><path d="M16 16v12"/></svg>',
  payment: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="4" y="8" width="24" height="16" rx="2"/><path d="M4 13h24"/><path d="M7 19h5"/></svg>',
  return: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M6 11l10-5 10 5v10l-10 5-10-5z"/><path d="M6 11l10 5 10-5"/><path d="M16 16v10"/><circle cx="23" cy="9" r="4.5" fill="var(--background-color, #fff)"/><path d="M25 8.2a2.2 2.2 0 1 0 .3 2" stroke-width="1.2"/><path d="M24.6 6.6v1.6h-1.6" stroke-width="1.2"/></svg>',
  support: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="5"/><path d="M7.5 7.5l4.9 4.9M19.6 19.6l4.9 4.9M24.5 7.5l-4.9 4.9M12.4 19.6l-4.9 4.9"/></svg>',
};

/**
 * Pick an icon key from an authored hint (icon name, title keywords, or index).
 */
function resolveIcon(hint, index) {
  const h = (hint || '').toLowerCase();
  if (/(ship|deliver|truck)/.test(h)) return 'shipping';
  if (/(pay|card|credit)/.test(h)) return 'payment';
  if (/(return|refund|exchange)/.test(h)) return 'return';
  if (/(support|help|service|online)/.test(h)) return 'support';
  return ['shipping', 'payment', 'return', 'support'][index % 4];
}

/**
 * loads and decorates the customer-services block
 *
 * Expected authored structure — one feature per row, each row with 2 cells:
 *   | :icon-hint: | Title \n Subtitle text |
 * The first cell is a short hint used to pick the icon (e.g. "shipping",
 * "payment", "return", "support"); if omitted, icons are assigned in order.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'customer-services-list';

  [...block.children].forEach((row, index) => {
    const cells = [...row.children];
    // detect a dedicated hint cell (short, no heading/paragraph structure)
    let hintCell = null;
    let contentCell = null;
    if (cells.length >= 2) {
      [hintCell, contentCell] = cells;
    } else {
      [contentCell] = cells;
    }

    const hint = hintCell ? hintCell.textContent.trim() : '';
    const iconKey = resolveIcon(hint || contentCell?.textContent, index);

    const item = document.createElement('li');
    item.className = 'customer-services-item';

    const icon = document.createElement('span');
    icon.className = 'customer-services-icon';
    icon.innerHTML = ICONS[iconKey];

    const content = document.createElement('div');
    content.className = 'customer-services-content';
    // title = first heading or first line; rest = subtitle
    const heading = contentCell?.querySelector('h1,h2,h3,h4,h5,h6');
    if (heading) {
      const title = document.createElement('div');
      title.className = 'customer-services-title';
      title.textContent = heading.textContent.trim();
      content.append(title);
      heading.remove();
      const rest = contentCell.textContent.trim();
      if (rest) {
        const sub = document.createElement('p');
        sub.className = 'customer-services-text';
        sub.textContent = rest;
        content.append(sub);
      }
    } else if (contentCell) {
      // no heading: first paragraph is title, remaining are subtitle
      const paras = [...contentCell.querySelectorAll('p')];
      const [titleP, ...restP] = paras.length ? paras : [contentCell];
      const title = document.createElement('div');
      title.className = 'customer-services-title';
      title.textContent = titleP.textContent.trim();
      content.append(title);
      restP.forEach((rp) => {
        const sub = document.createElement('p');
        sub.className = 'customer-services-text';
        sub.textContent = rp.textContent.trim();
        content.append(sub);
      });
    }

    item.append(icon, content);
    list.append(item);
  });

  block.replaceChildren(list);
}

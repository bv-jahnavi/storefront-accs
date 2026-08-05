// Inline SVG icons for the service features (stroke-based, inherit currentColor)
const ICONS = {
  shipping: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 6h16v14H2zM18 10h6l4 4v6h-10z"/><circle cx="8" cy="24" r="2.5"/><circle cx="23" cy="24" r="2.5"/></svg>',
  payment: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="7" width="26" height="18" rx="2"/><path d="M3 13h26"/><path d="M7 20h6"/></svg>',
  return: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 12a10 10 0 1 1-2 6"/><path d="M3 6v6h6"/></svg>',
  support: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 18v-3a10 10 0 0 1 20 0v3"/><rect x="3" y="18" width="5" height="8" rx="1.5"/><rect x="24" y="18" width="5" height="8" rx="1.5"/><path d="M26 26a6 6 0 0 1-6 5h-4"/></svg>',
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

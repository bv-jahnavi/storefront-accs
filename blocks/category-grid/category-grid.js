import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Category Grid
 * Renders a horizontal row of circular category tiles with a hover zoom effect,
 * matching the "s-categories" section from the reference design.
 *
 * Expected authored structure (one category per row):
 *   | Category Grid                     |
 *   | :image:  | new in                 |
 *   | :image:  | furniture              |
 *   ...
 * The label cell may contain a link; if not, the whole tile links to the image's
 * enclosing link (if any).
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'category-grid-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture, img')) || cells[0];
    const labelCell = cells.find((c) => c !== imageCell) || cells[1];

    const img = imageCell?.querySelector('img');
    if (!img) return;

    // resolve the link + label text
    const labelLink = labelCell?.querySelector('a');
    const href = labelLink?.getAttribute('href')
      || imageCell?.querySelector('a')?.getAttribute('href')
      || '#';
    const labelText = (labelCell?.textContent || img.alt || '').trim();

    const item = document.createElement('li');
    item.className = 'category-grid-item hover-image';

    // circular image link
    const imgLink = document.createElement('a');
    imgLink.className = 'category-grid-image';
    imgLink.href = href;
    if (labelText) imgLink.setAttribute('aria-label', labelText);
    const picture = createOptimizedPicture(
      img.src,
      img.alt || labelText,
      false,
      [{ width: '270' }],
    );
    imgLink.append(picture);

    // label link
    const labelWrap = document.createElement('div');
    labelWrap.className = 'category-grid-label';
    const textLink = document.createElement('a');
    textLink.href = href;
    textLink.textContent = labelText;
    labelWrap.append(textLink);

    item.append(imgLink, labelWrap);
    list.append(item);
  });

  block.replaceChildren(list);
}

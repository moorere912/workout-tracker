// Small hand-authored inline SVG icon set (stroke-based, inherits color via
// currentColor) -- avoids pulling in an icon font/library just for a
// handful of glyphs.

const wrap = (inner, size = 22) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const icons = {
  barbell: (size) =>
    wrap(
      '<line x1="6" y1="12" x2="18" y2="12"/><rect x="3" y="9" width="3.4" height="6" rx="1"/><rect x="17.6" y="9" width="3.4" height="6" rx="1"/><rect x="0.8" y="10.4" width="1.8" height="3.2" rx="0.6"/><rect x="21.4" y="10.4" width="1.8" height="3.2" rx="0.6"/>',
      size
    ),
  clock: (size) => wrap('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3.2 1.8"/>', size),
  trendUp: (size) => wrap('<path d="M3 17l5.5-6 4 4L21 6"/><path d="M15 6h6v6"/>', size),
  gear: (size) =>
    wrap(
      '<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.9 7.9 0 000-2l2-1.6-2-3.4-2.4 1a8 8 0 00-1.7-1L14.9 3h-4l-.4 2.9a8 8 0 00-1.7 1l-2.4-1-2 3.4L6.4 11a7.9 7.9 0 000 2l-2 1.6 2 3.4 2.4-1a8 8 0 001.7 1L10.9 21h4l.4-2.9a8 8 0 001.7-1l2.4 1 2-3.4z"/>',
      size
    ),
  empty: (size) =>
    wrap(
      '<line x1="7" y1="12" x2="17" y2="12"/><rect x="3.2" y="8.5" width="3.6" height="7" rx="1.2"/><rect x="17.2" y="8.5" width="3.6" height="7" rx="1.2"/><path d="M4 5l16 16" opacity="0.5"/>',
      size
    ),
};

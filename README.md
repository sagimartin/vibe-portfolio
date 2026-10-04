# Sagi Martin's Portfolio

Personal portfolio built with Vite + React.

## Quick Start
```bash
npm install
npm run dev
```

## Analytics

Vercel Analytics is enabled via `<Analytics />` in `src/App.jsx`. Deploy to Vercel
to start collecting page views.

## Scripts

- `npm run dev` - local dev server
- `npm run build` - production build (updates `public/sitemap.xml` dates)
- `npm run preview` - preview the build output
- `npm run lint` - run ESLint

## Content & Translations

- UI copy (EN/HU): `src/content/copy.js`
- Contact chat copy (EN/HU): `src/content/chatCopy.js`
- Project translations (HU): `src/content/projectTranslations.js`
- Tag labels: `src/content/tagLabels.js`
- Project images: `src/content/projectImages.js`
- Project data (EN base): `src/data/projects.json`

To add a project:
1. Add it to `src/data/projects.json`.
2. Add matching images and update `src/content/projectImages.js`.
3. Optional: add HU summary/description in `src/content/projectTranslations.js`.

## Page structure

- `Hero` – intro typing, rotating roles, spinning asterisk
- `Work` – project rows (marquee titles that slide on scroll, details open inline)
- `Snapshot` – live order / sales estimate with an odometer (`src/lib/liveStats.js`)
- `Contact` – guided chat (`src/chat/createChat.js`) that ends in a ready-made `mailto:` link.
  Chat state lives in `sessionStorage` (`sagi-chat`); nothing is sent to a server.
- `SiteBar` – language + theme switch (hides while scrolling down) and the floating "Say hi" button
- Project tags in `projects.json` are kept but not shown in the UI.

## Theme

Theme is shared through `src/lib/theme.js` (used by every `ThemeSwitch`). It sets `data-theme` on `<html>`
and updates the browser `theme-color` meta for iOS Safari.

## Deploy

This is a static Vite site. Build output goes to `dist/`.

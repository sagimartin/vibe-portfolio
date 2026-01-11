# Sagi Martin's Portfolio

Personal portfolio built with Vite + React.

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - local dev server
- `npm run build` - production build (updates `public/sitemap.xml` dates)
- `npm run preview` - preview the build output
- `npm run lint` - run ESLint

## Content & Translations

- UI copy: `src/content/copy.js`
- Project translations (HU): `src/content/projectTranslations.js`
- Tag labels: `src/content/tagLabels.js`
- Project images: `src/content/projectImages.js`
- Project data (EN base): `src/data/projects.json`

To add a project:
1. Add it to `src/data/projects.json`.
2. Add matching images and update `src/content/projectImages.js`.
3. Optional: add HU summary/description in `src/content/projectTranslations.js`.

## Theme

Theme is controlled by the `ThemeSwitch` component. It sets `data-theme` on `<html>`
and updates the browser `theme-color` meta for iOS Safari.

## Deploy

This is a static Vite site. Build output goes to `dist/`.

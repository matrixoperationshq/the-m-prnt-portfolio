# The M Prnt V2.3 — Consistent SVG Icon Fix

This fixes the cross-device emoji-style icons in V2, just as on the SILK site. It replaces **decorative Unicode icons with inline SVG line drawings**, keeping the existing colors, animations, layout, and responsive styling.

## Where the icons are fixed
- Floating skill cards: diamond, spatial triangle, code/command, half-circle and campaign burst
- Hero, marquee and project-card decorative asterisks
- Arrows in links, buttons, project cards, videos, PDFs, footer, Studio Admin
- Close button, play button, caret, scroll arrows and admin gallery reorder controls
- Dynamic cards, galleries and case-study overlays (the icons are created by JavaScript)

## Install on the EXISTING GitHub website
1. Make a backup or a branch first. Your repository is `matrixoperationshq/the-m-prnt-portfolio`.
2. Replace exactly these six files from this ZIP at their existing paths (do **not** put them inside another V2 folder):
   - `index.html`
   - `admin/index.html`
   - `css/site.css`
   - `css/admin.css`
   - `js/site.js`
   - `js/admin.js`
3. Commit your changes to `main` and wait for the Netlify automatic deployment.
4. Hard refresh (Mac: Cmd+Shift+R), and test on an iPhone/Safari as well as Chrome.

## What this does NOT change
- Supabase database, project content, 3D models or uploaded assets
- Your login, passwords, API keys or `js/config.js`
- GLB upload limits (these remain whatever your current code and bucket allow)

## IMPORTANT
This is based on the **V2.1 visual-editor files currently published in your GitHub repository**. If you already applied the separate V2.2 50 MB uploader update after that, these six files would overwrite that newer uploader. In that case, tell ChatGPT and ask for an icons-only patch against V2.2. The icon fix itself needs no SQL migration.

The new SVGs are source-defined vector graphics: no web font, emoji glyph, remote icon CDN, or additional JavaScript dependencies.

# The M Prnt V2.6 — Client Work Gallery

A dedicated, editable portfolio gallery for **real client commissions**: ads, logos, flyers, promotional graphics and campaign materials. It is distinct from The Concept Lab (spec work) and Visual Studies (self-initiated pieces).

## What is included

Seven website files, based on the currently deployed V2.5 GitHub source (not an earlier V2.4 release):

- `index.html`
- `admin/index.html`
- `js/site.js`
- `js/admin.js`
- `js/project-taxonomy.js`
- `css/site.css`
- `css/admin.css`

Do **not** upload the ZIP itself to GitHub; unzip it and upload the individual files preserving these paths. **Do not replace `js/config.js`.**

## Install

1. Create a backup of the current GitHub source or commit to a new branch.
2. In the GitHub repository `matrixoperationshq/the-m-prnt-portfolio`, replace the matching seven files, preserving folders.
3. Commit to `main` when ready for Netlify to deploy.
4. Refresh `themprnt.co/admin/` after the Netlify deploy completes.
5. For an actual commissioned project, select **Client Work** under **Where should this appear?**. The discipline can independently be Advertising, Brand Identity, or Poster Design. Keep it marked **Published**, then select **Save changes**.
6. The **Client Work** section and header link appear automatically after at least one published project has been assigned; until then, no empty section is displayed.
7. To change order or switch between compact, editorial or horizontal: **Arrange galleries → Client Work → Save layout & order**.
8. To change the wording: open **Studio copy + links → Client Work / Public Section Copy** and save.

## Default copy

**Label:** 03 / CLIENT WORK · DESIGN IN PRACTICE

**Headline:** Designed for the brief. / Made to stand out.

**Description:** From brand identities and promotional campaigns to flyers, advertising, and everyday creative assets. A collection of commissioned work where strategy meets visual storytelling, tailored to each client's audience, personality, and goals.

No Supabase table, authentication, or storage setting changes are needed. Existing project records are not reassigned and no content is uploaded automatically. The new placement requires explicit assignment through Studio Admin.

## Testing after installation

- Confirm an existing project still opens and renders normally.
- Assign one **real commissioned** project to Client Work and save. Refresh the homepage and verify it appears in the new section.
- Change the gallery mode to Carousel in Arrange galleries, save, refresh, and verify horizontal scrolling and arrows.
- Edit the Client Work headline in Studio copy + links, save, refresh, and verify.
- Confirm Concept Lab and Visual Studies still show their prior work and that no content was duplicated.

If the public site shows older code, hard-refresh with Command + Shift + R and check the latest Netlify deployment succeeded.

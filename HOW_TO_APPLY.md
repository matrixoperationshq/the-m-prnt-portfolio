# The M Prnt V2.16 — Section Numbers + Duplicate Panel Fix

This is a **two-file patch for the currently deployed V2.15 code**. It retains your existing visual design, cursor animations, galleries, crop settings, admin, and Supabase integration.

## Before installing

1. Export a Studio Admin backup JSON. This update doesn't change any project records, but a backup is sensible.
2. In GitHub, confirm the following two files exist in the root repository's `js/` folder.

## Install through GitHub

1. Open `matrixoperationshq/the-m-prnt-portfolio` on GitHub.
2. Upload/replace `js/site.js` with `js/site.js` from this package.
3. Upload/replace `js/section-settings.js` with the same path from this package.
4. **Keep both in the `js/` folder**, not at the repository root. Commit changes to `main`.
5. Wait for Netlify to report a successful deploy, then hard-refresh `https://themprnt.co/` (on Mac: Shift + Command + R).

## What this changes

- Section prefix numbers are computed from the order saved in **Studio Admin → Manage site sections**, rather than hard-coded strings from older versions of the page.
- Hidden, removed, unavailable, or deleted sections are skipped. Public sections are numbered consecutively, beginning at **01 / Selected Work**. Contact gets the final following number.
- **Motion & Film / 3D & Interaction still use their own 01 / 02 subsection numbers** within the single Motion + 3D chapter. Those are intentional subsection labels, not a second set of main page chapter numbers.
- The obsolete legacy standalone panel with eyebrow `SOCIAL MEDIA` and title `Designed for the brief. Made to stand out.` is excluded from rendering. The actual Client Work and Social & Content sections remain intact.
- The source files do not change your fonts, page structure, art, motion animation, projects, or admin UI.

## Quick checks

1. Open the public homepage, scroll to Motion + 3D, and check its outer eyebrow no longer says the old hard-coded **05 /** unless Motion really is the fifth *visible* section.
2. Rearrange two sections in Studio Admin, save, refresh the public homepage, and confirm the new numbers follow the new order.
3. Scroll past About to Contact and confirm there is **no extra SOCIAL MEDIA / Designed for the brief panel** between them.
4. Confirm the actual Social & Content gallery and Client Work still appear when enabled.

## Optional: permanent Supabase record cleanup

The JavaScript patch **hides** the obsolete panel from the public site. It does not automatically delete saved legacy content from your Supabase database. If you would also like to remove this obsolete text-only panel from your CMS records, export your backup first and review the optional `REMOVE_OBSOLETE_LEGACY_SOCIAL_PANEL.sql` file. It specifically targets matching entries in the `customSections` setting, *not* the proper Social & Content or Client Work galleries.

This SQL step is not required for the appearance fix. Don't run it if you want to keep a copy of that old panel in the database.

## Rollback

Use GitHub History to revert the two changed files to the previous commit. Your Supabase settings and project records will not have been modified by this deployment.

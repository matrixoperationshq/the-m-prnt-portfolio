# The M Prnt — V2.4 COMPLETE (all-in-one)

**This is the one V2.4 update to install.** It supersedes both the old V2.4 banner-only ZIP and the old V2.4 Organized Sections ZIP, and includes the vector icons inherited from V2.3, continuous marquee, clearer editorial categorization, two new public galleries, and the 50 MB Supabase Free uploader with resumable transfers.

## Before you install

1. Save a current **GitHub repository backup** (GitHub → Code → Download ZIP). In Studio Admin, you can also use **Export backup JSON** for the database content.
2. Don't delete or re-create your Supabase project. **No database migration is required.** Existing project IDs, records, files, auth, current live domain, and GitHub connection remain intact.
3. Existing projects are **not automatically reassigned** to the new galleries. After installation, pick the best destination in Studio Admin. This protects your published curation.

## Install into your existing GitHub repository

Download and extract the ZIP. Upload/replace these files into the **existing repository's root**, preserving each folder:

```
index.html
admin/index.html
css/site.css
css/admin.css
js/site.js
js/admin.js
js/project-taxonomy.js     <- NEW file, essential
```

GitHub repository: https://github.com/matrixoperationshq/the-m-prnt-portfolio

Commit with message: `V2.4 complete: concept lab, visual studies, organized portfolio`.

Your existing Netlify GitHub integration deploys from `main`. Once deployment is marked published, use **Command + Shift + R** on https://themprnt.co/ and https://themprnt.co/admin/ to bypass the browser cache.

**DO NOT upload this ZIP as a single file to GitHub, and do not replace `js/config.js`.** `js/config.js` holds your public Supabase project URL and publishable key; this ZIP doesn't include it. It also contains no passwords, secret keys, or SQL that changes your database.

## The new Studio Admin workflow

Every project has two separate decisions:

1. **Creative discipline — what kind of work is it?** Options include Brand Identity, Campaigns & Advertising, **Spec Campaigns & Concepts**, **Posters & Graphic Art**, Websites & Digital, 3D & Interactive, Motion & Film, Editorial & Art Direction, Strategy & Concepts, and Illustration & Experiments.
2. **Where should this live? — its main home on the public website.** Seven destinations: Creative Work; Digital Experiences; **The Concept Lab**; **Visual Studies**; Motion & Film; 3D & Interaction; More Work.

Optionally check **Homepage feature** if that project should also appear in **Selected Work**, regardless of its home section. The feature flag is separate from the primary destination. **Published / Live** is still required for any public appearance.

Suggested placements (suggestions only; edit independently):

| Example project | Creative discipline | Main website destination | Feature in Selected Work? |
|---|---|---|---|
| Maison Mélange founder brand | Brand Identity | Creative Work | Yes if flagship |
| Stay Wellthy Luxury Travel | Websites & Digital | Digital Experiences | Optional |
| Pinterest / The Muse conceptual magazine | Spec Campaigns & Concepts | The Concept Lab | Optional |
| Heinz concept advertising | Campaigns & Advertising or Spec Campaigns & Concepts | The Concept Lab or Creative Work | If a strong flagship |
| PopStarrRockStarr poster series | Posters & Graphic Art | Visual Studies | Optional |
| WRNG GLB model | 3D & Interactive | 3D & Interaction | Optional |
| Animated campaign piece | Motion & Film | Motion & Film | Optional |

Click **Save changes** in Studio Admin after choosing. Refresh the public site. Changing sections modifies your existing Supabase `portfolio_projects.data` JSONB; no new tables needed.

## What's new on the public site

- The existing **Selected Work** gallery still prioritizes your handpicked featured projects.
- **Digital Experiences** showcases web and product builds.
- **The Concept Lab** is a deep-plum exhibition with large, asymmetric campaign art and editorial captions, clearly signaling conceptual work.
- **Visual Studies** is a light-lavender poster wall that handles landscape, square, and portrait images. It uses the same ratio/cropping controls you already have in Admin.
- **Motion & Film** and **3D & Interaction** each have their own destination and anchor, with interactive GLB viewing still supported.
- **More Work** still holds supporting pieces not assigned to a new gallery.
- The purple scrolling **THINK / MAKE / FEEL / MOVE** banner has a continuous loop.
- Existing SVG line icons and the contact email icon fix remain intact.
- Studio Admin still allows custom editorial sections via **Build website sections**, with additional placement choices near the new galleries.

The new galleries will show an attractive short placeholder message if they have no assigned published projects. They will populate as soon as you publish/route items from Studio Admin. The included *preview screenshots* use example placements of your existing artwork for demonstration only; those sample placements are **not applied to your live database**.

## Upload limit: Supabase Free

The admin supports up to **50,000,000 bytes / 50 MB (decimal)** per file, with resumable uploading for files over 6 MiB. The existing `portfolio-media` bucket must be set to 50 MB and the Supabase global limit must allow it. This update does **not** change storage limits automatically. Your optimized WRNG model is below this limit. Very detailed 3D models can still be slow on mobile even when the upload succeeds.

## Quick verification checklist

1. Confirm the page has **The Concept Lab** and **Visual Studies** headings and the navigation links scroll to them.
2. In Admin, confirm the seven section cards, two new creative-discipline options, and the Show projects from dropdown all appear.
3. Open one *draft* test item, change its discipline to **Posters & Graphic Art** and destination to **Visual Studies**, Save, refresh the editor; confirm the placement persists. Publish only if desired.
4. Open a published piece, choose destination **The Concept Lab**, Save, refresh the public site; confirm it appears there and its detail modal still works.
5. Confirm a project with `Homepage feature` on still appears in **Selected Work** in addition to its main gallery.
6. Confirm the 3D gallery shows your model and interactive camera controls.
7. Watch the purple banner for at least 40 seconds and confirm no blank gap.
8. Check the site on mobile for layout and scrolling (reduced-motion mode should pause the banner).

## Testing notes and limits

- JavaScript syntax checked (`node --check`); taxonomy tested for legacy and new categories and custom overrides; HTML section IDs checked for uniqueness; desktop and mobile gallery/admin mockups rendered with headless Chromium and checked for horizontal overflow.
- The live site and authenticated Supabase editor were **not** modified or verified remotely. Test the new code after deploying. If anything misbehaves, use GitHub's prior commit to revert your website files while leaving Supabase records intact.

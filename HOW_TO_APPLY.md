# The M Prnt V2.8 — Complete Frame Shapes + Independent Featured Controls

This is the **complete V2.8 replacement update**, not a standalone patch. It includes V2.7 drag-to-crop, independent Selected Work (Featured) framing, editorial masonry flow, and all previously included gallery destinations and controls.

## More frame shapes, everywhere you need them

| Studio label | Ratio | Best for |
|---|---|---|
| Original artwork | Natural image proportion | No cropping |
| Square | 1:1 | Brand marks, matched grids |
| Portrait | 4:5 | Social feed work, general portfolios |
| **Portrait** | **3:4** | Portrait illustration and photography |
| **Tall portrait** | **2:3** | Posters, print design, vertical campaigns |
| **Social / story tall** | **9:16** | Story, Reel, vertical video stills |
| Classic landscape | 3:2 | Photography and landscape compositions |
| Wide landscape | 16:9 | Video frames and wide design |

The three **bold** rows are new in this edition. All prior values remain valid.

- **Selected Work:** Studio Admin → **Arrange galleries** → Selected Work → **Featured-only frame**. One setting updates all Featured cards. Your projects' ordinary gallery-card ratios do **not** change. Use **Adjust Selected Work crop** on each project for individualized drag-position and zoom.
- **Regular project image cards:** Open a project → **Project Display** → **Project section card shape** and optionally **Adjust section card crop**.
- **Project detail hero:** Open a project → **Case-study lead image shape** and/or **Adjust case-study cover**.
- **Media gallery:** In the project's media library, choose each image's shape, or click its crop editor.
- **Original:** Shows the un-cropped artwork. Choose Fill / Crop and drag to reposition only when a defined frame is selected.

Any frame can be changed later without altering the original uploaded asset. The chosen metadata is saved in your existing Supabase project JSON and portfolio settings. No SQL/database migration or re-upload is needed.

## Install using GitHub → Netlify

1. In Studio Admin, **Export backup JSON**. Back up your current GitHub branch before changing files (e.g. create a backup branch).
2. Extract the ZIP and upload the **eight website paths** to their corresponding locations in your existing repository:

   - `index.html`
   - `admin/index.html`
   - `css/site.css`
   - `css/admin.css`
   - `js/site.js`
   - `js/admin.js`
   - `js/project-taxonomy.js`
   - `js/crop-utils.js`

3. Do **not** upload the enclosing extracted folder as a folder within the repository; put files at their matching paths.
4. Do **not** replace `js/config.js` or your Supabase credentials. That file is intentionally **not** in this package. No changes to the storage bucket are required.
5. Commit the changed files to the Netlify-deployed branch (usually `main`), wait for a successful deploy, and hard-refresh (Command + Shift + R on Mac).

## Test on the actual website

1. Studio Admin → Arrange galleries → Selected Work → set **Social / story tall · 9:16** → Save layout & order. Confirm Featured cards are tall on your public site.
2. Open a project from Featured, choose **Adjust Selected Work crop**, drag to position, Apply crop, and Save changes. Confirm its **regular section card remains unchanged**.
3. For a regular section card, choose **Tall portrait · 2:3**; check the card ratio without affecting Selected Work.
4. Change a case-study cover to **Portrait · 3:4**; check the modal displays the entire intended frame.
5. Try a gallery image with 9:16 and verify zoom, drag, and saved positioning.
6. Try Editorial Flow, Compact, and Carousel with one of the new shapes; verify the desired responsive presentation.

## What remains unchanged

- All 41 existing portfolio projects, your live Supabase database, admin credentials and uploaded files.
- Separate Selected Work and regular-section sizing/cropping.
- Client Work, Concept Lab, Visual Studies, Web Builds, Motion, and 3D sections.
- Compact, Editorial Flow and horizontal Carousel options.
- Drag-to-reorder gallery arrangement, responsive layouts, the continuous ticker and the SVG icons.

## Verification and rollback

JavaScript syntax, HTML selectors/options, and CSS computed aspect-ratios were checked at 1440px and 390px widths with local Chromium. Supabase-authenticated saving still requires your account and must be verified after deployment. To roll back, revert the eight files in GitHub. This release contains no SQL migration.

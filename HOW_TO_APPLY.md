# The M Prnt — V2.7 / Drag-to-Crop Studio

This update builds on V2.6, including Client Work and the flexible galleries. It adds non-destructive image crop controls inside Studio Admin.

## What you can edit

- **Homepage/project cards:** Choose the original proportions, 1:1 square, 4:5 portrait, 16:9 landscape, or 3:2 classic. Click **Adjust homepage crop** to drag artwork into position and zoom.
- **Case-study cover:** Click **Adjust case-study cover** to choose an independent frame and crop; original full-resolution artwork remains accessible through *View Full Image*.
- **Case-study gallery images:** Click **Adjust crop** beside any image in the media library. Non-image assets (GLB, video, PDF) are left alone.
- **Undo/re-edit:** Reopen any crop, use Reset, or choose Original / full artwork. The crop only changes presentation metadata, not the source upload.

## Install to your connected GitHub / Netlify website

1. **Save a backup.** In GitHub, keep a copy of your current `main` commit, and in Studio Admin use **Export backup JSON**. The current live Supabase content will not be altered by installing the code.
2. Unzip `The_M_Prnt_V2_7_Drag_To_Crop_Studio.zip` on your computer.
3. Replace these existing files **at their matching repository paths**:
   - `admin/index.html`
   - `js/admin.js`
   - `js/site.js`
   - `css/admin.css`
   - `css/site.css`
4. **Add this new file** at its matching path: `js/crop-utils.js`.
5. Commit all six file changes to your repository's `main` branch. Do not upload the ZIP as a single file. Netlify will automatically deploy the changes.
6. Do **not** replace `js/config.js` and do not re-run Supabase SQL. Your Supabase connection and data stay intact.
7. Once the new Netlify deploy is published, hard-refresh the public site and `/admin/` (Mac Chrome: Cmd+Shift+R).

## Try your first 4:5 crop

1. In Studio Admin, choose a poster project.
2. Open **Project Display → Adjust homepage crop**.
3. Select **Portrait · 4:5**, drag the image and use **Zoom** to align the design. Click **Apply crop**.
4. Crucial: click the main **Save changes** button at the top of the project editor to publish the framing to Supabase.
5. Refresh the public website and inspect that project's card. You may independently use **Adjust case-study cover** if you want the full project view framed differently.

## Notes

- Crop settings live in each project's `data` JSON (`card_crop`, `hero_crop`, or `media[].crop`). No database migration or new storage bucket is required.
- Saved crop is expressed by X/Y focal position and zoom, so the browser recreates it responsively. The original files are not modified, downloaded, or overwritten.
- Cropping does not change image resolution. For huge originals, web-optimized cover assets may load faster, but are optional.
- The existing `Original / show entire image` option still displays the full uncut image.
- The new JavaScript was syntax-tested and the crop math was unit-checked. The authenticated live-browser interaction and cross-device visual match need to be confirmed after installation.

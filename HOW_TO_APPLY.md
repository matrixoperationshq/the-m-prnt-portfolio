# The M Prnt V2.13 — More Work + Private Holding

A focused add-on to the V2.12 portfolio. The design, hero movement, Client Work, Social & Content, Systems Lab and existing gallery controls are unchanged.

## What changes

- **More Work is a real gallery**, with its own public page section (`#more`), navigation link, heading/description, reorderable cards, and Compact / Editorial Flow / Carousel modes.
- Existing projects assigned to `archive` continue to appear in **More Work** once **Published**. There is no 12-project cap and Featured items may also appear in their regular More Work gallery.
- More Work is available in **Manage site sections**: move, rename, hide, remove from organization and restore, without deleting project records.
- **Private Holding** is a new destination in the project editor and the Content Library filter. Use it to keep an unplaced or unfinished project out of every public gallery. Selecting it automatically switches the underlying publishing state to **Draft** and unchecks Selected Work, which protects the record under the existing Supabase public-read policy.
- Moving an item from Private Holding to a real gallery **does not automatically publish it**; select **Published / live** and save only when ready.
- No SQL, database migration, new bucket or new keys are required.

## Install safely

1. Export **Studio Admin → Export backup JSON**. If you use GitHub, keep a copy or commit of the current files before replacing them.
2. Download the ZIP and extract its **six website files** (not the ZIP as a single upload).
3. In your repository `matrixoperationshq/the-m-prnt-portfolio` on branch `main`, replace each matching path:
   - `index.html`
   - `admin/index.html`
   - `css/` — **No CSS replacement**; existing V2 styling is preserved.
   - `js/site.js`
   - `js/admin.js`
   - `js/section-settings.js`
   - `js/project-taxonomy.js`
4. Commit to `main`. Let Netlify deploy. Do not touch your Supabase credentials, SQL schema, uploaded files, or custom domain.
5. Hard-refresh `themprnt.co` and `themprnt.co/admin/` after the deploy.

## Verify before rearranging important work

1. **More Work (public):** Choose an existing More Work item in Admin, set it to Published (if desired) and save. It should appear under the new independent `#more` section, not inside Selected Work. Its direct project view should open.
2. **Arrange:** Studio Admin → Arrange galleries → More Work. Confirm the new layout mode and reordering affect only More Work.
3. **Section manager:** Manage site sections → More Work. Confirm rename, reorder, hide and restore operate without touching project records.
4. **Private Holding:** Choose a test item, set its destination to Private Holding, save. It should display Draft internally, disappear from public galleries and direct project views, and remain accessible via Content Library → Private Holding.
5. **Restore:** Move the same test project back to its destination. Explicitly set Published, then Save. Verify it returns to the correct public section.
6. Confirm Client Work, Social & Content, Creative Work, Systems Lab, the original homepage and the purple marquee remain unchanged.

## Important privacy note

The Supabase public-read policy grants access to any **Published** record. For that reason, **Private Holding automatically saves as Draft** rather than leaving the record Published and merely hiding it visually. This is intentional. Existing Draft and Archived statuses remain available.

## Compatibility and limitations

- Old `archive` project placement values are preserved; no project rows are edited by installation.
- New settings extend the existing `sectionManagerV29` object. The normalization layer adds More Work to existing section arrangements without clearing edits.
- JavaScript syntax and data/HTML consistency were checked locally. Browser navigation in the test environment was blocked, so authenticated Supabase saves and final browser rendering still need verification on your deployed site.
- If something goes wrong, use GitHub Revert on this commit or redeploy the preceding Netlify deploy. This will not delete Supabase data.

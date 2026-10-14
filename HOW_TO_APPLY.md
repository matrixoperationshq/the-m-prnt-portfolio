# The M Prnt V2.14 — Section Organizer Consistency & Safe Deletion

This is a small additive patch for the V2.13 source. It does not redesign the public portfolio, replace its Supabase configuration, or modify your existing database rows on installation.

## Updated files (preserve these folder paths)

- `js/admin.js`
- `js/section-settings.js`
- `js/site.js`
- `admin/index.html`
- `css/admin.css`

## Install

1. In Studio Admin, use **Export backup JSON** first. Also keep a copy of the current `main` commit in GitHub (or note its commit hash).
2. Unzip the package. In GitHub, replace ONLY the five listed files, preserving their exact paths. Do not upload the folder itself into the repository as an extra nested folder.
3. Commit to `main` and wait for Netlify to report a successful deployment.
4. Hard-refresh the Studio Admin. Existing Supabase data is unchanged until you deliberately save section settings.

## What's fixed

- The project destination selector, section-filter dropdown and Arrange Galleries now follow the same saved *Manage site sections* ordering.
- Removed sections no longer appear as ordinary project destinations or as gallery arranger choices. Hidden sections remain accessible in the admin (they are not public).
- New **Admin note · private** field stores organization notes, separate from the public-facing section description. The existing placeholder "Your own collection of portfolio projects" can be replaced with a useful private note.
- Section manager up/down movement moves across the **active** list consistently when removed sections exist.
- Custom galleries have separate reversible **Remove from organizer** and irreversible **Delete permanently** controls. Deleting requires typing `DELETE` exactly.
- Permanent deletion is *blocked* when **any** published, draft, or archived project points to that custom section. No project is ever deleted as a side effect. Move each project into its intended destination, save it, and retry deletion.
- The *Removed from organization* area still shows removed sections for restoration. Removed custom sections can be permanently deleted from there if empty.
- Duplicate active section names are rejected on save. Rename or remove the extra gallery rather than allowing two identical destinations.
- Projects still assigned to a removed destination show a warning in the editor; saving them requires choosing a valid active section.

## Clean up the duplicate Social & Content section

1. Open **Manage site sections** and identify the built-in **Social & Content** (ID `social` behind the scenes) and the other custom gallery also called **Social & Content**. The custom one has **Section name** and **Section appearance** fields.
2. Check whether the custom gallery contains projects, including drafts/archived. In the project library you can filter to the custom gallery **before removing it**. Reassign each project to the built-in Social & Content and **Save changes** on each project.
3. Return to **Manage site sections**. Click **Delete permanently** on the custom duplicate. It checks the project count and requires you to type `DELETE`.
4. Click **Save website sections** to commit the deletion. The duplicate disappears from the active destination selector and arranger. The built-in Social & Content and its projects remain.

You can instead **Remove from organizer** to temporarily take it out of the main lists; it will remain in the *Removed from organization* area until restored or permanently deleted.

## Test after Netlify deploy

1. Move Creative Work up and down, save, then check the ordering in the **Show projects from** and **Arrange galleries** dropdowns.
2. Set the built-in Social & Content's private Admin note, save, close and reopen Manage site sections. Confirm your note remains and the public heading is unchanged.
3. Ensure permanent delete refuses a section with assigned projects. After reassigning them, type an incorrect confirmation first (should cancel), then type `DELETE` and save (should remove only the custom gallery).
4. Confirm that the homepage's *moves* effect and current project gallery appearances are unchanged.

## Testing status

JavaScript syntax and pure section-order/visibility normalization checks passed locally, as did static verification of the Admin markup and delete handler. Full authenticated Supabase writes and browser UI could not be exercised in the isolated environment and must be verified after deployment.

## Rollback

If the deployed admin has an error, use GitHub **Revert** on the V2.14 update commit or redeploy the last known good commit. The update doesn't change database schema and requires no SQL migration.

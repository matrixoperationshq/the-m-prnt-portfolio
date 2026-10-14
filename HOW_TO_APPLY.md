# The M Prnt V2.12 — Portfolio organization + Systems Lab

This release is **additive to your current V2.11 site**. It **does not** redesign your homepage, change the `moves` animation, alter the cursor glow, replace media, or modify Supabase tables. The nine included website files come from your current `main` branch as of this build plus the changes described below.

## Before installing

1. In Studio Admin, use **Export backup JSON** to download a copy of your current project data and site settings.
2. Preserve your current GitHub commit SHA (or create a branch/backup). Do not overwrite `js/config.js`, Supabase environment settings, the `assets` folder, or `data/projects.json`.
3. Extract the ZIP **before uploading**. In the GitHub repository `matrixoperationshq/the-m-prnt-portfolio`, upload the listed files to their matching root-relative locations, preserving folders.
4. Commit to `main` once all nine files are updated; Netlify should redeploy the connected site.
5. Hard refresh the public site and Studio Admin when deployment completes.

## Files to replace

- `index.html`
- `admin/index.html`
- `css/site.css`
- `css/admin.css`
- `js/site.js`
- `js/admin.js`
- `js/project-taxonomy.js`
- `js/section-settings.js`
- `js/systems-lab.js`

## How the new organization works

- **Selected Work** is driven by the **Also feature in Selected Work** checkbox. Its selected-work framing stays independent.
- **Creative Work** is now a separate gallery and appears in **Arrange galleries**, **Manage site sections**, and project placement. Projects already stored under legacy `site_section: work` are routed here automatically; **no database migration** is necessary. Your Featured projects can also appear in Creative Work at their own, separately saved card shape.
- **Social & Content** is a new public gallery for posts, social campaigns, stories, square posts, portrait graphics, and videos. It is in the project discipline, placement, arrangement, and section management controls. It appears on the public site only after it has published items and is enabled.
- **Hide**: keeps a section in the manager but removes it from public view.
- **Remove section**: removes a built-in or populated custom section from the active manager and public navigation. Look under **Removed from organization** to restore it. The projects remain in Supabase. They may stop appearing publicly until the section is restored or projects are reassigned.
- **Remove / delete**: for an **empty custom gallery**, this permanently deletes that custom gallery definition after confirmation (not any project). A populated custom gallery is instead soft-removed and can be restored; move its projects first if you later want permanent deletion.
- Sections never delete project records or uploaded assets. The project editor's **Delete record** is a separate explicit action and is not changed in this release.

## Systems Lab changes

The original Systems Lab now includes **the challenge, your approach, an interactive workflow, what the work demonstrates, and a transparent capability/status note** for each of SILK and Matrix.

- Based on the supplied SILK site PDF, the SILK example is correctly marked as a **platform concept in development**; it does **not** claim that unsupported integrations are live.
- Based on the supplied Matrix screenshot PDF, the Matrix example is correctly labeled **CORE V1 certified · read-only**. It does **not** claim verified sales, published pilots, or automatic external spending.
- Go to Studio Admin → **Systems Lab / interactive demonstrations**. You can edit all new fields individually. Existing copy remains saved. To use the new editorial copy, click **Load refined SILK + Matrix examples**, review the text, then **Save Systems Lab**. Loading the example does not publish until you save.
- The demo never connects to live customer data and does not expose the internal implementation of either system.

## Post-deploy verification

1. Open **Arrange galleries**. Confirm **Selected Work**, **Creative Work**, **Social & Content**, and the existing collections appear.
2. Select a Featured project with placement set to Creative Work. Verify the featured frame remains independent from the Creative Work card ratio.
3. In **Manage site sections**, confirm **Creative Work** and **Social & Content** appear. Hide and restore an empty section; save and refresh to verify persistence.
4. Create a disposable empty custom gallery, save it, reopen the manager, use **Remove / delete**, save, and confirm it no longer exists.
5. Remove a built-in section with a confirmed dialog, save, check the **Removed from organization** list, then restore it. The project's records must remain in the library.
6. Add an example post as a draft in **Social & Content**, save, publish, and check that the public gallery displays with its own crop/ratio and gallery mode.
7. In Systems Lab, verify that each workflow stage responds to clicks and the stated stage is accurate before publishing.
8. Check the homepage's original smooth `moves` effect, hover/aura behavior, marquee, and mobile navigation.

## Safe rollback

If the admin loads blank or a public gallery fails, redeploy the immediately previous GitHub commit (the V2.11 version), restore the backed-up files, and hard-refresh. This release requires no database/schema rollback. Settings added by V2.12 use existing `portfolio_settings` JSON and do not destroy original records.

## Verification completed for this package

- Full JavaScript syntax checks for updated modules.
- Pure-code compatibility tests: legacy Creative Work routing, Social & Content routing, preserved custom IDs, removed/restore flags, preserved Systems Lab content plus new optional fields.
- HTML source check: hero and banner markup identical to V2.10 source that V2.11 inherited; all original galleries still present.
- CSS parser checks (no CSS parsing errors).

**Not independently verified:** authenticated Supabase saves, browser-only drag operations, or live deployment. The local browser runner denied navigation in this environment. Test the above on your Netlify preview before treating the release as fully validated.

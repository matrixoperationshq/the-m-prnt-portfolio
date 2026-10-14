# The M Prnt V2.15 — Gallery Layout, Backgrounds and Permanent Section Deletion

**A focused update to V2.14, not a redesign.** Keeps the original homepage, *moves* animation, cursor glow, Client Work, Systems Lab, Supabase content, galleries and video controls.

## Replace these six files in the same locations in GitHub

- `js/site.js`
- `js/section-settings.js`
- `js/admin.js`
- `admin/index.html`
- `css/site.css`
- `css/admin.css`

Do **not** replace `js/config.js`, import new SQL, or upload this ZIP as a single repository file. Unzip it first, then upload its actual files into their respective locations. Don't install an older V2.14 after this update.

## Installation

1. Export your Studio Admin **backup JSON** and note the current GitHub commit SHA before installing.
2. Open `https://github.com/matrixoperationshq/the-m-prnt-portfolio`, replace the six files above, and commit to `main`.
3. Confirm the matching Netlify deployment succeeds. Hard-refresh the admin and public website (Mac: Command + Shift + R).
4. Test with ONE section before changing many settings.

## What changed

### 1. More predictable gallery placement

For collections with 2–4 items, **Compact** and **Editorial Flow** now use a balanced, responsive grid instead of CSS columns that could render both items vertically in a narrow left strip. Artwork ratios remain independent of Selected Work. **Carousel** remains horizontally swipeable. Larger Compact galleries use a regular responsive grid; larger Editorial galleries retain proportional, varied-height columns. These overrides apply to Creative Work, Social & Content, Client Work, More Work and custom galleries using the shared gallery styles.

### 2. Background colors for ALL sections

Go to **Studio Admin → Manage site sections**. Each active section now has **Section appearance**:
- **Original V2 section color** (default for built-ins; retains its original look)
- **Warm cream**
- **Soft lavender**
- **Dark plum**

Change one, click **Save website sections**, refresh the public website. A custom gallery still defaults to warm cream. Section appearance doesn't alter your actual artwork or cropping.

### 3. Temporary removal versus deletion

- **Hide** leaves a section in Admin and removes it from the public website.
- **Remove temporarily** takes it out of the active organizer and public navigation. A compact **Temporarily removed sections** disclosure (collapsed by default) allows recovery.
- **Delete forever** requires typing the exact word `DELETE`. It is **blocked if ANY published, draft or archived projects are assigned**. Move those projects elsewhere first.

For custom galleries, permanent deletion removes their custom definition entirely from the saved section settings. For built-in sections, whose HTML is part of the website source, deletion saves a permanent tombstone: that section disappears from the public page, navigation, project destinations, arranger, and restoration list. The underlying source code remains available in GitHub until changed by a developer. This avoids deleting any uploaded assets or project records.

**Important:** `Remove temporarily` is not deletion; it deliberately stays recoverable. Use **Delete forever** to make an empty section disappear entirely from the Admin organizer. Already-removed sections can be permanently deleted by opening the collapsed recovery list and clicking Delete forever.

### 4. Existing settings are preserved

Previous gallery settings and project assignments are not rewritten. Section settings gain only an optional deletion flag and theme choice. Existing sections default to their original V2 background unless you've chosen otherwise.

## Checklist after deployment

- In **Manage site sections**, find Creative Work, select **Soft lavender**, save and refresh. The section background should change without affecting the artwork's crop.
- With two Creative Work projects, choose **Editorial Flow** and save. On desktop, the two artworks should appear side by side, not in a single skinny left column. Test **Compact**, then **Carousel**, and test the page on mobile.
- Choose an unwanted EMPTY custom section. Click **Delete forever**, type `DELETE`, save. It should not appear in the active list, hidden list, project dropdown or arranger after a refresh.
- Test a section WITH projects; deletion must refuse it and preserve those projects.
- Check the original hero, scrolling banner, Featured cards, Client Work and Systems Lab.

## Tested / untested

Verified: JS parsing for the three changed modules, CSS stylesheet parsing, section-data normalization/tombstone persistence and ordered destinations. In an isolated Chromium CSS layout test, two different images displayed side by side at 1440px in Compact and Editorial mode; Carousel displayed as a horizontal flex row; all modes were also checked at 390px. The local environment blocked navigation to an actual test website, so authenticated Supabase saving and full production-browser behavior **still require verification after deployment**.

## Rollback

Revert the V2.15 commit in GitHub (or redeploy the previous Netlify commit). CSS and JS revert, but settings you deliberately save in Supabase are independent of GitHub deployments. To reverse a saved permanent built-in tombstone, restore the `sectionManagerV29` setting from your exported JSON or arrange a targeted correction; simply reverting the code doesn't undo database changes. Never expose Supabase private or service-role keys.

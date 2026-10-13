# THE M PRNT — Portfolio V2

A custom, responsive portfolio and secure-CMS-ready studio, rebuilt from the supplied Netlify source ZIP and Madison's MH monogram.

## What is included

- A redesigned editorial homepage with reactive cursor glow, spring-follow orbital skill tiles, animated headline, mobile skill carousel, project filters, a campaign-wall gallery, and full-screen case studies.
- Working MP4 video previews, PDFs, an actual `madwrld.glb` viewer (via Google `<model-viewer>` web component), and carefully reprocessed image assets.
- **41 editable project records (38 migrated + 3 dedicated web build case studies)**: 7 featured projects, 3 web builds, the remainder categorized by discipline, with incomplete/missing footage or 3D assets intentionally left as **drafts**.
- An authenticated `/admin/` CMS UI with new/edit/archive/delete/reorder, media uploading to Supabase Storage, draft/published state, preview, site text, export JSON and revision recovery.
- Database/storage access policies enforced by Supabase RLS and an SQL migration/seed. No hard-coded admin password, privileged keys, or unauthenticated upload endpoints.
- A static snapshot mode: you can run and inspect the V2 site without having a Supabase project yet. **CMS editing requires the database setup below and cannot save in snapshot mode.**

## Preview locally

Python 3 installed:

```bash
cd the-m-prnt-v2
python3 -m http.server 8000
```

Open `http://localhost:8000`. Do not double-click the HTML as `file://` because the app fetches JSON data.

Use `http://localhost:8000/admin/` to see the CMS. Before Supabase is configured it intentionally displays a setup screen rather than pretending to save changes.

## Connect the real CMS (first-time)

1. Create **your own Supabase project**. In its SQL Editor, run `supabase/schema.sql` followed by `supabase/seed.sql`.
2. In Supabase **Authentication → Users**, add/invite your admin email. Confirm the email and set a password through the Supabase-supported invite flow. Copy that user's UUID from Authentication (not the email string).
3. Back in SQL Editor, run:

```sql
insert into public.portfolio_admins(user_id)
values ('PASTE-ACTUAL-AUTH-USER-UUID-HERE')
on conflict do nothing;
```

4. In Supabase **Project settings → Data API / API keys**, find the Project URL and the **public publishable** (or legacy **anon**) key. Edit `js/config.js`:

```javascript
window.PORTFOLIO_CONFIG = Object.freeze({
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR-PUBLIC-PUBLISHABLE-OR-ANON-KEY'
});
```

These values are inherently public and **all write protection comes from RLS**, but never use `service_role`, secret keys, database passwords, or admin credentials in web code. RLS policies require that the authenticated UUID appear in `portfolio_admins`. Anonymous visitors can only read published records.

5. Run your site locally or deploy. Open `/admin/` and sign in. You can upload images (JPG/PNG/WebP/GIF), video (MP4/WebM), documents (PDF), and model files (GLB) up to ~45 MB each. Uploading media stores the file; **press Save changes** to attach the URL or publish the project. Uploaded media URLs are publicly retrievable because the media bucket is public. Don't upload confidential work.
6. Open your live site in a separate/private browser and verify that publishing a project or changing its cover becomes visible after refresh. A CMS record doesn't require a new Netlify build.

Important: `seed.sql` is intentionally **insert-once**, so rerunning it won't overwrite changes you make in the CMS. New/updated public projects are always read from Supabase when connected; if Supabase can't be reached, the frontend falls back to the initial bundled snapshot and logs a warning. For a strict fail-closed setup, remove that fallback once you're comfortable with your live database.

### Updating the logo, colors, font and interaction

- Monogram: `assets/brand/mh-monogram.webp` (supplied original transparent artwork, resized)
- Colors/font/motion: `css/site.css`
- Hero/content markup: `index.html`
- Public gallery logic: `js/site.js`
- CMS UI/auth/uploads/edits: `admin/index.html`, `css/admin.css`, `js/admin.js`
- Bundled offline content: `data/projects.json` (never stores private passwords or tokens)
- Server permissions: `supabase/schema.sql`

The `model-viewer` web component is loaded from a pinned public CDN for browser-based GLB rendering. Fonts are also externally hosted. They need network access for full fidelity; the page has font fallbacks.

## Connect GitHub and Netlify

1. Create a **private** GitHub repository, e.g. `the-m-prnt-v2`. Upload/commit the **contents** of this folder (not the old exported Netlify `node_modules`). Don't commit private passwords or secret keys.
2. In Netlify choose **Add new project → Import from Git → GitHub** and select the new repository. Set **Build command: empty** and **Publish directory: `.`**. This website does not require an npm build, so Netlify can serve the static files directly.
3. Keep V2 on a temporary Netlify subdomain while you test it. Don't replace `themprnt.co` until you approve the live preview, content and admin behavior.
4. When ready, move `themprnt.co` to this new Netlify site. Move an existing custom domain through Netlify's domain settings and confirm the DNS is correct. Do not create conflicting A/CNAME records or change your domain before testing.
5. Pushing website **code** through GitHub redeploys the frontend automatically. Editing project records through the CMS changes the **database**, so those updates appear without redeploying.

## What this version does not invent

The provided source ZIP lacks live files for several Silk walkthrough/backend videos, a concert promo, Heinz interactive 3D meshes and the M Prnt PDF deck. Those are drafts until actual original media is provided. The four Heinz PDFs remain available in the Heinz case study; their first pages supply the corrected cover composite. The live MadWrld GLB is included as a genuinely interactive model.

No Supabase account, Github repository, Netlify site, custom-domain reassignment or real user account has been created from this ZIP. Those steps require authorized account access by you. The website and admin code are ready for connecting and testing.

## Backup and maintenance

- Use the **Export backup JSON** action in `/admin/` periodically; it includes record data and public asset URLs, not binary uploaded files.
- Database snapshots are kept in `portfolio_revisions` whenever you save an existing record through the dashboard. The **View versions** panel allows you to load an earlier record and save it again.
- Stored media files are **not** deleted automatically when a record is removed; this prevents accidental loss. Clean up unused objects manually through Supabase Storage when necessary.
- Storage itself is not fully backed up by exported JSON. Keep local copies of original photo, video, PDF and GLB assets.
- Large video files may exceed Supabase's plan/file-size limits. For longer reels use dedicated media hosting and paste a secure playback URL.

## Technical QA checklist

- Desktop and mobile preview (360px / 390px / 768px / 1440px).
- All primary navigation links, filters, project dialogs, close/Escape actions.
- `prefers-reduced-motion` stops intensive animation and hides cursor glow.
- Production storage: upload an image, change cover, save and check another browser.
- Production permissions: anonymous users cannot write rows or upload to storage; authorized user can.
- Check real GLB model loaded and rotate/pinch controls work over HTTPS.

**Brand statement:** Work that moves when you touch it.

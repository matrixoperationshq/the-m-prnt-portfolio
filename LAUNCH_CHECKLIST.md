# The M Prnt V2 — Launch checklist

### Immediately: preview before replacing anything

- Unzip this project.
- In Terminal, inside the `the-m-prnt-v2` folder, run `python3 -m http.server 8000`.
- Open `http://localhost:8000` and review the hero, campaign wall, web builds, motion/3D, about and contact.
- The site runs from bundled real assets without a backend; `/admin/` displays setup directions until you connect Supabase.

### When ready to enable real uploads and publishing

1. Create a Supabase project; run `supabase/schema.sql`, then `supabase/seed.sql`.
2. Invite yourself through Supabase Authentication, copy your Auth user UUID, and insert it into `public.portfolio_admins` using the exact statement in README.
3. Add the Supabase **public** URL and **public** key to `js/config.js`. NEVER add a service-role key or password to the code.
4. Create a private GitHub repository with the folder contents.
5. Import that repository into Netlify as a new site. Keep the **existing live website unchanged** while reviewing the V2 preview site.
6. Test `/admin/`: sign in, upload one image, save it as a draft, publish it, and refresh an incognito window to confirm that public visitors see the change.
7. Test the real MP4s, all PDF viewers, and MadWrld GLB on desktop and mobile.
8. When approved, transfer `themprnt.co` from the old Netlify site to the new one using Netlify domain management. Preserve the old deployment as rollback.

**Still needed from you:** create/authorize the Supabase project and admin account; authorize the GitHub repo and Netlify deployment; upload missing original Silk walkthroughs, Heinz 3D meshes and pending pieces when available. These connections are not included in the ZIP.

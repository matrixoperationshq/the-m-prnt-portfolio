# The M Prnt V2.10 — ADDITIONS ONLY (V2 layout preserved)

This is an additive extension of the last V2 builds, not the experimental V3 redesign.

## What stays exactly as-is

- Existing V2 hero with **“Work that moves when you touch it.”** including the original `launchMotion()` animation, floating-card positions, parallax and cursor aura.
- Continuous THINK / MAKE / FEEL / MOVE marquee.
- All existing portfolio sections, especially **Client Work**, featured-card shape and crop independence, masonry/compact/carousel gallery options, original brand colors, admin authentication and Supabase project data.
- Your working `js/config.js`. It is **not** part of the update ZIP.

## What is added

### 1. Systems Lab, hidden until you publish it

A new native V2-styled section added after Digital Experiences. It uses the same fonts, dark gradient and pink/plum accent treatment as the existing website. It contains two user-editable interactive workflow diagrams: SILK and Matrix. In Studio Admin, open **Systems Lab / interactive demonstrations** to edit the small label, title, introduction, each demo's name and introduction, and each stage's title and description. Enable **Publish Systems Lab** and click **Save Systems Lab** to show it on the public site.

Important: The workflow examples are **illustrations**, not live connections to Airtable, booking software or Matrix. Never enter client or patient data into the publicly viewable workflow descriptions.

The Systems Lab is also available in **Manage site sections**. It can be moved, renamed in the menu, or hidden/re-enabled, just like the other built-in sections. Publishing Systems Lab does not move or change any existing project.

### 2. Main project visual: image, video or existing 3D model

Open any project in Studio Admin and find **Main project visual / Video**, immediately above Media Library. Upload a video into **Media Library**, then set:
- **Primary visual:** Uploaded video
- **Choose uploaded video:** the desired video file
- **Play the main video automatically (muted):** optional; default off
- **Use a muted video preview on regular project cards:** optional; default off

Saving the project preserves the selected video in its JSON project data. The original cover remains available as the video's poster image, and it remains the cover for **Selected Work** (the Featured framing stays completely separate). You can return to a still image or the existing 3D viewer at any time.

### 3. Sound controls

- Project lead video is always muted at first. The visitor must click **Enable sound**, or intentionally unmute via native video controls, before audio becomes audible.
- Gallery videos include an explicit Enable sound control, and remain silent at first.
- With automatic silent playback enabled, media pauses and mutes when it leaves the viewport.
- Videos pause and mute when a project popup is closed; other open project videos pause when a different video starts.
- Reduced-motion users are not auto-played.

The video files need to be valid browser-playable MP4/WebM hosted at public HTTPS URLs or in your Supabase media bucket. As before, the existing Free-plan per-file storage cap still applies.

## Installation (GitHub → Netlify)

**Before starting:** Export a backup JSON from Studio Admin. Save the last working GitHub commit SHA. Do not make this update during a critical site change.

1. Download and extract the V2.10 ZIP.
2. Open the existing `matrixoperationshq/the-m-prnt-portfolio` GitHub repository.
3. Upload/replace the files in their matching paths:
   - `index.html`
   - `admin/index.html`
   - `css/site.css`
   - `css/admin.css`
   - `js/site.js`
   - `js/admin.js`
   - `js/section-settings.js` (V2.9 functionality included)
   - `js/video-ui.js` (**new**)
   - `js/systems-lab.js` (**new**)
4. Commit to `main`, or preferably test on a branch with a Netlify Deploy Preview first.
5. Verify the production deploy finished, hard-refresh `themprnt.co/admin/` and log in.
6. Test on a draft project: upload a small MP4, set it as the main visual, Save, refresh the admin to confirm persistence, then temporarily publish if appropriate. Confirm it opens **muted**, that Enable sound works, and that closing the popup pauses the video.
7. Open Systems Lab / interactive demonstrations in Studio Admin. Customize SILK and Matrix examples, enable publishing, click Save, refresh the public site, and check the section and navigation.
8. Test Manage Site Sections hide/restore and ensure **Client Work** and Featured framing behave unchanged.

## Preview first

The standalone `The_M_Prnt_V2_10_True_V2_Interactive_Preview.html` is an **offline design review only**. It embeds a snapshot of the V2 webpage, local example assets, and illustrative demo settings. It is **not** meant to be uploaded as `index.html`, and does not save to Supabase. The preview shows a video-led Anthropologie project as a sample and Systems Lab enabled; your existing public site won't make those selections until you choose them in Studio Admin.

## Compatibility, verification and rollback

- No SQL migration, no reimport of projects and no new external service required.
- Project display choices are added to the existing `portfolio_projects.data` JSON; Systems Lab and section layout live in `portfolio_settings`.
- This includes the V2.9 section manager and Web Builds image-size CSS repair. You do not need to install V2.9 separately.
- **Nothing has been changed on the live website or Supabase by this package.**
- JavaScript syntax, static form IDs, and merged source structure were checked in a local environment. A full authenticated browser regression test is still required on the Netlify preview/production deployment.
- If the interface does not load after deploying, revert the new GitHub commit. Your Supabase data is unchanged.

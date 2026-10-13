# The M Prnt V2.5 — Gallery Layout & Drag Organizer

This is a **small website code update**, not a new portfolio or database. It builds directly on the completed V2.4 organization, icon, marquee and 50 MB upload changes.

## What is new

- **Actual-image sizing:** Studio Admin → select a project → Project Display → Homepage card shape → **Match the actual image · no crop**. The frame respects the uploaded image's intrinsic aspect ratio. Keep Square, Portrait 4:5, Landscape 16:9, Classic 3:2, or Editorial preset where matching dimensions is preferable.
- **Arrange galleries:** In Studio Admin, click **Arrange galleries** under Your projects. Select a destination and choose **Compact**, **Editorial**, or **Carousel**. Reorder the project thumbnails by dragging on desktop or by tapping the up/down buttons on mobile. Click **Save layout & order**.
- **Compact layout:** Stacks uneven image heights more tightly to avoid empty grid rows, particularly in Selected Work, The Concept Lab and Visual Studies. Note: in Compact mode, masonry column widths determine the card widths, so choose Editorial mode for old per-card full-width treatments.
- **Carousel layout:** Sideways touch scrolling, keyboard browsing, and arrow buttons. All seven project galleries can use the setting independently.
- **No ranking field:** The old Featured rank field and project-editor order arrows are removed from the interface; existing values stay in saved records for compatibility. No database migration is required.

## Install — only these seven project files

1. Back up your GitHub repository (`Code → Download ZIP`) and use Studio Admin → **Export backup JSON**. Do not delete anything in Supabase.
2. Download and extract the provided V2.5 ZIP.
3. Replace these paths in the **same** GitHub repository (do not create a second site):

   - `index.html` (retained from completed V2.4)
   - `admin/index.html`
   - `css/site.css`
   - `css/admin.css`
   - `js/site.js`
   - `js/admin.js`
   - `js/project-taxonomy.js` (retained from completed V2.4)

4. Commit to the `main` branch. Netlify should automatically redeploy the updated website.
5. Open `https://themprnt.co/admin/`. Sign in, use **Arrange galleries**, select the section, rearrange, select a mode, and save.
6. Refresh `https://themprnt.co/` in another tab to inspect the public layout. Use a hard refresh if cached assets are still displayed.

**Do not overwrite** `js/config.js` or `data/projects.json`. This update contains no Supabase credentials, and it does not modify your projects, uploads, access policies, or storage bucket.

## Layout modes

| Mode | Best use | Behavior |
| --- | --- | --- |
| Compact | Mixed portraits, posters, landscape creative work | A tightly stacked masonry-like gallery without the intentional staggered gaps; card order is read down the first column, then across |
| Editorial | Flagship case studies with consistent, curated sizing | Preserves V2.4 asymmetric grid, custom card spans and designed spacing |
| Carousel | Collections people can swipe through | Horizontal touch/trackpad scroll, scroll snapping, desktop buttons |

You can switch modes per section at any time. Draft projects won't appear in public galleries until published. Selected Work contains only projects marked **Also feature in Selected Work**.

## Testing / limitations

- JavaScript syntax was checked and the public gallery was rendered in isolated desktop/mobile browser tests with real bundled artwork. The arranger was also tested in desktop/mobile simulated browser sessions, including reorder and mocked saving.
- **Real authenticated Supabase saving and live deployment must still be tested after you install**. This release is packaged, not already deployed.
- Mobile ordering uses clearly labeled **up/down buttons** rather than touch drag. Desktop has HTML drag-and-drop.
- Compact CSS columns stack items vertically in each column (as masonry galleries do). If exact left-to-right reading order is important, choose Editorial or Carousel instead.
- Original-image sizing is available for project cards, not arbitrary CSS decorations or interactive GLB viewer canvases. GLB display size is controlled by its viewer component.

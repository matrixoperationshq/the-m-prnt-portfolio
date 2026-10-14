# The M Prnt — V2.11: Add Real Portfolio Galleries

## What changes

- **Manage site sections → + Add portfolio gallery** creates a *native* portfolio gallery, not an isolated editorial block.
- Name it, optionally set a heading, description and color theme, then **Save website sections**.
- New sections start hidden: they can be edited and given projects before being shown publicly.
- Open any project in Studio Admin → **Where should this live?**, select the new gallery and **Save changes**.
- Use **Arrange galleries** to choose Compact, Editorial Flow, or Carousel and reorder the project's tiles.
- Return to **Manage site sections** and click **Hidden — Restore**, then save. It appears in the public navigation and in the site order you chose.
- The old **Build website sections** panel is hidden when no prior legacy blocks exist, reducing confusion. Existing legacy editorial blocks and their data are retained if you previously used them.
- No deletion of projects is supported through the section manager: hide and restore instead.

## Installation

1. Export backup JSON from Studio Admin and note your last working GitHub commit.
2. Extract this archive and put the files in the corresponding folders of `matrixoperationshq/the-m-prnt-portfolio`, on a separate branch preferably.
3. Do **not** delete unrelated repository assets, `js/config.js`, or stored Supabase data. This is a source-code patch, not a new database.
4. Test the Netlify deploy preview. Open Admin, add a gallery and save it. Confirm it appears in the destination chooser. Put one **draft or published test project** there, then verify the public section, navigation, gallery layout, and hide/restore.
5. Publish to `main` only after testing, or revert the commit if something breaks.

## Notes

Native gallery definitions are saved as `portfolio_settings.sectionManagerV29.custom`, alongside the existing order and visibility preferences. A custom section's ID is stable when renamed. Moving a project into a section stores the ID in the existing `portfolio_projects.data.site_section` field. No new tables or keys are required. The original V2 hero, *moves* animation, marquee, galleries, video and Systems Lab remain intact.

New galleries are created as **hidden** initially so the public site never shows a half-built empty section. The section manager's Save operation stores definitions, ordering, visibility and headings; project edits still require their own Save. Saving gallery layouts also remains a separate step.

A maximum of 20 new sections are supported in the UI. If your current code differs from the V2.10 baseline, compare before replacing, rather than overwriting newer edits.

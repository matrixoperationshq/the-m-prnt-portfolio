-- OPTIONAL ONLY. Use after backing up Studio Admin's JSON.
-- The public V2.16 patch already prevents this legacy panel from displaying.
-- This SQL removes only the exact obsolete text-only legacy block from
-- portfolio_settings.customSections; it does NOT delete any projects,
-- Social & Content galleries, or Client Work galleries.

-- Preview any matching old standalone panels first:
select item as matching_legacy_panel
from public.portfolio_settings ps,
     lateral jsonb_array_elements(ps.value) items(item)
where ps.key = 'customSections'
  and jsonb_typeof(ps.value) = 'array'
  and lower(coalesce(item->>'title','')) like '%designed for the brief%'
  and lower(coalesce(item->>'title','')) like '%made to stand out%'
  and (
      lower(coalesce(item->>'eyebrow','')) like '%social media%'
      or lower(coalesce(item->>'body','')) like '%from brand identities and promotional campaigns%'
  );

-- After confirming the preview contains ONLY the panel you want to remove,
-- uncomment the following statement, run it once, then reload your site.
-- update public.portfolio_settings as ps
-- set value = (
--   select coalesce(jsonb_agg(item), '[]'::jsonb)
--   from jsonb_array_elements(ps.value) items(item)
--   where not (
--     lower(coalesce(item->>'title','')) like '%designed for the brief%'
--     and lower(coalesce(item->>'title','')) like '%made to stand out%'
--     and (
--       lower(coalesce(item->>'eyebrow','')) like '%social media%'
--       or lower(coalesce(item->>'body','')) like '%from brand identities and promotional campaigns%'
--     )
--   )
-- ), updated_at = now()
-- where ps.key = 'customSections'
--   and jsonb_typeof(ps.value) = 'array'
--   and exists (
--     select 1
--     from jsonb_array_elements(ps.value) items(item)
--     where lower(coalesce(item->>'title','')) like '%designed for the brief%'
--       and lower(coalesce(item->>'title','')) like '%made to stand out%'
--       and (
--         lower(coalesce(item->>'eyebrow','')) like '%social media%'
--         or lower(coalesce(item->>'body','')) like '%from brand identities and promotional campaigns%'
--       )
--   );

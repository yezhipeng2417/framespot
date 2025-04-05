alter table public.photos
    add column thumbnail_url text;

-- backfill existing rows with null values
update public.photos
set thumbnail_url = null
where thumbnail_url is null;
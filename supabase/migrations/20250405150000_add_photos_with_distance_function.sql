-- Create a function to get photos with distance calculation
create or replace function public.get_photos_with_distance(
    lat double precision,
    lng double precision
)
returns table (
    id uuid,
    user_id uuid,
    title text,
    description text,
    location jsonb,
    image_urls text[],
    thumbnail_url text,
    created_at timestamptz,
    updated_at timestamptz,
    distance double precision
)
language plpgsql
security definer
as $$
begin
    return query
    select 
        p.id,
        p.user_id,
        p.title,
        p.description,
        p.location,
        p.image_urls,
        p.thumbnail_url,
        p.created_at,
        p.updated_at,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(
                (p.location->>'longitude')::double precision,
                (p.location->>'latitude')::double precision
            ), 4326)::geography
        ) / 1000 as distance  -- Convert to kilometers
    from public.photos p;
end;
$$; 
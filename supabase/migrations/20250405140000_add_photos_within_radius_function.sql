-- Create a function to get photos within a radius
create or replace function public.get_photos_within_radius(
    lat double precision,
    lng double precision,
    radius_km double precision
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
    updated_at timestamptz
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
        p.updated_at
    from public.photos p
    where ST_DWithin(
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        ST_SetSRID(ST_MakePoint(
            (p.location->>'longitude')::double precision,
            (p.location->>'latitude')::double precision
        ), 4326)::geography,
        radius_km * 1000  -- Convert km to meters
    );
end;
$$; 
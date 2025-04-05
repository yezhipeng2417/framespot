-- Drop the old function first
drop function if exists public.get_photos_with_distance(double precision, double precision);

-- Create a function to get photos with distance calculation and sorting
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
    distance double precision,
    username text,
    avatar_url text
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
        ) / 1000 as distance,  -- Convert to kilometers
        pr.username,
        pr.avatar_url
    from public.photos p
    left join public.profiles pr on p.user_id = pr.id
    order by 
        distance asc,  -- 先按距离升序（近的在前）
        p.created_at desc;  -- 再按创建时间降序（新的在前）
end;
$$; 
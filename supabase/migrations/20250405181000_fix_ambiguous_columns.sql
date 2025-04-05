-- Drop the old function first
drop function if exists public.get_photos_with_distance(double precision, double precision);

-- Create a function to get photos with distance range based sorting
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
declare
    dist double precision;
begin
    return query
    with photos_with_distance as (
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
            pr.avatar_url,
            case
                when ST_Distance(
                    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
                    ST_SetSRID(ST_MakePoint(
                        (p.location->>'longitude')::double precision,
                        (p.location->>'latitude')::double precision
                    ), 4326)::geography
                ) / 1000 <= 1 then 1  -- 1公里内
                when ST_Distance(
                    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
                    ST_SetSRID(ST_MakePoint(
                        (p.location->>'longitude')::double precision,
                        (p.location->>'latitude')::double precision
                    ), 4326)::geography
                ) / 1000 <= 3 then 2  -- 3公里内
                when ST_Distance(
                    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
                    ST_SetSRID(ST_MakePoint(
                        (p.location->>'longitude')::double precision,
                        (p.location->>'latitude')::double precision
                    ), 4326)::geography
                ) / 1000 <= 5 then 3  -- 5公里内
                when ST_Distance(
                    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
                    ST_SetSRID(ST_MakePoint(
                        (p.location->>'longitude')::double precision,
                        (p.location->>'latitude')::double precision
                    ), 4326)::geography
                ) / 1000 <= 10 then 4  -- 10公里内
                when ST_Distance(
                    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
                    ST_SetSRID(ST_MakePoint(
                        (p.location->>'longitude')::double precision,
                        (p.location->>'latitude')::double precision
                    ), 4326)::geography
                ) / 1000 <= 20 then 5  -- 20公里内
                else 6  -- 20公里外
            end as distance_range
        from public.photos p
        left join public.profiles pr on p.user_id = pr.id
    )
    select 
        pd.id,
        pd.user_id,
        pd.title,
        pd.description,
        pd.location,
        pd.image_urls,
        pd.thumbnail_url,
        pd.created_at,
        pd.updated_at,
        pd.distance,
        pd.username,
        pd.avatar_url
    from photos_with_distance pd
    order by 
        pd.distance_range asc,  -- 先按距离范围排序
        pd.created_at desc;     -- 同一范围内按时间降序
end;
$$; 
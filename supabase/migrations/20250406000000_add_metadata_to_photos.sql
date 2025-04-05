-- Add metadata column to photos table
alter table public.photos
    add column metadata jsonb;

-- Add comment to the column
comment on column public.photos.metadata is '照片的元数据，包括相机信息、拍摄参数等'; 
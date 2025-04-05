-- Drop existing policies if they exist
drop policy if exists "Photo images are publicly accessible" on storage.objects;
drop policy if exists "Anyone can upload an photo" on storage.objects;
drop policy if exists "Users can update their own photo" on storage.objects;
drop policy if exists "Users can delete their own photo" on storage.objects;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Create storage policies for photos bucket
create policy "Photo images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'photos' );

create policy "Anyone can upload an photo"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own photo"
  on storage.objects for update
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own photo"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  ); 
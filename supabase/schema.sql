--
-- PostgreSQL database schema for FrameSpot
--

-- Enable necessary extensions
create extension if not exists "uuid-ossp";      -- For UUID generation
create extension if not exists "postgis";        -- For geographic queries
create extension if not exists "pg_graphql";     -- For GraphQL support

-- Set up storage for user files
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict do nothing;

-- Storage policies for avatars bucket
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create tables
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text,
    username text unique,
    full_name text,
    bio text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint username_length check (char_length(username) >= 3)
);
comment on table public.profiles is '用户个人资料表';

create table if not exists public.photos (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    location jsonb not null,
    image_urls text[] not null,
    thumbnail_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint location_check check (
        location ? 'latitude' and 
        location ? 'longitude' and 
        location ? 'name'
    )
);
comment on table public.photos is '用户上传的照片';

create table if not exists public.likes (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    photo_id uuid references public.photos(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, photo_id)
);
comment on table public.likes is '照片点赞记录';

create table if not exists public.comments (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    photo_id uuid references public.photos(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
comment on table public.comments is '照片评论';

-- Create indexes
create index if not exists photos_user_id_idx on public.photos(user_id);
create index if not exists likes_user_id_idx on public.likes(user_id);
create index if not exists likes_photo_id_idx on public.likes(photo_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists comments_photo_id_idx on public.comments(photo_id);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.photos enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on profiles for select
    using (true);

create policy "Users can insert their own profile"
    on profiles for insert
    with check (auth.uid() = id);

create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);

-- Photos policies
create policy "Photos are viewable by everyone"
    on photos for select
    using (true);

create policy "Users can insert their own photos"
    on photos for insert
    with check (auth.uid() = user_id);

create policy "Users can update own photos"
    on photos for update
    using (auth.uid() = user_id);

create policy "Users can delete own photos"
    on photos for delete
    using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone"
    on likes for select
    using (true);

create policy "Users can insert their own likes"
    on likes for insert
    with check (auth.uid() = user_id);

create policy "Users can delete own likes"
    on likes for delete
    using (auth.uid() = user_id);

-- Comments policies
create policy "Comments are viewable by everyone"
    on comments for select
    using (true);

create policy "Users can insert their own comments"
    on comments for insert
    with check (auth.uid() = user_id);

create policy "Users can update own comments"
    on comments for update
    using (auth.uid() = user_id);

create policy "Users can delete own comments"
    on comments for delete
    using (auth.uid() = user_id);

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email)
    values (new.id, new.email);
    return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql security definer;

-- Triggers
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

create trigger handle_profiles_updated_at
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();

create trigger handle_photos_updated_at
    before update on public.photos
    for each row execute procedure public.handle_updated_at();

create trigger handle_comments_updated_at
    before update on public.comments
    for each row execute procedure public.handle_updated_at(); 
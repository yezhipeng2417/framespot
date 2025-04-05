export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_urls: string[];
  thumbnail_url: string | null;
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  metadata?: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    dateTime?: string;
    resolution?: string;
    whiteBalance?: string;
    brightness?: string;
  };
}

export interface Like {
  id: string;
  user_id: string;
  photo_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  photo_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// 数据库表名常量
export const DB_TABLES = {
  PROFILES: "profiles",
  PHOTOS: "photos",
  LIKES: "likes",
  COMMENTS: "comments",
} as const;

// 存储桶名称常量
export const STORAGE_BUCKETS = {
  AVATARS: "avatars",
  PHOTOS: "photos",
} as const;

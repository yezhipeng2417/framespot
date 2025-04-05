export interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_urls: string[];
  thumbnail_url: string | null;
  location: Location;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export interface User {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

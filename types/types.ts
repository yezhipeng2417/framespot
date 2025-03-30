export interface Photo {
  id: string;
  title: string;
  description: string;
  images: string[];
  thumbnailUrl: string;
  location: Location;
  user: User;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  photosCount: number;
  followersCount: number;
  followingCount: number;
}

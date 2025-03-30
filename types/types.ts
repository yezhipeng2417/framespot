export interface Photo {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  location: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  createdAt: string;
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

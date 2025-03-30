import { Photo, User } from "@/types/types";

export const dummyUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    username: "johndoe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    bio: "Landscape photographer based in San Francisco",
    photosCount: 24,
    followersCount: 1234,
    followingCount: 567,
  },
  {
    id: "2",
    name: "Jane Smith",
    username: "janesmith",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    bio: "Street photographer looking for unique moments",
    photosCount: 42,
    followersCount: 2341,
    followingCount: 432,
  },
];

export const dummyPhotos: Photo[] = [
  {
    id: "1",
    title: "Golden Gate Bridge",
    description:
      "Iconic view of the Golden Gate Bridge at sunset, with fog rolling in from the Pacific Ocean.",
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200&h=200&fit=crop",
    location: {
      latitude: 37.8199,
      longitude: -122.4783,
      name: "Golden Gate Bridge",
      address: "Golden Gate Bridge, San Francisco, CA",
    },
    user: dummyUsers[0],
    likes: 342,
    comments: 47,
    createdAt: "2023-06-12T15:24:32Z",
  },
  {
    id: "2",
    title: "Alamo Square",
    description:
      "The famous Painted Ladies at Alamo Square, with San Francisco skyline in the background.",
    imageUrl: "https://images.unsplash.com/photo-1551009175-15bdf9dcb580",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1551009175-15bdf9dcb580?w=200&h=200&fit=crop",
    location: {
      latitude: 37.7764,
      longitude: -122.433,
      name: "Alamo Square",
      address: "Alamo Square, San Francisco, CA",
    },
    user: dummyUsers[1],
    likes: 254,
    comments: 31,
    createdAt: "2023-07-23T09:12:45Z",
  },
  {
    id: "3",
    title: "Lombard Street",
    description:
      "The most crooked street in the world, with beautiful flowers and architecture.",
    imageUrl: "https://images.unsplash.com/photo-1577130740896-9294add0e8be",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1577130740896-9294add0e8be?w=200&h=200&fit=crop",
    location: {
      latitude: 37.8021,
      longitude: -122.4196,
      name: "Lombard Street",
      address: "Lombard St, San Francisco, CA",
    },
    user: dummyUsers[0],
    likes: 198,
    comments: 26,
    createdAt: "2023-08-05T18:39:12Z",
  },
];

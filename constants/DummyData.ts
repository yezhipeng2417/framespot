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
  {
    id: "3",
    name: "Alex Johnson",
    username: "alexj",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    bio: "Urban explorer and architecture photographer",
    photosCount: 18,
    followersCount: 876,
    followingCount: 345,
  },
  {
    id: "4",
    name: "Sophia Chen",
    username: "sophiac",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    bio: "Travel photographer capturing beautiful moments around the world",
    photosCount: 65,
    followersCount: 3450,
    followingCount: 220,
  },
];

export const dummyPhotos: Photo[] = [
  // Golden Gate Bridge - Multiple photos from same user at same location
  {
    id: "1",
    title: "Golden Gate Bridge at Sunset",
    description:
      "Iconic view of the Golden Gate Bridge at sunset, with fog rolling in from the Pacific Ocean.",
    images: ["https://images.unsplash.com/photo-1501594907352-04cda38ebc29"],
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
    title: "Golden Gate in Morning Fog",
    description:
      "The majestic Golden Gate Bridge emerging from the early morning fog.",
    images: ["https://images.unsplash.com/photo-1534050359320-02900022671e"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1534050359320-02900022671e?w=200&h=200&fit=crop",
    location: {
      latitude: 37.8199,
      longitude: -122.4783,
      name: "Golden Gate Bridge",
      address: "Golden Gate Bridge, San Francisco, CA",
    },
    user: dummyUsers[0],
    likes: 289,
    comments: 33,
    createdAt: "2023-06-13T08:12:45Z",
  },
  {
    id: "3",
    title: "Bridge Details",
    description:
      "Close-up architectural details of the Golden Gate Bridge's iconic red structure.",
    images: ["https://images.unsplash.com/photo-1610312278520-bcc893a3ff1d"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1610312278520-bcc893a3ff1d?w=200&h=200&fit=crop",
    location: {
      latitude: 37.8199,
      longitude: -122.4783,
      name: "Golden Gate Bridge",
      address: "Golden Gate Bridge, San Francisco, CA",
    },
    user: dummyUsers[0],
    likes: 176,
    comments: 21,
    createdAt: "2023-06-14T11:33:20Z",
  },

  // Golden Gate Bridge - Different user at same location
  {
    id: "4",
    title: "Bridge at Blue Hour",
    description:
      "Golden Gate Bridge captured during the magical blue hour just after sunset.",
    images: ["https://images.unsplash.com/photo-1541464522988-31b420f688b6"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1541464522988-31b420f688b6?w=200&h=200&fit=crop",
    location: {
      latitude: 37.8199,
      longitude: -122.4783,
      name: "Golden Gate Bridge",
      address: "Golden Gate Bridge, San Francisco, CA",
    },
    user: dummyUsers[1],
    likes: 412,
    comments: 56,
    createdAt: "2023-05-22T19:45:11Z",
  },

  // Alamo Square - Multiple users at same location
  {
    id: "5",
    title: "Painted Ladies",
    description:
      "The famous Painted Ladies at Alamo Square, with San Francisco skyline in the background.",
    images: ["https://images.unsplash.com/photo-1551009175-15bdf9dcb580"],
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
    id: "6",
    title: "Victorian Houses in Fog",
    description:
      "Alamo Square's Painted Ladies shrouded in San Francisco's characteristic fog.",
    images: ["https://images.unsplash.com/photo-1580849366770-3425e430cddd"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1580849366770-3425e430cddd?w=200&h=200&fit=crop",
    location: {
      latitude: 37.7764,
      longitude: -122.433,
      name: "Alamo Square",
      address: "Alamo Square, San Francisco, CA",
    },
    user: dummyUsers[2],
    likes: 187,
    comments: 24,
    createdAt: "2023-08-02T14:22:38Z",
  },
  // Palace of Fine Arts - Multiple photos from different users
  {
    id: "8",
    title: "Palace Reflections",
    description:
      "Beautiful reflections of the Palace of Fine Arts in the lagoon at dusk.",
    images: ["https://images.unsplash.com/photo-1549499090-c9203d2b20ad"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1549499090-c9203d2b20ad?w=200&h=200&fit=crop",
    location: {
      latitude: 37.8029,
      longitude: -122.4484,
      name: "Palace of Fine Arts",
      address: "3301 Lyon St, San Francisco, CA",
    },
    user: dummyUsers[3],
    likes: 301,
    comments: 42,
    createdAt: "2023-06-28T16:18:33Z",
  },
  {
    id: "9",
    title: "Architectural Wonder",
    description:
      "The magnificent dome and columns of the Palace of Fine Arts, inspired by Roman and Greek architecture.",
    images: ["https://images.unsplash.com/photo-1636159734091-1e7b7d18c4ce"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1636159734091-1e7b7d18c4ce?w=200&h=200&fit=crop",
    location: {
      latitude: 37.8029,
      longitude: -122.4484,
      name: "Palace of Fine Arts",
      address: "3301 Lyon St, San Francisco, CA",
    },
    user: dummyUsers[2],
    likes: 265,
    comments: 37,
    createdAt: "2023-07-15T11:24:18Z",
  },
  {
    id: "10",
    title: "Palace at Night",
    description:
      "The Palace of Fine Arts illuminated at night, creating a magical atmosphere.",
    images: ["https://images.unsplash.com/photo-1652475227060-6abc8aebe504"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1652475227060-6abc8aebe504?w=200&h=200&fit=crop",
    location: {
      latitude: 37.8029,
      longitude: -122.4484,
      name: "Palace of Fine Arts",
      address: "3301 Lyon St, San Francisco, CA",
    },
    user: dummyUsers[1],
    likes: 328,
    comments: 45,
    createdAt: "2023-08-10T21:42:50Z",
  },

  // Twin Peaks - Different location, same user
  {
    id: "11",
    title: "City Overlook",
    description:
      "Panoramic view of San Francisco from Twin Peaks, showing the entire city and bay.",
    images: ["https://images.unsplash.com/photo-1521464302861-ce943915d1c3"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521464302861-ce943915d1c3?w=200&h=200&fit=crop",
    location: {
      latitude: 37.7563,
      longitude: -122.4472,
      name: "Twin Peaks",
      address: "501 Twin Peaks Blvd, San Francisco, CA",
    },
    user: dummyUsers[0],
    likes: 422,
    comments: 61,
    createdAt: "2023-05-18T10:12:33Z",
  },
  {
    id: "12",
    title: "Fog Rolling In",
    description:
      "The famous San Francisco fog rolling in over Twin Peaks, engulfing the city below.",
    images: ["https://images.unsplash.com/photo-1516245542582-e0cf5a7f0a7a"],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516245542582-e0cf5a7f0a7a?w=200&h=200&fit=crop",
    location: {
      latitude: 37.7563,
      longitude: -122.4472,
      name: "Twin Peaks",
      address: "501 Twin Peaks Blvd, San Francisco, CA",
    },
    user: dummyUsers[3],
    likes: 374,
    comments: 48,
    createdAt: "2023-07-02T17:36:22Z",
  },

  // Coit Tower batch upload as a photo with multiple images
  {
    id: "13",
    title: "Coit Tower Views",
    description:
      "A series of panoramic views from Coit Tower, showing San Francisco from different angles.",
    images: [
      "https://images.unsplash.com/photo-1521464302861-ce943915d1c3",
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
      "https://images.unsplash.com/photo-1534050359320-02900022671e",
    ],
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521464302861-ce943915d1c3?w=200&h=200&fit=crop",
    location: {
      latitude: 37.8025,
      longitude: -122.4058,
      name: "Coit Tower",
      address: "1 Telegraph Hill Blvd, San Francisco, CA",
    },
    user: dummyUsers[0],
    likes: 287,
    comments: 34,
    createdAt: "2023-07-05T14:22:18Z",
  },
];

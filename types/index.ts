/**
 * Core type definitions for the application
 */

export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Professional {
  _id: string;
  userId?: string; // Reference to User who owns this profile
  name: string;
  slug: string;
  category: string; // Category ID
  description: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: Location;
  images: string[]; // Cloudinary URLs
  gallery?: string[]; // Portfolio images - Cloudinary URLs
  media?: string[]; // Video URLs (YouTube, Facebook, Vimeo embeds)
  bio?: string; // Longer biographical section
  rating?: number;
  reviewCount?: number;
  featured: boolean;
  active: boolean;
  verified: boolean; // Admin-controlled verification badge
  socialLinks?: SocialLinks;
  priceRange?: {
    min?: number;
    max?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  city?: string;
  region?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Venue extends Professional {
  capacity?: number;
  amenities?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'professional';
  sessionId: string; // Unique session identifier for device isolation
  iat?: number;
  exp?: number;
}

export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  location: {
    city: string;
    region: string;
    venue: string;
    address?: string;
  };
  posterImage: string; // Flyer/poster URL
  bannerImage?: string;
  startDate: Date;
  endDate: Date;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  category: string; // DJ, Concert, Party, etc.
  ticketing: Array<{
    label: string; // e.g., "General", "BRONZE TABLE", "SILVER", "GOLD", "PLATINUM"
    price: number; // Price in EUR
    currency: string; // e.g., "EUR"
    quantity?: number; // Optional: available tickets
  }>;
  ticketUrl?: string; // External ticketing platform link
  capacity: number;
  attendees: number;
  organizer: {
    name: string;
    email?: string;
    phone: string;
    website?: string;
  };
  featured: boolean;
  published: boolean;
  tags: string[];
  highlights: string[]; // Featured acts/performers
  media?: string[]; // Video URLs (YouTube, Facebook, Vimeo embeds)
  createdAt: Date;
  updatedAt: Date;
}
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
  iat?: number;
  exp?: number;
}

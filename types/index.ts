// Booking status: pending (awaiting confirmation), confirmed, cancelled, expired
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired';

export interface Booking {
  _id: string;
  professionalId: string;
  clientId?: string;
  service: string;
  start: Date;
  end: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  _id: string;
  professionalId: string;
  days: number[]; // 0=Sun, 1=Mon, ...
  startTime: string; // '09:00'
  endTime: string;   // '17:00'
  bufferMinutes: number;
  exceptions: Array<{ date: Date; reason?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedTime {
  _id: string;
  professionalId: string;
  start: Date;
  end: Date;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}
/**
 * Core type definitions for the application
 */

export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'professional';
  accountType?: string; // for legacy compatibility
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
  // Dashboard features
  subscriptionTier?: 'free' | 'pro' | 'premium';
  subscriptionExpiry?: Date;
  analytics?: {
    views: {
      total: number;
      thisMonth: number;
      lastMonth: number;
    };
    contactClicks: number;
    searchImpressions: number;
  };
  verificationDocuments?: string[];
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Inquiry {
  _id: string;
  professionalId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  replies: Array<{
    text: string;
    timestamp: Date;
    from: 'professional' | 'client';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  _id: string;
  professionalId: string;
  date: Date;
  views: number;
  contactClicks: number;
  searchImpressions: number;
  searchTerms: string[];
  referrers: string[];
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
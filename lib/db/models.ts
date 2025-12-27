// ============ BOOKING MODEL ============
import { Booking, Availability, BlockedTime } from '@/types';

interface IBookingDocument extends Omit<Booking, '_id'>, Document {}
const bookingSchema = new Schema({
  professionalId: { type: mongoose.Types.ObjectId, ref: 'Professional', required: true, index: true },
  clientId: { type: mongoose.Types.ObjectId, ref: 'User' },
  service: { type: String, required: true },
  start: { type: Date, required: true, index: true },
  end: { type: Date, required: true, index: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'expired'], required: true, index: true },
}, { timestamps: true });
bookingSchema.index({ professionalId: 1, start: 1, end: 1 }, { unique: true }); // Prevent double-booking
export const BookingModel = (mongoose.models.Booking as Model<IBookingDocument>) || mongoose.model<IBookingDocument>('Booking', bookingSchema);

// ============ AVAILABILITY MODEL ============
interface IAvailabilityDocument extends Omit<Availability, '_id'>, Document {}
const availabilitySchema = new Schema({
  professionalId: { type: mongoose.Types.ObjectId, ref: 'Professional', required: true, index: true },
  days: [{ type: Number, required: true }],
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  bufferMinutes: { type: Number, default: 0 },
  exceptions: [{ date: Date, reason: String }],
}, { timestamps: true });
availabilitySchema.index({ professionalId: 1 });
export const AvailabilityModel = (mongoose.models.Availability as Model<IAvailabilityDocument>) || mongoose.model<IAvailabilityDocument>('Availability', availabilitySchema);

// ============ BLOCKED TIME MODEL ============
interface IBlockedTimeDocument extends Omit<BlockedTime, '_id'>, Document {}
const blockedTimeSchema = new Schema({
  professionalId: { type: mongoose.Types.ObjectId, ref: 'Professional', required: true, index: true },
  start: { type: Date, required: true, index: true },
  end: { type: Date, required: true, index: true },
  reason: { type: String },
}, { timestamps: true });
blockedTimeSchema.index({ professionalId: 1, start: 1, end: 1 });
export const BlockedTimeModel = (mongoose.models.BlockedTime as Model<IBlockedTimeDocument>) || mongoose.model<IBlockedTimeDocument>('BlockedTime', blockedTimeSchema);
/**
 * Mongoose models for categories and professionals
 */

import mongoose, { Document, Model, Schema } from 'mongoose';
import { Category, Professional } from '@/types';

// ============ CATEGORY MODEL ============
interface ICategoryDocument extends Omit<Category, '_id'>, Document {}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: String,
    icon: String,
  },
  { timestamps: true }
);

export const CategoryModel =
  (mongoose.models.Category as Model<ICategoryDocument>) ||
  mongoose.model<ICategoryDocument>('Category', categorySchema);

// ============ PROFESSIONAL MODEL ============
interface IProfessionalDocument extends Omit<Professional, '_id'>, Document {}

const locationSchema = new Schema(
  {
    city: String,
    region: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

const professionalSchema = new Schema<IProfessionalDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId as any,
      ref: 'Category',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    email: String,
    phone: String,
    website: String,
    location: locationSchema,
    images: [String],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    socialLinks: {
      instagram: String,
      twitter: String,
      facebook: String,
      youtube: String,
      tiktok: String,
    },
    priceRange: {
      min: Number,
      max: Number,
    },
    gallery: [String], // Array of image URLs from Cloudinary
    media: [String], // Array of video URLs (YouTube, Facebook, Vimeo embeds)
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    bio: String, // Longer biographical/about section
    // Dashboard features
    subscriptionTier: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
      index: true,
    },
    subscriptionExpiry: Date,
    analytics: {
      views: {
        total: { type: Number, default: 0 },
        thisMonth: { type: Number, default: 0 },
        lastMonth: { type: Number, default: 0 },
      },
      contactClicks: { type: Number, default: 0 },
      searchImpressions: { type: Number, default: 0 },
    },
    verificationDocuments: [String], // Cloudinary URLs for verification docs
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Compound index for efficient filtering
professionalSchema.index({ category: 1, active: 1, featured: -1 });
professionalSchema.index({ name: 'text', description: 'text' });
professionalSchema.index({ userId: 1 });

export const ProfessionalModel =
  (mongoose.models.Professional as Model<IProfessionalDocument>) ||
  mongoose.model<IProfessionalDocument>('Professional', professionalSchema);

// ============ USER MODEL ============
// ============ CONTACT MODEL ============
interface IContactDocument extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContactDocument>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

export const ContactModel =
  (mongoose.models.Contact as Model<IContactDocument>) ||
  mongoose.model<IContactDocument>('Contact', contactSchema);

// ============ REVIEW MODEL ============
interface IReviewDocument extends Document {
  professionalId: mongoose.Types.ObjectId;
  clientName: string;
  clientEmail: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verified: boolean; // Admin verified
  approved: boolean; // Published
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    approved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
reviewSchema.index({ professionalId: 1, approved: 1 });
reviewSchema.index({ professionalId: 1, rating: 1 });

export const ReviewModel =
  (mongoose.models.Review as Model<IReviewDocument>) ||
  mongoose.model<IReviewDocument>('Review', reviewSchema);

// ============ INQUIRY MODEL ============
interface IInquiryDocument extends Document {
  professionalId: mongoose.Types.ObjectId;
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

const inquirySchema = new Schema<IInquiryDocument>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    clientPhone: String,
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'closed'],
      default: 'new',
      index: true,
    },
    replies: [{
      text: String,
      timestamp: Date,
      from: {
        type: String,
        enum: ['professional', 'client'],
      },
    }],
  },
  { timestamps: true }
);

inquirySchema.index({ professionalId: 1, status: 1 });
inquirySchema.index({ professionalId: 1, createdAt: -1 });

export const InquiryModel =
  (mongoose.models.Inquiry as Model<IInquiryDocument>) ||
  mongoose.model<IInquiryDocument>('Inquiry', inquirySchema);

// ============ ANALYTICS MODEL ============
interface IAnalyticsDocument extends Document {
  professionalId: mongoose.Types.ObjectId;
  date: Date;
  views: number;
  contactClicks: number;
  searchImpressions: number;
  searchTerms: string[];
  referrers: string[];
}

const analyticsSchema = new Schema<IAnalyticsDocument>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    contactClicks: {
      type: Number,
      default: 0,
    },
    searchImpressions: {
      type: Number,
      default: 0,
    },
    searchTerms: [String],
    referrers: [String],
  },
  { timestamps: true }
);

analyticsSchema.index({ professionalId: 1, date: -1 });
analyticsSchema.index({ date: -1 });

export const AnalyticsModel =
  (mongoose.models.Analytics as Model<IAnalyticsDocument>) ||
  mongoose.model<IAnalyticsDocument>('Analytics', analyticsSchema);

// ============ BLOG POST MODEL ============
interface IBlogPostDocument extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  featuredImage?: string;
  published: boolean;
  featured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPostDocument>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    author: {
      type: String,
      default: 'Admin',
    },
    featuredImage: String,
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

blogPostSchema.index({ published: 1, featured: -1, createdAt: -1 });
blogPostSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

export const BlogPostModel =
  (mongoose.models.BlogPost as Model<IBlogPostDocument>) ||
  mongoose.model<IBlogPostDocument>('BlogPost', blogPostSchema);

// ============ NEWS FLASH MODEL ============
interface INewsFlashDocument extends Document {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  published: boolean;
  startDate: Date;
  endDate: Date;
  priority: number;
  link?: string; // Optional link to redirect when clicked
  createdAt: Date;
  updatedAt: Date;
}

const newsFlashSchema = new Schema<INewsFlashDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
    },
    link: {
      type: String,
      default: null, // Optional: redirect link when clicked
    },
  },
  { timestamps: true }
);

newsFlashSchema.index({ published: 1, priority: -1, startDate: -1 });

export const NewsFlashModel =
  (mongoose.models.NewsFlash as Model<INewsFlashDocument>) ||
  mongoose.model<INewsFlashDocument>('NewsFlash', newsFlashSchema);

// ============ USER MODEL (Enhanced) ============
interface IUserDocument extends Document {
  email: string;
  password?: string; // Optional for OAuth users
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  accountType: 'user' | 'professional' | 'admin';
  
  // OAuth
  oauthProvider?: 'google' | 'facebook';
  oauthId?: string;
  
  // Profile Completion
  profileCompletion: {
    basicInfo: boolean;
    contactInfo: boolean;
    profilePicture: boolean;
    preferences: boolean;
  };
  profileCompletionPercentage: number;
  
  // Account Settings
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    twoFactorEnabled: boolean;
    language: 'en' | 'fr';
    theme: 'light' | 'dark';
  };
  
  // Email Verification
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  
  // Password Recovery
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Account Status
  active: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phone: String,
    profilePicture: String,
    accountType: {
      type: String,
      enum: ['user', 'professional', 'admin'],
      default: 'user',
      index: true,
    },
    
    // OAuth
    oauthProvider: {
      type: String,
      enum: ['google', 'facebook'],
    },
    oauthId: String,
    
    // Profile Completion
    profileCompletion: {
      basicInfo: { type: Boolean, default: false },
      contactInfo: { type: Boolean, default: false },
      profilePicture: { type: Boolean, default: false },
      preferences: { type: Boolean, default: false },
    },
    profileCompletionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    
    // Account Settings
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      marketingEmails: { type: Boolean, default: true },
      twoFactorEnabled: { type: Boolean, default: false },
      language: {
        type: String,
        enum: ['en', 'fr'],
        default: 'en',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
    },
    
    // Email Verification
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    // Password Recovery
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Account Status
    active: { type: Boolean, default: true, index: true },
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  { timestamps: true }
);

// Index for profile completion tracking
userSchema.index({ accountType: 1, profileCompletionPercentage: 1 });
userSchema.index({ emailVerified: 1, active: 1 });

export const UserModel =
  (mongoose.models.User as Model<IUserDocument>) ||
  mongoose.model<IUserDocument>('User', userSchema);

// ============ NEWSLETTER SUBSCRIBER MODEL ============
interface INewsletterSubscriberDocument extends Document {
  email: string;
  firstName?: string;
  subscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  verificationToken?: string;
  verified: boolean;
  categories: string[]; // Categories user is interested in
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriberDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    firstName: String,
    subscribed: {
      type: Boolean,
      default: true,
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: Date,
    verificationToken: String,
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    categories: [
      {
        type: String,
        lowercase: true,
      },
    ],
  },
  { timestamps: true }
);

// Indexes for efficient queries
newsletterSubscriberSchema.index({ subscribed: 1, verified: 1 });
newsletterSubscriberSchema.index({ email: 1, subscribed: 1 });

export const NewsletterSubscriberModel =
  (mongoose.models.NewsletterSubscriber as Model<INewsletterSubscriberDocument>) ||
  mongoose.model<INewsletterSubscriberDocument>('NewsletterSubscriber', newsletterSubscriberSchema);

// ============ EVENT MODEL ============
interface IEventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  location: {
    city: string;
    region: string;
    venue: string;
    address?: string;
  };
  posterImage: string; // Primary image (for backward compatibility)
  bannerImage?: string; // Optional banner image (deprecated - use images array)
  images: Array<{
    url: string; // Base64 or Cloudinary URL
    caption?: string;
    order: number; // For gallery ordering
  }>; // Full image gallery (Free: 1, Featured: 3-5, Boost: 10+)
  startDate: Date;
  endDate: Date;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  category: string; // DJ, Concert, Fashion, Party, etc.
  ticketing: Array<{
    label: string; // e.g., "General", "BRONZE TABLE", "SILVER", "GOLD", "PLATINUM"
    price: number; // Price in EUR
    currency: string; // e.g., "EUR"
    quantity?: number; // Optional: available tickets
  }>;
  ticketUrl?: string; // External ticketing platform link
  capacity: number; // Total attendance capacity
  attendees: number; // Current number of registered attendees
  organizer: {
    name: string;
    email?: string;
    phone: string;
    website?: string;
  };
  featured: boolean;
  published: boolean;
  tags: string[];
  highlights: string[]; // Featured acts, performers, etc.
  media?: string[]; // Video URLs (YouTube, Facebook, Vimeo embeds)
  userId?: mongoose.Types.ObjectId; // User who created the event
  promotionTier?: string; // 'free', 'featured', 'boost'
  promotionStartDate?: Date;
  promotionExpiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      city: String,
      region: String,
      venue: {
        type: String,
        required: true,
      },
      address: String,
    },
    posterImage: {
      type: String,
      required: true,
    },
    bannerImage: String,
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: String,
        order: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    ticketing: [
      {
        label: {
          type: String,
          required: true, // e.g., "General", "BRONZE TABLE", "SILVER", "GOLD", "PLATINUM"
        },
        price: {
          type: Number,
          required: true, // Price in EUR
        },
        currency: {
          type: String,
          default: 'EUR',
        },
        quantity: Number, // Optional: available tickets
      },
    ],
    ticketUrl: String, // External ticketing platform link
    capacity: {
      type: Number,
      required: true,
    },
    attendees: {
      type: Number,
      default: 0,
    },
    organizer: {
      name: {
        type: String,
        required: true,
      },
      email: String,
      phone: {
        type: String,
        required: true,
      },
      website: String,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [String],
    highlights: [String],
    media: [String], // Array of video URLs (YouTube, Facebook, Vimeo embeds)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    promotionTier: {
      type: String,
      enum: ['free', 'featured', 'boost'],
      default: 'free',
    },
    promotionStartDate: {
      type: Date,
      default: Date.now,
    },
    promotionExpiryDate: Date, // For featured (1 week) and boost (1 month) tiers
  },
  { timestamps: true }
);

// Indexes for efficient queries
eventSchema.index({ published: 1, startDate: 1 });
eventSchema.index({ category: 1, startDate: 1 });
eventSchema.index({ published: 1, featured: -1, startDate: -1 });
eventSchema.index({ userId: 1, createdAt: -1 });
eventSchema.index({ userId: 1, promotionTier: 1 });

export const EventModel =
  (mongoose.models.Event as Model<IEventDocument>) ||
  mongoose.model<IEventDocument>('Event', eventSchema);

// ============ USER SESSION MODEL ============
// Tracks active sessions per user/device for session isolation
interface IUserSessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string; // Unique per login
  deviceFingerprint: string; // Device identifier (User-Agent + Accept-Language hash)
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const userSessionSchema = new Schema<IUserSessionDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceFingerprint: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: String,
    userAgent: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      // Auto-delete after expiration (TTL index)
      expires: 0,
    },
  },
  { timestamps: true }
);

export const UserSessionModel =
  (mongoose.models.UserSession as Model<IUserSessionDocument>) ||
  mongoose.model<IUserSessionDocument>('UserSession', userSessionSchema);

// ============ LOGOUT TOKEN MODEL ============
// Stores tokens that have been logged out (blacklist)
interface ILogoutTokenDocument extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const logoutTokenSchema = new Schema<ILogoutTokenDocument>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      // Auto-delete after expiration (TTL index)
      expires: 0,
    },
  },
  { timestamps: true }
);

export const LogoutTokenModel =
  (mongoose.models.LogoutToken as Model<ILogoutTokenDocument>) ||
  mongoose.model<ILogoutTokenDocument>('LogoutToken', logoutTokenSchema);

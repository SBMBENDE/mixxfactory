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
  },
  { timestamps: true }
);

// Compound index for efficient filtering
professionalSchema.index({ category: 1, active: 1, featured: -1 });
professionalSchema.index({ name: 'text', description: 'text' });

export const ProfessionalModel =
  (mongoose.models.Professional as Model<IProfessionalDocument>) ||
  mongoose.model<IProfessionalDocument>('Professional', professionalSchema);

// ============ USER MODEL ============
interface IUserDocument extends Document {
  email: string;
  password: string;
  role: 'admin' | 'professional' | 'user';
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
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'professional', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
);

export const UserModel =
  (mongoose.models.User as Model<IUserDocument>) ||
  mongoose.model<IUserDocument>('User', userSchema);

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

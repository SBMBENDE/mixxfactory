import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['professional', 'admin', 'user']).default('professional'),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).toLowerCase(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProfessionalSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).toLowerCase().optional(),
  category: z.string().min(1),
  description: z.string().min(10).max(2000),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.object({
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
  }).optional(),
  images: z.array(z.string()).min(0),
  featured: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  socialLinks: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
});

export const updateProfessionalSchema = createProfessionalSchema.partial();

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  slug: z.string().optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('12'),
  sort: z.enum(['newest', 'rating', 'name']).optional().default('newest'),
});

// Type exports
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export const createReviewSchema = z.object({
  professionalId: z.string().min(1, 'Professional ID is required'),
  clientName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  clientEmail: z.string().email('Invalid email address'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(5000),
});

export const createBlogPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  content: z.string().min(50, 'Content must be at least 50 characters').max(50000),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(300),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional().default([]),
  author: z.string().optional().default('Admin'),
  featuredImage: z.string().url().optional(),
  featured: z.boolean().optional().default(false),
});

export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  published: z.boolean().optional(),
});

export const createNewsFlashSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  priority: z.number().min(0).max(100).optional().default(0),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>;
export type UpdateProfessionalInput = z.infer<typeof updateProfessionalSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type CreateNewsFlashInput = z.infer<typeof createNewsFlashSchema>;

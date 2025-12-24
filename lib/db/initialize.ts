/**
 * Initialize database with seed data if empty
 * Runs on first server connection
 */

import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, CategoryModel } from '@/lib/db/models';

let initialized = false;

export async function initializeDatabase() {
  if (initialized) return;
  
  try {
    await connectDB();
    
    // Check if we already have categories
    const categoryCount = await CategoryModel.countDocuments();
    
    if (categoryCount === 0) {
      console.log('[INIT] Database is empty, seeding initial data...');
      
      // Create categories
      const categories = await CategoryModel.insertMany([
        { name: 'DJ', slug: 'dj', icon: '🎧', description: 'Professional DJs for events' },
        { name: 'Event Hall', slug: 'event-hall', icon: '🏛️', description: 'Event venues and spaces' },
        { name: 'Stylist', slug: 'stylist', icon: '✨', description: 'Professional stylists' },
        { name: 'Restaurant', slug: 'restaurant', icon: '🍽️', description: 'Catering and dining' },
        { name: 'Nightclub', slug: 'nightclub', icon: '🌙', description: 'Nightclubs and venues' },
        { name: 'Cameraman', slug: 'cameraman', icon: '📹', description: 'Photography and video' },
        { name: 'Promoter', slug: 'promoter', icon: '📢', description: 'Event promoters' },
      ]);
      
      console.log(`[INIT] Created ${categories.length} categories`);
      
      // Create professionals
      const professionals = await ProfessionalModel.insertMany([
        {
          name: 'DJ Alex Turner',
          slug: 'dj-alex-turner',
          description: 'Professional DJ with 10+ years experience',
          category: categories[0]._id,
          images: ['https://via.placeholder.com/400x400?text=DJ+Alex'],
          gallery: [],
          rating: 4.8,
          reviewCount: 42,
          featured: true,
          active: true,
          location: { city: 'New York', country: 'USA' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Grand Ballroom',
          slug: 'grand-ballroom',
          description: 'Elegant venue for 500+ guests',
          category: categories[1]._id,
          images: ['https://via.placeholder.com/400x400?text=Grand+Ballroom'],
          gallery: [],
          rating: 4.9,
          reviewCount: 58,
          featured: true,
          active: true,
          location: { city: 'London', country: 'UK' },
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(Date.now() - 86400000),
        },
        {
          name: 'Sara\'s Styling',
          slug: 'saras-styling',
          description: 'Expert hair and makeup styling',
          category: categories[2]._id,
          images: ['https://via.placeholder.com/400x400?text=Sara+Styling'],
          gallery: [],
          rating: 4.7,
          reviewCount: 35,
          featured: true,
          active: true,
          location: { city: 'Paris', country: 'France' },
          createdAt: new Date(Date.now() - 172800000),
          updatedAt: new Date(Date.now() - 172800000),
        },
      ]);
      
      console.log(`[INIT] Created ${professionals.length} professionals`);
    } else {
      console.log(`[INIT] Database already has ${categoryCount} categories, skipping seed`);
    }
    
    initialized = true;
  } catch (error) {
    console.error('[INIT] Error during initialization:', error);
  }
}

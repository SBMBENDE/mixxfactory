/**
 * MongoDB indexes for optimal performance
 * Run this once to ensure all required indexes exist
 *
 * Usage: node scripts/create-indexes.js
 */

import mongoose from 'mongoose'
import { ProfessionalModel, CategoryModel } from '../lib/db/models'

const MONGODB_URI = process.env.MONGODB_URI

async function createIndexes() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not set')
    }

    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Featured professionals (main query)
    await ProfessionalModel.collection.createIndex({
      featured: 1,
      createdAt: -1,
    })
    console.log('✅ Created index: { featured: 1, createdAt: -1 }')

    // Slug lookup (critical for individual pages)
    await ProfessionalModel.collection.createIndex(
      { slug: 1 },
      { unique: true }
    )
    console.log('✅ Created index: { slug: 1 } (unique)')

    // Active professionals with featured priority
    await ProfessionalModel.collection.createIndex({
      active: 1,
      featured: -1,
      createdAt: -1,
    })
    console.log('✅ Created index: { active: 1, featured: -1, createdAt: -1 }')

    // Directory filtering by category, city, rating
    await ProfessionalModel.collection.createIndex({
      category: 1,
      active: 1,
      rating: -1,
    })
    console.log('✅ Created index: { category: 1, active: 1, rating: -1 }')

    // Text search on name and description
    await ProfessionalModel.collection.createIndex({
      name: 'text',
      description: 'text',
    })
    console.log('✅ Created index: { name: text, description: text }')

    // Categories slug
    await CategoryModel.collection.createIndex({ slug: 1 }, { unique: true })
    console.log('✅ Created index on categories: { slug: 1 } (unique)')

    console.log('\n✨ All indexes created successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating indexes:', error)
    process.exit(1)
  }
}

createIndexes()

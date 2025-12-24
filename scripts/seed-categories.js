/**
 * Seed script to add categories to the database
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Read .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
let MONGODB_URI = ''
for (const line of envContent.split('\n')) {
  if (line.startsWith('MONGODB_URI=')) {
    MONGODB_URI = line
      .substring('MONGODB_URI='.length)
      .replaceAll('"', '')
      .trim()
    break
  }
}

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set')
  process.exit(1)
}

const categorySchema = new mongoose.Schema(
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
)

const Category = mongoose.model('Category', categorySchema)

const categories = [
  {
    name: 'DJ',
    slug: 'dj',
    description: 'Professional DJs for events and parties',
    icon: '🎧',
  },
  {
    name: 'Event Hall',
    slug: 'event-hall',
    description: 'Venues and event spaces for your celebrations',
    icon: '🏛️',
  },
  {
    name: 'Stylist',
    slug: 'stylist',
    description: 'Professional stylists and makeup artists',
    icon: '✨',
  },
  {
    name: 'Restaurant',
    slug: 'restaurant',
    description: 'Restaurants for catering and dining',
    icon: '🍽️',
  },
  {
    name: 'Nightclub',
    slug: 'nightclub',
    description: 'Nightclubs and entertainment venues',
    icon: '🌙',
  },
  {
    name: 'Cameraman',
    slug: 'cameraman',
    description: 'Professional photographers and videographers',
    icon: '📹',
  },
  {
    name: 'Promoter',
    slug: 'promoter',
    description: 'Event promoters and organizers',
    icon: '📢',
  },
  {
    name: 'Decorator',
    slug: 'decorator',
    description: 'Event decorators and designers',
    icon: '🎨',
  },
  {
    name: 'Caterer',
    slug: 'caterer',
    description: 'Catering services and food providers',
    icon: '🍽️',
  },
  {
    name: 'Florist',
    slug: 'florist',
    description: 'Flower arrangements and floral design',
    icon: '🌸',
  },
]

async function seedCategories() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✓ Connected to MongoDB')

    // Clear existing categories
    await Category.deleteMany({})
    console.log('✓ Cleared existing categories')

    // Insert categories
    const created = await Category.insertMany(categories)
    console.log(`✓ Created ${created.length} categories:`)
    created.forEach((cat) => {
      console.log(`  - ${cat.icon} ${cat.name} (${cat.slug})`)
    })

    await mongoose.disconnect()
    console.log('✓ Disconnected from MongoDB')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

seedCategories()

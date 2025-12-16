/**
 * Script to add new categories to the database
 * Usage: node add-categories.js
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Load .env.local if MONGODB_URI not set
if (!process.env.MONGODB_URI) {
  const envPath = path.join(__dirname, '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envLines = envContent.split('\n')
    for (const line of envLines) {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        let value = match[2].trim()
        // Remove surrounding quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }
        process.env[match[1]] = value
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set')
  process.exit(1)
}

// Define category schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
)

const Category = mongoose.model('Category', categorySchema)

// New categories to add
const newCategories = [
  {
    name: 'Cleaning Services',
    slug: 'cleaning-services',
    description: 'Professional cleaning services for homes and businesses',
    icon: '🧹',
  },
  {
    name: 'Childcare',
    slug: 'childcare',
    description: 'Reliable childcare and babysitting services',
    icon: '👶',
  },
  {
    name: 'Grocery Stores',
    slug: 'grocery-stores',
    description: 'Local grocery and food supply stores',
    icon: '🛒',
  },
  {
    name: 'Handyman Services',
    slug: 'handyman-services',
    description: 'General handyman and repair services',
    icon: '🔧',
  },
]

async function addCategories() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✓ Connected to MongoDB')

    for (const categoryData of newCategories) {
      // Check if category already exists
      const existing = await Category.findOne({ slug: categoryData.slug })

      if (existing) {
        console.log(
          `⚠️  Category "${categoryData.name}" already exists (${categoryData.slug})`
        )
      } else {
        const category = new Category(categoryData)
        await category.save()
        console.log(
          `✓ Added category: ${categoryData.name} (${categoryData.slug})`
        )
      }
    }

    // Show total categories
    const total = await Category.countDocuments()
    console.log(`\n📊 Total categories in database: ${total}`)

    await mongoose.disconnect()
    console.log('✓ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

addCategories()

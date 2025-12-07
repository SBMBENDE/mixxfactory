/**
 * Check categories in database
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const envPath = path.join(
  '/Users/sampsonmbende/Documents/mixxfactory',
  '.env.local'
)
const envContent = fs.readFileSync(envPath, 'utf-8')
const lines = envContent.split('\n')

let mongoUri = ''
for (const line of lines) {
  if (line.startsWith('MONGODB_URI=')) {
    mongoUri = line.substring('MONGODB_URI='.length).replaceAll('"', '')
    break
  }
}

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
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

const Category =
  mongoose.models.Category || mongoose.model('Category', categorySchema)

async function checkCategories() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB\n')

    const categories = await Category.find().sort({ name: 1 })
    console.log(`📁 Total categories in database: ${categories.length}\n`)

    categories.forEach((cat, i) => {
      console.log(`${i + 1}. ${cat.icon} ${cat.name} (${cat.slug})`)
    })

    await mongoose.connection.close()
    console.log('\n✅ Done')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkCategories()

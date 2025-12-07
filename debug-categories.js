/**
 * Debug categories query
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

async function debug() {
  try {
    await mongoose.connect(mongoUri)

    const categories = await Category.find().sort({ name: 1 }).lean()
    console.log('Array.isArray(categories):', Array.isArray(categories))
    console.log('categories.length:', categories.length)
    console.log('typeof categories:', typeof categories)
    console.log('categories.constructor.name:', categories.constructor.name)

    console.log('\nFirst item:')
    console.log(categories[0])

    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

debug()

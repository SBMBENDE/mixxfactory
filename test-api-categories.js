/**
 * Test API categories directly
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

async function testAPI() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected\n')

    // Exact same query as API
    const categories = await Category.find().sort({ name: 1 }).lean()
    console.log('📊 Query result:')
    console.log(`Total categories returned: ${categories.length}`)
    console.log('\nFull JSON response that API would return:')
    console.log(JSON.stringify({ success: true, data: categories }, null, 2))

    await mongoose.connection.close()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

testAPI()

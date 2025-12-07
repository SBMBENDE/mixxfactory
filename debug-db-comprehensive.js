/**
 * Comprehensive database debug
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

console.log('🔍 MongoDB Connection String Analysis:')
console.log('URI:', mongoUri.replace(/:[^:]*@/, ':****@'))

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
    console.log('\n🔗 Connecting to MongoDB...')
    const conn = await mongoose.connect(mongoUri)
    console.log('✅ Connected')
    console.log('Database name:', conn.connection.db.databaseName)

    // Check all collections
    const collections = await conn.connection.db.listCollections().toArray()
    console.log('\n📚 Collections in database:')
    collections.forEach((c) => console.log('  -', c.name))

    // Check categories collection specifically
    const categoriesCount = await conn.connection.db
      .collection('categories')
      .countDocuments()
    console.log(
      `\n📊 Direct MongoDB count of categories collection: ${categoriesCount}`
    )

    const allDocs = await conn.connection.db
      .collection('categories')
      .find({})
      .toArray()
    console.log(
      `\n📄 All documents in categories collection (${allDocs.length} total):`
    )
    allDocs.forEach((doc, i) => {
      console.log(`  ${i + 1}. ${doc.name} (${doc.slug})`)
    })

    // Now check with Mongoose
    const mongooseCount = await Category.countDocuments()
    console.log(`\n🔍 Mongoose count: ${mongooseCount}`)

    const mongooseFind = await Category.find().sort({ name: 1 }).lean()
    console.log(`\n📋 Mongoose find results (${mongooseFind.length} total):`)
    mongooseFind.forEach((doc, i) => {
      console.log(`  ${i + 1}. ${doc.name} (${doc.slug})`)
    })

    await mongoose.connection.close()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

debug()

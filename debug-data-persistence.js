#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envLines = envContent.split('\n')
envLines.forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim().replace(/^["']|["']$/g, '')
    process.env[key] = value
  }
})

const { MongoClient } = require('mongodb')

async function debugDataPersistence() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in environment')
    process.exit(1)
  }

  console.log('🔍 Connecting to MongoDB...')
  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    console.log('✅ MongoDB connected successfully\n')

    const db = client.db('mixxfactory')

    // Check categories
    const categories = await db.collection('categories').find({}).toArray()
    console.log(`📚 Categories: ${categories.length} found`)
    categories.forEach((cat) => {
      console.log(`   - ${cat.name} (slug: ${cat.slug})`)
    })

    // Check professionals
    const professionals = await db
      .collection('professionals')
      .find({})
      .toArray()
    console.log(`\n👥 Professionals: ${professionals.length} found`)
    professionals.forEach((prof) => {
      console.log(`   - ${prof.name} (slug: ${prof.slug})`)
      console.log(`     Images: ${prof.images?.length || 0}`)
      if (prof.images && prof.images.length > 0) {
        prof.images.forEach((img, idx) => {
          console.log(`       [${idx}] ${img}`)
        })
      }
    })

    // Check reviews
    const reviews = await db.collection('reviews').find({}).toArray()
    console.log(`\n⭐ Reviews: ${reviews.length} found`)
    reviews.slice(0, 5).forEach((review) => {
      console.log(
        `   - "${review.comment}" (${review.rating}★ by ${review.reviewerName})`
      )
    })
    if (reviews.length > 5) {
      console.log(`   ... and ${reviews.length - 5} more`)
    }

    // Check if data exists
    console.log('\n📊 Summary:')
    console.log(`✓ Total professionals: ${professionals.length}`)
    console.log(`✓ Total reviews: ${reviews.length}`)
    console.log(
      `✓ Total images across all professionals: ${professionals.reduce(
        (sum, p) => sum + (p.images?.length || 0),
        0
      )}`
    )
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
  }
}

debugDataPersistence()

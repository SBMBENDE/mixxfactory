/**
 * Test script to debug featured professionals fetching
 */

const mongoose = require('mongoose')

const professionalSchema = new mongoose.Schema({}, { strict: false })
const Professional = mongoose.model('Professional', professionalSchema)

async function testFetch() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable not set')
      process.exit(1)
    }

    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB\n')

    // Simulate the exact query from homepage-data.ts
    console.log('🔍 Testing exact query from homepage-data.ts...\n')

    console.log('Query 1: Featured + Active (featured: true, active: true)')
    const query1Start = Date.now()
    let professionals = await Professional.find({
      featured: true,
      active: true,
    })
      .select(
        'name slug images gallery rating reviewCount category createdAt featured active'
      )
      .sort({ createdAt: -1 })
      .limit(4)
      .lean()
      .exec()
    console.log(`  Time: ${Date.now() - query1Start}ms`)
    console.log(`  Results: ${professionals.length} professionals`)

    if (professionals.length > 0) {
      console.log('  ✅ Found featured professionals:')
      professionals.forEach((p) => {
        console.log(`    - ${p.name} (slug: ${p.slug})`)
        console.log(`      featured=${p.featured}, active=${p.active}`)
        console.log(
          `      images: ${p.images?.length || 0}, gallery: ${
            p.gallery?.length || 0
          }`
        )
      })
    } else {
      console.log('  ⚠️ No featured+active professionals found')

      // Try fallback query
      console.log('\nQuery 2: Fallback - Active only (active: true)')
      const query2Start = Date.now()
      professionals = await Professional.find({ active: true })
        .select(
          'name slug images gallery rating reviewCount category createdAt featured active'
        )
        .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
        .limit(4)
        .lean()
        .exec()
      console.log(`  Time: ${Date.now() - query2Start}ms`)
      console.log(`  Results: ${professionals.length} professionals`)

      if (professionals.length > 0) {
        console.log('  ✅ Found active professionals:')
        professionals.forEach((p) => {
          console.log(
            `    - ${p.name} (rating: ${p.rating}, reviews: ${p.reviewCount})`
          )
        })
      }
    }

    console.log('\n🔍 Checking database indexes...')
    const indexes = await Professional.collection.getIndexes()
    console.log('Indexes:', Object.keys(indexes).join(', '))

    await mongoose.disconnect()
    console.log('\n✅ Test complete')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testFetch()

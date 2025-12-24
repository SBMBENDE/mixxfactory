/**
 * Test the new simplified query approach
 */

const mongoose = require('mongoose')

const professionalSchema = new mongoose.Schema({}, { strict: false })
const Professional = mongoose.model('Professional', professionalSchema)

async function testNewQuery() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable not set')
      process.exit(1)
    }

    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB\n')

    console.log('🔍 Testing NEW simplified query approach...\n')

    // NEW APPROACH: Get active professionals, sort by featured
    console.log('Query: Find all active, sort by featured, get 8 results')
    const queryStart = Date.now()

    let professionals = await Professional.find({ active: true })
      .select(
        'name slug images gallery rating reviewCount category createdAt featured active'
      )
      .sort({ featured: -1, rating: -1, createdAt: -1 })
      .limit(8)
      .lean()
      .exec()

    const queryTime = Date.now() - queryStart
    console.log(`  ⏱️  Query took: ${queryTime}ms`)
    console.log(`  📊 Results: ${professionals.length} professionals\n`)

    // Filter featured in-memory
    let featuredOnes = professionals.filter((p) => p.featured === true)
    console.log(`  ⭐ Featured professionals: ${featuredOnes.length}`)

    if (featuredOnes.length > 0) {
      console.log('  ✅ Using featured professionals:')
      featuredOnes.slice(0, 4).forEach((p, i) => {
        console.log(
          `    ${i + 1}. ${p.name} (rating: ${p.rating}, featured: ${
            p.featured
          })`
        )
      })
    } else {
      console.log('  ℹ️  No featured professionals, using top-rated:')
      professionals.slice(0, 4).forEach((p, i) => {
        console.log(
          `    ${i + 1}. ${p.name} (rating: ${p.rating}, featured: ${
            p.featured
          })`
        )
      })
    }

    await mongoose.disconnect()
    console.log('\n✅ Test complete')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testNewQuery()

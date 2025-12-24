/**
 * Rebuild database indexes for optimal performance
 */

const mongoose = require('mongoose')

async function rebuildIndexes() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable not set')
      process.exit(1)
    }

    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    const Professional = db.collection('professionals')

    console.log('🔍 Current indexes on professionals collection:')
    const currentIndexes = await Professional.indexes()
    currentIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}:`, idx.key)
    })

    console.log('\n🔨 Dropping old indexes (except _id_)...')
    for (const idx of currentIndexes) {
      if (idx.name !== '_id_') {
        try {
          await Professional.dropIndex(idx.name)
          console.log(`  ✅ Dropped ${idx.name}`)
        } catch (error) {
          console.log(`  ⚠️  Could not drop ${idx.name}`)
        }
      }
    }

    console.log('\n✨ Creating optimized indexes...')

    // Index for featured professionals query
    await Professional.createIndex(
      { active: 1, featured: -1, createdAt: -1 },
      { name: 'active_featured_created_idx' }
    )
    console.log('  ✅ Created index: active_featured_created_idx')

    // Index for category filtering
    await Professional.createIndex(
      { category: 1, active: 1 },
      { name: 'category_active_idx' }
    )
    console.log('  ✅ Created index: category_active_idx')

    // Index for slug (unique)
    await Professional.createIndex(
      { slug: 1 },
      { name: 'slug_idx', unique: true }
    )
    console.log('  ✅ Created index: slug_idx')

    // Index for name
    await Professional.createIndex({ name: 1 }, { name: 'name_idx' })
    console.log('  ✅ Created index: name_idx')

    // Text index for search
    await Professional.createIndex(
      { name: 'text', description: 'text' },
      { name: 'search_idx', weights: { name: 10, description: 5 } }
    )
    console.log('  ✅ Created index: search_idx')

    // Index for userId
    await Professional.createIndex({ userId: 1 }, { name: 'userId_idx' })
    console.log('  ✅ Created index: userId_idx')

    // Index for verified
    await Professional.createIndex({ verified: 1 }, { name: 'verified_idx' })
    console.log('  ✅ Created index: verified_idx')

    console.log('\n🔍 New indexes:')
    const newIndexes = await Professional.indexes()
    newIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}:`, idx.key)
    })

    console.log('\n✅ Index rebuild complete!')
    console.log('\n🧪 Testing query performance...')

    const queryStart = Date.now()
    const results = await Professional.find({ active: true, featured: true })
      .sort({ featured: -1, createdAt: -1 })
      .limit(4)
      .toArray()
    const queryTime = Date.now() - queryStart

    console.log(`  Query returned ${results.length} results in ${queryTime}ms`)

    if (queryTime > 1000) {
      console.log('  ⚠️  Query is still slow! Consider:')
      console.log('     - Upgrading MongoDB Atlas tier')
      console.log('     - Checking network latency')
      console.log('     - Reviewing collection size')
    } else {
      console.log('  ✅ Query performance looks good!')
    }

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

rebuildIndexes()

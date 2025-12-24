/**
 * Force index rebuild and verify usage
 */

const mongoose = require('mongoose')

async function fixIndexes() {
  try {
    const mongoUri = process.env.MONGODB_URI
    await mongoose.connect(mongoUri)
    console.log('✅ Connected\n')

    const db = mongoose.connection.db
    const Professional = db.collection('professionals')

    // Drop ALL indexes (including broken ones)
    console.log('🗑️  Dropping all indexes...')
    await Professional.dropIndexes()
    console.log('✅ All indexes dropped\n')

    // Create ONLY the essential index for our query
    console.log('✨ Creating optimized index...')
    await Professional.createIndex(
      { active: 1 },
      { name: 'active_1_simple', background: false }
    )
    console.log('✅ Created simple active index\n')

    // Test the query with hint to force index usage
    console.log('🧪 Testing query WITH index hint...')
    const start = Date.now()
    const results = await Professional.find({ active: true })
      .hint('active_1_simple') // Force use of this index
      .limit(8)
      .toArray()
    const time = Date.now() - start

    console.log(`  Results: ${results.length}`)
    console.log(`  Time: ${time}ms`)

    if (time < 1000) {
      console.log('  ✅ Query is fast!')
    } else {
      console.log('  ⚠️  Still slow - may be network latency')
    }

    // Verify with explain
    console.log('\n🔍 Verifying index usage...')
    const explain = await Professional.find({ active: true })
      .hint('active_1_simple')
      .limit(8)
      .explain('executionStats')

    console.log(`  Stage: ${explain.executionStats.executionStages.stage}`)
    console.log(
      `  Index: ${explain.executionStats.executionStages.indexName || 'NONE'}`
    )
    console.log(`  Docs examined: ${explain.executionStats.totalDocsExamined}`)
    console.log(
      `  Server execution time: ${explain.executionStats.executionTimeMillis}ms`
    )

    await mongoose.disconnect()
    console.log('\n✅ Done')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixIndexes()

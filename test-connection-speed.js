/**
 * Test MongoDB connection speed and network latency
 */

const mongoose = require('mongoose')

async function testConnectionSpeed() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set')
      process.exit(1)
    }

    console.log('🔌 Testing MongoDB connection speed...\n')

    // Test 1: Connection time
    const connectStart = Date.now()
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
    })
    const connectTime = Date.now() - connectStart
    console.log(`✅ Connection established in ${connectTime}ms`)

    const db = mongoose.connection.db
    const Professional = db.collection('professionals')

    // Test 2: Simple count query
    console.log('\n📊 Test 2: Simple count query')
    const countStart = Date.now()
    const count = await Professional.countDocuments()
    const countTime = Date.now() - countStart
    console.log(`  Total documents: ${count}`)
    console.log(`  Time: ${countTime}ms`)

    // Test 3: Simple findOne
    console.log('\n📊 Test 3: Simple findOne')
    const findOneStart = Date.now()
    const one = await Professional.findOne({})
    const findOneTime = Date.now() - findOneStart
    console.log(`  Found: ${one ? one.name : 'none'}`)
    console.log(`  Time: ${findOneTime}ms`)

    // Test 4: Find with filter (no index)
    console.log('\n📊 Test 4: Find with active filter')
    const filterStart = Date.now()
    const activeCount = await Professional.countDocuments({ active: true })
    const filterTime = Date.now() - filterStart
    console.log(`  Active documents: ${activeCount}`)
    console.log(`  Time: ${filterTime}ms`)

    // Test 5: The actual query we use
    console.log('\n📊 Test 5: Actual homepage query (active=true, limit=8)')
    const actualStart = Date.now()
    const results = await Professional.find({ active: true }).limit(8).toArray()
    const actualTime = Date.now() - actualStart
    console.log(`  Results: ${results.length} documents`)
    console.log(`  Time: ${actualTime}ms`)

    // Test 6: Check if indexes are being used
    console.log('\n📊 Test 6: Explain query to check index usage')
    const explainStart = Date.now()
    const explanation = await Professional.find({ active: true })
      .limit(8)
      .explain('executionStats')
    const explainTime = Date.now() - explainStart

    console.log(`  Execution time: ${explainTime}ms`)
    console.log(
      `  Total docs examined: ${explanation.executionStats.totalDocsExamined}`
    )
    console.log(
      `  Total keys examined: ${explanation.executionStats.totalKeysExamined}`
    )
    console.log(
      `  Execution time (server): ${explanation.executionStats.executionTimeMillis}ms`
    )
    console.log(
      `  Index used: ${
        explanation.executionStats.executionStages.inputStage?.indexName ||
        'COLLSCAN (NO INDEX!)'
      }`
    )

    // Diagnosis
    console.log('\n🔍 DIAGNOSIS:')
    if (connectTime > 5000) {
      console.log('  ⚠️  Slow connection (>5s) - possible network issues')
    }
    if (actualTime > 5000) {
      console.log('  ⚠️  Query is slow (>5s)')
      if (explanation.executionStats.executionStages.stage === 'COLLSCAN') {
        console.log('  ❌ PROBLEM: Collection scan (no index used)!')
        console.log('  💡 FIX: Indexes may have been dropped or corrupted')
      }
    }
    if (actualTime < 1000) {
      console.log('  ✅ Query performance is good')
    }

    await mongoose.disconnect()
    console.log('\n✅ Test complete')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testConnectionSpeed()

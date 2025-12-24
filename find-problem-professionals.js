/**
 * Find problematic professional documents
 */

const mongoose = require('mongoose')

async function findProblems() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set')
      process.exit(1)
    }

    console.log('🔍 Analyzing professionals collection...\n')

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
    })
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    const Professional = db.collection('professionals')

    // Test 1: Count documents
    console.log('📊 Test 1: Count documents')
    const count = await Professional.countDocuments()
    console.log(`   Total: ${count} professionals\n`)

    // Test 2: Get all document IDs only (fast)
    console.log('📊 Test 2: Fetch all IDs (fast query)')
    const ids = await Professional.find({}, { projection: { _id: 1, name: 1 } })
      .limit(20)
      .toArray()
    console.log(`   Found ${ids.length} documents:`)
    ids.forEach((doc, i) => {
      console.log(`   ${i + 1}. ${doc._id} - ${doc.name || 'NO NAME'}`)
    })
    console.log()

    // Test 3: Fetch each document individually to find problematic ones
    console.log('📊 Test 3: Check each document individually...')
    for (const id of ids) {
      try {
        const start = Date.now()
        const doc = await Professional.findOne({ _id: id._id })
        const time = Date.now() - start

        if (time > 1000) {
          console.log(`   ⚠️  SLOW: ${id.name} (${id._id}) took ${time}ms`)
        } else {
          console.log(`   ✅ OK: ${id.name} (${time}ms)`)
        }

        // Check for problematic fields
        if (doc) {
          const docSize = JSON.stringify(doc).length
          if (docSize > 100000) {
            // 100KB
            console.log(
              `      ⚠️  Large document: ${Math.round(docSize / 1024)}KB`
            )
          }

          // Check for problematic arrays
          if (doc.images && doc.images.length > 50) {
            console.log(`      ⚠️  Too many images: ${doc.images.length}`)
          }
          if (doc.gallery && doc.gallery.length > 100) {
            console.log(
              `      ⚠️  Too many gallery items: ${doc.gallery.length}`
            )
          }
          if (doc.media && doc.media.length > 50) {
            console.log(`      ⚠️  Too many media items: ${doc.media.length}`)
          }
        }
      } catch (err) {
        console.log(`   ❌ ERROR: ${id.name} (${id._id})`)
        console.log(`      Error: ${err.message}`)
      }
    }
    console.log()

    // Test 4: Check indexes
    console.log('📊 Test 4: Check indexes')
    const indexes = await Professional.indexes()
    console.log(`   Total indexes: ${indexes.length}`)
    indexes.forEach((idx) => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`)
    })
    console.log()

    // Test 5: Try the actual query used by the API
    console.log('📊 Test 5: Test API query (featured + active)')
    const apiStart = Date.now()
    const apiQuery = await Professional.find({ featured: true, active: true })
      .limit(4)
      .toArray()
    const apiTime = Date.now() - apiStart
    console.log(`   Query time: ${apiTime}ms`)
    console.log(`   Results: ${apiQuery.length} professionals`)
    if (apiTime > 5000) {
      console.log('   ⚠️  Query is too slow! This is the problem.')
    }
    console.log()

    // Test 6: Try query with explain
    console.log('📊 Test 6: Explain query plan')
    const explain = await Professional.find({ featured: true, active: true })
      .limit(4)
      .explain('executionStats')
    console.log(
      `   Execution time: ${explain.executionStats.executionTimeMillis}ms`
    )
    console.log(`   Docs examined: ${explain.executionStats.totalDocsExamined}`)
    console.log(`   Keys examined: ${explain.executionStats.totalKeysExamined}`)
    console.log(
      `   Using index: ${
        explain.executionStats.executionStages.inputStage?.indexName ||
        'COLLSCAN'
      }`
    )

    if (explain.executionStats.executionStages.stage === 'COLLSCAN') {
      console.log('   ❌ PROBLEM: Using collection scan (no index)!')
      console.log('   💡 FIX: Rebuild indexes')
    }

    await mongoose.disconnect()
    console.log('\n✅ Analysis complete')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

findProblems()

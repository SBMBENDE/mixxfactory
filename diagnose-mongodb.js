/**
 * Diagnose MongoDB Atlas connection issues
 */

const mongoose = require('mongoose')

async function diagnose() {
  console.log('🔍 MongoDB Atlas Connection Diagnostics\n')

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable not set')
    process.exit(1)
  }

  // Parse connection string (safely)
  const uriParts = mongoUri.match(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/
  )
  if (uriParts) {
    console.log('📋 Connection String Analysis:')
    console.log(`   Username: ${uriParts[1]}`)
    console.log(`   Cluster: ${uriParts[3]}`)
    console.log(`   Database: ${uriParts[4]}`)
    console.log(`   Options: ${uriParts[5] || 'none'}\n`)
  }

  console.log('🔌 Attempting connection with different timeout settings...\n')

  // Test 1: Very long timeout
  console.log('Test 1: Long timeout (120s)')
  const startTime1 = Date.now()
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 120000,
      connectTimeoutMS: 120000,
      socketTimeoutMS: 120000,
    })
    const time1 = Date.now() - startTime1
    console.log(`✅ Connected successfully in ${time1}ms\n`)

    // Check cluster info
    const admin = mongoose.connection.db.admin()
    const serverStatus = await admin.serverStatus()
    console.log('📊 Cluster Info:')
    console.log(`   Host: ${serverStatus.host}`)
    console.log(`   Version: ${serverStatus.version}`)
    console.log(`   Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes\n`)

    // Test a simple query
    console.log('🧪 Testing simple query...')
    const queryStart = Date.now()
    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()
    const queryTime = Date.now() - queryStart
    console.log(`✅ Query completed in ${queryTime}ms`)
    console.log(
      `   Collections found: ${collections.map((c) => c.name).join(', ')}\n`
    )

    await mongoose.disconnect()
    console.log('✅ All tests passed! MongoDB Atlas is working correctly.')
    console.log(
      '\n💡 Recommendation: The issue might be with Vercel deployment.'
    )
    console.log('   Check: MongoDB Atlas Network Access settings')
    console.log(
      '   Action: Add "0.0.0.0/0" to IP whitelist (allow from anywhere)'
    )
  } catch (error) {
    const time1 = Date.now() - startTime1
    console.error(`❌ Connection failed after ${time1}ms`)
    console.error(`   Error: ${error.message}\n`)

    if (error.message.includes('timed out')) {
      console.log('🔍 Diagnosis: CONNECTION TIMEOUT')
      console.log('\nPossible causes:')
      console.log(
        '1. ⚠️  MongoDB Atlas cluster is paused (free tier auto-pauses)'
      )
      console.log(
        '2. ⚠️  IP address not whitelisted in MongoDB Atlas Network Access'
      )
      console.log('3. ⚠️  Firewall blocking outbound connections to MongoDB')
      console.log('4. ⚠️  Network connectivity issues')

      console.log('\n📝 Action Items:')
      console.log('1. Log into MongoDB Atlas (https://cloud.mongodb.com)')
      console.log('2. Check if cluster is paused - Resume it if needed')
      console.log(
        '3. Go to Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)'
      )
      console.log(
        '4. Check Database Access → Ensure user has read/write permissions'
      )
    } else if (error.message.includes('authentication')) {
      console.log('🔍 Diagnosis: AUTHENTICATION FAILED')
      console.log('\n📝 Action Items:')
      console.log('1. Check username and password in MONGODB_URI')
      console.log('2. Verify user exists in Database Access section')
      console.log('3. Ensure user has correct permissions for database')
    } else {
      console.log('🔍 Diagnosis: UNKNOWN ERROR')
      console.log(`   Full error: ${error.stack}`)
    }

    process.exit(1)
  }
}

diagnose()

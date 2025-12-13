#!/usr/bin/env node
/**
 * Test API endpoints to diagnose production data sync issues
 */

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

async function testAPIEndpoints() {
  const mongoUri = process.env.MONGODB_URI
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  console.log('🔍 Testing API Endpoints & Database Connection\n')
  console.log(`📍 MongoDB URI: ${mongoUri ? '✓ Set' : '✗ Missing'}`)
  console.log(`📍 App URL: ${appUrl || 'Not set (using localhost:3000)'}\n`)

  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    console.log('✅ MongoDB connection successful\n')

    const db = client.db('mixxfactory')

    // Test 1: Get professionals
    console.log('📋 Test 1: Fetching professionals...')
    const professionals = await db
      .collection('professionals')
      .find({})
      .project({
        _id: 1,
        name: 1,
        slug: 1,
        category: 1,
        images: { $size: '$images' },
      })
      .toArray()

    console.log(`   Found: ${professionals.length} professionals`)
    professionals.forEach((p) => {
      console.log(`   - ${p.name} (${p.images} images)`)
    })

    // Test 2: Get a professional with full details
    if (professionals.length > 0) {
      console.log(
        `\n📋 Test 2: Fetching full professional details for "${professionals[0].name}"...`
      )
      const fullProf = await db
        .collection('professionals')
        .findOne({ _id: professionals[0]._id })
      console.log(`   Name: ${fullProf.name}`)
      console.log(`   Category: ${fullProf.category}`)
      console.log(`   Images: ${fullProf.images?.length || 0}`)
      if (fullProf.images && fullProf.images.length > 0) {
        console.log(
          `   First image URL (first 80 chars): ${fullProf.images[0].substring(
            0,
            80
          )}...`
        )
      }
    }

    // Test 3: Check categories
    console.log(`\n📋 Test 3: Fetching categories...`)
    const categories = await db
      .collection('categories')
      .find({})
      .limit(5)
      .toArray()
    console.log(`   Found: ${categories.length} categories (showing first 5)`)
    categories.forEach((c) => {
      console.log(`   - ${c.name} (slug: ${c.slug})`)
    })

    // Test 4: Check reviews
    console.log(`\n📋 Test 4: Fetching reviews...`)
    const reviews = await db.collection('reviews').find({}).limit(5).toArray()
    console.log(`   Found: ${reviews.length} reviews (showing first 5)`)
    reviews.forEach((r) => {
      console.log(`   - "${r.comment}" (${r.rating}★)`)
    })

    console.log('\n✅ All database tests passed!')
    console.log('\n🔍 Next steps for troubleshooting Vercel:')
    console.log('1. Go to https://vercel.com/dashboard and select your project')
    console.log('2. Click Settings > Environment Variables')
    console.log('3. Verify these variables are set:')
    console.log('   - MONGODB_URI (should be same as .env.local)')
    console.log('   - JWT_SECRET')
    console.log('   - NEXT_PUBLIC_APP_URL')
    console.log('4. If variables are correct, redeploy: git push')
    console.log(
      '5. Check function logs: https://vercel.com/dashboard/project/mixxfactory/logs'
    )
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.close()
  }
}

testAPIEndpoints()

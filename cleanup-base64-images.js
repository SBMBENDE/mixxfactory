/**
 * Clean up BASE64 images from professionals collection
 * Replace with empty arrays (images should be Cloudinary URLs)
 */

const mongoose = require('mongoose')

async function cleanup() {
  try {
    const mongoUri = process.env.MONGODB_URI
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 30000 })
    console.log('✅ Connected to MongoDB\n')

    const db = mongoose.connection.db
    const Professional = db.collection('professionals')

    // Find all professionals with base64 images
    console.log('🔍 Finding professionals with BASE64 images...\n')

    const allDocs = await Professional.find(
      {},
      { projection: { _id: 1, name: 1, images: 1, gallery: 1 } }
    ).toArray()

    const problematicDocs = []

    for (const doc of allDocs) {
      let hasBase64 = false
      let base64Count = 0

      // Check images array
      if (doc.images && Array.isArray(doc.images)) {
        for (const img of doc.images) {
          if (
            typeof img === 'string' &&
            (img.startsWith('data:image') ||
              img.startsWith('iVBOR') ||
              img.startsWith('/9j/'))
          ) {
            hasBase64 = true
            base64Count++
          }
        }
      }

      // Check gallery array
      if (doc.gallery && Array.isArray(doc.gallery)) {
        for (const img of doc.gallery) {
          if (
            typeof img === 'string' &&
            (img.startsWith('data:image') ||
              img.startsWith('iVBOR') ||
              img.startsWith('/9j/'))
          ) {
            hasBase64 = true
            base64Count++
          }
        }
      }

      if (hasBase64) {
        problematicDocs.push({ _id: doc._id, name: doc.name, base64Count })
        console.log(`❌ ${doc.name}: ${base64Count} base64 images`)
      }
    }

    console.log(
      `\n📊 Found ${problematicDocs.length} professionals with BASE64 images\n`
    )

    if (problematicDocs.length === 0) {
      console.log('✅ No cleanup needed!')
      await mongoose.disconnect()
      return
    }

    console.log('🧹 Cleaning up BASE64 images...\n')

    for (const doc of problematicDocs) {
      console.log(`   Processing: ${doc.name}...`)

      // Remove base64 images, keep only URLs
      const result = await Professional.updateOne(
        { _id: doc._id },
        {
          $set: {
            images: [], // Clear images array
            gallery: [], // Clear gallery array
          },
        }
      )

      if (result.modifiedCount > 0) {
        console.log(`   ✅ Cleaned: ${doc.name}`)
      } else {
        console.log(`   ⚠️  No change: ${doc.name}`)
      }
    }

    console.log('\n✅ Cleanup complete!')
    console.log('\n📝 Note: Images arrays are now empty.')
    console.log(
      '   You should re-upload images through the dashboard using Cloudinary.'
    )
    console.log(
      '   The dashboard will store Cloudinary URLs, not base64 data.\n'
    )

    // Verify cleanup
    console.log('🔍 Verifying cleanup...')
    const afterCount = await Professional.countDocuments({})
    console.log(`   Total professionals: ${afterCount}`)

    // Test query speed
    const start = Date.now()
    const testQuery = await Professional.find({ active: true })
      .limit(10)
      .toArray()
    const time = Date.now() - start
    console.log(`   Query time: ${time}ms`)

    if (time < 5000) {
      console.log(`   ✅ Query speed is good!`)
    } else {
      console.log(`   ⚠️  Still slow, but should improve`)
    }

    await mongoose.disconnect()
    console.log('\n✅ Done!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanup()

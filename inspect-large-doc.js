/**
 * Inspect large document fields
 */

const mongoose = require('mongoose')

async function inspectLargeDoc() {
  try {
    const mongoUri = process.env.MONGODB_URI
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 30000 })

    const db = mongoose.connection.db
    const Professional = db.collection('professionals')

    console.log('🔍 Inspecting Eleanor (largest document)...\n')

    const doc = await Professional.findOne({ name: 'Eleanor' })

    if (doc) {
      console.log('📊 Field sizes:')
      console.log(`   images: ${doc.images?.length || 0} items`)
      console.log(`   gallery: ${doc.gallery?.length || 0} items`)
      console.log(`   media: ${doc.media?.length || 0} items`)

      if (doc.images && doc.images.length > 0) {
        const firstImage = doc.images[0]
        console.log(`\n   First image preview (first 200 chars):`)
        console.log(`   ${firstImage.substring(0, 200)}...`)
        console.log(`   Length: ${firstImage.length} characters`)

        if (
          firstImage.startsWith('data:image') ||
          firstImage.startsWith('iVBOR') ||
          firstImage.startsWith('/9j/')
        ) {
          console.log(`   ❌ PROBLEM: This is BASE64 encoded image data!`)
          console.log(`   💡 FIX: Images should be URLs, not base64 data`)
        }
      }

      if (doc.gallery && doc.gallery.length > 0) {
        const firstGallery = doc.gallery[0]
        console.log(`\n   First gallery item preview (first 200 chars):`)
        console.log(`   ${firstGallery.substring(0, 200)}...`)
        console.log(`   Length: ${firstGallery.length} characters`)

        if (
          firstGallery.startsWith('data:image') ||
          firstGallery.startsWith('iVBOR') ||
          firstGallery.startsWith('/9j/')
        ) {
          console.log(
            `   ❌ PROBLEM: Gallery contains BASE64 encoded image data!`
          )
        }
      }
    }

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

inspectLargeDoc()

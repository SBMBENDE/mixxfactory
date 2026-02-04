// Cleanup script: Remove any Base64 images from professionals.images arrays
// Usage: node scripts/cleanup-base64-images.js

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const professionalSchema = new mongoose.Schema(
  {},
  { strict: false, collection: 'professionals' },
)
const Professional = mongoose.model('Professional', professionalSchema)

async function cleanup() {
  // Find all professionals (not just those with Base64 in images)
  const professionals = await Professional.find({})
  let cleanedCount = 0
  for (const prof of professionals) {
    let changed = false
    // Helper to clean an array field
    const cleanArray = (arr) =>
      Array.isArray(arr)
        ? arr.filter((img) =>
            typeof img === 'string' ? !img.startsWith('data:image/') : true,
          )
        : arr

    // Clean images
    const origImagesLen = prof.images?.length || 0
    prof.images = cleanArray(prof.images)
    if (prof.images?.length !== origImagesLen) changed = true

    // Clean gallery
    const origGalleryLen = prof.gallery?.length || 0
    prof.gallery = cleanArray(prof.gallery)
    if (prof.gallery?.length !== origGalleryLen) changed = true

    // Clean media
    const origMediaLen = prof.media?.length || 0
    prof.media = cleanArray(prof.media)
    if (prof.media?.length !== origMediaLen) changed = true

    // Clean verificationDocuments
    const origVerifLen = prof.verificationDocuments?.length || 0
    prof.verificationDocuments = cleanArray(prof.verificationDocuments)
    if (prof.verificationDocuments?.length !== origVerifLen) changed = true

    if (changed) {
      await prof.save()
      cleanedCount++
      console.log(
        `Cleaned Base64 images for professional: ${prof.name || prof._id}`,
      )
    }
  }
  console.log(`Cleanup complete. Cleaned ${cleanedCount} professionals.`)
  mongoose.disconnect()
}

cleanup().catch((err) => {
  console.error('Cleanup failed:', err)
  mongoose.disconnect()
})

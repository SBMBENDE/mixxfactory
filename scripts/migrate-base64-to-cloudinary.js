// Migrate Base64 images in Professional documents to Cloudinary URLs
// Usage: node migrate-base64-to-cloudinary.js

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const { v2: cloudinary } = require('cloudinary')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

async function uploadBase64ToCloudinary(base64) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64,
      { folder: 'professionals' },
      (err, result) => {
        if (err) return reject(err)
        resolve(result.secure_url)
      },
    )
  })
}

async function migrate() {
  // Find all professionals (not just those with Base64 in images)
  const professionals = await Professional.find({})
  console.log(
    `Found ${professionals.length} professionals to check for Base64 images in all arrays.`,
  )

  for (const prof of professionals) {
    let updated = false

    // Helper to migrate an array field
    const migrateArray = async (arr, profId, field) => {
      if (!Array.isArray(arr)) return arr
      return await Promise.all(
        arr.map(async (img, idx) => {
          if (typeof img === 'string' && img.startsWith('data:image/')) {
            try {
              const url = await uploadBase64ToCloudinary(img)
              updated = true
              console.log(`Uploaded ${field}[${idx}] for ${profId}`)
              return url
            } catch (err) {
              console.error(
                `Failed to upload ${field}[${idx}] for ${profId}:`,
                err,
              )
              return img // fallback to original
            }
          }
          return img
        }),
      )
    }

    // Migrate images
    prof.images = await migrateArray(prof.images, prof._id, 'images')
    // Migrate gallery
    prof.gallery = await migrateArray(prof.gallery, prof._id, 'gallery')
    // Migrate media
    prof.media = await migrateArray(prof.media, prof._id, 'media')
    // Migrate verificationDocuments
    prof.verificationDocuments = await migrateArray(
      prof.verificationDocuments,
      prof._id,
      'verificationDocuments',
    )

    if (updated) {
      await prof.save()
      console.log(`Updated professional ${prof._id}`)
    }
  }
  console.log('Migration complete.')
  mongoose.disconnect()
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  mongoose.disconnect()
})

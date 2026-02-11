/**
 * Cleanup script: Remove base64 images from sam.mbende2@gmail.com profile
 * Keep only the Cloudinary URL (first image)
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const cleanup = async () => {
  try {
    console.log('\n🔧 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected\n')

    const Professional = mongoose.model(
      'Professional',
      new mongoose.Schema({}, { strict: false }),
      'professionals',
    )
    const User = mongoose.model(
      'User',
      new mongoose.Schema({}, { strict: false }),
      'users',
    )

    // Find user
    const user = await User.findOne({ email: 'sam.mbende2@gmail.com' })
    if (!user) {
      console.log('❌ User not found')
      process.exit(0)
    }

    console.log('📋 User found:', user._id)

    // Find professional profile
    const professional = await Professional.findOne({ userId: user._id })
    if (!professional) {
      console.log('❌ Professional profile not found')
      process.exit(0)
    }

    console.log('📋 Professional found:', professional._id)
    console.log('📋 Name:', professional.name)
    console.log('📋 Current images count:', professional.images?.length || 0)

    if (!professional.images || professional.images.length === 0) {
      console.log('✅ No images to clean')
      process.exit(0)
    }

    // Check image types
    console.log('\n📸 Current images:')
    professional.images.forEach((img, index) => {
      const isBase64 = img.startsWith('data:')
      const isCloudinary = img.includes('cloudinary')
      const size = img.length
      console.log(
        `  [${index + 1}] ${isBase64 ? '🔴 BASE64' : isCloudinary ? '✅ CLOUDINARY' : '❓ OTHER'} (${size} chars)`,
      )
      if (!isBase64) {
        console.log(`      ${img.substring(0, 80)}...`)
      }
    })

    // Keep only Cloudinary URLs
    const cloudinaryImages = professional.images.filter(
      (img) => !img.startsWith('data:'),
    )

    console.log(
      `\n🔄 Keeping ${cloudinaryImages.length} Cloudinary URLs, removing ${professional.images.length - cloudinaryImages.length} base64 images`,
    )

    // Update the professional
    await Professional.updateOne(
      { _id: professional._id },
      { $set: { images: cloudinaryImages } },
    )

    console.log('\n✅ Cleanup complete!')
    console.log('📸 Final images:')
    cloudinaryImages.forEach((img, index) => {
      console.log(`  [${index + 1}] ${img}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanup()

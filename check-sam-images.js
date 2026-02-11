require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const professionalSchema = new mongoose.Schema({}, { strict: false })
const Professional = mongoose.model(
  'Professional',
  professionalSchema,
  'professionals',
)

async function checkImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const sam = await Professional.findOne({ email: 'sam.mbende2@gmail.com' })

    if (!sam) {
      console.log('No professional found for sam.mbende2@gmail.com')
      return
    }

    console.log('\n=== Professional Found ===')
    console.log('Name:', sam.name)
    console.log('Email:', sam.email)
    console.log('Images count:', sam.images?.length || 0)

    if (sam.images && sam.images.length > 0) {
      console.log('\n=== Image Analysis ===')
      sam.images.forEach((img, index) => {
        const first100 = img.substring(0, 100)
        const isBase64 = img.startsWith('data:image/')
        const isCloudinary = img.startsWith('https://res.cloudinary.com/')
        const size = Buffer.byteLength(img, 'utf8')

        console.log(`\nImage ${index + 1}:`)
        console.log(
          '  Type:',
          isBase64 ? 'BASE64' : isCloudinary ? 'CLOUDINARY URL' : 'UNKNOWN',
        )
        console.log('  Size:', (size / 1024).toFixed(2), 'KB')
        console.log('  Preview:', first100 + '...')
      })
    }

    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

checkImages()

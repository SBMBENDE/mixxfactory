// Verification script: Check for any remaining Base64 images in professionals collection
// Usage: node scripts/verify-no-base64-images.js

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

async function verify() {
  const query = {
    $or: [
      { images: { $elemMatch: { $regex: /^data:image\// } } },
      { gallery: { $elemMatch: { $regex: /^data:image\// } } },
      { media: { $elemMatch: { $regex: /^data:image\// } } },
      { verificationDocuments: { $elemMatch: { $regex: /^data:image\// } } },
    ],
  }
  const professionals = await Professional.find(query)
  if (professionals.length === 0) {
    console.log('✅ No Base64 images found in any professional document.')
  } else {
    console.log(
      `❌ Found ${professionals.length} professionals with Base64 images:`,
    )
    professionals.forEach((prof) => {
      console.log(`- ${prof.name || prof._id}`)
    })
  }
  mongoose.disconnect()
}

verify().catch((err) => {
  console.error('Verification failed:', err)
  mongoose.disconnect()
})

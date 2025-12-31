// Script to remove base64 images from all professionals in the database
// Usage: node scripts/remove-base64-images.js

const mongoose = require('mongoose')
const { Professional } = require('../lib/db/models')
require('dotenv').config({ path: '.env.local' })

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const professionals = await Professional.find({
    images: { $exists: true, $ne: [] },
  })
  let totalRemoved = 0
  let affected = 0
  let updatedCount = 0

  for (const pro of professionals) {
    let removedImages = 0
    let beforeImages = Array.isArray(pro.images) ? pro.images.length : 0

    if (Array.isArray(pro.images)) {
      const filtered = pro.images.filter((img) => !isBase64Image(img))
      removedImages = beforeImages - filtered.length
      if (removedImages > 0) {
        pro.images = filtered
        updatedCount++
        console.log(
          `Cleaned ${removedImages} base64 images for: ${pro.name || ''}`
        )
      }
    }
  }

  console.log(`Total professionals affected: ${affected}`)
  console.log(`Total base64 images removed: ${totalRemoved}`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

function isBase64Image(str) {
  return typeof str === 'string' && /^data:image\/[a-zA-Z]+;base64,/.test(str)
}

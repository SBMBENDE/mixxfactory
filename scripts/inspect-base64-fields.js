// Script to print all fields containing Base64 data for professionals with Base64 images
// Usage: node scripts/inspect-base64-fields.js

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

// Recursively search for Base64 image strings in any field
function findBase64Fields(obj, path = '') {
  let results = []
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      results = results.concat(findBase64Fields(item, `${path}[${idx}]`))
    })
  } else if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      results = results.concat(
        findBase64Fields(value, path ? `${path}.${key}` : key),
      )
    })
  } else if (typeof obj === 'string' && obj.startsWith('data:image/')) {
    results.push(path)
  }
  return results
}

async function inspect() {
  // Find professionals with Base64 images in any main array
  const query = {
    $or: [
      { images: { $elemMatch: { $regex: /^data:image\// } } },
      { gallery: { $elemMatch: { $regex: /^data:image\// } } },
      { media: { $elemMatch: { $regex: /^data:image\// } } },
      { verificationDocuments: { $elemMatch: { $regex: /^data:image\// } } },
    ],
  }
  const professionals = await Professional.find(query)
  for (const prof of professionals) {
    const fields = findBase64Fields(prof.toObject())
    console.log(`\nProfessional: ${prof.name || prof._id}`)
    if (fields.length === 0) {
      console.log('  No Base64 fields found (unexpected).')
    } else {
      console.log('  Base64 fields:')
      fields.forEach((f) => console.log('   -', f))
    }
  }
  mongoose.disconnect()
}

inspect().catch((err) => {
  console.error('Inspection failed:', err)
  mongoose.disconnect()
})

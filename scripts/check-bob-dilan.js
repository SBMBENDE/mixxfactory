// Script to check for any professional named "Bob dilan" in the database
// Usage: node scripts/check-bob-dilan.js

const mongoose = require('mongoose')
const MONGODB_URI =
  process.env.MONGODB_URI ||
  (require('dotenv').config({ path: '.env.local' }) && process.env.MONGODB_URI)

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI')
  process.exit(1)
}

const Professional = require('../lib/db/models/Professional')

async function checkBobDilan() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const results = await Professional.find({ name: /bob dilan/i })
  if (results.length === 0) {
    console.log('No professionals named "Bob dilan" found.')
  } else {
    console.log(`Found ${results.length} professional(s) named "Bob dilan":`)
    results.forEach((prof) => {
      console.log({
        _id: prof._id,
        name: prof.name,
        slug: prof.slug,
        active: prof.active,
        featured: prof.featured,
        createdAt: prof.createdAt,
      })
    })
  }
  await mongoose.disconnect()
}

checkBobDilan().catch((err) => {
  console.error(err)
  process.exit(1)
})

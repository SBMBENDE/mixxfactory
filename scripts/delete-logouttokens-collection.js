// scripts/delete-logouttokens-collection.js
// Script to delete all documents from the 'logouttokens' collection in MongoDB
// Usage: node scripts/delete-logouttokens-collection.js

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env.local')
  process.exit(1)
}

async function main() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const db = mongoose.connection

  try {
    const result = await db.collection('logouttokens').deleteMany({})
    console.log(
      `Deleted ${result.deletedCount} documents from logouttokens collection.`
    )
  } catch (err) {
    console.error('Error deleting logouttokens:', err)
  } finally {
    await mongoose.disconnect()
  }
}

main()

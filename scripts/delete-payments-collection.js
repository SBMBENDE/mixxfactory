// scripts/delete-payments-collection.js
// Script to delete all documents from the 'payments' collection in MongoDB
// Usage: node scripts/delete-payments-collection.js

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
    const result = await db.collection('payments').deleteMany({})
    console.log(
      `Deleted ${result.deletedCount} documents from payments collection.`
    )
  } catch (err) {
    console.error('Error deleting payments:', err)
  } finally {
    await mongoose.disconnect()
  }
}

main()

// scripts/delete-all-payments.js
// Script to delete all payment documents from the payments collection in MongoDB
// Usage: node scripts/delete-all-payments.js

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
    // Try to infer the collection name
    const collections = await db.db.listCollections().toArray()
    const paymentCollection = collections.find(
      (col) =>
        col.name === 'payments' ||
        col.name === 'payment' ||
        col.name.includes('payment')
    )
    if (!paymentCollection) {
      console.error('No payments collection found.')
      process.exit(1)
    }
    const collectionName = paymentCollection.name
    const result = await db.collection(collectionName).deleteMany({})
    console.log(
      `Deleted ${result.deletedCount} documents from ${collectionName} collection.`
    )
  } catch (err) {
    console.error('Error deleting payments:', err)
  } finally {
    await mongoose.disconnect()
  }
}

main()

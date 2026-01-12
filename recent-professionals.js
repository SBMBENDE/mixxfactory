const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

;(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const Professional = mongoose.model(
      'Professional',
      new mongoose.Schema({}, { strict: false }),
      'professionals'
    )

    // Get all recently updated professionals
    const professionals = await Professional.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean()

    console.log(`Last 10 updated professionals:\n`)
    professionals.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.businessName || 'No business name'}`)
      console.log(`   Tier: ${p.subscriptionTier || 'N/A'}`)
      console.log(`   Payment Status: ${p.paymentStatus || 'N/A'}`)
      console.log(`   Updated: ${p.updatedAt}`)
      console.log(`   Email: ${p.email || 'N/A'}`)
      console.log('')
    })

    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

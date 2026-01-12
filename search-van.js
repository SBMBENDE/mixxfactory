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

    // Search for professionals with "Van" in the name
    const professionals = await Professional.find({
      businessName: { $regex: 'Van', $options: 'i' },
    }).lean()

    console.log(
      `Found ${professionals.length} professionals with "Van" in name:`
    )
    professionals.forEach((p) => {
      console.log('\n---')
      console.log('Business Name:', p.businessName)
      console.log('Subscription Tier:', p.subscriptionTier)
      console.log('Payment Status:', p.paymentStatus)
      console.log('Active:', p.active)
      console.log('Updated At:', p.updatedAt)
    })

    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

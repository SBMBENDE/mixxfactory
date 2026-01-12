const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

;(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check for payment records
    const Payment = mongoose.model(
      'Payment',
      new mongoose.Schema({}, { strict: false }),
      'payments'
    )
    const payments = await Payment.find({
      email: 'kiki@vanmulangoservices.com',
    })
      .sort({ createdAt: -1 })
      .lean()

    console.log(`\nFound ${payments.length} payment(s):\n`)
    payments.forEach((p, idx) => {
      console.log(`Payment ${idx + 1}:`)
      console.log('  Amount:', p.amount)
      console.log('  Status:', p.status)
      console.log('  Tier:', p.tier || p.subscriptionTier)
      console.log('  Transaction ID:', p.transactionId)
      console.log('  Created:', p.createdAt)
      console.log('')
    })

    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

async function checkPayment() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const User = mongoose.model(
      'User',
      new mongoose.Schema({}, { strict: false })
    )
    const Professional = mongoose.model(
      'Professional',
      new mongoose.Schema({}, { strict: false })
    )
    const Payment = mongoose.model(
      'Payment',
      new mongoose.Schema({}, { strict: false })
    )

    // Find the most recent payment
    const recentPayment = await Payment.findOne()
      .sort({ createdAt: -1 })
      .limit(1)
    console.log('\n=== Most Recent Payment ===')
    console.log('Payment ID:', recentPayment?._id)
    console.log('Status:', recentPayment?.status)
    console.log('Tier:', recentPayment?.subscriptionTier)
    console.log('Amount:', recentPayment?.amount, recentPayment?.currency)
    console.log('Created:', recentPayment?.createdAt)

    if (recentPayment?.userId) {
      const user = await User.findById(recentPayment.userId)
      const prof = await Professional.findOne({ userId: recentPayment.userId })

      console.log('\n=== Associated User ===')
      console.log('User ID:', user?._id)
      console.log('Email:', user?.email)
      console.log('Subscription Tier:', user?.subscriptionTier)

      console.log('\n=== Associated Professional ===')
      console.log('Professional ID:', prof?._id)
      console.log('Name:', prof?.name)
      console.log('Subscription Tier:', prof?.subscriptionTier)
    }

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error)
  }
  process.exit(0)
}

checkPayment()

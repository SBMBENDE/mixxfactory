const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

;(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB\n')

    const Professional = mongoose.model(
      'Professional',
      new mongoose.Schema({}, { strict: false }),
      'professionals'
    )
    const User = mongoose.model(
      'User',
      new mongoose.Schema({}, { strict: false }),
      'users'
    )

    // Find the professional
    const professional = await Professional.findOne({
      email: 'kiki@vanmulangoservices.com',
    })

    if (!professional) {
      console.log('Professional not found')
      process.exit(1)
    }

    console.log('Found professional:', professional.email)
    console.log('Current subscription tier:', professional.subscriptionTier)

    // Update Professional record
    professional.subscriptionTier = 'starter'
    professional.paymentStatus = 'paid'
    professional.subscriptionStartDate = new Date()
    professional.subscriptionEndsAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ) // 30 days from now
    await professional.save()

    console.log('\n✓ Updated Professional record to starter plan')

    // Update User record
    if (professional.userId) {
      const user = await User.findById(professional.userId)
      if (user) {
        user.subscriptionTier = 'starter'
        user.paymentStatus = 'paid'
        await user.save()
        console.log('✓ Updated User record to starter plan')
      } else {
        console.log('⚠ User record not found')
      }
    }

    console.log('\n✅ Successfully upgraded to starter plan!')
    console.log('User can now access the dashboard.')

    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

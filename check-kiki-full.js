const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

;(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find the professional first
    const Professional = mongoose.model(
      'Professional',
      new mongoose.Schema({}, { strict: false }),
      'professionals'
    )
    const professional = await Professional.findOne({
      email: 'kiki@vanmulangoservices.com',
    }).lean()

    if (!professional) {
      console.log('Professional not found')
      return
    }

    console.log('\nProfessional Record:')
    console.log('  userId:', professional.userId)
    console.log('  subscriptionTier:', professional.subscriptionTier)
    console.log('  paymentStatus:', professional.paymentStatus)

    // Now find the User
    const User = mongoose.model(
      'User',
      new mongoose.Schema({}, { strict: false }),
      'users'
    )
    const user = await User.findById(professional.userId).lean()

    if (user) {
      console.log('\nUser Record:')
      console.log('  email:', user.email)
      console.log('  subscriptionTier:', user.subscriptionTier)
      console.log('  paymentStatus:', user.paymentStatus)
      console.log('  userType:', user.userType)
    } else {
      console.log('\nUser not found!')
    }

    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

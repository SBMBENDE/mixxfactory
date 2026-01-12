const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

;(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB\n')

    // Use proper schema-less updates
    const professionalResult = await mongoose.connection
      .collection('professionals')
      .updateOne(
        { email: 'kiki@vanmulangoservices.com' },
        {
          $set: {
            subscriptionTier: 'starter',
            paymentStatus: 'paid',
            subscriptionStartDate: new Date(),
            subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        }
      )

    console.log(
      'Professional update result:',
      professionalResult.modifiedCount,
      'document(s) modified'
    )

    // Find the professional to get userId
    const professional = await mongoose.connection
      .collection('professionals')
      .findOne({ email: 'kiki@vanmulangoservices.com' })

    if (professional && professional.userId) {
      const userResult = await mongoose.connection
        .collection('users')
        .updateOne(
          { _id: professional.userId },
          {
            $set: {
              subscriptionTier: 'starter',
              paymentStatus: 'paid',
            },
          }
        )

      console.log(
        'User update result:',
        userResult.modifiedCount,
        'document(s) modified'
      )
    }

    // Verify changes
    console.log('\n--- Verification ---')
    const updatedPro = await mongoose.connection
      .collection('professionals')
      .findOne({ email: 'kiki@vanmulangoservices.com' })
    console.log('Professional subscriptionTier:', updatedPro.subscriptionTier)
    console.log('Professional paymentStatus:', updatedPro.paymentStatus)

    if (updatedPro.userId) {
      const updatedUser = await mongoose.connection
        .collection('users')
        .findOne({ _id: updatedPro.userId })
      console.log('User subscriptionTier:', updatedUser?.subscriptionTier)
      console.log('User paymentStatus:', updatedUser?.paymentStatus)
    }

    console.log('\n✅ Update complete!')

    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
})()

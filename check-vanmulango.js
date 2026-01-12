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
    const professional = await Professional.findOne({
      businessName: /VanMulango/i,
    }).lean()

    if (!professional) {
      console.log(
        'Professional not found. Searching all professionals with recent payments...'
      )
      const recentPaid = await Professional.find({
        subscriptionTier: { $ne: 'free' },
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean()
      console.log(
        'Recent paid professionals:',
        JSON.stringify(
          recentPaid.map((p) => ({
            businessName: p.businessName,
            subscriptionTier: p.subscriptionTier,
            paymentStatus: p.paymentStatus,
            updatedAt: p.updatedAt,
          })),
          null,
          2
        )
      )
    } else {
      console.log(
        'Professional found:',
        JSON.stringify(
          {
            _id: professional._id,
            businessName: professional.businessName,
            subscriptionTier: professional.subscriptionTier,
            paymentStatus: professional.paymentStatus,
            paymentDate: professional.paymentDate,
            subscriptionEndsAt: professional.subscriptionEndsAt,
            active: professional.active,
          },
          null,
          2
        )
      )
    }

    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

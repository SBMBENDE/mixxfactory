const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const email = 'kiki@vanmulangoservices.com'

;(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB\n')

    // Delete Professional record
    const professionalResult = await mongoose.connection
      .collection('professionals')
      .deleteOne({ email: email })
    console.log(
      `✓ Deleted ${professionalResult.deletedCount} Professional record(s)`
    )

    // Delete User record
    const userResult = await mongoose.connection
      .collection('users')
      .deleteOne({ email: email })
    console.log(`✓ Deleted ${userResult.deletedCount} User record(s)`)

    // Delete any payment records
    const paymentResult = await mongoose.connection
      .collection('payments')
      .deleteMany({ $or: [{ email: email }, { 'metadata.email': email }] })
    console.log(`✓ Deleted ${paymentResult.deletedCount} Payment record(s)`)

    console.log('\n✅ User completely deleted from database!')
    console.log('You can now re-register with:', email)

    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
})()

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
      email: 'kiki@vanmulangoservices.com',
    }).lean()

    if (professional) {
      console.log('Professional record:')
      console.log(JSON.stringify(professional, null, 2))
    } else {
      console.log('Professional not found')
    }

    await mongoose.disconnect()
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

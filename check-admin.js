require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
})

const User = mongoose.model('User', userSchema)

;(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    // Find admin
    const admin = await User.findOne({ email: 'admin@mixxfactory.com' }).select(
      '+password'
    )
    if (!admin) {
      console.log('❌ Admin not found')
      process.exit(1)
    }

    console.log('Admin found:')
    console.log('Email:', admin.email)
    console.log('Role:', admin.role)
    console.log('Password hash:', admin.password)

    // Test with password
    const testPassword = 'changeme123!'
    const isValid = await bcrypt.compare(testPassword, admin.password)
    console.log('Password "changeme123!" is valid:', isValid)

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

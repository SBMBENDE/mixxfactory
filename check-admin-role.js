require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: String,
  accountType: String,
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model('User', userSchema)

;(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find admin user
    const admin = await User.findOne({ email: 'admin@afrobizz.com' })

    if (!admin) {
      console.log('❌ Admin user not found!')
    } else {
      console.log('✅ Admin user found!')
      console.log('Email:', admin.email)
      console.log('Role:', admin.role)
      console.log('AccountType:', admin.accountType)
      console.log('Created:', admin.createdAt)
    }

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

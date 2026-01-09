require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  accountType: String,
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model('User', userSchema)

;(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Delete existing admin
    await User.deleteOne({ email: 'admin@afrobizz.com' })
    console.log('Deleted existing admin if any')

    // Create new admin
    const hashedPassword = await bcrypt.hash('changeme123!', 10)
    const admin = new User({
      email: 'admin@afrobizz.com',
      password: hashedPassword,
      accountType: 'admin',
    })

    await admin.save()
    console.log('Admin created successfully')
    console.log('Email: admin@afrobizz.com')
    console.log('Password: changeme123!')
    console.log('AccountType: admin')

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

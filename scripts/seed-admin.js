/**
 * Seed admin user script
 * Run: node scripts/seed-admin.js
 */

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')

  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      return
    }

    // Split only on FIRST equals sign
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex > -1) {
      const key = trimmed.substring(0, eqIndex).trim()
      const value = trimmed
        .substring(eqIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, '')
      if (key && value) {
        process.env[key] = value
      }
    }
  })
}

const MONGODB_URI = process.env.MONGODB_URI
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mixxfactory.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123!'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set')
  process.exit(1)
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const User = mongoose.model('User', userSchema)

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${ADMIN_EMAIL}`)
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

    // Create admin user
    const admin = new User({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    })

    await admin.save()

    console.log('✅ Admin user created successfully!')
    console.log(`📧 Email: ${ADMIN_EMAIL}`)
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`)
    console.log('')
    console.log('⚠️  Remember to change the password in production!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding admin:', error)
    process.exit(1)
  }
}

seedAdmin()

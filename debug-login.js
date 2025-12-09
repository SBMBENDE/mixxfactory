#!/usr/bin/env node

/**
 * Simple debug script to check admin login
 */

const path = require('path')
const fs = require('fs')

// Load environment manually
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
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

;(async () => {
  try {
    const mongoose = require('mongoose')
    const bcrypt = require('bcryptjs')

    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)

    // Define User model
    const userSchema = new mongoose.Schema({
      email: { type: String, unique: true, lowercase: true },
      password: String,
      role: String,
    })

    const User = mongoose.model('DebugUser', userSchema)

    // Find admin
    const admin = await mongoose.connection
      .collection('users')
      .findOne({ email: 'admin@mixxfactory.com' })

    if (!admin) {
      console.log('❌ No admin user found. Creating one...')

      // Delete if exists
      await mongoose.connection
        .collection('users')
        .deleteOne({ email: 'admin@mixxfactory.com' })

      // Create new admin
      const hashedPassword = await bcrypt.hash('changeme123!', 10)
      const result = await mongoose.connection.collection('users').insertOne({
        email: 'admin@mixxfactory.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log('✅ Admin user created!')
      console.log('Email: admin@mixxfactory.com')
      console.log('Password: changeme123!')
      console.log('ID:', result.insertedId)
    } else {
      console.log('✅ Admin user found!')
      console.log('Email:', admin.email)
      console.log('Role:', admin.role)

      // Test password
      const isValid = await bcrypt.compare('changeme123!', admin.password)
      console.log('Password "changeme123!" is valid:', isValid)

      if (!isValid) {
        console.log('\n⚠️  Password mismatch! Updating password...')
        const hashedPassword = await bcrypt.hash('changeme123!', 10)
        await mongoose.connection
          .collection('users')
          .updateOne(
            { email: 'admin@mixxfactory.com' },
            { $set: { password: hashedPassword } }
          )
        console.log('✅ Password updated!')
      }
    }

    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
})()

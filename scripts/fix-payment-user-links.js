// scripts/fix-payment-user-links.js
// Script to fix payment records missing or with incorrect userId linkage
// It will attempt to match payments to users by email if userId is missing or invalid,
// and update the payment, user, and professional records accordingly.

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env.local')
  process.exit(1)
}

// Fix payment-user links script
// This script should ensure that all Stripe payments are correctly linked to the corresponding user in the database.
// It should use the centralized upgradeUser logic for consistency.
// Steps:
// 1. Find all payments in the DB that have Stripe metadata with userId/email/tier but are not linked to a user.
// 2. For each payment, find the user by userId/email.
// 3. If user found, call upgradeUser to ensure tier is correct and link payment to user.
// 4. Log results and errors for auditing.

const { getDb } = require('../lib/db')
const { upgradeUser } = require('../lib/billing/upgradeUser')
const Payment = require('../lib/db/models/Payment')
const User = require('../lib/db/models/User')

async function fixPaymentUserLinks({ dryRun = false } = {}) {
  await getDb()
  const payments = await Payment.find({
    $or: [{ user: { $exists: false } }, { user: null }],
    'stripe.metadata.userId': { $exists: true },
  })

  for (const payment of payments) {
    const { userId, email, tier } = payment.stripe.metadata || {}
    let user = null
    if (userId) {
      user = await User.findById(userId)
    }
    if (!user && email) {
      user = await User.findOne({ email })
    }
    if (!user) {
      console.warn(
        `No user found for payment ${payment._id} (userId: ${userId}, email: ${email})`
      )
      continue
    }
    try {
      if (!dryRun) {
        await upgradeUser({ userId: user._id, tier, paymentId: payment._id })
        payment.user = user._id
        await payment.save()
      }
      console.log(
        `[${dryRun ? 'DRY RUN' : 'FIXED'}] Linked payment ${
          payment._id
        } to user ${user._id} and upgraded tier to ${tier}`
      )
    } catch (err) {
      console.error(`Error upgrading user for payment ${payment._id}:`, err)
    }
  }
  mongoose.connection.close()
}

async function main() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  await fixPaymentUserLinks()
  await mongoose.disconnect()
}

if (require.main === module) {
  // CLI: node fix-payment-user-links.js [--dry-run]
  const dryRun = process.argv.includes('--dry-run')
  fixPaymentUserLinks({ dryRun })
}

module.exports = { fixPaymentUserLinks }

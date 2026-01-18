// scripts/repair-stripe-payments.js
// This script finds all payments marked as 'failed' in MongoDB, checks their status in Stripe,
// and if Stripe says 'succeeded', updates the payment, user, and professional records accordingly.
// Requires STRIPE_SECRET_KEY in .env.local

const mongoose = require('mongoose')
const Stripe = require('stripe')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!MONGODB_URI || !STRIPE_SECRET_KEY) {
  console.error('MONGODB_URI or STRIPE_SECRET_KEY not set in .env.local')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

async function main() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const db = mongoose.connection
  const Payment = db.collection('payments')
  // Dynamically import upgradeUser
  const { upgradeUser } = await import('../lib/billing/upgradeUser')

  // Get all Stripe payment intents with status succeeded
  const stripePayments = await Payment.find({
    provider: 'stripe',
    providerPaymentId: { $exists: true, $ne: '' },
  }).toArray()
  let repaired = 0

  for (const payment of stripePayments) {
    try {
      const intent = await stripe.paymentIntents.retrieve(
        payment.providerPaymentId
      )
      if (intent.status === 'succeeded') {
        // Upsert payment and always call upgradeUser
        await Payment.updateOne(
          { _id: payment._id },
          {
            $set: {
              status: 'succeeded',
              email: intent.metadata?.email,
              userId: intent.metadata?.userId,
              subscriptionTier: intent.metadata?.tier || 'pro',
            },
          }
        )
        try {
          await upgradeUser({
            userId: intent.metadata?.userId,
            email: intent.metadata?.email,
            tier: intent.metadata?.tier || 'pro',
          })
          repaired++
          console.log(
            `Fixed payment ${payment._id}: Stripe succeeded, user upgraded.`
          )
        } catch (err) {
          console.error(
            `UpgradeUser error for payment ${payment._id}:`,
            err.message
          )
        }
      } else {
        console.log(
          `Payment ${payment._id}: Stripe status is '${intent.status}', no change.`
        )
      }
    } catch (err) {
      console.error(`Error checking payment ${payment._id}:`, err.message)
    }
  }

  console.log(`\nRepair complete. ${repaired} payment(s) upgraded.`)
  await mongoose.disconnect()
}

main()

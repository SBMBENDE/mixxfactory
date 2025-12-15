/**
 * Script to check newsletter subscribers in database
 * Usage: node check-newsletter-subscribers.js
 */

const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set')
  process.exit(1)
}

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    firstName: String,
    subscribed: {
      type: Boolean,
      default: true,
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: mongoose.Schema.Types.Date,
    verificationToken: String,
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    categories: [
      {
        type: String,
        lowercase: true,
      },
    ],
  },
  { timestamps: true }
)

const NewsletterSubscriber = mongoose.model(
  'NewsletterSubscriber',
  newsletterSubscriberSchema
)

async function checkSubscribers() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✓ Connected to MongoDB')

    const count = await NewsletterSubscriber.countDocuments()
    console.log(`\n📊 Total newsletter subscribers: ${count}`)

    if (count > 0) {
      console.log('\n📧 Recent subscribers:')
      const subscribers = await NewsletterSubscriber.find()
        .sort({ subscribedAt: -1 })
        .limit(10)

      subscribers.forEach((sub, idx) => {
        console.log(`\n  ${idx + 1}. Email: ${sub.email}`)
        console.log(`     Name: ${sub.firstName || 'Not provided'}`)
        console.log(`     ID: ${sub._id}`)
        console.log(`     Subscribed: ${sub.subscribed}`)
        console.log(`     Verified: ${sub.verified}`)
        console.log(`     Categories: ${sub.categories?.join(', ') || 'None'}`)
        console.log(
          `     Subscribed At: ${new Date(sub.subscribedAt).toLocaleString()}`
        )
      })
    } else {
      console.log('\n⚠️  No subscribers found in database')
    }

    await mongoose.disconnect()
    console.log('\n✓ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkSubscribers()

/**
 * Delete test events by session ID
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

async function deleteTestEvents() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const sessionId =
      'cs_test_a1OxH6SWIU8Gs2ElWbg2zzCglt0zEcr7FwumzayJf7EfVb09lQKQPS79R4'

    // Find all events by this payment session
    const Event = mongoose.model(
      'Event',
      new mongoose.Schema({}, { strict: false }),
    )
    const events = await Event.find({ paymentId: sessionId })

    console.log(
      `\n📅 Found ${events.length} event(s) with payment session ${sessionId}:`,
    )
    events.forEach((event, index) => {
      console.log(
        `  ${index + 1}. ${event.title} (${event.slug}) - ID: ${event._id}`,
      )
    })

    // Delete all events
    if (events.length > 0) {
      const deleteResult = await Event.deleteMany({ paymentId: sessionId })
      console.log(`\n🗑️  Deleted ${deleteResult.deletedCount} event(s)`)
    }

    // Also find user by email and delete
    const User = mongoose.model(
      'User',
      new mongoose.Schema({}, { strict: false }),
    )
    const user = await User.findOne({ email: 'sam@digicorepro.com' })

    if (user) {
      console.log(`\n👤 Found user: ${user.email} (ID: ${user._id})`)

      // Find any other events by user ID
      const userEvents = await Event.find({ userId: user._id.toString() })
      if (userEvents.length > 0) {
        console.log(
          `\n📅 Found ${userEvents.length} additional event(s) by user:`,
        )
        userEvents.forEach((event, index) => {
          console.log(`  ${index + 1}. ${event.title} (${event.slug})`)
        })
        const userEventsDelete = await Event.deleteMany({
          userId: user._id.toString(),
        })
        console.log(`\n🗑️  Deleted ${userEventsDelete.deletedCount} event(s)`)
      }

      await User.deleteOne({ _id: user._id })
      console.log(`\n🗑️  Deleted user: ${user.email}`)
    } else {
      console.log('\n👤 No user found with email sam@digicorepro.com')
    }

    console.log('\n✅ Cleanup complete! You can now test the flow again.')

    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

deleteTestEvents()

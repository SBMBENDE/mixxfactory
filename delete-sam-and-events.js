/**
 * Delete sam@digicorepro.com user and all associated events
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  process.exit(1)
}

async function deleteUserAndEvents() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const userEmail = 'sam@digicorepro.com'

    // Find the user
    const User = mongoose.model(
      'User',
      new mongoose.Schema({}, { strict: false }),
    )
    const user = await User.findOne({ email: userEmail })

    if (!user) {
      console.log(`❌ User with email ${userEmail} not found`)
      await mongoose.disconnect()
      return
    }

    console.log(`\n📋 Found user: ${user.email} (ID: ${user._id})`)

    // Find all events by this user
    const Event = mongoose.model(
      'Event',
      new mongoose.Schema({}, { strict: false }),
    )
    const events = await Event.find({ userId: user._id.toString() })

    console.log(
      `\n📅 Found ${events.length} event(s) associated with this user:`,
    )
    events.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title} (${event.slug})`)
    })

    // Delete all events
    if (events.length > 0) {
      const deleteResult = await Event.deleteMany({
        userId: user._id.toString(),
      })
      console.log(`\n🗑️  Deleted ${deleteResult.deletedCount} event(s)`)
    }

    // Delete the user
    await User.deleteOne({ _id: user._id })
    console.log(`\n🗑️  Deleted user: ${user.email}`)

    console.log('\n✅ Cleanup complete! You can now test the flow again.')

    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

deleteUserAndEvents()

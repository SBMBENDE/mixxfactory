/**
 * Delete all users and professionals except admin and specified email
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const KEEP_EMAIL = 'mbende2000@yahoo.com'

async function cleanupDatabase() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected!\n')

    const db = mongoose.connection.db
    const usersCollection = db.collection('users')
    const professionalsCollection = db.collection('professionals')
    const sessionsCollection = db.collection('sessions')
    const userSessionsCollection = db.collection('usersessions')

    // Find users to keep (admins and KEEP_EMAIL)
    const usersToKeep = await usersCollection
      .find({
        $or: [{ accountType: 'admin' }, { email: KEEP_EMAIL }],
      })
      .toArray()
    const keepUserIds = usersToKeep.map((u) => u._id)
    const keepUserIdStrings = usersToKeep.map((u) => u._id.toString())

    // Delete all other users
    const usersToDelete = await usersCollection
      .find({ _id: { $nin: keepUserIds } })
      .toArray()
    console.log(`📊 Found ${usersToDelete.length} user(s) to delete\n`)
    if (usersToDelete.length > 0) {
      console.log('🗑️  Users to be deleted:')
      usersToDelete.forEach((user) => {
        console.log(`  - ${user.email} (${user.accountType}) - ID: ${user._id}`)
      })
      await usersCollection.deleteMany({
        _id: { $in: usersToDelete.map((u) => u._id) },
      })
      console.log(
        `✅ Deleted ${usersToDelete.length} user(s) from users collection`
      )
    } else {
      console.log('✨ No users to delete. Database is clean!')
    }

    // Delete ALL professionals
    const professionalsToDelete = await professionalsCollection
      .find({})
      .toArray()
    if (professionalsToDelete.length > 0) {
      await professionalsCollection.deleteMany({})
      console.log(
        `✅ Deleted ${professionalsToDelete.length} professional(s) from professionals collection`
      )
    } else {
      console.log('No professionals to delete.')
    }

    // Delete ALL sessions
    const sessionsToDelete = await sessionsCollection.find({}).toArray()
    if (sessionsToDelete.length > 0) {
      await sessionsCollection.deleteMany({})
      console.log(
        `✅ Deleted ${sessionsToDelete.length} session(s) from sessions collection`
      )
    } else {
      console.log('No sessions to delete.')
    }

    // Delete ALL userSessions
    const userSessionsToDelete = await userSessionsCollection.find({}).toArray()
    if (userSessionsToDelete.length > 0) {
      await userSessionsCollection.deleteMany({})
      console.log(
        `✅ Deleted ${userSessionsToDelete.length} session(s) from usersessions collection`
      )
    } else {
      console.log('No usersessions to delete.')
    }

    // Show remaining users
    console.log('\n📋 Remaining users:')
    const remainingUsers = await usersCollection.find({}).toArray()
    remainingUsers.forEach((user) => {
      console.log(`  ✓ ${user.email} (${user.accountType})`)
    })

    console.log('\n✨ Cleanup complete!\n')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

cleanupDatabase()

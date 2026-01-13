/**
 * Delete user and professional by email
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const email = 'sam.mbende2@gmail.com'

async function deleteUserByEmail() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected!')

    // Get collections
    const db = mongoose.connection.db
    const usersCollection = db.collection('users')
    const professionalsCollection = db.collection('professionals')
    const sessionsCollection = db.collection('sessions')

    // Also check for NextAuth collections
    const nextAuthUsersCollection = db.collection('nextauth_users')
    const nextAuthAccountsCollection = db.collection('accounts')

    console.log(`\n🔍 Searching for records with email: ${email}\n`)

    // Find and delete from users
    const users = await usersCollection.find({ email }).toArray()
    console.log(`Found ${users.length} user(s) in users collection`)
    if (users.length > 0) {
      users.forEach((u) =>
        console.log(`  - User ID: ${u._id}, Account Type: ${u.accountType}`)
      )
      const deleteResult = await usersCollection.deleteMany({ email })
      console.log(`✅ Deleted ${deleteResult.deletedCount} user(s)`)
    }

    // Find and delete from professionals
    const professionals = await professionalsCollection
      .find({ email })
      .toArray()
    console.log(
      `\nFound ${professionals.length} professional(s) in professionals collection`
    )
    if (professionals.length > 0) {
      professionals.forEach((p) =>
        console.log(`  - Professional ID: ${p._id}, Name: ${p.name}`)
      )
      const deleteResult = await professionalsCollection.deleteMany({ email })
      console.log(`✅ Deleted ${deleteResult.deletedCount} professional(s)`)
    }

    // Find and delete sessions for this user
    if (users.length > 0) {
      const userIds = users.map((u) => u._id.toString())
      const sessions = await sessionsCollection
        .find({ userId: { $in: userIds } })
        .toArray()
      console.log(`\nFound ${sessions.length} session(s)`)
      if (sessions.length > 0) {
        const deleteResult = await sessionsCollection.deleteMany({
          userId: { $in: userIds },
        })
        console.log(`✅ Deleted ${deleteResult.deletedCount} session(s)`)
      }
    }

    // Check NextAuth collections
    try {
      const nextAuthUsers = await nextAuthUsersCollection
        .find({ email })
        .toArray()
      console.log(`\nFound ${nextAuthUsers.length} NextAuth user(s)`)
      if (nextAuthUsers.length > 0) {
        nextAuthUsers.forEach((u) =>
          console.log(`  - NextAuth User ID: ${u._id}`)
        )
        const deleteResult = await nextAuthUsersCollection.deleteMany({ email })
        console.log(`✅ Deleted ${deleteResult.deletedCount} NextAuth user(s)`)

        // Delete associated accounts
        const userIds = nextAuthUsers.map((u) => u._id)
        const accounts = await nextAuthAccountsCollection
          .find({ userId: { $in: userIds } })
          .toArray()
        console.log(`\nFound ${accounts.length} OAuth account(s)`)
        if (accounts.length > 0) {
          const deleteResult = await nextAuthAccountsCollection.deleteMany({
            userId: { $in: userIds },
          })
          console.log(
            `✅ Deleted ${deleteResult.deletedCount} OAuth account(s)`
          )
        }
      }
    } catch (err) {
      console.log(
        '\nNextAuth collections not found (this is okay if adapter not used)'
      )
    }

    console.log('\n✨ Cleanup complete!\n')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

deleteUserByEmail()

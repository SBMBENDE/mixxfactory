// cleanup-orphaned-users.js
// Script to remove users whose emails do not exist in the professionals collection

const mongoose = require('mongoose')
const { UserModel, ProfessionalModel } = require('./lib/db/models')
const { connectDB } = require('./lib/db/connection')

async function cleanupOrphanedUsers() {
  await connectDB()
  const professionals = await ProfessionalModel.find({}, 'email')
  const professionalEmails = new Set(
    professionals
      .map((p) => p.email)
      .filter(
        (email) => email && typeof email === 'string' && email.trim() !== ''
      )
  )

  console.log('Professional emails:', Array.from(professionalEmails))

  const allUsers = await UserModel.find({}, 'email')
  const userEmails = allUsers.map((u) => u.email)
  console.log('User emails:', userEmails)

  const orphanedUsers = await UserModel.find({
    email: { $nin: Array.from(professionalEmails) },
  })
  if (orphanedUsers.length === 0) {
    console.log('No orphaned users found.')
    await mongoose.connection.close()
    return
  }
  console.log(`Found ${orphanedUsers.length} orphaned users. Deleting...`)
  for (const user of orphanedUsers) {
    await UserModel.deleteOne({ _id: user._id })
    console.log(`Deleted user: ${user.email}`)
  }
  console.log('Cleanup complete.')
  await mongoose.connection.close()
  process.exit(0)
}

cleanupOrphanedUsers().catch((err) => {
  console.error('Error during cleanup:', err)
  process.exit(1)
})

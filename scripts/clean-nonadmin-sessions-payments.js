// scripts/clean-nonadmin-sessions-payments.js
// Deletes all sessions and payments except those related to admins and mbende2000@hotmail.com

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const PROTECTED_EMAILS = ['mbende2000@hotmail.com']

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env.local')
  process.exit(1)
}

async function main() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const db = mongoose.connection
  const User = db.collection('users')
  const Session = db.collection('sessions')
  const Payment = db.collection('payments')

  // Find all admin users and protected emails
  const admins = await User.find({
    $or: [
      { role: 'admin' },
      { accountType: 'admin' },
      { email: { $in: PROTECTED_EMAILS } },
    ],
  }).toArray()
  const protectedUserIds = admins.map((u) => u._id.toString())

  // Delete all sessions not belonging to protected users
  const sessionResult = await Session.deleteMany({
    userId: { $nin: protectedUserIds },
  })
  // Delete all payments not belonging to protected users
  const paymentResult = await Payment.deleteMany({
    userId: { $nin: protectedUserIds },
  })

  console.log(
    `Deleted ${sessionResult.deletedCount} sessions and ${
      paymentResult.deletedCount
    } payments (excluding admins and ${PROTECTED_EMAILS.join(', ')})`
  )
  await mongoose.disconnect()
}

main()

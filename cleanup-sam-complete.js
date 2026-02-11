require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const professionalSchema = new mongoose.Schema({}, { strict: false })
const Professional = mongoose.model(
  'Professional',
  professionalSchema,
  'professionals',
)

const userSchema = new mongoose.Schema({}, { strict: false })
const User = mongoose.model('User', userSchema, 'users')

async function checkAndDelete() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const email = 'sam.mbende2@gmail.com'

    // Find all professionals with this email
    const professionals = await Professional.find({ email })
    console.log(
      `\nFound ${professionals.length} professional(s) with email: ${email}`,
    )

    professionals.forEach((prof, i) => {
      console.log(`\nProfessional ${i + 1}:`)
      console.log('  ID:', prof._id)
      console.log('  Name:', prof.name)
      console.log('  Email:', prof.email)
      console.log('  Slug:', prof.slug)
    })

    // Find all users with this email
    const users = await User.find({ email })
    console.log(`\nFound ${users.length} user(s) with email: ${email}`)

    users.forEach((user, i) => {
      console.log(`\nUser ${i + 1}:`)
      console.log('  ID:', user._id)
      console.log('  Email:', user.email)
      console.log('  Name:', user.name)
    })

    // Also check by userId field in professionals
    if (users.length > 0) {
      const userIds = users.map((u) => u._id)
      const profsByUserId = await Professional.find({
        userId: { $in: userIds },
      })
      console.log(
        `\nFound ${profsByUserId.length} professional(s) linked to user ID(s)`,
      )

      profsByUserId.forEach((prof, i) => {
        console.log(`\nLinked Professional ${i + 1}:`)
        console.log('  ID:', prof._id)
        console.log('  Name:', prof.name)
        console.log('  Email:', prof.email)
        console.log('  User ID:', prof.userId)
      })
    }

    // Delete everything
    console.log('\n=== DELETING ===')
    const profResult = await Professional.deleteMany({ email })
    console.log(`Deleted ${profResult.deletedCount} professional(s) by email`)

    if (users.length > 0) {
      const userIds = users.map((u) => u._id)
      const profByUserIdResult = await Professional.deleteMany({
        userId: { $in: userIds },
      })
      console.log(
        `Deleted ${profByUserIdResult.deletedCount} professional(s) by userId`,
      )
    }

    const userResult = await User.deleteMany({ email })
    console.log(`Deleted ${userResult.deletedCount} user(s) by email`)

    console.log('\n✓ Cleanup complete!')

    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

checkAndDelete()

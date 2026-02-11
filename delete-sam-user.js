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

async function deleteUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const email = 'sam.mbende2@gmail.com'

    // Delete professional profile
    const profResult = await Professional.deleteMany({ email })
    console.log(
      `Deleted ${profResult.deletedCount} professional profile(s) for ${email}`,
    )

    // Delete user account
    const userResult = await User.deleteMany({ email })
    console.log(
      `Deleted ${userResult.deletedCount} user account(s) for ${email}`,
    )

    console.log(
      '\n✓ User deleted successfully. You can now re-register with the same email.',
    )

    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

deleteUser()

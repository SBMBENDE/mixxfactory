/**
 * Delete sam.mbende2@gmail.com user and professional for testing
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const cleanup = async () => {
  try {
    console.log('\n🔧 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected\n')

    const Professional = mongoose.model(
      'Professional',
      new mongoose.Schema({}, { strict: false }),
      'professionals',
    )
    const User = mongoose.model(
      'User',
      new mongoose.Schema({}, { strict: false }),
      'users',
    )

    const email = 'sam.mbende2@gmail.com'

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      console.log('❌ User not found')
      await mongoose.disconnect()
      process.exit(0)
    }

    console.log('📋 User found:', user._id)
    console.log('   Email:', user.email)
    console.log('   Name:', user.name)

    // Find and delete professional profile
    const professional = await Professional.findOne({ userId: user._id })
    if (professional) {
      console.log('\n📋 Professional found:', professional._id)
      console.log('   Name:', professional.name)
      console.log('   Slug:', professional.slug)

      await Professional.deleteOne({ _id: professional._id })
      console.log('✅ Professional profile deleted')
    } else {
      console.log('\n⚠️  No professional profile found')
    }

    // Delete user
    await User.deleteOne({ _id: user._id })
    console.log('✅ User account deleted')

    console.log('\n✅ Cleanup complete! Ready for fresh test.\n')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanup()

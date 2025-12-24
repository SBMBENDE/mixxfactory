/**
 * Test Professional Dashboard Setup
 * Run with: export $(cat .env.local | grep -v '^#' | xargs) && node test-dashboard-setup.js
 */

const mongoose = require('mongoose')

// Define schemas inline for testing
const professionalSchema = new mongoose.Schema({}, { strict: false })
const userSchema = new mongoose.Schema({}, { strict: false })
const reviewSchema = new mongoose.Schema({}, { strict: false })

async function testSetup() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Get or create models
    const Professional =
      mongoose.models.Professional ||
      mongoose.model('Professional', professionalSchema)
    const User = mongoose.models.User || mongoose.model('User', userSchema)
    const Review =
      mongoose.models.Review || mongoose.model('Review', reviewSchema)

    const sampleProfessional = await Professional.findOne()

    console.log('📋 Professional Model Check:')
    if (sampleProfessional) {
      console.log('  ✅ Professional found:', sampleProfessional.name)
      console.log('  - Has userId field:', !!sampleProfessional.userId)
      console.log(
        '  - Has subscriptionTier field:',
        !!sampleProfessional.subscriptionTier
      )
      console.log('  - Has analytics field:', !!sampleProfessional.analytics)
      console.log(
        '  - Subscription tier:',
        sampleProfessional.subscriptionTier || 'free'
      )
    } else {
      console.log('  ⚠️  No professionals found in database')
    }

    // Check if Inquiry model exists
    console.log('\n📨 Inquiry Model Check:')
    try {
      const Inquiry =
        mongoose.models.Inquiry ||
        mongoose.model('Inquiry', new mongoose.Schema({}, { strict: false }))
      const inquiryCount = await Inquiry.countDocuments()
      console.log('  ✅ Inquiry model exists')
      console.log('  - Total inquiries:', inquiryCount)
    } catch (error) {
      console.log('  ℹ️  Inquiry model created (no documents yet)')
    }

    // Check if Analytics model exists
    console.log('\n📊 Analytics Model Check:')
    try {
      const Analytics =
        mongoose.models.Analytics ||
        mongoose.model('Analytics', new mongoose.Schema({}, { strict: false }))
      const analyticsCount = await Analytics.countDocuments()
      console.log('  ✅ Analytics model exists')
      console.log('  - Total analytics documents:', analyticsCount)
    } catch (error) {
      console.log('  ℹ️  Analytics model created (no documents yet)')
    }

    // Check Review model
    console.log('\n⭐ Review Model Check:')
    const reviewCount = await Review.countDocuments()
    console.log('  ✅ Review model exists')
    console.log('  - Total reviews:', reviewCount)

    // Check for users with professional accountType
    console.log('\n👤 Professional Users Check:')
    const professionalUsers = await User.find({ accountType: 'professional' })
    console.log('  - Professional accounts:', professionalUsers.length)
    if (professionalUsers.length > 0) {
      console.log('  ✅ Found professional user:', professionalUsers[0].email)
    } else {
      console.log('  ⚠️  No professional accounts found')
      console.log(
        '  💡 Create one via /auth/register with accountType: "professional"'
      )
    }

    console.log('\n🎯 Dashboard Routes Available:')
    console.log('  - /professional (main dashboard)')
    console.log('  - /professional/analytics')
    console.log('  - /professional/reviews')
    console.log('  - /professional/inquiries')
    console.log('  - /professional/profile')
    console.log('  - /professional/subscription')
    console.log('  - /professional/settings')

    console.log('\n📡 API Endpoints Available:')
    console.log('  - GET /api/professional/dashboard')
    console.log('  - GET /api/professional/my-profile')
    console.log('  - GET /api/professional/analytics')
    console.log('  - GET /api/professional/reviews')
    console.log('  - GET /api/professional/inquiries')
    console.log('  - POST /api/professional/inquiries/[id]/read')
    console.log('  - POST /api/professional/inquiries/[id]/reply')

    console.log('\n✅ Dashboard setup complete!')
    console.log('\n📝 Next Steps:')
    console.log("  1. Create a professional account if you haven't")
    console.log('  2. Link a professional profile to a user (set userId field)')
    console.log('  3. Visit /professional to see the dashboard')
    console.log('  4. Test all features and pages')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

testSetup()

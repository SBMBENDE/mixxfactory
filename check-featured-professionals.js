const mongoose = require('mongoose')

const professionalSchema = new mongoose.Schema({}, { strict: false })
const Professional = mongoose.model('Professional', professionalSchema)

async function check() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error('MONGODB_URI environment variable not set')
      process.exit(1)
    }

    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB\n')

    const total = await Professional.countDocuments()
    console.log('Total professionals:', total)

    const active = await Professional.countDocuments({ active: true })
    console.log('Active professionals:', active)

    const featured = await Professional.countDocuments({ featured: true })
    console.log('Featured professionals:', featured)

    const featuredActive = await Professional.countDocuments({
      featured: true,
      active: true,
    })
    console.log('Featured AND Active professionals:', featuredActive)

    // Get a sample of professionals with their featured/active status
    const sample = await Professional.find({})
      .select('name slug featured active rating reviewCount')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    console.log('\n📋 Sample professionals:')
    sample.forEach((p) => {
      console.log(
        `- ${p.name}: featured=${p.featured}, active=${p.active}, rating=${p.rating}, reviews=${p.reviewCount}`
      )
    })

    // Check specifically featured professionals
    if (featuredActive > 0) {
      console.log('\n⭐ Featured & Active professionals:')
      const featuredProfs = await Professional.find({
        featured: true,
        active: true,
      })
        .select('name slug featured active rating reviewCount')
        .limit(5)
        .lean()

      featuredProfs.forEach((p) => {
        console.log(`- ${p.name}: rating=${p.rating}, reviews=${p.reviewCount}`)
      })
    }

    await mongoose.disconnect()
    console.log('\n✅ Check complete')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

check()

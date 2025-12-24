/**
 * Fix Professional Category References
 * Maps old category IDs to new ones based on category names
 */

const mongoose = require('mongoose')

// Category ID mapping (old slugs to identify categories)
const categoryMapping = {
  dj: 'DJ',
  'event-hall': 'Event Hall',
  stylist: 'Stylist',
  restaurant: 'Restaurant',
  nightclub: 'Nightclub',
  cameraman: 'Cameraman',
  promoter: 'Promoter',
  decorator: 'Decorator',
  caterer: 'Caterer',
  florist: 'Florist',
  'software-engineer': 'Software Engineer',
  'auto-service': 'Auto Service',
}

async function fixCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const Category = mongoose.model(
      'Category',
      new mongoose.Schema({}, { strict: false })
    )
    const Professional = mongoose.model(
      'Professional',
      new mongoose.Schema({}, { strict: false })
    )

    // Get all current categories
    const categories = await Category.find().lean()
    console.log(`📊 Found ${categories.length} categories:\n`)
    categories.forEach((cat) => console.log(`  - ${cat.name} (${cat._id})`))

    // Get all professionals
    const professionals = await Professional.find().lean()
    console.log(`\n📋 Found ${professionals.length} professionals to check\n`)

    let fixed = 0
    let notFound = 0

    for (const prof of professionals) {
      // Try to find the matching category by checking common patterns
      let matchedCategory = null

      // Check if professional name contains category keywords
      const profNameLower = prof.name.toLowerCase()

      if (profNameLower.includes('dj') || prof.slug?.includes('dj')) {
        matchedCategory = categories.find((c) => c.slug === 'dj')
      } else if (
        profNameLower.includes('stylist') ||
        profNameLower.includes('eleanor')
      ) {
        matchedCategory = categories.find((c) => c.slug === 'stylist')
      } else if (
        profNameLower.includes('restaurant') ||
        profNameLower.includes('chef') ||
        profNameLower.includes('coq')
      ) {
        matchedCategory = categories.find((c) => c.slug === 'restaurant')
      } else if (
        profNameLower.includes('florist') ||
        profNameLower.includes('fleur')
      ) {
        matchedCategory = categories.find((c) => c.slug === 'florist')
      } else if (
        profNameLower.includes('salon') ||
        profNameLower.includes('event') ||
        profNameLower.includes('hall') ||
        profNameLower.includes('venue') ||
        profNameLower.includes('espace')
      ) {
        matchedCategory = categories.find((c) => c.slug === 'event-hall')
      } else if (
        profNameLower.includes('software') ||
        profNameLower.includes('engineer') ||
        profNameLower.includes('digicor')
      ) {
        matchedCategory = categories.find(
          (c) =>
            c.name.toLowerCase().includes('software') ||
            c.name.toLowerCase().includes('tech')
        )
      } else if (
        profNameLower.includes('auto') ||
        profNameLower.includes('car')
      ) {
        matchedCategory = categories.find(
          (c) =>
            c.name.toLowerCase().includes('auto') ||
            c.name.toLowerCase().includes('car')
        )
      }

      if (
        matchedCategory &&
        matchedCategory._id.toString() !== prof.category?.toString()
      ) {
        await Professional.updateOne(
          { _id: prof._id },
          { $set: { category: matchedCategory._id } }
        )
        console.log(`✅ Fixed: ${prof.name} → ${matchedCategory.name}`)
        fixed++
      } else if (!matchedCategory) {
        console.log(
          `⚠️  Could not match: ${prof.name} (needs manual assignment)`
        )
        notFound++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`  - Fixed: ${fixed}`)
    console.log(`  - Needs manual review: ${notFound}`)
    console.log(`  - Total: ${professionals.length}`)

    await mongoose.disconnect()
    console.log('\n✅ Done!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

fixCategories()

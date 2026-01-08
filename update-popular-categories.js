/**
 * Update Popular Categories
 * - Set 8 categories as popular
 * - Tech should be first (sort order: 1)
 * - Add Restaurant to popular list
 */

const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

async function updatePopularCategories() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db()
    const categoriesCollection = db.collection('categories')

    // Define the popular categories in order (Tech first)
    const popularOrder = [
      { slug: 'tech', order: 1 },
      { slug: 'dj', order: 2 },
      { slug: 'event-hall', order: 3 },
      { slug: 'audiovisual', order: 4 },
      { slug: 'caterer', order: 5 },
      { slug: 'restaurant', order: 6 },
      { slug: 'stylist', order: 7 },
      { slug: 'decorator', order: 8 },
    ]

    // First, reset all categories to not popular
    await categoriesCollection.updateMany(
      {},
      { $set: { popular: false }, $unset: { popularOrder: '' } }
    )
    console.log('✅ Reset all categories to not popular')

    // Then, set the selected categories as popular with order
    for (const { slug, order } of popularOrder) {
      const result = await categoriesCollection.updateOne(
        { slug },
        { $set: { popular: true, popularOrder: order } }
      )

      if (result.matchedCount > 0) {
        console.log(`✅ Set ${slug} as popular (order: ${order})`)
      } else {
        console.log(`⚠️  Category ${slug} not found`)
      }
    }

    // Verify the update
    const popularCategories = await categoriesCollection
      .find({ popular: true })
      .sort({ popularOrder: 1 })
      .toArray()

    console.log('\n📋 Popular Categories (in order):')
    popularCategories.forEach((cat) => {
      console.log(`  ${cat.popularOrder}. ${cat.name} (${cat.slug})`)
    })

    console.log(`\n✅ Total popular categories: ${popularCategories.length}`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
    console.log('\n👋 Disconnected from MongoDB')
  }
}

updatePopularCategories()

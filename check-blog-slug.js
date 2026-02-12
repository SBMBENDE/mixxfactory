const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function checkBlogSlug() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    const posts = await db.collection('blogposts').find({}).toArray()

    console.log('\n📚 Blog Posts in Database:')
    console.log('='.repeat(60))

    if (posts.length === 0) {
      console.log('❌ No blog posts found')
    } else {
      posts.forEach((post, index) => {
        console.log(`\nPost #${index + 1}:`)
        console.log(`  Title: ${post.title}`)
        console.log(`  Slug: ${post.slug}`)
        console.log(`  Published: ${post.published ? '✅ YES' : '❌ NO'}`)
        console.log(`  Featured: ${post.featured ? '⭐ YES' : '⭕ NO'}`)
        console.log(`  URL: /blog/${post.slug}`)
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log(`Total posts: ${posts.length}\n`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

checkBlogSlug()

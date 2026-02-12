const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const BlogPostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  excerpt: String,
  category: String,
  tags: [String],
  author: String,
  featuredImage: String,
  published: Boolean,
  featured: Boolean,
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

async function checkPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✓ Connected to MongoDB')

    const BlogPost = mongoose.model('BlogPost', BlogPostSchema)

    const posts = await BlogPost.find({})
    console.log(`\n📝 Found ${posts.length} blog posts in database:`)

    if (posts.length === 0) {
      console.log('\n⚠️  No blog posts found in database!')
    } else {
      posts.forEach((post, index) => {
        console.log(`\n${index + 1}. ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   Published: ${post.published}`)
        console.log(`   Featured: ${post.featured}`)
        console.log(`   Author: ${post.author}`)
        console.log(`   Created: ${post.createdAt}`)
      })
    }

    await mongoose.disconnect()
    console.log('\n✓ Disconnected from MongoDB')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkPosts()

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
    console.log('✓ Connected to MongoDB\n')

    const BlogPost = mongoose.model('BlogPost', BlogPostSchema)

    // Get all posts
    const allPosts = await BlogPost.find({})
    console.log(`📝 Total posts in database: ${allPosts.length}`)

    allPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. "${post.title}"`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Published: ${post.published ? '✅ YES' : '❌ NO'}`)
      console.log(`   Featured: ${post.featured ? '⭐ YES' : 'NO'}`)
    })

    // Get only published posts
    const publishedPosts = await BlogPost.find({ published: true })
    console.log(`\n\n✅ Published posts: ${publishedPosts.length}`)
    publishedPosts.forEach((post) => {
      console.log(`   - /blog/${post.slug}`)
    })

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkPosts()

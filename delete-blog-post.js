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

async function deletePost() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✓ Connected to MongoDB\n')

    const BlogPost = mongoose.model('BlogPost', BlogPostSchema)

    // Delete the post
    const result = await BlogPost.deleteOne({
      slug: 'design-engineering-decisions-1',
    })

    if (result.deletedCount > 0) {
      console.log('✅ Post deleted successfully')
    } else {
      console.log('⚠️  No post found with that slug')
    }

    // Check remaining posts
    const remaining = await BlogPost.countDocuments()
    console.log(`\n📝 Remaining posts in database: ${remaining}`)

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

deletePost()

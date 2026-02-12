const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

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
});

async function checkPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
    
    const posts = await BlogPost.find({});
    console.log(`\nFound ${posts.length} blog posts:`);
    posts.forEach(post => {
      console.log(`\n- Title: ${post.title}`);
      console.log(`  Slug: ${post.slug}`);
      console.log(`  Published: ${post.published}`);
      console.log(`  Featured: ${post.featuredconst mongoose = require('mongoose $require('dotenv').config({ path: '.eit
const BlogPostSchema = new mongoose.Schema({
  con  title: String,
  slug: String,
  content:it  slug: String,ck  conten

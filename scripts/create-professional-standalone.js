// Standalone script: create-professional-standalone.js
// Usage: node scripts/create-professional-standalone.js <MONGODB_URI> <userId> <name> <categorySlug>

const mongoose = require('mongoose')

const professionalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: String,
  slug: String,
  category: mongoose.Schema.Types.ObjectId,
  description: String,
  email: String,
  images: [String],
  featured: Boolean,
  active: Boolean,
  verified: Boolean,
})

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  icon: String,
})

const Professional = mongoose.model(
  'Professional',
  professionalSchema,
  'professionals'
)
const Category = mongoose.model('Category', categorySchema, 'categories')

async function main() {
  const [, , MONGODB_URI, userId, name, categorySlug] = process.argv
  if (!MONGODB_URI || !userId || !name || !categorySlug) {
    console.error(
      'Usage: node scripts/create-professional-standalone.js <MONGODB_URI> <userId> <name> <categorySlug>'
    )
    process.exit(1)
  }
  await mongoose.connect(MONGODB_URI)
  const category = await Category.findOne({ slug: categorySlug })
  if (!category) {
    console.error('Category not found:', categorySlug)
    process.exit(1)
  }
  let professional = await Professional.findOne({ userId })
  if (professional) {
    console.log('Professional already exists:', professional)
    process.exit(0)
  }
  professional = new Professional({
    userId,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    category: category._id,
    description: 'Auto-generated professional profile.',
    email: '',
    images: [],
    featured: false,
    active: true,
    verified: false,
  })
  await professional.save()
  console.log('Professional created:', professional)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

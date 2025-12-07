/**
 * Seed professional profiles (DJs, etc)
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join('/Users/sampsonmbende/Documents/mixxfactory', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');

let mongoUri = '';
for (const line of lines) {
  if (line.startsWith('MONGODB_URI=')) {
    mongoUri = line.substring('MONGODB_URI='.length).replaceAll('"', '');
    break;
  }
}

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Define schemas inline
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  description: String,
  icon: String,
}, { timestamps: true });

const locationSchema = new mongoose.Schema({
  city: String,
  region: String,
  country: String,
  coordinates: { lat: Number, lng: Number },
}, { _id: false });

const professionalSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  description: { type: String, required: true },
  email: String,
  phone: String,
  website: String,
  location: locationSchema,
  images: [String],
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false, index: true },
  active: { type: Boolean, default: true, index: true },
  socialLinks: { instagram: String, twitter: String, facebook: String },
  priceRange: { min: Number, max: Number },
  availability: [String],
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Professional = mongoose.models.Professional || mongoose.model('Professional', professionalSchema);

async function seedProfessionals() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Ensure DJ category exists
    console.log('\n📁 Creating/finding DJ category...');
    let djCategory = await Category.findOne({ slug: 'dj' });
    if (!djCategory) {
      djCategory = await Category.create({
        name: 'DJ',
        slug: 'dj',
        description: 'Professional DJs for events and parties',
        icon: '🎧',
      });
      console.log('✅ DJ category created');
    } else {
      console.log('✅ DJ category found');
    }

    // Create sample DJ profiles
    console.log('\n👤 Creating professional profiles...');

    const professionals = [
      {
        name: 'DJ Alex Turner',
        slug: 'dj-alex-turner',
        category: djCategory._id,
        description: 'High-energy DJ specializing in house and techno music. 10+ years experience in clubs and festivals.',
        email: 'alex@djservice.com',
        phone: '+1-555-0101',
        website: 'https://djAlexTurner.com',
        location: {
          city: 'New York',
          region: 'NY',
          country: 'USA',
          coordinates: { lat: 40.7128, lng: -74.0060 },
        },
        images: ['https://via.placeholder.com/400x300?text=DJ+Alex'],
        rating: 4.8,
        reviewCount: 45,
        featured: true,
        active: true,
        socialLinks: {
          instagram: '@djAlexTurner',
          twitter: '@djAlexTurner',
          facebook: 'DJ Alex Turner',
        },
        priceRange: { min: 500, max: 2000 },
        availability: ['Friday', 'Saturday', 'Sunday'],
      },
      {
        name: 'DJ Luna Rose',
        slug: 'dj-luna-rose',
        category: djCategory._id,
        description: 'Electronic and progressive music specialist. Creates immersive audio experiences for weddings and corporate events.',
        email: 'luna@djservice.com',
        phone: '+1-555-0102',
        website: 'https://djLunaRose.com',
        location: {
          city: 'Los Angeles',
          region: 'CA',
          country: 'USA',
          coordinates: { lat: 34.0522, lng: -118.2437 },
        },
        images: ['https://via.placeholder.com/400x300?text=DJ+Luna'],
        rating: 4.9,
        reviewCount: 67,
        featured: true,
        active: true,
        socialLinks: {
          instagram: '@djLunaRose',
          twitter: '@djLunaRose',
          facebook: 'DJ Luna Rose Official',
        },
        priceRange: { min: 600, max: 2500 },
        availability: ['Friday', 'Saturday'],
      },
      {
        name: 'DJ Marcus Sound',
        slug: 'dj-marcus-sound',
        category: djCategory._id,
        description: 'Hip-hop and R&B specialist. Perfect for parties, clubs, and private events.',
        email: 'marcus@djservice.com',
        phone: '+1-555-0103',
        website: 'https://djMarcusSound.com',
        location: {
          city: 'Chicago',
          region: 'IL',
          country: 'USA',
          coordinates: { lat: 41.8781, lng: -87.6298 },
        },
        images: ['https://via.placeholder.com/400x300?text=DJ+Marcus'],
        rating: 4.7,
        reviewCount: 38,
        featured: false,
        active: true,
        socialLinks: {
          instagram: '@djMarcusSound',
          twitter: '@djMarcusSound',
        },
        priceRange: { min: 400, max: 1800 },
        availability: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    ];

    // Insert or update professionals
    for (const prof of professionals) {
      const existing = await Professional.findOne({ slug: prof.slug });
      if (existing) {
        await Professional.findByIdAndUpdate(existing._id, prof);
        console.log(`✏️  Updated: ${prof.name}`);
      } else {
        await Professional.create(prof);
        console.log(`✅ Created: ${prof.name}`);
      }
    }

    console.log('\n✅ Professional profiles seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - DJ Category: ${djCategory.name}`);
    console.log(`   - Total Professionals: ${professionals.length}`);

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedProfessionals();

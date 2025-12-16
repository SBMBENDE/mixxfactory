const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load .env.local
if (!process.env.MONGODB_URI) {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    for (const line of envLines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[match[1]] = value;
      }
    }
  }
}

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  icon: String,
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

const iconUpdates = [
  { slug: 'transport-service', icon: '🚗' },
  { slug: 'tech', icon: '💻' },
];

async function updateIcons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    for (const update of iconUpdates) {
      const result = await Category.findOneAndUpdate(
        { slug: update.slug },
        { icon: update.icon },
        { new: true }
      );
      
      if (result) {
        console.log(`✓ Updated ${result.name} (${result.slug}) - Icon: ${result.icon}`);
      } else {
        console.log(`⚠️ Category not found: ${update.slug}`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✓ Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateIcons();

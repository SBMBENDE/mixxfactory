const mongoose = require('mongoose');

async function update() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Professional = mongoose.model('Professional', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

    // Check all categories
    const categories = await Category.find().lean();
    console.log('📊 Available Categories:');
    categories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));

    // Look for Tech category
    let techCategory = categories.find(c => 
      c.slug === 'tech' || 
      c.slug === 'technology' || 
      c.name.toLowerCase().includes('tech')
    );

    if (!techCategory) {
      console.log('\n⚠️  No Tech category found. Creating one...');
      techCategory = await Category.create({
        name: 'Tech',
        slug: 'tech',
        icon: '💻',
        description: 'Technology and software services'
      });
      console.log('✅ Created Tech category:', techCategory._id);
    } else {
      console.log('\n✅ Found Tech category:', techCategory.name);
    }

    // Update DIGICOREPRO
    const result = await Professional.updateOne(
      { name: 'DIGICOREPRO' },
      { $set: { category: techCategory._id } }
    );

    console.log('\n✅ Updated DIGICOREPRO to Tech category');
    console.log('  Modified:', result.modifiedCount);

    // Also update "Software Engineer" professional if it exists
    const swEngineer = await Professional.findOne({ 
      name: { $regex: /software engineer/i } 
    });
    
    if (swEngineer) {
      await Professional.updateOne(
        { _id: swEngineer._id },
        { $set: { category: techCategory._id } }
      );
      console.log('✅ Updated Software Engineer to Tech category');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

update();

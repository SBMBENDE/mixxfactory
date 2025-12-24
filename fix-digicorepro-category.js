const mongoose = require('mongoose');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Professional = mongoose.model('Professional', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

    // Find DIGICOREPRO
    const digi = await Professional.findOne({ name: 'DIGICOREPRO' });
    
    if (!digi) {
      console.log('❌ DIGICOREPRO not found');
      return;
    }

    console.log('Found DIGICOREPRO:');
    console.log('  Current category ID:', digi.category);

    // Find DJ category (we assigned it to DJ earlier)
    const djCategory = await Category.findOne({ slug: 'dj' });
    
    if (!djCategory) {
      console.log('❌ DJ category not found');
      return;
    }

    console.log('  DJ Category ID:', djCategory._id);

    // Update the professional
    await Professional.updateOne(
      { _id: digi._id },
      { $set: { category: djCategory._id } }
    );

    console.log('\n✅ Updated DIGICOREPRO category to DJ');

    // Verify
    const updated = await Professional.findById(digi._id).populate('category');
    console.log('  New category:', updated.category?.name || 'NOT POPULATED');

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fix();

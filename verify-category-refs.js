const mongoose = require('mongoose');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Use proper schemas
    const categorySchema = new mongoose.Schema({ name: String, slug: String }, { strict: false });
    const professionalSchema = new mongoose.Schema({
      name: String,
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
    }, { strict: false });

    const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
    const Professional = mongoose.models.Professional || mongoose.model('Professional', professionalSchema);

    const categories = await Category.find().lean();
    console.log(`📊 Categories in DB: ${categories.length}`);
    categories.forEach(cat => console.log(`  - ${cat.name} (${cat._id})`));

    console.log('\n📋 Checking professionals...\n');
    const professionals = await Professional.find().limit(5).lean();
    
    for (const prof of professionals) {
      const categoryExists = categories.find(c => c._id.toString() === prof.category?.toString());
      console.log(`${prof.name}:`);
      console.log(`  Category ID: ${prof.category}`);
      console.log(`  Exists: ${categoryExists ? '✅ ' + categoryExists.name : '❌ NOT FOUND'}\n`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verify();

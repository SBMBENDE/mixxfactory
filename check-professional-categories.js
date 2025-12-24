const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Professional = mongoose.model('Professional', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

    // Get a few professionals with raw data
    const professionals = await Professional.find().limit(3).lean();
    
    console.log('�� Sample Professionals (raw data):');
    professionals.forEach(prof => {
      console.log(`\n- ${prof.name}`);
      console.log(`  category field type: ${typeof prof.category}`);
      console.log(`  category value: ${prof.category}`);
    });

    // Try populate
    console.log('\n\n📋 Sample Professionals (with populate):');
    const professionalsPopulated = await Professional.find().populate('category').limit(3).lean();
    professionalsPopulated.forEach(prof => {
      console.log(`\n- ${prof.name}`);
      console.log(`  category: ${prof.category?.name || 'NOT POPULATED'}`);
    });

    // Check categories exist
    const categoryCount = await Category.countDocuments();
    console.log(`\n\n📊 Total categories in DB: ${categoryCount}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

check();

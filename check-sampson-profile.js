const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Professional = mongoose.model('Professional', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

    // Find all professionals, sorted by createdAt
    const professionals = await Professional.find().sort({ createdAt: -1 }).lean();
    
    console.log(`📋 All Professionals (${professionals.length} total):\n`);
    
    professionals.forEach((prof, index) => {
      console.log(`${index + 1}. ${prof.name}`);
      console.log(`   ID: ${prof._id}`);
      console.log(`   Slug: ${prof.slug}`);
      console.log(`   Category ID: ${prof.category}`);
      console.log(`   User ID: ${prof.userId}`);
      console.log(`   Created: ${prof.createdAt}`);
      console.log('');
    });

    // Check for "SAMPSON BONYEKI MBENDE"
    const sampsonProf = await Professional.findOne({ 
      name: { $regex: /sampson/i } 
    }).lean();

    if (sampsonProf) {
      console.log('🔍 Found SAMPSON profile:');
      console.log(JSON.stringify(sampsonProf, null, 2));
      
      // Check if category exists
      if (sampsonProf.category) {
        const cat = await Category.findById(sampsonProf.category);
        console.log(`\nCategory lookup: ${cat ? cat.name : 'NOT FOUND'}`);
      }
    }

    // Check for Digicorepro
    const digiProf = await Professional.findOne({ 
      name: { $regex: /digicor/i } 
    }).lean();

    if (digiProf) {
      console.log('\n\n🔍 Found Digicorepro profile:');
      console.log(JSON.stringify(digiProf, null, 2));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

check();

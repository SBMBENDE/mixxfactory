const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Professional = mongoose.model('Professional', new mongoose.Schema({}, { strict: false }));

    const professionals = await Professional.find().lean();
    
    console.log('📋 All Professionals Status:\n');
    
    professionals.forEach(prof => {
      const activeStatus = prof.active ? '✅ Active' : '❌ Inactive';
      const featuredStatus = prof.featured ? '⭐ Featured' : '  Not Featured';
      console.log(`${activeStatus}  ${featuredStatus}  - ${prof.name}`);
    });

    const inactiveFeatured = professionals.filter(p => p.featured && !p.active);
    if (inactiveFeatured.length > 0) {
      console.log('\n⚠️  Featured but INACTIVE professionals:');
      inactiveFeatured.forEach(p => console.log(`  - ${p.name}`));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();

const mongoose = require('mongoose');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const Professional = mongoose.model('Professional', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

    const categories = await Category.find().lean();
    const professionals = await Professional.find().lean();
    
    console.log('✅ All Professionals Status:\n');
    
    professionals.forEach(prof => {
      const categoryExists = categories.find(c => c._id.toString() === prof.category?.toString());
      const status = categoryExists ? '✅' : '❌';
      console.log(`${status} ${prof.name} → ${categoryExists ? categoryExists.name : 'NO CATEGORY'}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

verify();

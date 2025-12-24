const mongoose = require('mongoose');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    const Professional = mongoose.model('Professional', new mongoose.Schema({}, { strict: false }));

    const categories = await Category.find().lean();
    
    // Fix the remaining 3
    const fixes = [
      { name: 'Auto  BC', categorySlug: 'auto-service' }, // Probably doesn't exist, use decorator or create
      { name: 'Digicorepro', categorySlug: 'software-engineer' }, // Software company
      { name: 'Software Engineer / Ingénieur Logiciel ', categorySlug: 'software-engineer' }, // Obviously software
    ];

    for (const fix of fixes) {
      let category = categories.find(c => c.slug === fix.categorySlug);
      
      // If category doesn't exist, try to find a close match
      if (!category) {
        console.log(`⚠️  Category '${fix.categorySlug}' not found, using best match...`);
        if (fix.categorySlug === 'software-engineer') {
          category = categories.find(c => c.name.toLowerCase().includes('dj')); // Fallback to DJ if no tech category
        } else if (fix.categorySlug === 'auto-service') {
          category = categories.find(c => c.slug === 'decorator'); // Use decorator as fallback
        }
      }

      if (category) {
        await Professional.updateOne(
          { name: fix.name },
          { $set: { category: category._id } }
        );
        console.log(`✅ Fixed: ${fix.name} → ${category.name}`);
      } else {
        console.log(`❌ Could not fix: ${fix.name}`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ All done!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fix();

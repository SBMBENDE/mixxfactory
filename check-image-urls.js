const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Professional = mongoose.model('Professional', new mongoose.Schema({}, { strict: false }));

    const professionals = await Professional.find().lean();
    
    console.log('📸 Image Check for All Professionals:\n');
    
    professionals.forEach(prof => {
      console.log(`\n${prof.name}:`);
      console.log(`  Featured: ${prof.featured ? '⭐ YES' : '  No'}`);
      console.log(`  Active: ${prof.active ? '✅ YES' : '❌ NO'}`);
      
      if (prof.images && prof.images.length > 0) {
        console.log(`  Images: ${prof.images.length} found`);
        prof.images.forEach((img, idx) => {
          const imgType = img.startsWith('data:') ? '⚠️  BASE64 (inline)' : 
                         img.startsWith('http') ? '✅ URL' : 
                         img.startsWith('/') ? '📁 Local path' : '❓ Unknown';
          const preview = img.length > 80 ? img.substring(0, 80) + '...' : img;
          console.log(`    [${idx + 1}] ${imgType}: ${preview}`);
        });
      } else {
        console.log(`  Images: ❌ None`);
      }
    });

    const base64Images = professionals.filter(p => 
      p.images && p.images.some(img => img.startsWith('data:'))
    );
    
    if (base64Images.length > 0) {
      console.log('\n\n⚠️  PROFESSIONALS WITH BASE64 IMAGES:');
      base64Images.forEach(p => console.log(`  - ${p.name} (${p.images.filter(i => i.startsWith('data:')).length} base64 images)`));
      console.log('\n💡 Base64 images may cause display issues and should be converted to URLs');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '/Users/sampsonmbende/Documents/mixxfactory/.env.local' });

async function test() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('mixxfactory');
    
    // Check if restaurant category exists
    const restaurantCat = await db.collection('categories').findOne({ slug: 'restaurant' });
    console.log('Restaurant category:', restaurantCat);
    
    if (restaurantCat) {
      // Check if any professionals link to this category
      const restaurantProfs = await db.collection('professionals')
        .find({ category: restaurantCat._id })
        .toArray();
      
      console.log(`\nProfessionals in restaurant category (${restaurantCat._id}):`, restaurantProfs.length);
      restaurantProfs.forEach(prof => {
        console.log(`  - ${prof.name}`);
      });
    }
    
    // List all categories and their professional counts
    console.log('\n\nAll categories and their professional counts:');
    const categories = await db.collection('categories').find({}).toArray();
    for (const cat of categories) {
      const count = await db.collection('professionals').countDocuments({ category: cat._id });
      console.log(`  - ${cat.name} (${cat.slug}): ${count} professionals`);
    }
    
  } finally {
    await client.close();
  }
}

test().catch(console.error);

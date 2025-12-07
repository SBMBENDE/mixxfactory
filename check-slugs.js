const { MongoClient } = require('mongodb');

async function checkSlugs() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('mixxfactory');
    
    // Get all categories
    const categories = await db.collection('categories').find({}).toArray();
    console.log('\n📚 Categories in DB:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (slug: "${cat.slug}")`);
    });
    
    // Get all professionals with their categories
    const professionals = await db.collection('professionals')
      .aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails'
          }
        }
      ])
      .toArray();
    
    console.log('\n👥 Professionals in DB:');
    professionals.forEach(prof => {
      const catName = prof.categoryDetails[0]?.name || 'Unknown';
      const catSlug = prof.categoryDetails[0]?.slug || 'unknown';
      console.log(`  - ${prof.name} (category: ${catName}, slug: ${catSlug})`);
    });
    
  } finally {
    await client.close();
  }
}

checkSlugs();

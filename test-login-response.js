const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Find your user
    const user = await User.findOne({ email: 'sam@digicorepro.com' }).lean();
    
    if (user) {
      console.log('👤 User found:', user.email);
      console.log('📊 accountType:', user.accountType);
      console.log('🔑 role:', user.role);
      console.log('\n🔍 What the API would return:');
      console.log({
        userId: user._id.toString(),
        email: user.email,
        role: user.accountType, // This is what gets returned as "role"
        accountType: user.accountType
      });
    } else {
      console.log('❌ User not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();

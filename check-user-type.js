const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Professional = mongoose.model('Professional', new mongoose.Schema({}, { strict: false }));

    const users = await User.find().lean();
    const professionals = await Professional.find().lean();

    console.log('👥 All Users:\n');
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`  Account Type: ${user.accountType || 'NOT SET'}`);
      console.log(`  Role: ${user.role || 'NOT SET'}`);
      console.log(`  ID: ${user._id}\n`);
    });

    console.log('\n💼 Professionals with User Links:\n');
    professionals.forEach(prof => {
      console.log(`Professional: ${prof.name}`);
      console.log(`  userId: ${prof.userId || 'NOT LINKED'}`);
      console.log(`  ID: ${prof._id}\n`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();

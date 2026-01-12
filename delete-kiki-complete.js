const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const email = 'kiki@vanmulangoservices.com';
  
  // Find user
  const user = await mongoose.connection.collection('users').findOne({ email });
  
  if (!user) {
    console.log('User not found');
    await mongoose.disconnect();
    process.exit(0);
  }
  
  const userId = user._id;
  console.log('Found user:', userId.toString());
  
  // Delete professional profile
  const profResult = await mongoose.connection.collection('professionals').deleteMany({ userId });
  console.log('Deleted professionals:', profResult.deletedCount);
  
  // Delete payments
  const paymentResult = await mongoose.connection.collection('payments').deleteMany({ userId });
  console.log('Deleted payments:', paymentResult.deletedCount);
  
  // Delete reviews
  const reviewResult = await mongoose.connection.collection('reviews').deleteMany({ userId });
  console.log('Deleted reviews:', reviewResult.deletedCount);
  
  // Delete inquiries
  const inquiryResult = await mongoose.connection.collection('inquiries').deleteMany({ userId });
  console.log('Deleted inquiries:', inquiryResult.deletedCount);
  
  // Delete analytics
  const analyticsResult = await mongoose.connection.collection('analytics').deleteMany({ userId });
  console.log('Deleted analytics:', analyticsResult.deletedCount);
  
  // Delete user
  const userResult = await mongoose.connection.collection('users').deleteOne({ _id: userId });
  console.log('Deleted user:', userResult.deletedCount);
  
  console.log('\n✅ User completely deleted from database');
  
  await mongoose.disconnect();
  process.exit(0);
})();

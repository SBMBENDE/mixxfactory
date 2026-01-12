const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Find the user
    const user = await mongoose.connection.collection('users').findOne({ email: 'kiki@vanmulangoservices.com' });
    
    if (user) {
      console.log('User Record:');
      console.log('  Email:', user.email);
      console.log('  subscriptionTier:', user.subscriptionTier);
      console.log('  paymentStatus:', user.paymentStatus);
      
      // Find professional
      const professional = await mongoose.connection.collection('professionals').findOne({ userId: user._id });
      
      if (professional) {
        console.log('\nProfessional Record:');
        console.log('  Name:', professional.name);
        console.log('  subscriptionTier:', professional.subscriptionTier);
        console.log('  paymentStatus:', professional.paymentStatus);
      }
      
      // Find payments
      const payments = await mongoose.connection.collection('payments').find({ userId: user._id }).toArray();
      console.log('\nPayment Records:', payments.length);
      payments.forEach((p, idx) => {
        console.log(`\nPayment ${idx + 1}:`);
        console.log('  Amount:', p.amount);
        console.log('  Status:', p.status);
        console.log('  Tier:', p.subscriptionTier);
        console.log('  Provider:', p.provider);
        console.log('  Provider Payment ID:', p.providerPaymentId);
        console.log('  Created:', p.createdAt);
      });
    } else {
      console.log('User not found');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();

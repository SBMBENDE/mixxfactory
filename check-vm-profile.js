const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await mongoose.connection.collection('users').findOne({ email: 'kiki@vanmulangoservices.com' });
  
  if (!user) {
    console.log('User not found!');
    process.exit(0);
  }
  
  console.log('User ID:', user._id.toString());
  console.log('Subscription Tier:', user.subscriptionTier);
  console.log('Professional ID:', user.professionalId?.toString() || 'NONE');
  
  if (user.professionalId) {
    const prof = await mongoose.connection.collection('professionals').findOne({ _id: user.professionalId });
    console.log('\nProfessional found:', prof ? 'Yes' : 'No');
    if (prof) {
      console.log('Professional Name:', prof.name);
      console.log('Professional Tier:', prof.subscriptionTier);
      console.log('Professional Active:', prof.active);
    }
  } else {
    console.log('\n⚠️ NO PROFESSIONAL PROFILE - This is the issue!');
    console.log('Payment creation requires a professional profile to exist first.');
  }
  
  await mongoose.disconnect();
  process.exit(0);
})();

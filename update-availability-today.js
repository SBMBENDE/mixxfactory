// update-availability-today.js
// Usage: node update-availability-today.js
// Updates today's availability for specified professionals to true

const mongoose = require('mongoose');
const { ProfessionalModel } = require('./lib/db/models');

const MONGODB_URI = process.env.MONGODB_URI || 'YOUR_MONGODB_URI_HERE';

const emails = [
  'info@digicorepro.com',
  'chefsuzypassion@gmail.com',
];

const today = new Date().toISOString().split('T')[0];

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  for (const email of emails) {
    const result = await ProfessionalModel.updateOne(
      { email },
      { $set: { [`availability.${today}`]: true } }
    );
    console.log(`Updated ${email}:`, result.modifiedCount ? 'Success' : 'Not found or already set');
  }
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

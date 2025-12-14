const mongoose = require('mongoose');

const uri = "mongodb+srv://MixxFactoryAdmin:Azerty123456@mixxfactory.jmifjk7.mongodb.net/mixxfactory?retryWrites=true&w=majority";

mongoose.connect(uri).then(async () => {
  const userCol = mongoose.connection.collection('users');
  const users = await userCol.find({}).toArray();
  console.log('✓ Users in DB:', users.length);
  if (users.length > 0) console.log('  Sample:', users[0].email || 'no email');
  
  const profCol = mongoose.connection.collection('professionals');
  const profs = await profCol.find({}).toArray();
  console.log('✓ Professionals in DB:', profs.length);
  profs.forEach(p => console.log('  -', p.name));
  
  process.exit(0);
}).catch(err => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});

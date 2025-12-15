const mongoose = require('mongoose')

const uri = process.env.MONGODB_URI

if (!uri) {
  console.error('MONGODB_URI environment variable is not set')
  process.exit(1)
}

mongoose
  .connect(uri)
  .then(async () => {
    const userCol = mongoose.connection.collection('users')
    const users = await userCol.find({}).toArray()
    console.log('✓ Users in DB:', users.length)
    if (users.length > 0) console.log('  Sample:', users[0].email || 'no email')

    const profCol = mongoose.connection.collection('professionals')
    const profs = await profCol.find({}).toArray()
    console.log('✓ Professionals in DB:', profs.length)
    profs.forEach((p) => console.log('  -', p.name))

    process.exit(0)
  })
  .catch((err) => {
    console.error('✗ Error:', err.message)
    process.exit(1)
  })

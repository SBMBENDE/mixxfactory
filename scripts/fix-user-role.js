// Usage: node scripts/fix-user-role.js <email> <role>
// Example: node scripts/fix-user-role.js sam@digicorepro.com professional

const mongoose = require('mongoose')

async function main() {
  const [, , email, role] = process.argv
  if (!email || !role) {
    console.error('Usage: node scripts/fix-user-role.js <email> <role>')
    process.exit(1)
  }
  await mongoose.connect(process.env.MONGODB_URI)
  const User = mongoose.model(
    'User',
    new mongoose.Schema({}, { strict: false })
  )
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { accountType: role, role } },
    { new: true }
  )
  if (user) {
    console.log(`✅ Updated user ${email} to role: ${role}`)
  } else {
    console.log(`❌ User not found: ${email}`)
  }
  await mongoose.disconnect()
}

main()

import mongoose from 'mongoose';
import { UserModel, ProfessionalModel } from '@/lib/db/models';

export async function upgradeUser({
  userId,
  email,
  tier,
}: {
  userId?: string;
  email?: string;
  tier: 'starter' | 'pro';
}) {
  let user = null;
  console.log('[upgradeUser] Called with:', { userId, email, tier });

  if (userId) {
    user = await UserModel.findById(userId);
    console.log('[upgradeUser] User lookup by userId:', user ? user._id : null);
  }

  if (!user && email) {
    user = await UserModel.findOne({ email });
    console.log('[upgradeUser] User lookup by email:', user ? user._id : null);
  }

  if (!user) {
    console.error('[upgradeUser] User not found for upgrade', { userId, email });
    throw new Error('User not found for upgrade');
  }

  const userUpdate = await UserModel.updateOne(
    { _id: user._id },
    { subscriptionTier: tier }
  );
  console.log('[upgradeUser] User update result:', userUpdate);

  const profUpdate = await ProfessionalModel.updateOne(
    { userId: user._id },
    { subscriptionTier: tier }
  );
  console.log('[upgradeUser] Professional update result:', profUpdate);

  return user._id;
}

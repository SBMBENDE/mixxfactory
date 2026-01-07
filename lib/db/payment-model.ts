/**
 * Payment Model
 * MongoDB schema for payment tracking
 */

import mongoose, { Schema, Model } from 'mongoose';
import { Payment } from '@/types/payment';

const PaymentSchema = new Schema<Payment>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    professionalId: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'],
      required: true,
      default: 'pending',
      index: true,
    },
    provider: {
      type: String,
      enum: ['stripe', 'paypal'],
      required: true,
      index: true,
    },
    providerPaymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    providerCustomerId: {
      type: String,
      index: true,
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'starter', 'pro'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    failureReason: {
      type: String,
    },
    refundReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ professionalId: 1, status: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

// Delete cached model to prevent enum issues
if (mongoose.models.Payment) {
  delete mongoose.models.Payment;
}

// Create fresh model with updated schema
const PaymentModel: Model<Payment> = mongoose.model<Payment>('Payment', PaymentSchema);

export default PaymentModel;

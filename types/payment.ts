/**
 * Payment System Types
 * Defines types for Stripe and PayPal payment processing
 */

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded';

export type PaymentProvider = 'stripe' | 'paypal';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  clientSecret?: string;
  metadata?: Record<string, string>;
}

export interface Payment {
  _id: string;
  userId: string;
  professionalId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerPaymentId: string;
  providerCustomerId?: string;
  subscriptionTier: SubscriptionTier;
  description: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  provider: PaymentProvider;
  subscriptionTier: SubscriptionTier;
  professionalId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentWebhookEvent {
  provider: PaymentProvider;
  eventType: string;
  paymentId: string;
  status: PaymentStatus;
  data: any;
}

export interface SubscriptionPricing {
  id: string; // same as tier, for backwards compatibility
  tier: SubscriptionTier;
  name: string;
  price: number; // monthly price
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  stripePriceId?: string;
  paypalPlanId?: string;
}

export const SUBSCRIPTION_PRICING: SubscriptionPricing[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    price: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['Basic profile', '1 image', 'Listed in directory'],
  },
  {
    id: 'basic',
    tier: 'basic',
    name: 'Basic',
    price: 9.99,
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: ['Enhanced profile', '5 images', 'Featured badge', 'Contact info'],
  },
  {
    id: 'premium',
    tier: 'premium',
    name: 'Premium',
    price: 19.99,
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    features: ['Premium profile', 'Unlimited images', 'Top placement', 'Analytics', 'Priority support'],
  },
  {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    monthlyPrice: 49.99,
    yearlyPrice: 499.99,
    features: ['Custom branding', 'API access', 'Dedicated support', 'Advanced analytics', 'Multiple locations'],
  },
];

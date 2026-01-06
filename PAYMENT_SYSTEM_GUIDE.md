# Payment System Documentation

## Overview
Secure, production-ready payment system with Stripe and PayPal integration. Supports subscription upgrades, payment tracking, webhook handling, and comprehensive error management.

## Features
- ✅ Dual payment providers (Stripe & PayPal)
- ✅ Subscription tier management (Free, Basic, Premium, Enterprise)
- ✅ Secure payment intent creation
- ✅ Webhook handlers for async payment confirmation
- ✅ Payment history tracking
- ✅ Automatic user subscription upgrades
- ✅ Refund handling
- ✅ Comprehensive error handling and logging

## Architecture

### Database Model
**Payment Schema** (`/lib/db/payment-model.ts`)
- userId: Reference to user making payment
- amount: Payment amount in cents
- currency: Currency code (USD)
- status: pending | succeeded | failed | canceled | refunded
- provider: stripe | paypal
- providerPaymentId: Provider's payment/order ID
- subscriptionTier: Target subscription tier
- Timestamps: createdAt, updatedAt
- Indexes: userId, professionalId, status, providerPaymentId

### API Routes

#### 1. Create Payment Intent
**POST** `/api/payment/create-intent`
- Creates Stripe payment intent or PayPal order
- Requires authentication
- Creates/retrieves Stripe customer
- Stores payment record in database

Request:
```json
{
  "subscriptionTier": "basic" | "premium" | "enterprise",
  "provider": "stripe" | "paypal"
}
```

Response (Stripe):
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentId": "payment_id"
}
```

Response (PayPal):
```json
{
  "success": true,
  "orderId": "paypal_order_id",
  "paymentId": "payment_id"
}
```

#### 2. Confirm Payment
**POST** `/api/payment/confirm`
- Confirms PayPal payment (Stripe auto-confirms)
- Upgrades user subscription tier
- Updates payment status

Request:
```json
{
  "provider": "paypal",
  "orderId": "paypal_order_id"
}
```

Response:
```json
{
  "success": true,
  "message": "Payment confirmed and subscription upgraded",
  "payment": { ... }
}
```

#### 3. Payment History
**GET** `/api/payment/history`
- Returns user's payment history
- Requires authentication
- Sorted by most recent

Response:
```json
{
  "success": true,
  "payments": [
    {
      "_id": "xxx",
      "amount": 999,
      "currency": "usd",
      "status": "succeeded",
      "provider": "stripe",
      "subscriptionTier": "basic",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 4. Stripe Webhook
**POST** `/api/webhooks/stripe`
- Handles Stripe webhook events
- Verifies webhook signature
- Updates payment status
- Upgrades/downgrades user subscriptions

Handled Events:
- `payment_intent.succeeded`: Mark payment as succeeded, upgrade user
- `payment_intent.payment_failed`: Mark payment as failed
- `payment_intent.canceled`: Mark payment as canceled
- `charge.refunded`: Mark payment as refunded, downgrade user

#### 5. PayPal Webhook
**POST** `/api/webhooks/paypal`
- Handles PayPal webhook events
- Verifies webhook signature
- Updates payment status
- Upgrades/downgrades user subscriptions

Handled Events:
- `PAYMENT.CAPTURE.COMPLETED`: Mark payment as succeeded, upgrade user
- `PAYMENT.CAPTURE.DENIED/DECLINED`: Mark payment as failed
- `PAYMENT.CAPTURE.REFUNDED`: Mark payment as refunded, downgrade user

### UI Components

#### 1. Checkout Page
**Route:** `/checkout`
- Displays subscription tiers with pricing
- Allows tier selection
- Payment provider selection (Stripe/PayPal)

#### 2. Payment Process Page
**Route:** `/payment/process?tier=X&provider=Y`
- Creates payment intent
- Renders Stripe Elements or PayPal buttons
- Handles payment submission
- Redirects to success page

#### 3. Payment Success Page
**Route:** `/payment/success`
- Displays success message with confetti animation
- Shows next steps
- Links to dashboard

#### 4. Payment History Page
**Route:** `/payment/history`
- Lists all user payments
- Shows payment status, amount, date
- Displays failure reasons if applicable

## Setup Instructions

### 1. Environment Variables
Add to `.env.local`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
PAYPAL_MODE=sandbox  # or 'live' for production
```

### 2. Stripe Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API keys from **Developers > API keys**
3. Create webhook endpoint at **Developers > Webhooks**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, `charge.refunded`
4. Copy webhook signing secret

### 3. PayPal Setup
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create REST API app
3. Get Client ID and Secret
4. Create webhook at **Webhooks**
   - URL: `https://yourdomain.com/api/webhooks/paypal`
   - Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.DECLINED`, `PAYMENT.CAPTURE.REFUNDED`
5. Copy webhook ID

### 4. Install Dependencies
```bash
npm install stripe @stripe/react-stripe-js @stripe/stripe-js
npm install @paypal/checkout-server-sdk @paypal/react-paypal-js
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

### 5. Update User Model
Add `subscriptionTier` field to User model in `/lib/db/models.ts`:
```typescript
subscriptionTier: {
  type: String,
  enum: ['free', 'basic', 'premium', 'enterprise'],
  default: 'free'
}
```

## Subscription Pricing

| Tier       | Price/Month | Features                                      |
|------------|-------------|-----------------------------------------------|
| Free       | $0          | Basic access, Limited features                |
| Basic      | $9.99       | Enhanced profile, Priority support            |
| Premium    | $19.99      | All Basic + Analytics, Featured listing       |
| Enterprise | $49.99      | All Premium + API access, Dedicated support   |

## Testing

### Test Cards (Stripe)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

### PayPal Sandbox
1. Create sandbox accounts at [PayPal Sandbox](https://developer.paypal.com/dashboard/accounts)
2. Use sandbox buyer account for testing

## Security Features
- ✅ Webhook signature verification (Stripe & PayPal)
- ✅ JWT authentication on all payment routes
- ✅ Input validation with Zod schemas
- ✅ Secure payment intent creation
- ✅ PCI compliance (handled by providers)
- ✅ HTTPS required in production
- ✅ Error logging without exposing sensitive data

## Error Handling
- Network failures: Automatic retry logic in webhooks
- Payment failures: Captured in database with failure reason
- Invalid webhooks: Rejected with 400 status
- Authentication errors: 401 Unauthorized response
- Server errors: Logged and returned with 500 status

## Monitoring & Logging
All payment operations log to console:
- `[Payment Intent]` - Payment creation logs
- `[Payment Confirm]` - Payment confirmation logs
- `[Stripe Webhook]` - Stripe webhook event logs
- `[PayPal Webhook]` - PayPal webhook event logs

## Production Checklist
- [ ] Switch to live Stripe API keys
- [ ] Switch PayPal mode to 'live'
- [ ] Configure production webhook URLs
- [ ] Enable HTTPS
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure email notifications for failed payments
- [ ] Test webhook delivery
- [ ] Set up payment analytics
- [ ] Configure automatic refund policies
- [ ] Add payment receipt emails

## Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is publicly accessible
2. Verify webhook secret is correct
3. Check webhook event selection
4. Test with provider's webhook testing tool

### Payment Fails Immediately
1. Verify API keys are correct
2. Check test card numbers
3. Ensure amount is >= minimum (usually $0.50)
4. Check provider dashboard for errors

### User Not Upgraded After Payment
1. Check webhook is receiving events
2. Verify payment status in database
3. Check user model has subscriptionTier field
4. Review webhook handler logs

## Future Enhancements
- [ ] Recurring subscriptions
- [ ] Automatic billing cycles
- [ ] Payment method management
- [ ] Invoice generation
- [ ] Tax calculation
- [ ] Multi-currency support
- [ ] Discount codes/coupons
- [ ] Payment analytics dashboard
- [ ] Automatic dunning for failed payments
- [ ] Upgrade/downgrade proration

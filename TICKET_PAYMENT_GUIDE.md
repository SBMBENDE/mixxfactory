# Event Ticket Payment Infrastructure

## Overview
Complete Stripe Connect integration for event ticketing with automatic revenue splitting between Afrobizz platform and event promoters.

## Revenue Model
- **Basic Events**: 5% platform fee (95% to promoter)
- **Premium/Featured Events**: 3% platform fee (97% to promoter)
- Event promotion fees (€4.99 basic, €19.99 premium) are separate from ticketing fees

## Architecture

### Database Schema Updates

#### Event Model (`lib/db/models.ts`)
Added three new fields to the Event schema:

```typescript
stripeConnectedAccountId: String // Promoter's Stripe Connect account ID
ticketingEnabled: Boolean        // True when account is verified and ready
ticketingCommissionRate: Number  // Default 5%, 3% for premium events
```

### API Routes

#### 1. Stripe Connect Onboarding
**Endpoint**: `POST /api/stripe/connect/onboard`

Creates or retrieves Stripe Connect Express account for event promoters.

**Request Body**:
```json
{
  "eventId": "string",
  "returnUrl": "string (optional)",
  "refreshUrl": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://connect.stripe.com/...",
    "accountId": "acct_xxx",
    "expiresAt": 1234567890,
    "message": "Stripe Connect onboarding link created successfully"
  }
}
```

**Features**:
- Creates Stripe Express account on first call
- Stores account ID in event document
- Generates onboarding link for KYC verification
- Links account to specific event and user

#### 2. Account Status Check
**Endpoint**: `GET /api/stripe/connect/status?eventId={id}`

Checks verification status of connected account.

**Response**:
```json
{
  "success": true,
  "data": {
    "connected": true,
    "chargesEnabled": true,
    "payoutsEnabled": true,
    "detailsSubmitted": true,
    "accountId": "acct_xxx",
    "requirements": {
      "currentlyDue": [],
      "pastDue": [],
      "pendingVerification": []
    },
    "message": "Your account is fully connected and ready to receive payments"
  }
}
```

**Features**:
- Verifies account capabilities (charges_enabled, payouts_enabled)
- Auto-updates `ticketingEnabled` when account is ready
- Returns outstanding verification requirements

#### 3. Ticket Checkout
**Endpoint**: `POST /api/stripe/tickets/checkout`

Creates Stripe Checkout session with automatic revenue splitting.

**Request Body**:
```json
{
  "eventId": "string",
  "ticketType": "string",
  "quantity": 1-20,
  "customerEmail": "email@example.com",
  "customerName": "Full Name"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_xxx",
    "url": "https://checkout.stripe.com/...",
    "totalAmount": 50.00,
    "commissionAmount": 2.50,
    "netAmount": 47.50,
    "commissionRate": 5,
    "message": "Checkout session created successfully"
  }
}
```

**Revenue Splitting Logic**:
```javascript
// Determine commission rate based on promotion tier
let commissionRate = event.ticketingCommissionRate || 5; // Default 5%

if (event.promotionTier === 'featured' || event.promotionTier === 'boost') {
  commissionRate = 3; // Premium events get 3% rate
}

const commissionAmount = totalTicketAmount * (commissionRate / 100);
const netAmount = totalTicketAmount - commissionAmount;

// Create Stripe Checkout with destination charges
payment_intent_data: {
  application_fee_amount: commissionAmount, // Platform fee
  transfer_data: {
    destination: event.stripeConnectedAccountId // Promoter receives net
  }
}
```

**Features**:
- Validates ticket availability and event capacity
- Automatic commission calculation based on tier
- Destination charges pattern for instant split
- Metadata tracking for analytics
- Secure Stripe Checkout UI

#### 4. Webhook Handler
**Endpoint**: `POST /api/stripe/webhooks/connect`

Handles Stripe webhook events for ticket sales and account updates.

**Supported Events**:

1. **checkout.session.completed**
   - Updates event attendee count
   - Decrements ticket quantity
   - Logs successful purchase

2. **payment_intent.succeeded**
   - Confirms payment processed
   - Analytics tracking

3. **account.updated**
   - Updates `ticketingEnabled` when account verified
   - Syncs account capabilities with event settings

4. **charge.refunded**
   - Restores attendee count
   - Restores ticket inventory
   - Handles refund accounting

**Security**:
- Signature verification with webhook secret
- Idempotent event handling
- Error logging and recovery

### Frontend Components

#### 1. TicketCheckoutModal (`components/TicketCheckoutModal.tsx`)
Modal component for ticket selection and checkout initiation.

**Features**:
- Ticket type selection with pricing
- Quantity selector with max limits
- Customer name and email collection
- Real-time total calculation
- Loading states and error handling
- Disables checkout if `ticketingEnabled` is false

**Usage**:
```tsx
<TicketCheckoutModal
  eventId={event._id}
  eventTitle={event.title}
  tickets={event.ticketing}
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  ticketingEnabled={event.ticketingEnabled}
/>
```

#### 2. StripeConnectStatus (`components/StripeConnectStatus.tsx`)
Status indicator for promoters to see their account verification status.

**States**:
- **Not Connected**: Shows "Connect Stripe Account" button
- **Incomplete**: Shows warning with missing requirements
- **Active**: Shows success message with account ID

**Features**:
- Auto-refresh status
- One-click onboarding redirect
- Visual status indicators
- Requirement tracking

**Usage**:
```tsx
<StripeConnectStatus eventId={event._id} />
```

### User Flow

#### Promoter Setup Flow
1. **Create Event**: Promoter creates event with ticketing options
2. **Connect Account**: Click "Connect Stripe Account" button
3. **Stripe Onboarding**: Redirected to Stripe Express onboarding
4. **KYC Verification**: Completes identity and bank verification
5. **Account Ready**: Returns to platform, `ticketingEnabled` set to true
6. **Sell Tickets**: Buy button becomes active for customers

#### Customer Purchase Flow
1. **Browse Events**: Customer finds event on events page
2. **View Details**: Clicks on event to see full information
3. **Buy Tickets**: Clicks "Buy Tickets" button
4. **Select Options**: Choose ticket type, quantity, enter details
5. **Checkout**: Redirected to Stripe Checkout
6. **Payment**: Completes payment with card
7. **Confirmation**: Redirected to success page, receives email
8. **Automatic Split**: Promoter receives 95-97%, platform receives 3-5%

### Setup Instructions

#### 1. Environment Variables
Add to `.env.local`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### 2. Stripe Dashboard Setup

**Create Connect Platform**:
1. Go to Stripe Dashboard → Connect
2. Enable "Express" account type
3. Configure branding (logo, colors)
4. Set up webhook endpoint: `https://your-domain.com/api/stripe/webhooks/connect`
5. Subscribe to events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `account.updated`
   - `charge.refunded`
6. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

**Platform Settings**:
- Set platform fee percentage
- Configure payout schedule (default: daily)
- Enable auto-payouts to connected accounts

#### 3. Testing

**Test Cards**:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0027 6000 3184`

**Test Flow**:
1. Create test event with tickets
2. Use test Stripe account for onboarding
3. Purchase tickets with test cards
4. Verify webhook events received
5. Check balances in Stripe Dashboard

### Security Considerations

1. **Authentication**:
   - All Connect API routes require JWT authentication
   - Event ownership verified before operations

2. **Webhook Security**:
   - Signature verification on all webhook events
   - Idempotent processing with metadata tracking

3. **Data Validation**:
   - Zod schemas for all inputs
   - Capacity and availability checks
   - XSS protection on user inputs

4. **PCI Compliance**:
   - No card data stored locally
   - All payments through Stripe Checkout
   - Secure iframe embedding

### Monitoring & Analytics

**Key Metrics to Track**:
- Ticket sales volume per event
- Average commission per transaction
- Connected account activation rate
- Refund rate
- Checkout abandonment rate

**Stripe Dashboard Analytics**:
- View in Stripe Dashboard → Connect → Overview
- Per-account transaction history
- Fee collection tracking
- Payout status monitoring

### Troubleshooting

**Common Issues**:

1. **"Ticketing not enabled"**:
   - Check `stripeConnectedAccountId` exists
   - Verify account has `charges_enabled` and `payouts_enabled`
   - Complete missing verification requirements

2. **"Account not found"**:
   - Ensure connected account created successfully
   - Check account ID matches in database
   - Verify account not deleted in Stripe

3. **Webhook not firing**:
   - Verify webhook endpoint is publicly accessible
   - Check webhook secret matches
   - Review Stripe Dashboard webhook logs
   - Ensure HTTPS in production

4. **Payment not splitting**:
   - Verify `application_fee_amount` calculated correctly
   - Check `destination` account has payouts enabled
   - Review Stripe Dashboard balance transactions

### Future Enhancements

1. **Email Notifications**:
   - Send ticket confirmation emails via SendGrid
   - QR code generation for tickets
   - Reminder emails before event

2. **Refund Management**:
   - Admin UI for processing refunds
   - Automated refund policies
   - Partial refund support

3. **Analytics Dashboard**:
   - Sales tracking per event
   - Revenue reporting
   - Payout history

4. **Advanced Features**:
   - Early bird pricing
   - Discount codes
   - Group ticket bundles
   - Reserved seating

### Support Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Express Accounts](https://stripe.com/docs/connect/express-accounts)
- [Destination Charges](https://stripe.com/docs/connect/destination-charges)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

## Summary

The event ticket payment infrastructure is now complete with:
- ✅ Stripe Connect integration for promoters
- ✅ Automatic revenue splitting (5% basic, 3% premium)
- ✅ Secure checkout flow with Stripe Checkout
- ✅ Webhook handling for inventory management
- ✅ Status tracking for connected accounts
- ✅ User-friendly UI components

Event promoters can now receive payments directly while Afrobizz automatically collects platform fees based on event tier.

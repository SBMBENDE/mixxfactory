/**
 * PayPal Payment Configuration and Utilities
 * Secure server-side PayPal integration
 */

import paypal from '@paypal/checkout-server-sdk';

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required in environment variables');
}

// Configure PayPal environment (sandbox or live)
const environment = process.env.NODE_ENV === 'production'
  ? new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    )
  : new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );

// Initialize PayPal client
export const paypalClient = new paypal.core.PayPalHttpClient(environment);

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(params: {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<any> {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: params.currency?.toUpperCase() || 'USD',
            value: params.amount.toFixed(2),
          },
          description: params.description || 'MixxFactory Subscription',
          custom_id: JSON.stringify(params.metadata || {}),
        },
      ],
      application_context: {
        brand_name: 'MixxFactory',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      },
    });

    const response = await paypalClient.execute(request);
    return response.result;
  } catch (error: any) {
    console.error('[PayPal] Order creation failed:', error);
    throw new Error(`PayPal order creation failed: ${error.message}`);
  }
}

/**
 * Capture a PayPal order
 */
export async function capturePayPalOrder(orderId: string): Promise<any> {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await paypalClient.execute(request);
    return response.result;
  } catch (error: any) {
    console.error('[PayPal] Order capture failed:', error);
    throw new Error(`PayPal order capture failed: ${error.message}`);
  }
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrder(orderId: string): Promise<any> {
  try {
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const response = await paypalClient.execute(request);
    return response.result;
  } catch (error: any) {
    console.error('[PayPal] Order retrieval failed:', error);
    throw new Error(`PayPal order retrieval failed: ${error.message}`);
  }
}

/**
 * Refund a PayPal captured payment
 */
export async function refundPayPalPayment(params: {
  captureId: string;
  amount?: number;
  currency?: string;
  note?: string;
}): Promise<any> {
  try {
    const request = new paypal.payments.CapturesRefundRequest(params.captureId);
    
    const requestBody: any = {};
    if (params.amount) {
      requestBody.amount = {
        value: params.amount.toFixed(2),
        currency_code: params.currency?.toUpperCase() || 'USD',
      };
    }
    if (params.note) {
      requestBody.note_to_payer = params.note;
    }

    request.requestBody(requestBody);
    const response = await paypalClient.execute(request);
    return response.result;
  } catch (error: any) {
    console.error('[PayPal] Refund failed:', error);
    throw new Error(`PayPal refund failed: ${error.message}`);
  }
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhook(params: {
  webhookId: string;
  headers: Record<string, string>;
  body: any;
}): Promise<boolean> {
  try {
    const request = new paypal.notifications.VerifyWebhookSignature();
    request.requestBody({
      transmission_id: params.headers['paypal-transmission-id'],
      transmission_time: params.headers['paypal-transmission-time'],
      cert_url: params.headers['paypal-cert-url'],
      auth_algo: params.headers['paypal-auth-algo'],
      transmission_sig: params.headers['paypal-transmission-sig'],
      webhook_id: params.webhookId,
      webhook_event: params.body,
    });

    const response = await paypalClient.execute(request);
    return response.result.verification_status === 'SUCCESS';
  } catch (error: any) {
    console.error('[PayPal] Webhook verification failed:', error);
    return false;
  }
}

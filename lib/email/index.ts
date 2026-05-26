/**
 * Email sending functions - uses SendGrid service
 * Re-exports common email functions for easy access
 */

export { sendEmail } from './sendgrid';
export { getVerificationEmailHTML } from './sendgrid';

import { sendEmail } from './sendgrid';

/**
 * Send welcome email to new professional
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #667eea; font-size: 16px; margin-top: 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          ul { margin: 10px 0; padding-left: 20px; }
          li { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Afrobizz! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            
            <p>Thank you for joining Afrobizz! We're excited to have you as a professional in our community.</p>
            
            <div class="section">
              <h2>Getting Started</h2>
              <p>Here are the next steps to make the most of your profile:</p>
              <ul>
                <li><strong>Complete Your Profile</strong> - Add a professional photo, description, and pricing</li>
                <li><strong>Upload Portfolio</strong> - Showcase your best work with gallery images</li>
                <li><strong>Set Your Availability</strong> - Let customers know when you're available</li>
                <li><strong>Request Verification</strong> - Get verified to build trust with customers</li>
              </ul>
            </div>
            
            <div class="section">
              <h2>Need Help?</h2>
              <p>Check out our help center or contact our support team at support@afrobizz.com</p>
            </div>
            
            <div class="section">
              <p>Best regards,<br>The Afrobizz Team</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 Afrobizz. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Afrobizz! 🎉',
    html,
  });
}

/**
 * Send newsletter confirmation email
 */
export async function sendNewsletterConfirmationEmail(
  email: string,
  firstName?: string
): Promise<void> {
  const name = firstName || 'Subscriber';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #667eea; font-size: 16px; margin-top: 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          .highlight { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Newsletter Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            
            <p>Thank you for subscribing to the Afrobizz newsletter! You're now part of our community.</p>
            
            <div class="section">
              <h2>What to Expect</h2>
              <p>You'll receive exclusive updates about:</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>New professionals joining our directory</li>
                <li>Special offers and promotions</li>
                <li>Industry news and trends</li>
                <li>Tips and best practices</li>
              </ul>
            </div>
            
            <div class="highlight">
              <p><strong>📌 Note:</strong> We respect your privacy. You can unsubscribe at any time from any email we send you.</p>
            </div>
            
            <div class="section">
              <p>Thank you for being part of Afrobizz!</p>
              <p>Best regards,<br>The Afrobizz Team</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 Afrobizz. All rights reserved.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #667eea; text-decoration: none;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: '📧 Newsletter Confirmation - Welcome!',
    html,
  });
}

/**
 * Send ticket purchase confirmation email
 */
export async function sendTicketConfirmationEmail(options: {
  customerEmail: string;
  customerName: string;
  eventTitle: string;
  eventSlug: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  ticketCode: string;
}): Promise<void> {
  const {
    customerEmail, customerName, eventTitle, eventSlug,
    ticketType, quantity, totalAmount, currency, ticketCode,
  } = options;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mixxfactory.vercel.app';
  const eventUrl = `${baseUrl}/events/${eventSlug}`;
  const isFree = totalAmount === 0;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
          .wrapper { max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0 0 8px; font-size: 28px; }
          .header p { margin: 0; opacity: 0.9; font-size: 16px; }
          .body { padding: 32px 24px; }
          .ticket-box { background: #f0fdf4; border: 2px dashed #86efac; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
          .ticket-label { font-size: 11px; font-weight: 700; color: #16a34a; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
          .ticket-code { font-size: 32px; font-weight: 800; color: #15803d; font-family: monospace; letter-spacing: 0.05em; }
          .details { border-collapse: collapse; width: 100%; margin: 20px 0; }
          .details td { padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 15px; }
          .details td:first-child { color: #6b7280; }
          .details td:last-child { font-weight: 600; text-align: right; }
          .cta { display: block; text-align: center; margin: 24px 0 8px; }
          .cta a { display: inline-block; background: #f97316; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; }
          .notice { background: #fefce8; border-left: 4px solid #fbbf24; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #92400e; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 24px; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>🎟️ You're In!</h1>
            <p>Your ticket is confirmed for <strong>${eventTitle}</strong></p>
          </div>
          <div class="body">
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>
              ${isFree
                ? `Your free ticket for <strong>${eventTitle}</strong> is confirmed.`
                : `Your payment of <strong>${currency} ${totalAmount.toFixed(2)}</strong> was received and your ticket is confirmed.`
              }
              Present the reference code below at the entrance:
            </p>

            <div class="ticket-box">
              <div class="ticket-label">Ticket Reference</div>
              <div class="ticket-code">${ticketCode}</div>
            </div>

            <table class="details">
              <tr>
                <td>Event</td>
                <td>${eventTitle}</td>
              </tr>
              <tr>
                <td>Ticket Type</td>
                <td>${ticketType}</td>
              </tr>
              <tr>
                <td>Quantity</td>
                <td>${quantity} ticket${quantity > 1 ? 's' : ''}</td>
              </tr>
              ${!isFree ? `
              <tr>
                <td>Total Paid</td>
                <td>${currency} ${totalAmount.toFixed(2)}</td>
              </tr>` : ''}
            </table>

            <div class="notice">
              📌 <strong>Important:</strong> Screenshot or print this email. Present your ticket code <strong>${ticketCode}</strong> at the door for entry.
            </div>

            <div class="cta">
              <a href="${eventUrl}">View Event Details →</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MixxFactory. All rights reserved.</p>
            <p>Questions? Contact us at <a href="mailto:support@afrobizz.com" style="color:#6b7280">support@afrobizz.com</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `🎟️ Your ticket for ${eventTitle} — ${ticketCode}`,
    html,
    text: `Hi ${customerName},\n\nYour ticket for ${eventTitle} is confirmed!\n\nTicket Reference: ${ticketCode}\nTicket Type: ${ticketType}\nQuantity: ${quantity}\n${!isFree ? `Total Paid: ${currency} ${totalAmount.toFixed(2)}\n` : ''}Present this code at the entrance.\n\nView event: ${eventUrl}\n\nMixxFactory Team`,
  });
}


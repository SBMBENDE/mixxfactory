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
            <h1>Welcome to MixxFactory! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            
            <p>Thank you for joining MixxFactory! We're excited to have you as a professional in our community.</p>
            
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
              <p>Check out our help center or contact our support team at support@mixxfactory.com</p>
            </div>
            
            <div class="section">
              <p>Best regards,<br>The MixxFactory Team</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 MixxFactory. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to MixxFactory! 🎉',
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
            
            <p>Thank you for subscribing to the MixxFactory newsletter! You're now part of our community.</p>
            
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
              <p>Thank you for being part of MixxFactory!</p>
              <p>Best regards,<br>The MixxFactory Team</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 MixxFactory. All rights reserved.</p>
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


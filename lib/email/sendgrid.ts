/**
 * Email Service — powered by Resend
 * Handles email sending for verification, password reset, and notifications
 */

import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via Resend
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    console.log('[Email] Checking RESEND_API_KEY...');
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ [Email] CRITICAL: RESEND_API_KEY not configured!');
      throw new Error('RESEND_API_KEY not configured');
    }
    console.log(`[Email] API Key present (length: ${process.env.RESEND_API_KEY.length})`);

    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    console.log(`[Email] From: ${from}`);
    console.log(`[Email] To: ${options.to}`);
    console.log(`[Email] Subject: ${options.subject}`);

    console.log('[Email] Initializing Resend...');
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('[Email] Calling resend.emails.send()...');
    const { data, error } = await resend.emails.send({
      from,
      to: options.to,
      replyTo: 'support@afrobizz.com',
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('❌ [Email] Resend error:', JSON.stringify(error));
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
    }

    console.log(`✅ [Email] Successfully sent to ${options.to} | ID: ${data?.id}`);
  } catch (err) {
    console.error('❌ [Email] Exception:', err);
    throw err;
  }
}

/**
 * Password reset email template
 */
export function getPasswordResetEmailHTML(
  firstName: string,
  resetUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .email-wrapper {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .content p {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #555;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
            transition: opacity 0.2s;
          }
          .button:hover {
            opacity: 0.9;
          }
          .link-section {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 12px;
            color: #666;
          }
          .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
          }
          .warning {
            background: #fff3cd;
            padding: 12px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
            font-size: 14px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-wrapper">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello ${firstName || 'there'},</p>
              <p>We received a request to reset your password for your Afrobizz account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <div class="warning">
                ⚠️ This link will expire in <strong>1 hour</strong> for security reasons.
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <div class="link-section">
                ${resetUrl}
              </div>
              <p><strong>Didn't request a password reset?</strong></p>
              <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Afrobizz.</p>
              <p>Need help? Contact us at support@afrobizz.com</p>
              <p>&copy; ${new Date().getFullYear()} Afrobizz. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email verification template
 */
export function getVerificationEmailHTML(
  firstName: string,
  verificationUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .email-wrapper {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .content p {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #555;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
            transition: opacity 0.2s;
          }
          .button:hover {
            opacity: 0.9;
          }
          .link-section {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 12px;
            color: #666;
          }
          .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
          }
          .warning {
            background: #fff3cd;
            padding: 12px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
            border-radius: 4px;
            color: #856404;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-wrapper">
            <div class="header">
              <h1>🎉 Welcome to Afrobizz!</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Thank you for signing up! We're excited to have you on board.</p>
              <p>To complete your registration, please verify your email address by clicking the button below:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <div class="link-section">${verificationUrl}</div>
              <div class="warning">
                ⏱️ <strong>This link expires in 24 hours</strong>
              </div>
              <p>If you didn't create this account, please ignore this email.</p>
              <p>
                Need help? Contact us at <a href="mailto:support@afrobizz.com">support@afrobizz.com</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Afrobizz. All rights reserved.</p>
              <p>
                <a href="https://afrobizz.com" style="color: #667eea; text-decoration: none;">Visit our website</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Password reset email template
 */
export function getResetPasswordEmailHTML(
  firstName: string,
  resetUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .email-wrapper {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .content p {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #555;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
            transition: opacity 0.2s;
          }
          .button:hover {
            opacity: 0.9;
          }
          .link-section {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 12px;
            color: #666;
          }
          .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
          }
          .warning {
            background: #fff3cd;
            padding: 12px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
            border-radius: 4px;
            color: #856404;
            font-size: 14px;
          }
          .security-note {
            background: #e7f3ff;
            padding: 12px;
            border-left: 4px solid #2196F3;
            margin: 15px 0;
            border-radius: 4px;
            color: #0d47a1;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-wrapper">
            <div class="header">
              <h1>🔐 Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <div class="link-section">${resetUrl}</div>
              <div class="warning">
                ⏱️ <strong>This link expires in 1 hour</strong>
              </div>
              <div class="security-note">
                🔒 If you didn't request this password reset, please ignore this email. Your account is safe and your password has not been changed.
              </div>
              <p>For your security, never share this link with anyone.</p>
              <p>
                Questions? Contact us at <a href="mailto:support@afrobizz.com">support@afrobizz.com</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Afrobizz. All rights reserved.</p>
              <p>
                <a href="https://afrobizz.com" style="color: #667eea; text-decoration: none;">Visit our website</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Welcome email template
 */
export function getWelcomeEmailHTML(firstName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .email-wrapper {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 30px 20px;
          }
          .content p {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #555;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
          }
          .features {
            margin: 20px 0;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 5px;
          }
          .feature-item {
            margin: 10px 0;
            font-size: 15px;
            color: #555;
          }
          .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-wrapper">
            <div class="header">
              <h1>Welcome, ${firstName}! 🚀</h1>
            </div>
            <div class="content">
              <p>Your account is all set up and ready to go!</p>
              <p>Here's what you can do with Afrobizz:</p>
              <div class="features">
                <div class="feature-item">✨ Discover talented professionals in your area</div>
                <div class="feature-item">💬 Read reviews and ratings from other users</div>
                <div class="feature-item">⭐ Leave reviews and help others find great services</div>
                <div class="feature-item">🔔 Get personalized recommendations</div>
                <div class="feature-item">👤 Manage your account preferences</div>
              </div>
              <p>
                <a href="https://afrobizz.com" class="button">Explore Now</a>
              </p>
              <p>
                If you have any questions, feel free to reach out to us at <a href="mailto:support@afrobizz.com">support@afrobizz.com</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Afrobizz. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

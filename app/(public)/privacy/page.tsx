'use client';

import Link from 'next/link';

export default function PrivacyPolicy() {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-sm hover:text-gray-200 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          <p className="text-blue-100 mt-2">Last updated: December 22, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              MixxFactory (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or &quot;Company&quot;) operates the MixxFactory website and application. 
              This Privacy Policy explains how we collect, use, disclose, and otherwise handle your information when you visit our website 
              and use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Personal Information You Provide
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Name and contact information (email, phone)</li>
                  <li>Professional profile information</li>
                  <li>Payment and billing information</li>
                  <li>Account credentials and preferences</li>
                  <li>Messages and communications with other users</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Information Collected Automatically
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Usage data and analytics</li>
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Pages visited and time spent on site</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process transactions and send confirmations</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve and personalize your experience</li>
              <li>Comply with legal obligations</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Service providers who assist in operations</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your consent</li>
              <li>Other users as part of public profile information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              5. Your Rights and Choices
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              6. Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              7. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Email:</strong> privacy@mixxfactory.com<br />
                <strong>Address:</strong> Contact us through our contact form
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

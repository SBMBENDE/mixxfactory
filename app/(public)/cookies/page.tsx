'use client';

import Link from 'next/link';

export default function CookiePolicy() {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-sm hover:text-gray-200 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Cookie Policy</h1>
          <p className="text-amber-100 mt-2">Last updated: December 22, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              1. What Are Cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Cookies are small data files stored on your browser or device. They are widely used to make websites work more efficiently 
              and to provide information to the owners of the site. We use cookies to enhance your experience on MixxFactory.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              2. Types of Cookies We Use
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Essential Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies are necessary for the website to function properly. They enable core functionality 
                  such as security, network management, and accessibility. You cannot opt-out of these cookies.
                </p>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Analytical Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We use these cookies to understand how visitors interact with our website. They help us analyze page performance 
                  and improve user experience. These cookies do not identify you personally.
                </p>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Functional Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies allow MixxFactory to remember your preferences and choices to provide a more personalized experience. 
                  For example, they remember your language preference and login information.
                </p>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Marketing Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies track your activity across websites to display personalized advertisements. 
                  You can opt-out of marketing cookies at any time.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              3. How Long Do Cookies Last?
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Session Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies are temporary and expire when you close your browser. They are used for essential functionality.
                </p>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Persistent Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  These cookies remain on your device for a specified period. They may be used for analytical or functional purposes.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              4. Third-Party Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We work with third-party service providers who may set cookies on your device for analytics, advertising, and other purposes. 
              These include:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mt-4">
              <li>Google Analytics - for website traffic analysis</li>
              <li>Cloudinary - for image optimization and delivery</li>
              <li>Advertising networks - for targeted advertising (optional)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              5. Your Cookie Choices
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the right to choose whether or not to accept cookies. Most web browsers allow you to control cookies through settings. 
              However, please note that disabling certain cookies may affect your ability to use MixxFactory fully.
            </p>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-gray-800 dark:text-gray-200 text-sm">
                <strong>Browser Controls:</strong> Visit your browser settings to manage cookies. Most browsers allow you to refuse cookies 
                or alert you when cookies are being sent.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              6. Do Not Track (DNT)
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Some browsers include a Do Not Track feature. Currently, there is no industry standard for DNT signals. 
              MixxFactory does not currently respond to DNT signals, but we provide cookie controls for user preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              7. Changes to This Cookie Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Cookie Policy from time to time to reflect changes in our practices or other operational, legal, or regulatory reasons. 
              We will notify you of any material changes by posting the updated policy on this page with a new &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              8. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Email:</strong> privacy@mixxfactory.com<br />
                <strong>Contact Form:</strong> mixxfactory.com/contact
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              9. Additional Resources
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>
                <Link href="/privacy" className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

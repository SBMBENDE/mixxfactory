'use client';

import Link from 'next/link';

export default function TermsOfService() {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-sm hover:text-gray-200 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
          <p className="text-purple-100 mt-2">Last updated: December 22, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing and using MixxFactory, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              2. Use License
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on MixxFactory&rsquo;s website 
              for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under 
              this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on MixxFactory</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or &quot;mirroring&quot; the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              3. Disclaimer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The materials on MixxFactory&rsquo;s website are provided on an &apos;as is&apos; basis. MixxFactory makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of 
              merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              4. Limitations
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              In no event shall MixxFactory or its suppliers be liable for any damages (including, without limitation, damages for loss of data 
              or profit, or due to business interruption) arising out of the use or inability to use the materials on MixxFactory&rsquo;s website, 
              even if MixxFactory or an authorized representative has been notified of the possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              5. Accuracy of Materials
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              The materials appearing on MixxFactory&rsquo;s website could include technical, typographical, or photographic errors. 
              MixxFactory does not warrant that any of the materials on its website are accurate, complete, or current. 
              MixxFactory may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              6. Links
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              MixxFactory has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. 
              The inclusion of any link does not imply endorsement by MixxFactory of the site. Use of any such linked website is at the user&rsquo;s own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              7. Modifications
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              MixxFactory may revise these terms of service for its website at any time without notice. 
              By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              8. Governing Law
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which MixxFactory operates, 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              9. User Conduct
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Users agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Violate any applicable law or regulation</li>
              <li>Post or transmit any unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable material</li>
              <li>Harass, abuse, or harm another user</li>
              <li>Engage in any activity that disrupts the normal flow of dialogue within our services</li>
              <li>Attempt to gain unauthorized access to systems or networks</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              10. Contact
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Email:</strong> legal@mixxfactory.com<br />
                <strong>Contact:</strong> Use our contact form at mixxfactory.com/contact
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


"use client";
import { useState } from 'react';

const faqs = [
  { q: 'How do I update my profile?', a: 'Go to the Profile page and click Edit to update your information.' },
  { q: 'How do I get paid?', a: 'Connect your payout account in the Earnings section to receive payments.' },
  { q: 'How do I contact support?', a: 'Use the contact form below or email support@mixxfactory.com.' },
];

export default function ProfessionalHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [reportMsg, setReportMsg] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => { setContactSent(false); setContactMsg(''); }, 2000);
  };
  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSent(true);
    setTimeout(() => { setReportSent(false); setReportMsg(''); }, 2000);
  };

  return (
    <div className="p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Help & Support</h1>
      <p className="text-gray-600 mb-4">Access the help center, contact support, or report a problem.</p>

      {/* FAQ Section */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Frequently Asked Questions</h2>
        <ul>
          {faqs.map((faq, idx) => (
            <li key={faq.q} className="mb-2">
              <button
                className="w-full text-left font-medium text-blue-700 hover:underline"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                {faq.q}
              </button>
              {openFaq === idx && (
                <div className="mt-1 text-gray-700 bg-blue-50 rounded p-2">{faq.a}</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Contact Support Form */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Contact Support</h2>
        <form onSubmit={handleContact} className="space-y-3">
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows={3}
            placeholder="Describe your issue or question..."
            value={contactMsg}
            onChange={e => setContactMsg(e.target.value)}
            required
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Send Message</button>
        </form>
        {contactSent && <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">Message sent! Support will contact you soon.</div>}
      </div>

      {/* Report a Problem Form */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Report a Problem</h2>
        <form onSubmit={handleReport} className="space-y-3">
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows={3}
            placeholder="Describe the problem..."
            value={reportMsg}
            onChange={e => setReportMsg(e.target.value)}
            required
          />
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">Report</button>
        </form>
        {reportSent && <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">Problem reported! Our team will investigate.</div>}
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4 text-center">Pricing & Plans</h1>
      <p className="text-gray-600 mb-8 text-center">
        Choose the plan that fits your needs. All plans include access to MixxFactory's core features, secure payments, and dedicated support.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Free Plan */}
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Starter</h2>
          <div className="text-3xl font-bold mb-2">Free</div>
          <ul className="text-gray-600 mb-4 text-sm list-disc list-inside">
            <li>Profile listing in directory</li>
            <li>Basic messaging</li>
            <li>Access to public events</li>
            <li>Email support</li>
          </ul>
          <button className="mt-auto px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60" disabled>Current Plan</button>
        </div>
        {/* Pro Plan */}
        <div className="bg-white rounded shadow p-6 flex flex-col items-center border-2 border-blue-600">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <div className="text-3xl font-bold mb-2">€19<span className="text-base font-normal">/mo</span></div>
          <ul className="text-gray-600 mb-4 text-sm list-disc list-inside">
            <li>Everything in Starter</li>
            <li>Priority directory placement</li>
            <li>Advanced analytics</li>
            <li>Unlimited gallery uploads</li>
            <li>Featured badge</li>
            <li>Priority support</li>
          </ul>
          <Link href="/register?plan=pro" className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Upgrade to Pro</Link>
        </div>
        {/* Business Plan */}
        <div className="bg-white rounded shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Business</h2>
          <div className="text-3xl font-bold mb-2">Custom</div>
          <ul className="text-gray-600 mb-4 text-sm list-disc list-inside">
            <li>Everything in Pro</li>
            <li>Team management</li>
            <li>Custom integrations</li>
            <li>Dedicated account manager</li>
            <li>API access</li>
          </ul>
          <Link href="/contact" className="mt-auto px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">Contact Sales</Link>
        </div>
      </div>
      {/* Events Pricing */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4 text-center">Event Promotion Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Basic Event */}
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">Basic Event</h3>
            <div className="text-2xl font-bold mb-2">Free</div>
            <ul className="text-gray-600 mb-4 text-sm list-disc list-inside">
              <li>Listed in public event directory</li>
              <li>Standard visibility</li>
              <li>Shareable event page</li>
            </ul>
            <Link href="/promote-event" className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Post Event</Link>
          </div>
          {/* Premium/Featured Event */}
          <div className="bg-white rounded shadow p-6 flex flex-col items-center border-2 border-yellow-500">
            <h3 className="text-lg font-semibold mb-2">Premium / Featured Event</h3>
            <div className="text-2xl font-bold mb-2">€29<span className="text-base font-normal">/event</span></div>
            <ul className="text-gray-600 mb-4 text-sm list-disc list-inside">
              <li>Top placement in event directory</li>
              <li>Featured badge</li>
              <li>Highlighted in newsletters</li>
              <li>Social media spotlight</li>
              <li>Increased reach & RSVPs</li>
            </ul>
            <Link href="/promote-event?featured=true" className="mt-auto px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Promote as Featured</Link>
          </div>
        </div>
      </div>

      {/* News Flash Pricing */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4 text-center">News Flash Promotion</h2>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center max-w-xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">News Flash</h3>
          <div className="text-2xl font-bold mb-2">€15<span className="text-base font-normal">/flash</span></div>
          <ul className="text-gray-600 mb-4 text-sm list-disc list-inside">
            <li>Instant banner on homepage</li>
            <li>Appears in user dashboards</li>
            <li>Included in weekly newsletter</li>
            <li>Great for urgent updates & announcements</li>
          </ul>
          <Link href="/promote-event?newsflash=true" className="mt-auto px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">Submit News Flash</Link>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-12">
        All prices in EUR. VAT may apply. Cancel anytime. For more details, see our <Link href="/terms" className="underline">Terms of Service</Link>.
      </div>
    </div>
  );
}

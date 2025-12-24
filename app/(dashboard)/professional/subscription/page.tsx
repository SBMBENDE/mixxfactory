/**
 * Professional Subscription Management Page
 */

'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function SubscriptionPage() {
  const plans = [
    {
      name: 'Free',
      price: '€0',
      period: 'forever',
      features: [
        { text: 'Basic profile listing', included: true },
        { text: 'Up to 5 images', included: true },
        { text: 'Contact form', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Priority search placement', included: false },
        { text: 'Featured badge', included: false },
        { text: 'Unlimited images', included: false },
        { text: 'Video gallery', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'Custom branding', included: false },
      ],
      current: true,
    },
    {
      name: 'Pro',
      price: '€29',
      period: 'per month',
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Priority search placement', included: true },
        { text: 'Featured badge', included: true },
        { text: 'Unlimited images', included: true },
        { text: 'Video gallery', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Email support', included: true },
        { text: 'Custom branding', included: false },
        { text: 'Dedicated account manager', included: false },
        { text: 'API access', included: false },
      ],
      popular: true,
      current: false,
    },
    {
      name: 'Premium',
      price: '€99',
      period: 'per month',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Top search placement', included: true },
        { text: 'Custom branding', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'API access', included: true },
        { text: 'Priority customer support', included: true },
        { text: 'Advanced reporting', included: true },
        { text: 'Multiple team members', included: true },
        { text: 'White-label options', included: true },
        { text: 'Custom integrations', included: true },
      ],
      current: false,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Choose Your Plan
        </h1>
        <p style={{ color: '#6b7280' }}>
          Upgrade your subscription to unlock more features and grow your business
        </p>
      </div>

      {/* Pricing Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}
      >
        {plans.map((plan, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              boxShadow: plan.popular ? '0 10px 40px rgba(37, 99, 235, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
              border: plan.popular ? '2px solid #2563eb' : '1px solid #e5e7eb',
              position: 'relative',
              transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s',
            }}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '0.25rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}
              >
                MOST POPULAR
              </div>
            )}

            {/* Current Badge */}
            {plan.current && (
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}
              >
                CURRENT PLAN
              </div>
            )}

            {/* Plan Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {plan.name !== 'Free' && (
                <FontAwesomeIcon
                  icon={faCrown}
                  style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.5rem' }}
                />
              )}
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {plan.name}
              </h3>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {plan.price}
                </span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{plan.period}</p>
            </div>

            {/* Features List */}
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
              {plan.features.map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 0',
                    borderBottom: idx < plan.features.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <FontAwesomeIcon
                    icon={feature.included ? faCheck : faTimes}
                    style={{
                      fontSize: '0.875rem',
                      color: feature.included ? '#15803d' : '#dc2626',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: feature.included ? '#1f2937' : '#9ca3af',
                    }}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              disabled={plan.current}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: plan.current ? '#9ca3af' : plan.popular ? '#2563eb' : 'white',
                color: plan.current ? 'white' : plan.popular ? 'white' : '#2563eb',
                border: plan.popular ? 'none' : '1px solid #2563eb',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: plan.current ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!plan.current) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!plan.current) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {plan.current ? 'Current Plan' : plan.name === 'Free' ? 'Downgrade' : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
              Can I change my plan anytime?
            </h4>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately,
              and we&apos;ll prorate any charges.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
              What payment methods do you accept?
            </h4>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.6' }}>
              We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
              Is there a long-term commitment?
            </h4>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.6' }}>
              No, all plans are month-to-month. You can cancel anytime with no penalties or fees.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
              What happens if I cancel my subscription?
            </h4>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Your account will revert to the Free plan at the end of your billing cycle. All your data
              will be preserved, but premium features will be disabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

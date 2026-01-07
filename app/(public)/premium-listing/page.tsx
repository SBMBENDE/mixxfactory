'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';
import { useAuth } from '@/components/AuthProvider';
import { CheckCircle, X, Crown, TrendingUp, Award, Users, Star } from 'lucide-react';

export default function PremiumListingPage() {
  const t = useTranslations();
  const { user, authStatus } = useAuth();
  const [userTier, setUserTier] = useState<string>('free');

  useEffect(() => {
    // Fetch user's current subscription tier if logged in
    const fetchUserTier = async () => {
      if (authStatus === 'authenticated' && user) {
        try {
          const res = await fetch('/api/professional/my-profile', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setUserTier(data.data?.subscriptionTier || 'free');
          }
        } catch (error) {
          console.error('Failed to fetch user tier:', error);
        }
      }
    };
    fetchUserTier();
  }, [authStatus, user]);

  const isLoggedIn = authStatus === 'authenticated';
  const isPremium = userTier === 'pro';
  const isStarter = userTier === 'starter';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="inline-block mb-4">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
            {isPremium ? '🎉 YOU\'RE PREMIUM!' : '⭐ PREMIUM LISTING'}
          </span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
          {isPremium 
            ? t.premiumListing?.heroTitlePremium || 'You\'re Already Premium!'
            : t.premiumListing?.heroTitle || 'Get More Visibility. Get More Bookings.'
          }
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          {isPremium
            ? t.premiumListing?.heroSubtitlePremium || 'You\'re getting maximum exposure with featured placement and priority search results.'
            : t.premiumListing?.heroSubtitle || 'Premium Listings appear first and get up to 5× more views.'
          }
        </p>

        {!isPremium && (
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href={isLoggedIn ? '/checkout?tier=pro' : '/register'}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold text-lg shadow-lg transform hover:scale-105 transition-all"
            >
              {isLoggedIn 
                ? (isStarter ? t.premiumListing?.ctaUpgradeToPro || 'Upgrade to Pro' : t.premiumListing?.ctaGetStarted || 'Get Started')
                : t.premiumListing?.ctaSignUp || 'Sign Up & Go Premium'
              }
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-lg transition-all"
            >
              {t.premiumListing?.ctaViewPricing || 'View Pricing'}
            </Link>
          </div>
        )}

        {/* Social Proof */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <TrendingUp className="h-12 w-12 text-purple-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">5×</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.premiumListing?.stat1 || 'More Profile Views'}</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="h-12 w-12 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">3×</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.premiumListing?.stat2 || 'More Inquiries'}</p>
          </div>
          <div className="flex flex-col items-center">
            <Award className="h-12 w-12 text-purple-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">#1</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.premiumListing?.stat3 || 'Priority Placement'}</p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t.premiumListing?.benefitsTitle || 'Why Go Premium?'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Star className="h-8 w-8" />,
                title: t.premiumListing?.benefit1Title || 'Priority in Search Results',
                desc: t.premiumListing?.benefit1Desc || 'Appear first when customers search for professionals in your category.'
              },
              {
                icon: <Crown className="h-8 w-8" />,
                title: t.premiumListing?.benefit2Title || 'Featured Badge',
                desc: t.premiumListing?.benefit2Desc || 'Stand out with a verified premium badge on your profile.'
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: t.premiumListing?.benefit3Title || 'Homepage Exposure',
                desc: t.premiumListing?.benefit3Desc || 'Get featured on the homepage for maximum visibility.'
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: t.premiumListing?.benefit4Title || 'Higher Trust & Credibility',
                desc: t.premiumListing?.benefit4Desc || 'Premium status signals quality and professionalism to clients.'
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: t.premiumListing?.benefit5Title || 'More Leads',
                desc: t.premiumListing?.benefit5Desc || 'Premium profiles receive significantly more inquiries.'
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: t.premiumListing?.benefit6Title || 'Unlimited Gallery',
                desc: t.premiumListing?.benefit6Desc || 'Showcase unlimited images to attract more clients.'
              },
            ].map((benefit, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-purple-600 dark:text-purple-400 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {t.premiumListing?.comparisonTitle || 'Compare Plans'}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-gray-900 dark:text-white font-semibold">
                  {t.premiumListing?.featureColumn || 'Feature'}
                </th>
                <th className="px-6 py-4 text-center text-gray-900 dark:text-white font-semibold">
                  {t.pricing?.free || 'Free'}
                </th>
                <th className="px-6 py-4 text-center text-gray-900 dark:text-white font-semibold">
                  {t.pricing?.starter || 'Starter'}
                </th>
                <th className="px-6 py-4 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-t-lg">
                  {t.pricing?.pro || 'Pro'} ⭐
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Profile Listing', free: true, starter: true, pro: true },
                { feature: 'Gallery Images', free: '1', starter: '5', pro: 'Unlimited' },
                { feature: 'Contact Info Display', free: false, starter: true, pro: true },
                { feature: 'Social Media Links', free: false, starter: true, pro: true },
                { feature: 'Dashboard Access', free: false, starter: true, pro: true },
                { feature: 'Featured Badge', free: false, starter: false, pro: true },
                { feature: 'Priority Search Placement', free: false, starter: false, pro: true },
                { feature: 'Homepage Featured', free: false, starter: false, pro: true },
                { feature: 'Analytics Dashboard', free: false, starter: false, pro: true },
                { feature: 'Priority Support', free: false, starter: false, pro: true },
              ].map((row, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof row.free === 'boolean' 
                      ? (row.free ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-300 mx-auto" />)
                      : <span className="text-gray-600 dark:text-gray-400">{row.free}</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof row.starter === 'boolean' 
                      ? (row.starter ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-300 mx-auto" />)
                      : <span className="text-gray-600 dark:text-gray-400">{row.starter}</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-center bg-purple-50 dark:bg-purple-900/20">
                    {typeof row.pro === 'boolean' 
                      ? (row.pro ? <CheckCircle className="h-5 w-5 text-purple-600 mx-auto" /> : <X className="h-5 w-5 text-gray-300 mx-auto" />)
                      : <span className="text-purple-600 dark:text-purple-400 font-semibold">{row.pro}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {t.premiumListing?.pricingTitle || 'Simple, Transparent Pricing'}
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            {t.premiumListing?.pricingSubtitle || 'Upgrade to Pro and start getting more bookings today'}
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="h-8 w-8 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.pricing?.pro || 'Pro'} {t.premiumListing?.plan || 'Plan'}
              </h3>
            </div>
            
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              €19.99
              <span className="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t.premiumListing?.billedMonthly || 'Billed monthly. Cancel anytime.'}
            </p>
            
            {!isPremium && (
              <Link
                href={isLoggedIn ? '/checkout?tier=pro' : '/register'}
                className="block w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold text-lg shadow-lg transform hover:scale-105 transition-all"
              >
                {isLoggedIn 
                  ? (isStarter ? t.premiumListing?.ctaUpgrade || 'Upgrade Now' : t.premiumListing?.ctaGetPremium || 'Get Premium')
                  : t.premiumListing?.ctaStartTrial || 'Start Now'
                }
              </Link>
            )}

            {isPremium && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-6 py-3 rounded-lg font-semibold">
                ✓ {t.premiumListing?.activePremium || 'Active Premium Member'}
              </div>
            )}
          </div>

          <p className="text-purple-100 text-sm mt-6">
            {t.premiumListing?.moneyBack || '30-day money-back guarantee. No questions asked.'}
          </p>
        </div>
      </div>

      {/* Final CTA */}
      {!isPremium && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {t.premiumListing?.finalCtaTitle || 'Ready to Grow Your Business?'}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            {t.premiumListing?.finalCtaSubtitle || 'Join hundreds of professionals getting more bookings with Premium Listing'}
          </p>
          <Link
            href={isLoggedIn ? '/checkout?tier=pro' : '/register'}
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-semibold text-lg shadow-lg transform hover:scale-105 transition-all"
          >
            {isLoggedIn 
              ? t.premiumListing?.ctaUpgradeNow || 'Upgrade to Premium Now'
              : t.premiumListing?.ctaGetStartedNow || 'Get Started Now'
            }
          </Link>
        </div>
      )}
    </div>
  );
}

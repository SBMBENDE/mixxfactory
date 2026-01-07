'use client';

import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';

export default function PricingPage() {
  const t = useTranslations();
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center">{t.pricing.title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-12 text-center text-lg max-w-2xl mx-auto">
        {t.pricing.subtitle}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Free Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center border-2 border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1 rounded-full text-sm font-semibold">
              {t.pricing.hookRegister}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t.pricing.free}</h2>
          <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">€0<span className="text-lg font-normal text-gray-600 dark:text-gray-400">{t.pricing.perMonth}</span></div>
          <ul className="text-gray-600 dark:text-gray-400 mb-6 text-sm space-y-3 w-full">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.freeFeature1}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.freeFeature2}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.freeFeature3}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.freeFeature4}</span>
            </li>
          </ul>
          <Link href="/register" className="mt-auto px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold w-full text-center">
            {t.pricing.getStartedFree}
          </Link>
        </div>

        {/* Starter Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 flex flex-col items-center border-4 border-blue-500 relative transform scale-105">
          <div className="absolute -top-4 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
            {t.pricing.mostPopular}
          </div>
          <div className="mb-4 mt-2">
            <span className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-1 rounded-full text-sm font-semibold">
              {t.pricing.firstMonetization}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t.pricing.starter}</h2>
          <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">€9.99<span className="text-lg font-normal text-gray-600 dark:text-gray-400">{t.pricing.perMonth}</span></div>
          <ul className="text-gray-600 dark:text-gray-400 mb-6 text-sm space-y-3 w-full">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.starterFeature1}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.starterFeature2}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.starterFeature3}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.starterFeature4}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.starterFeature5}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.starterFeature6}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.starterFeature7}</span>
            </li>
          </ul>
          <Link href="/checkout?tier=starter" className="mt-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold w-full text-center">
            {t.pricing.startGrowing}
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center border-2 border-purple-300 dark:border-purple-700">
          <div className="mb-4">
            <span className="bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-4 py-1 rounded-full text-sm font-semibold">
              {t.pricing.revenueLoyalty}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t.pricing.pro}</h2>
          <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">€19.99<span className="text-lg font-normal text-gray-600 dark:text-gray-400">{t.pricing.perMonth}</span></div>
          <ul className="text-gray-600 dark:text-gray-400 mb-6 text-sm space-y-3 w-full">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.proFeature1}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.proFeature2}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.proFeature3}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.proFeature4}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.proFeature5}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.proFeature6}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.pricing.proFeature7}</span>
            </li>
          </ul>
          <Link href="/checkout?tier=pro" className="mt-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold w-full text-center">
            {t.pricing.goPro}
          </Link>
        </div>
      </div>
      {/* Events Pricing */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4 text-center">{t.pricing.eventPricingTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Basic Event */}
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2">{t.pricing.basicEvent}</h3>
            <div className="text-2xl font-bold mb-2">€4.99<span className="text-base font-normal">{t.pricing.perEvent}</span></div>
            <ul className="text-gray-600 mb-4 text-sm list-disc list-inside">
              <li>{t.pricing.basicEventFeature1}</li>
              <li>{t.pricing.basicEventFeature2}</li>
              <li>{t.pricing.basicEventFeature3}</li>
            </ul>
            <Link href="/promote-event" className="mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t.pricing.postEvent}</Link>
          </div>
          {/* Premium/Featured Event */}
          <div className="bg-white rounded shadow p-6 flex flex-col items-center border-2 border-yellow-500">
            <h3 className="text-lg font-semibold mb-2">{t.pricing.premiumEvent}</h3>
            <div className="text-2xl font-bold mb-2">€19.99<span className="text-base font-normal">{t.pricing.perEvent}</span></div>
            <ul className="text-gray-600 mb-4 text-sm list-disc list-inside">
              <li>{t.pricing.premiumEventFeature1}</li>
              <li>{t.pricing.premiumEventFeature2}</li>
              <li>{t.pricing.premiumEventFeature3}</li>
              <li>{t.pricing.premiumEventFeature4}</li>
              <li>{t.pricing.premiumEventFeature5}</li>
            </ul>
            <Link href="/promote-event?featured=true" className="mt-auto px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">{t.pricing.promoteAsFeatured}</Link>
          </div>
        </div>
      </div>

      {/* News Flash Pricing */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4 text-center">{t.pricing.newsFlashTitle}</h2>
        <div className="bg-white rounded shadow p-6 flex flex-col items-center max-w-xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">{t.pricing.newsFlash}</h3>
          <div className="text-2xl font-bold mb-2">€15<span className="text-base font-normal">{t.pricing.perFlash}</span></div>
          <ul className="text-gray-600 mb-4 text-sm list-disc list-inside">
            <li>{t.pricing.newsFlashFeature1}</li>
            <li>{t.pricing.newsFlashFeature2}</li>
            <li>{t.pricing.newsFlashFeature3}</li>
            <li>{t.pricing.newsFlashFeature4}</li>
          </ul>
          <Link href="/promote-event?newsflash=true" className="mt-auto px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">{t.pricing.submitNewsFlash}</Link>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-12">
        {t.pricing.disclaimer} <Link href="/terms" className="underline">{t.pricing.termsLink}</Link>.
      </div>
    </div>
  );
}

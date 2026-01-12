/**
 * Professional Dashboard Home
 * Main dashboard with overview, orientation, and motivation
 * Updated: 2026-01-12
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGlobe, 
  faRocket, 
  faStar, 
  faChartLine, 
  faUsers,
  faCalendarCheck,
  faCrown,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

export default function ProfessionalDashboard() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/professional/my-profile', {
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfileData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tier = profileData?.subscriptionTier || 'free';
  const isPro = tier === 'pro';
  // Handle category - it might be an object or a string
  const categoryName = typeof profileData?.category === 'object' 
    ? profileData?.category?.name || 'Professional'
    : profileData?.category || 'Professional';
  
  // Check if first-time user (account created within last 24 hours)
  const isNewUser = profileData?.createdAt 
    ? (new Date().getTime() - new Date(profileData.createdAt).getTime()) < (24 * 60 * 60 * 1000)
    : false;
  
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isNewUser 
                ? `Welcome to Afrobizz, ${profileData?.name || 'Professional'}! 🎉` 
                : `Welcome back, ${profileData?.name || 'Professional'}! 👋`
              }
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {isNewUser 
                ? "Let's get started with your professional journey" 
                : "Your professional presence on Afrobizz"
              }
            </p>
          </div>
          {isPro && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FontAwesomeIcon icon={faCrown} className="text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-amber-900 dark:text-amber-200">PRO</span>
            </div>
          )}
        </div>
      </div>

      {/* Your Business on Afrobizz Today */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faGlobe} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            How Your Business Appears to Clients
          </h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Your profile is currently <strong className="text-blue-600 dark:text-blue-400">visible to users</strong> searching for{' '}
            <strong>{categoryName}</strong> services in <strong>France & Africa Diaspora</strong>.{' '}
            {!isPro && (
              <>
                Free listings receive limited exposure in search results.{' '}
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Upgrading increases visibility and client contact opportunities.
                </span>
              </>
            )}
            {isPro && (
              <span className="text-green-600 dark:text-green-400 font-medium">
                Your PRO status gives you priority placement in search results and featured listings.
                </span>
            )}
          </p>

          <div className="grid md:grid-cols-3 gap-4 pt-2">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 dark:text-blue-400 mt-1" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Your Reach</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Connecting with clients across France, Africa, and diaspora communities
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FontAwesomeIcon icon={faShieldAlt} className="text-green-600 dark:text-green-400 mt-1" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Trust Badge</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {profileData?.verified ? 'Verified professional status' : 'Build credibility with reviews'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FontAwesomeIcon icon={faChartLine} className="text-purple-600 dark:text-purple-400 mt-1" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Growth</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {isPro ? 'Premium positioning active' : 'Upgrade for maximum exposure'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Feature Highlight */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faRocket} className="text-2xl text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-1 bg-green-600 text-white rounded">NEW FEATURE</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {isPro ? 'Availability Calendar Now Live!' : 'Availability Calendar for PRO Members'}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {isPro ? (
                <>
                  Manage your availability directly from your dashboard.{' '}
                  <strong>Show clients when you&apos;re available</strong> and get more qualified bookings.{' '}
                  Navigate to <strong>Calendar</strong> to start managing your schedule.
                </>
              ) : (
                <>
                  PRO members can now <strong>manage availability calendars</strong> directly from their dashboard,{' '}
                  making it easier for clients to see when you&apos;re available.{' '}
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    Upgrade to PRO to unlock this powerful booking tool.
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Professional Spotlight */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faStar} className="text-2xl text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-1 bg-amber-600 text-white rounded">SUCCESS STORY</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Professional Spotlight
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
              <p className="text-gray-700 dark:text-gray-300 italic mb-3">
                &quot;After upgrading to PRO, I saw a <strong>300% increase</strong> in profile views and received{' '}
                <strong>5 new client inquiries</strong> in the first week. The calendar feature made booking so much easier.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  KE
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Kofi Events</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Event Planning • Paris</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Awareness */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          The Afrobizz Ecosystem
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          <strong>Afrobizz</strong> connects professionals, businesses, venues, and events across{' '}
          <strong>Africa and the diaspora</strong>. Our platform brings together:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Service Professionals</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">DJs, photographers, stylists, and creative talent</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 dark:text-purple-400 font-bold">2</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Venue Owners</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Event halls, restaurants, and meeting spaces</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 font-bold">3</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Event Organizers</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Promoting cultural events and gatherings</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 dark:text-orange-400 font-bold">4</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Clients & Communities</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Searching for trusted services and experiences</div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="text-blue-600 dark:text-blue-400">You&apos;re part of something bigger.</strong>{' '}
            By joining Afrobizz, you&apos;re contributing to a thriving marketplace that celebrates African and diaspora excellence.
          </p>
        </div>
      </div>

      {/* Quick Tip */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Pro Tip
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Keep your profile updated</strong> with recent photos and accurate contact information.{' '}
              Professionals with <strong>complete profiles</strong> receive <strong>2x more inquiries</strong> than those with incomplete information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

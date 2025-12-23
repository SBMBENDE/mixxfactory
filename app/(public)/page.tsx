/**
 * Home page - Server Component with ISR
 * Prerendered at build time, cached for 60 seconds
 * No 'use client' - enables true static generation
 */

export const revalidate = 60; // ISR: revalidate every 60 seconds

import { getHomepageData } from '@/lib/homepage';
import HomePage from '@/components/home/HomePage';

export default async function Page() {
  console.log('[PAGE] Starting getHomepageData...');
  console.log('[PAGE] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('[PAGE] NODE_ENV:', process.env.NODE_ENV);
  
  try {
    const data = await getHomepageData();
    console.log('[PAGE] Data fetched successfully:', { 
      profCount: data.professionals.length,
      catCount: data.categories.length 
    });
    return <HomePage data={data} />;
  } catch (error) {
    console.error('[PAGE] Error fetching data:', error);
    throw error;
  }
}

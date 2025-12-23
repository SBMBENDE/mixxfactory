/**
 * Home page - Server Component with ISR
 * Prerendered at build time, cached for 60 seconds
 * No 'use client' - enables true static generation
 */

export const revalidate = 60; // ISR: revalidate every 60 seconds

import { getHomepageData } from '@/lib/homepage';
import HomePage from '@/components/home/HomePage';

export default async function Page() {
  const data = await getHomepageData();
  return <HomePage data={data} />;
}

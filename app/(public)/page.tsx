export const revalidate = 60; // ISR: revalidate every 60 seconds

import HomePage from '@/components/home/HomePage';
import { getHomepageData } from '@/lib/homepage-data';

export default async function Page() {
  const data = await getHomepageData();
  return <HomePage data={data} />;
}

export const revalidate = 60; // ISR: revalidate every 60 seconds

import { getHomepageData } from '@/lib/homepage';
import HomePage from '@/components/home/HomePage';

export default async function Page() {
  try {
    console.log('[PAGE] Fetching homepage data...');
    const data = await getHomepageData();
    console.log('[PAGE] Data:', {
      profCount: data.professionals?.length || 0,
      catCount: data.categories?.length || 0,
    });
    return <HomePage data={data} />;
  } catch (error) {
    console.error('[PAGE] Error:', error);
    // Return minimal page if data fetch fails
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>MixxFactory</h1>
        <p>Loading...</p>
      </div>
    );
  }
}

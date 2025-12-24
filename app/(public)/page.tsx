export const revalidate = 60; // ISR: revalidate every 60 seconds

import Hero from '@/components/Hero';

export default async function Page() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/professionals?limit=4`);
  const data = await res.json();

  return (
    <main>
      <Hero />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}

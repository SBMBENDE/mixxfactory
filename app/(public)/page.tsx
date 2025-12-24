export const revalidate = 60; // ISR: revalidate every 60 seconds

import Hero from '@/components/Hero';

export default function Page() {
  return (
    <main>
      <Hero />
    </main>
  );
}

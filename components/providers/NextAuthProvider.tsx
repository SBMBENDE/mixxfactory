/**
 * NextAuth Session Provider Wrapper
 * Client component for NextAuth session context
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function NextAuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

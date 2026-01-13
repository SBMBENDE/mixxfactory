/**
 * NextAuth.js API Route
 * Handles OAuth social login for Google and Facebook
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

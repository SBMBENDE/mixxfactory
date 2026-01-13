/**
 * NextAuth.js Configuration for OAuth Social Login
 * Supports Google and Facebook authentication
 */

import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/auth/mongodb-client';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models';
import { comparePassword } from '@/lib/auth/password';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    
    // Facebook OAuth Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    
    // Credentials Provider (existing email/password login)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDBWithTimeout();
        
        const user = await UserModel.findOne({ email: credentials.email }).select('+password');
        
        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await comparePassword(credentials.password, user.password);
        
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.accountType,
          emailVerified: user.emailVerified,
        };
      }
    }),
  ],

  callbacks: {
    // JWT callback - Add custom fields to token
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role || 'professional';
        token.emailVerified = user.emailVerified || false;
      }
      
      // Store OAuth provider info
      if (account?.provider) {
        token.provider = account.provider;
      }
      
      return token;
    },

    // Session callback - Add custom fields to session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as boolean;
        session.user.provider = token.provider as string;
      }
      return session;
    },

    // Sign-in callback - Handle OAuth user creation
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        await connectDBWithTimeout();
        
        // Check if user exists
        const existingUser = await UserModel.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user for OAuth signup
          await UserModel.create({
            email: user.email,
            name: user.name || user.email?.split('@')[0],
            emailVerified: true, // OAuth emails are pre-verified
            accountType: 'professional',
            authProvider: account.provider,
            authProviderId: account.providerAccountId,
          });
        } else if (!existingUser.authProvider) {
          // Link OAuth to existing email/password account
          existingUser.authProvider = account.provider;
          existingUser.authProviderId = account.providerAccountId;
          existingUser.emailVerified = true;
          await existingUser.save();
        }
      }
      
      return true;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

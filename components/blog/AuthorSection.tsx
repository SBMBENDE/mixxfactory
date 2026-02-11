/**
 * AuthorSection Component - Author bio and social links
 */

'use client';

import { AppImage } from '@/components/AppImage';
import { Twitter, Linkedin, Globe } from 'lucide-react';

interface AuthorSectionProps {
  author: {
    name: string;
    bio?: string;
    avatar?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
  };
}

export default function AuthorSection({ author }: AuthorSectionProps) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 md:p-8">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-orange-200 dark:bg-orange-900 flex-shrink-0">
          {author.avatar ? (
            <AppImage
              src={author.avatar}
              alt={author.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-orange-600 dark:text-orange-300">
              {author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
                Written by
              </p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {author.name}
              </h3>
            </div>
            
            {/* Social Links */}
            {author.social && (
              <div className="flex items-center gap-2">
                {author.social.twitter && (
                  <a
                    href={author.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-400 hover:text-white transition-all"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {author.social.linkedin && (
                  <a
                    href={author.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-700 hover:text-white transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {author.social.website && (
                  <a
                    href={author.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-600 hover:text-white transition-all"
                    aria-label="Website"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
          
          {author.bio && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

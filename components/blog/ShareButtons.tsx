/**
 * ShareButtons Component - Social media sharing
 */

'use client';

import { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Share:</span>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const buttons = [
    { name: 'Twitter', icon: Twitter, href: shareLinks.twitter, color: 'hover:bg-blue-400' },
    { name: 'Facebook', icon: Facebook, href: shareLinks.facebook, color: 'hover:bg-blue-600' },
    { name: 'LinkedIn', icon: Linkedin, href: shareLinks.linkedin, color: 'hover:bg-blue-700' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Share:</span>
      
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <a
            key={button.name}
            href={button.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-white transition-all duration-200 ${button.color}`}
            aria-label={`Share on ${button.name}`}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
      
      <button
        onClick={copyToClipboard}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-600 hover:text-white transition-all duration-200"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

/**
 * Unit tests for slug utilities
 */

import { generateSlug, formatUrlParam } from '@/utils/slug';

describe('Slug Utilities', () => {
  describe('generateSlug', () => {
    it('converts text to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('removes special characters', () => {
      expect(generateSlug('DJ Events & More!')).toBe('dj-events-more');
    });

    it('replaces spaces with hyphens', () => {
      expect(generateSlug('Event Hall')).toBe('event-hall');
    });

    it('handles multiple hyphens', () => {
      expect(generateSlug('The---Quick---Brown')).toBe('the-quick-brown');
    });

    it('trims whitespace', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });
  });

  describe('formatUrlParam', () => {
    it('encodes URL parameter', () => {
      expect(formatUrlParam('Hello World')).toBe('hello%20world');
    });

    it('converts to lowercase', () => {
      expect(formatUrlParam('HELLO')).toBe('hello');
    });

    it('trims whitespace', () => {
      expect(formatUrlParam('  test  ')).toBe('test');
    });
  });
});

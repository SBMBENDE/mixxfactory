"use client";
import { useRef, useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useGSAP, ANIMATION_DEFAULTS } from '@/hooks/useGSAP';
import gsap from 'gsap';

export default function ReadyToFindCta() {
  const t = useTranslations();
  const [isMobile, setIsMobile] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useGSAP(() => {
    if (!headingRef.current || !subtitleRef.current || !ctaRef.current) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: headingRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Split heading text into individual letters
    const headingText = (t.home?.readyToFind || 'Find Your Perfect Professional');
    
    // For mobile, insert a line break before "Professional"
    let formattedText = headingText;
    if (isMobile && headingText.includes('Perfect Professional')) {
      formattedText = headingText.replace('Perfect Professional', 'Perfect<br/>Professional');
    } else if (isMobile && headingText.includes('professionnel parfait')) {
      formattedText = headingText.replace('professionnel parfait', 'professionnel<br/>parfait');
    }
    
    headingRef.current.innerHTML = formattedText
      .split(/<br\/?>/)
      .map(line => 
        line.split('')
          .map((char) => 
            char === ' ' 
              ? '<span style="display: inline-block; width: 0.3em; height: 1em;">&nbsp;</span>'
              : `<span style="display: inline-block; opacity: 0; transform: translateY(-30px); white-space: nowrap;">${char}</span>`
          )
          .join('')
      )
      .join('<br/>');

    // Split subtitle text into individual letters
    const subtitleText = subtitleRef.current.textContent || '';
    subtitleRef.current.innerHTML = subtitleText
      .split('')
      .map((char, i) => 
        char === ' ' 
          ? '<span style="display: inline-block; width: 0.3em; height: 1em;">&nbsp;</span>'
          : `<span style="display: inline-block; opacity: 0; white-space: nowrap;">${char}</span>`
      )
      .join('');

    // Animate heading letters sliding down
    const headingLetters = headingRef.current.querySelectorAll('span');
    timeline.to(headingLetters, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.03,
      ease: ANIMATION_DEFAULTS.ease.smooth,
    });

    // Animate subtitle letters fading in randomly
    const subtitleLetters = Array.from(subtitleRef.current.querySelectorAll('span'));
    const shuffledLetters = [...subtitleLetters].sort(() => Math.random() - 0.5);
    
    timeline.to(shuffledLetters, {
      opacity: 1,
      duration: 0.03,
      stagger: 0.02,
      ease: 'none',
    }, '-=0.3');

    // Animate CTA button
    timeline.fromTo(
      ctaRef.current,
      {
        opacity: 0,
        scale: 0.9,
        y: 20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: ANIMATION_DEFAULTS.duration.normal,
        ease: ANIMATION_DEFAULTS.ease.elastic,
      },
      '-=0.5'
    );
  }, [isMobile, t]);

  return (
    <section style={{
      padding: '4rem 1rem',
      background: 'linear-gradient(135deg, #1e40af 0%, #0f172a 50%, #000000 100%)',
      color: 'white',
      textAlign: 'center',
      margin: '4rem 0',
      borderRadius: '1.5rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      <h2 
        ref={headingRef}
        style={{
          fontSize: isMobile ? '2rem' : '2.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em',
          lineHeight: '1.3',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
        }}
      >
        {/* Text will be replaced by animation */}
        {(t.home?.readyToFind || 'Find Your Perfect Professional')}
      </h2>
      <p 
        ref={subtitleRef}
        style={{
          fontSize: '1.25rem',
          marginBottom: '2.5rem',
          color: 'rgba(255,255,255,0.92)',
          lineHeight: '1.6',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
        }}
      >
        {(t.home?.browseDescription || 'Browse our directory of top-rated professionals and venues for your next event.')}
      </p>
      <a
        ref={ctaRef}
        href="/directory"
        style={{
          display: 'inline-block',
          padding: '1rem 2.5rem',
          background: 'white',
          color: '#2563eb',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '1.125rem',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(30,64,175,0.10)',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {(t.home?.browseCta || 'Browse All Professionals')}
      </a>
    </section>
  );
}
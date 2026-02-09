'use client';

import { useState, useEffect } from 'react';
import { AppImage } from './AppImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faStar } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from '@/hooks/useTranslations';

interface Testimonial {
  id: number;
  name: string;
  role: { en: string; fr: string };
  image: string;
  content: { en: string; fr: string };
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sam MBENDE',
    role: { en: 'Business Owner', fr: 'Propriétaire d\'entreprise' },
    image: 'https://res.cloudinary.com/dkd3k6eau/image/upload/v1769950331/professionals/q8hxjdwmiqafamlpgh6k.jpg',
    content: {
      en: 'AfroBizz has been a game-changer for my business. The platform makes it easy to connect with the right audience, and the exposure I\'ve gained has translated into real growth. It\'s refreshing to see a space that truly supports and uplifts African and Black-owned businesses.',
      fr: 'AfroBizz a changé la donne pour mon entreprise. La plateforme facilite la connexion avec le bon public, et l\'exposition que j\'ai gagnée s\'est traduite par une croissance réelle. C\'est rafraîchissant de voir un espace qui soutient et valorise véritablement les entreprises africaines et appartenant à des Noirs.',
    },
    rating: 5,
  },
  {
    id: 2,
    name: 'Eve M.',
    role: { en: 'Entrepreneur', fr: 'Entrepreneur' },
    image: 'https://res.cloudinary.com/dkd3k6eau/image/upload/v1770601513/eve_gzriwc.jpg',
    content: {
      en: 'What I love most about AfroBizz is the sense of community. It\'s more than just a directory — it\'s a network. Since joining, I\'ve gained visibility, new customers, and meaningful connections with other entrepreneurs who genuinely want to see each other win.',
      fr: 'Ce que j\'aime le plus chez AfroBizz, c\'est le sentiment de communauté. C\'est plus qu\'un simple annuaire — c\'est un réseau. Depuis mon adhésion, j\'ai gagné en visibilité, de nouveaux clients et des connexions significatives avec d\'autres entrepreneurs qui veulent sincèrement se voir réussir.',
    },
    rating: 5,
  },
  {
    id: 3,
    name: 'Judy Malobe',
    role: { en: 'Business Professional', fr: 'Professionnel d\'affaires' },
    image: 'https://res.cloudinary.com/dkd3k6eau/image/upload/v1770601656/judy1_xmwplb.jpg',
    content: {
      en: 'AfroBizz is professional, user-friendly, and impactful. Setting up my profile was simple, and the quality of leads and partnerships I\'ve received has exceeded my expectations. I\'d highly recommend AfroBizz to any business looking to grow with purpose.',
      fr: 'AfroBizz est professionnel, convivial et impactant. La création de mon profil a été simple, et la qualité des prospects et des partenariats que j\'ai reçus a dépassé mes attentes. Je recommande vivement AfroBizz à toute entreprise qui cherche à croître avec un objectif.',
    },
    rating: 5,
  },
];

const CSS_ANIMATIONS = `
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Desktop: Slide animations */
  @media (min-width: 769px) {
    .testimonial-card {
      animation: scaleIn 0.6s ease-out;
    }

    .testimonial-card.prev {
      animation: slideInLeft 0.3s ease-out;
    }

    .testimonial-card.next {
      animation: slideInRight 0.3s ease-out;
    }
  }

  /* Mobile: Fade animations */
  @media (max-width: 768px) {
    .testimonial-card {
      animation: fadeIn 0.5s ease-out;
    }

    .testimonial-card.exiting {
      animation: fadeOut 0.3s ease-out forwards;
    }
  }

  .testimonial-image {
    animation: float 3s ease-in-out infinite;
  }

  .quote-icon {
    font-size: 2.5rem;
    opacity: 0.1;
  }
`;

export default function TestimonialCarousel() {
  const t = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [direction, setDirection] = useState<'prev' | 'next'>('next');
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    // Inject CSS animations
    const styleElement = document.createElement('style');
    styleElement.textContent = CSS_ANIMATIONS;
    document.head.appendChild(styleElement);

    return () => styleElement.remove();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, currentIndex]);

  const handleNext = () => {
    setDirection('next');
    setAnimated(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setAnimated(false), 300);
  };

  const handlePrev = () => {
    setDirection('prev');
    setAnimated(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setAnimated(false), 300);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 'next' : 'prev');
    setAnimated(true);
    setCurrentIndex(index);
    setTimeout(() => setAnimated(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.testimonials.title}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* Main Carousel */}
        <div className="relative">
          {/* Testimonial Card */}
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
              {/* Left - Quote */}
              <div
                className={`testimonial-card ${
                  animated
                    ? direction === 'next'
                      ? 'next'
                      : 'prev'
                    : ''
                } flex flex-col justify-center`}
              >
                <div className="quote-icon">&ldquo;</div>
                <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-light leading-relaxed mb-8">
                  {current.content[t.nav.home === 'Home' ? 'en' : 'fr']}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900">
                      <AppImage
                        src={current.image}
                        alt={current.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        objectFit="cover"
                        objectPosition="center"
                        priority={false}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {current.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {current.role[t.nav.home === 'Home' ? 'en' : 'fr']}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right - Visual */}
              <div className="hidden md:flex flex-col items-center justify-center">
                <div className="relative w-64 h-64 mb-8">
                  {/* Decorative circles */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full blur-xl"></div>

                  {/* Main image */}
                  <div className="testimonial-image absolute inset-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full overflow-hidden shadow-lg">
                    <AppImage
                      src={current.image}
                      alt={current.name}
                      width={224}
                      height={224}
                      className="w-full h-full object-cover"
                      objectFit="cover"
                      objectPosition="center"
                      priority={false}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 text-center w-full">
                  <div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      5K+
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Professionals
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                      10K+
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Happy Clients
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-between p-6 md:p-8 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={handlePrev}
                onMouseEnter={() => setIsAutoPlay(false)}
                onMouseLeave={() => setIsAutoPlay(true)}
                className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                aria-label={t.testimonials.previousTestimonial}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-6 h-6" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-blue-600 dark:bg-blue-400 w-8'
                        : 'bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500'
                    }`}
                    aria-label={`${t.testimonials.goToTestimonial} ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                onMouseEnter={() => setIsAutoPlay(false)}
                onMouseLeave={() => setIsAutoPlay(true)}
                className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                aria-label={t.testimonials.nextTestimonial}
              >
                <FontAwesomeIcon icon={faChevronRight} className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Testimonial Counter - More prominent on mobile */}
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentIndex + 1}
              </span>
              {' / '}
              <span>{testimonials.length}</span>
            </p>
            
            {/* Mobile swipe hint */}
            <p className="md:hidden text-xs text-gray-500 dark:text-gray-500 mt-2">
              {t.nav.home === 'Home' ? 'Swipe left or right' : 'Glissez vers la gauche ou droite'}
            </p>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              98%
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {t.testimonials.satisfaction}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center">
            <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
              50K+
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {t.testimonials.bookings}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center">
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              4.9★
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {t.testimonials.rating}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

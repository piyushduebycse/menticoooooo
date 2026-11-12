import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Sprout,
  Mountain,
  Heart,
  Layers,
  TrendingUp,
  Calendar,
  Check,
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Zap,
  FileText,
  Footprints,
  BookOpen,
  BarChart3,
  Brain,
  RotateCw,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../landing.css';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasPurchased = Boolean(user?.hasPurchased || user?.hasPurchasedPdf);

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Scroll listener for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePurchaseClick = () => {
    if (hasPurchased) {
      navigate('/library?openPdf=true');
    } else {
      navigate('/purchase');
    }
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const sneakPeekItems = [
    {
      id: 1,
      badge: 'A Real Truth',
      title: 'Social Confidence Without the Hype',
      art: '/images/sneak_art_1.jpg',
      full: '/images/preview_confidence_formula.jpg',
    },
    {
      id: 2,
      badge: 'Framework',
      title: 'The Conversation Engine',
      art: '/images/sneak_art_2.jpg',
      full: '/images/preview_frameworks.jpg',
    },
    {
      id: 3,
      badge: 'Action Plan',
      title: 'The 30-Day Challenge',
      art: '/images/sneak_art_3.jpg',
      full: '/images/preview_30day_challenge.jpg',
    },
    {
      id: 4,
      badge: 'Quick Reference',
      title: 'Final Field Card',
      art: '/images/sneak_art_4.jpg',
      full: '/images/book_open_preview.jpg',
    },
  ];

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => {
      const nextIdx = (prev + 1) % sneakPeekItems.length;
      setLightboxImage(sneakPeekItems[nextIdx]);
      return nextIdx;
    });
  };

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => {
      const prevIdx = (prev - 1 + sneakPeekItems.length) % sneakPeekItems.length;
      setLightboxImage(sneakPeekItems[prevIdx]);
      return prevIdx;
    });
  };

  const initialTestimonials = [
    {
      id: 1,
      author: '— Amit, 26',
      quote:
        '"This helped me stop overthinking and actually start talking to people. The 30-day challenge is super practical."',
      avatar: '/images/testimonial_avatar_1.jpg',
    },
    {
      id: 2,
      author: '— Rohan, 24',
      quote:
        '"I feel more confident in social situations and conversations that I actually enjoy now. It\'s not theory, it\'s real life."',
      avatar: '/images/testimonial_avatar_2.jpg',
    },
    {
      id: 3,
      author: '— Karan, 28',
      quote:
        '"Not just about dating, this improved my overall social life. Very practical and well-structured."',
      avatar: '/images/testimonial_avatar_3.jpg',
    },
  ];

  const [testimonialsList, setTestimonialsList] = useState(initialTestimonials);

  useEffect(() => {
    // Randomize avatar images dynamically across testimonials on load
    const pool = [
      '/images/testimonial_avatar_1.jpg',
      '/images/testimonial_avatar_2.jpg',
      '/images/testimonial_avatar_3.jpg',
    ];
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setTestimonialsList((prev) =>
      prev.map((item, idx) => ({
        ...item,
        avatar: shuffled[idx % shuffled.length],
      }))
    );
  }, []);

  const faqItems = [
    {
      question: 'What format is the book?',
      answer:
        'The book comes as an instant downloadable, high-resolution PDF document. It is formatted specifically for smooth reading on phones, tablets, and laptops, and is fully printer-friendly if you prefer a physical bound copy.',
    },
    {
      question: 'Is this only about approaching women?',
      answer:
        'No. While it addresses approaching and communicating with women with respect, honesty, and confidence, it is a complete social psychology system. You will learn to overcome social anxiety in meetings, group dinners, everyday strangers, and networking spaces.',
    },
    {
      question: 'Will this guarantee dates or relationships?',
      answer:
        'No ethical program can guarantee the feelings or decisions of another independent human being. What Mentico Social Freedom guarantees is that you will eliminate crippling hesitation, know exactly what to say and how to listen, handle any outcome with dignity, and stop standing on the sidelines of your life.',
    },
    {
      question: 'How will I receive the book?',
      answer:
        'Immediately upon successful payment, your account is activated and you can download the complete PDF field guide right away. You will also get continuous lifetime access in your Mentico web library.',
    },
  ];

  return (
    <div className="mentico-home" id="top">
      {/* 1. Header Navigation */}
      <header className={`mentico-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="mentico-container mentico-nav-inner">
          <a
            href="#top"
            onClick={(e) => handleNavClick(e, 'top')}
            className="mentico-brand"
            aria-label="Mentico Home"
          >
            MENTICO
          </a>

          {/* Desktop Nav Links */}
          <nav aria-label="Main Navigation">
            <ul className="mentico-nav-links">
              <li>
                <a
                  href="#top"
                  onClick={(e) => handleNavClick(e, 'top')}
                  className="mentico-nav-link"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#whats-inside"
                  onClick={(e) => handleNavClick(e, 'whats-inside')}
                  className="mentico-nav-link"
                >
                  About the Book
                </a>
              </li>
              <li>
                <a
                  href="#what-youll-learn"
                  onClick={(e) => handleNavClick(e, 'what-youll-learn')}
                  className="mentico-nav-link"
                >
                  What You'll Learn
                </a>
              </li>
              <li>
                <a
                  href="#challenge"
                  onClick={(e) => handleNavClick(e, 'challenge')}
                  className="mentico-nav-link"
                >
                  Challenge
                </a>
              </li>
              <li>
                <a
                  href="#reviews"
                  onClick={(e) => handleNavClick(e, 'reviews')}
                  className="mentico-nav-link"
                >
                  Reviews
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="mentico-nav-link"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </nav>

          {/* Header CTA Button */}
          <button
            type="button"
            onClick={handlePurchaseClick}
            className="mentico-btn-cta"
            aria-label="Get the Book"
          >
            {hasPurchased ? 'Open Your Book' : 'Get the Book'}
            <ArrowRight size={16} />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mentico-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`mentico-mobile-menu ${mobileMenuOpen ? 'is-open' : ''}`}>
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, 'top')}
          className="mentico-mobile-nav-link"
        >
          Home
        </a>
        <a
          href="#whats-inside"
          onClick={(e) => handleNavClick(e, 'whats-inside')}
          className="mentico-mobile-nav-link"
        >
          About the Book
        </a>
        <a
          href="#what-youll-learn"
          onClick={(e) => handleNavClick(e, 'what-youll-learn')}
          className="mentico-mobile-nav-link"
        >
          What You'll Learn
        </a>
        <a
          href="#challenge"
          onClick={(e) => handleNavClick(e, 'challenge')}
          className="mentico-mobile-nav-link"
        >
          Challenge
        </a>
        <a
          href="#reviews"
          onClick={(e) => handleNavClick(e, 'reviews')}
          className="mentico-mobile-nav-link"
        >
          Reviews
        </a>
        <a
          href="#faq"
          onClick={(e) => handleNavClick(e, 'faq')}
          className="mentico-mobile-nav-link"
        >
          FAQ
        </a>
        <button
          type="button"
          onClick={handlePurchaseClick}
          className="mentico-btn-cta"
          style={{ width: '100%', marginTop: '12px', height: '52px' }}
        >
          {hasPurchased ? 'Open Your Book' : 'Get the Book'}
          <ArrowRight size={16} />
        </button>
      </div>

      <main>
        {/* 2. Hero Section */}
        <section className="mentico-hero">
          <div className="mentico-container mentico-hero-grid">
            <div className="mentico-hero-content">
              <span className="mentico-label-pill">A PRACTICAL FIELD GUIDE</span>

              <h1 className="mentico-hero-title">
                <span className="mentico-hero-title-main">MENTICO</span>
                <span className="mentico-hero-title-accent">SOCIAL FREEDOM</span>
              </h1>

              <h2 className="mentico-hero-subhead">
                Stop overthinking. Start participating.
              </h2>

              <p className="mentico-hero-desc">
                A step-by-step system to build real social confidence, have better conversations,
                handle rejection and create meaningful connections.
              </p>

              <button
                type="button"
                onClick={handlePurchaseClick}
                className="mentico-btn-cta"
              >
                {hasPurchased ? 'Access PDF Field Guide' : 'Get the PDF Book Now'}
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="mentico-hero-media-wrapper">
              <div className="mentico-hero-script-overlay">
                More Confidence
                <br />
                More real conversations
                <br />
                A freer you
              </div>
              <img
                src="/images/hero_person_cliff.jpg"
                alt="Man sitting freely on a cliff overlooking sunset and city"
                className="mentico-hero-image"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* 3. Feature Highlights Bar */}
        <section className="mentico-container mentico-features-bar" aria-label="Book highlights">
          <div className="mentico-features-bar-inner">
            <div className="mentico-feature-item">
              <Zap className="mentico-feature-icon" />
              <div className="mentico-feature-text">
                <strong>Instant</strong>
                digital access
              </div>
            </div>

            <div className="mentico-feature-item">
              <FileText className="mentico-feature-icon" />
              <div className="mentico-feature-text">
                <strong>PDF pages</strong>
                (printer friendly)
              </div>
            </div>

            <div className="mentico-feature-item">
              <Calendar className="mentico-feature-icon" />
              <div className="mentico-feature-text">
                <strong>30-day</strong>
                challenge included
              </div>
            </div>
          </div>
        </section>

        {/* 4. What You'll Learn Section */}
        <section
          id="what-youll-learn"
          className="mentico-container mentico-learn-section"
        >
          <h2 className="mentico-section-heading">What You'll Learn</h2>

          <div className="mentico-learn-grid">
            <div className="mentico-learn-card">
              <MessageSquare className="mentico-learn-icon" />
              <span className="mentico-learn-label">Start without overthinking</span>
            </div>

            <div className="mentico-learn-card">
              <Users className="mentico-learn-icon" />
              <span className="mentico-learn-label">Have better conversations</span>
            </div>

            <div className="mentico-learn-card">
              <Sprout className="mentico-learn-icon" />
              <span className="mentico-learn-label">Build a social life</span>
            </div>

            <div className="mentico-learn-card">
              <Mountain className="mentico-learn-icon" />
              <span className="mentico-learn-label">Handle rejection</span>
            </div>

            <div className="mentico-learn-card">
              <Heart className="mentico-learn-icon" />
              <span className="mentico-learn-label">Read reciprocity</span>
            </div>

            <div className="mentico-learn-card">
              <Layers className="mentico-learn-icon" />
              <span className="mentico-learn-label">Practical frameworks</span>
            </div>

            <div className="mentico-learn-card">
              <TrendingUp className="mentico-learn-icon" />
              <span className="mentico-learn-label">Express attraction</span>
            </div>

            <div className="mentico-learn-card">
              <Calendar className="mentico-learn-icon" />
              <span className="mentico-learn-label">30-day challenge</span>
            </div>
          </div>
        </section>

        {/* 5. Problem: Does This Sound Familiar? */}
        <section className="mentico-container" style={{ marginBottom: '36px' }}>
          <div className="mentico-card-familiar mentico-card-familiar-full">
            <img
              src="/images/familiar_thinking_man.jpg"
              alt="Thoughtful man reflecting in warm lighting"
              className="mentico-card-familiar-bg"
            />
            <div className="mentico-card-familiar-content">
              <h2 className="mentico-card-familiar-title">Does This Sound Familiar?</h2>
              <ul className="mentico-familiar-list mentico-familiar-list-2col">
                <li className="mentico-familiar-item">
                  <Check className="mentico-check-icon" size={18} />
                  <span>You overthink before approaching someone.</span>
                </li>
                <li className="mentico-familiar-item">
                  <Check className="mentico-check-icon" size={18} />
                  <span>You struggle to start or keep conversations.</span>
                </li>
                <li className="mentico-familiar-item">
                  <Check className="mentico-check-icon" size={18} />
                  <span>You worry about what others think.</span>
                </li>
                <li className="mentico-familiar-item">
                  <Check className="mentico-check-icon" size={18} />
                  <span>You avoid social situations.</span>
                </li>
                <li className="mentico-familiar-item">
                  <Check className="mentico-check-icon" size={18} />
                  <span>You want to express interest but fear rejection.</span>
                </li>
                <li className="mentico-familiar-item">
                  <Check className="mentico-check-icon" size={18} />
                  <span>You feel stuck, even though you want more connections.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Audience Identification: Who Should Read Social Freedom? */}
        <section className="mentico-who-section">
          <div className="mentico-container">
            <div className="mentico-who-header">
              <h2 className="mentico-who-heading">
                Who Should Read <span className="mentico-who-heading-accent">Social Freedom?</span>
              </h2>
              <p className="mentico-who-subtitle">
                If you relate to any of these, this book is for you.
              </p>
              <div className="mentico-who-divider" />
            </div>

            <div className="mentico-who-cards">
              {/* Card 1: Students and young adults */}
              <div className="mentico-who-card">
                <img
                  src="/images/who_students_sq.jpg"
                  alt="Students and young adults"
                  className="mentico-who-card-img"
                  loading="lazy"
                />
                <div className="mentico-who-card-body">
                  <h3 className="mentico-who-card-title">Students and young adults</h3>
                  <p className="mentico-who-card-desc">
                    Who want to become more socially comfortable.
                  </p>
                </div>
              </div>

              {/* Card 2: Working professionals */}
              <div className="mentico-who-card">
                <img
                  src="/images/who_professionals_sq.jpg"
                  alt="Working professionals"
                  className="mentico-who-card-img"
                  loading="lazy"
                />
                <div className="mentico-who-card-body">
                  <h3 className="mentico-who-card-title">Working professionals</h3>
                  <p className="mentico-who-card-desc">
                    Who want to improve communication and networking.
                  </p>
                </div>
              </div>

              {/* Card 3: Overthinkers and introverts */}
              <div className="mentico-who-card">
                <img
                  src="/images/who_introverts_sq.jpg"
                  alt="Overthinkers and introverts"
                  className="mentico-who-card-img"
                  loading="lazy"
                />
                <div className="mentico-who-card-body">
                  <h3 className="mentico-who-card-title">Overthinkers and introverts</h3>
                  <p className="mentico-who-card-desc">
                    Who want to participate more comfortably in social situations.
                  </p>
                </div>
              </div>

              {/* Card 4: People starting afresh */}
              <div className="mentico-who-card">
                <img
                  src="/images/who_afresh_sq.jpg"
                  alt="People starting afresh"
                  className="mentico-who-card-img"
                  loading="lazy"
                />
                <div className="mentico-who-card-body">
                  <h3 className="mentico-who-card-title">People starting afresh</h3>
                  <p className="mentico-who-card-desc">
                    Who want to expand their social circle and make new connections.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Action / Solution: The 30-Day Social Freedom Challenge */}
        <section className="mentico-container" style={{ marginBottom: '36px' }} id="challenge">
          <div className="mentico-card-challenge mentico-card-challenge-full">
            <div>
              <h2 className="mentico-section-heading" style={{ marginBottom: '6px' }}>
                The 30-Day Social Freedom Challenge
              </h2>
              <p className="mentico-section-subheading">
                A progressive challenge to turn concepts into real-world experience.
              </p>
            </div>

            <div className="mentico-challenge-timeline">
              <div className="mentico-timeline-step">
                <span className="mentico-timeline-pill">Days 1 – 3</span>
                <span className="mentico-timeline-arrow">→</span>
                <h4 className="mentico-timeline-title">Presence</h4>
                <p className="mentico-timeline-desc">Be more aware and present.</p>
              </div>

              <div className="mentico-timeline-step">
                <span className="mentico-timeline-pill">Days 4 – 9</span>
                <span className="mentico-timeline-arrow">→</span>
                <h4 className="mentico-timeline-title">Small Actions</h4>
                <p className="mentico-timeline-desc">Start simple conversations.</p>
              </div>

              <div className="mentico-timeline-step">
                <span className="mentico-timeline-pill">Days 10 – 21</span>
                <span className="mentico-timeline-arrow">→</span>
                <h4 className="mentico-timeline-title">Build Momentum</h4>
                <p className="mentico-timeline-desc">
                  Go deeper, join groups, explore new situations.
                </p>
              </div>

              <div className="mentico-timeline-step">
                <span className="mentico-timeline-pill">Days 22 – 30</span>
                <h4 className="mentico-timeline-title">Real Progress</h4>
                <p className="mentico-timeline-desc">
                  Handle uncertainty, notice attraction and intimacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Section Pair: Not a Pickup-Line Book vs The Confidence Formula */}
        <div className="mentico-container mentico-section-row">
          {/* Card: This is NOT a Pickup-Line Book */}
          <div className="mentico-card-not-pickup">
            <h2 className="mentico-section-heading">
              This is <span className="mentico-highlight-not">NOT</span> a Pickup-Line Book
            </h2>

            <div className="mentico-compare-grid">
              <div className="mentico-compare-col">
                <div className="mentico-compare-item">
                  <X className="mentico-cross-icon" size={18} />
                  <span>No scripts.</span>
                </div>
                <div className="mentico-compare-item">
                  <X className="mentico-cross-icon" size={18} />
                  <span>No manipulation.</span>
                </div>
                <div className="mentico-compare-item">
                  <X className="mentico-cross-icon" size={18} />
                  <span>No fake personality.</span>
                </div>
                <div className="mentico-compare-item">
                  <X className="mentico-cross-icon" size={18} />
                  <span>No guaranteed dates.</span>
                </div>
                <div className="mentico-compare-item">
                  <X className="mentico-cross-icon" size={18} />
                  <span>No tricks or shortcuts.</span>
                </div>
              </div>

              <div className="mentico-compare-col">
                <div className="mentico-compare-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>A practical, ethical system.</span>
                </div>
                <div className="mentico-compare-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>Real-world strategies.</span>
                </div>
                <div className="mentico-compare-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>Respect for boundaries.</span>
                </div>
                <div className="mentico-compare-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>Focus on genuine connections.</span>
                </div>
                <div className="mentico-compare-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>Works for everyday life, not just dating.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: The Confidence Formula */}
          <div className="mentico-card-formula">
            <h2 className="mentico-section-heading">The Confidence Formula</h2>

            <div className="mentico-formula-steps">
              <div className="mentico-formula-step">
                <Footprints className="mentico-formula-icon" />
                <span className="mentico-formula-name">Action</span>
                <span className="mentico-formula-desc">Take small steps consistently.</span>
              </div>

              <div className="mentico-formula-step">
                <BookOpen className="mentico-formula-icon" />
                <span className="mentico-formula-name">Experience</span>
                <span className="mentico-formula-desc">See what actually happens.</span>
              </div>

              <div className="mentico-formula-step">
                <BarChart3 className="mentico-formula-icon" />
                <span className="mentico-formula-name">Evidence</span>
                <span className="mentico-formula-desc">Build your own proof.</span>
              </div>

              <div className="mentico-formula-step">
                <Brain className="mentico-formula-icon" />
                <span className="mentico-formula-name">Confidence</span>
                <span className="mentico-formula-desc">Your confidence grows.</span>
              </div>

              <div className="mentico-formula-step">
                <RotateCw className="mentico-formula-icon" />
                <span className="mentico-formula-name">More Action</span>
                <span className="mentico-formula-desc">Keep repeating.</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Section Pair: What's Inside? vs Real People. Real Progress. */}
        <div className="mentico-container mentico-section-row" id="whats-inside">
          {/* Card: What's Inside? */}
          <div className="mentico-card-inside">
            <h2 className="mentico-section-heading">What's Inside?</h2>

            <div className="mentico-inside-layout">
              <div>
                <img
                  src="/images/book_isolated.jpg"
                  alt="Mentico Social Freedom book cover"
                  className="mentico-inside-book-img"
                />
              </div>

              <ul className="mentico-inside-list">
                <li className="mentico-inside-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>90 pages of practical content</span>
                </li>
                <li className="mentico-inside-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>Social confidence fundamentals</span>
                </li>
                <li className="mentico-inside-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>Conversation frameworks</span>
                </li>
                <li className="mentico-inside-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>Approaching women ethically & respectfully</span>
                </li>
                <li className="mentico-inside-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>Rejection handling</span>
                </li>
                <li className="mentico-inside-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>Real-life scenarios</span>
                </li>
                <li className="mentico-inside-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>30-day challenge</span>
                </li>
                <li className="mentico-inside-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>Cheat sheets & final field card</span>
                </li>
                <li className="mentico-inside-item">
                  <Check className="mentico-check-green" size={18} />
                  <span>And much more...</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card: Real People. Real Progress. */}
          <div className="mentico-card-reviews" id="reviews">
            <h2 className="mentico-section-heading">Real People. Real Progress.</h2>

            <div className="mentico-reviews-grid">
              {testimonialsList.map((review) => (
                <div key={review.id} className="mentico-review-box">
                  <div className="mentico-review-avatar-wrap">
                    <img
                      src={review.avatar}
                      alt={review.author}
                      className="mentico-review-avatar"
                      loading="lazy"
                    />
                  </div>
                  <p className="mentico-review-quote">{review.quote}</p>
                  <span className="mentico-review-author">{review.author}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8. Section Pair: A Sneak Peek Inside vs This Book is for You If... */}
        <div className="mentico-container mentico-section-row">
          {/* Card: A Sneak Peek Inside */}
          <div className="mentico-card-sneak">
            <h2 className="mentico-section-heading">A Sneak Peek Inside</h2>

            <div className="mentico-sneak-carousel">
              <button
                type="button"
                onClick={handleCarouselPrev}
                className="mentico-carousel-btn"
                aria-label="Previous preview"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="mentico-sneak-items">
                {sneakPeekItems.map((item) => (
                  <div
                    key={item.id}
                    className="mentico-sneak-card"
                    onClick={() => setLightboxImage(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setLightboxImage(item);
                      }
                    }}
                    title={`Click to view spread: ${item.title}`}
                  >
                    <div className="mentico-sneak-card-header">
                      <span className="mentico-sneak-card-badge">{item.badge}</span>
                      <h4 className="mentico-sneak-card-title">{item.title}</h4>
                    </div>
                    <div className="mentico-sneak-card-art-wrap">
                      <img
                        src={item.art}
                        alt={item.title}
                        className="mentico-sneak-card-art"
                        loading="lazy"
                      />
                      <span className="mentico-sneak-card-zoom">Preview ↗</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCarouselNext}
                className="mentico-carousel-btn"
                aria-label="Next preview"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Card: This Book is for You If... */}
          <div className="mentico-card-for-you">
            <h2 className="mentico-section-heading">This Book is for You If...</h2>

            <ul className="mentico-for-you-list">
              <li className="mentico-for-you-item">
                <Check className="mentico-check-green" size={18} />
                <span>You want to be more social and enjoy conversations.</span>
              </li>
              <li className="mentico-for-you-item">
                <Check className="mentico-check-green" size={18} />
                <span>You want to express interest respectfully.</span>
              </li>
              <li className="mentico-for-you-item">
                <Check className="mentico-check-green" size={18} />
                <span>You want to feel more confident in social situations.</span>
              </li>
              <li className="mentico-for-you-item">
                <Check className="mentico-check-green" size={18} />
                <span>You want practical steps, not just theory.</span>
              </li>
              <li className="mentico-for-you-item">
                <Check className="mentico-check-green" size={18} />
                <span>You are ready to take action and improve.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 9. Frequently Asked Questions */}
        <section id="faq" className="mentico-container mentico-faq-section">
          <div className="mentico-faq-card">
            <h2 className="mentico-section-heading">Frequently Asked Questions</h2>

            <div className="mentico-faq-list">
              {faqItems.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={item.question} className="mentico-faq-item">
                    <button
                      type="button"
                      className="mentico-faq-trigger"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      <span className="mentico-faq-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && <div className="mentico-faq-content">{item.answer}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 10. Bottom Banner (using footer.png as background per user instructions) */}
        <section className="mentico-container" aria-label="Call to action banner">
          <div className="mentico-bottom-banner">
            <div className="mentico-bottom-banner-overlay" />
            <div className="mentico-bottom-banner-content">
              <div className="mentico-banner-script-wrap">
                Same person.
                <br />
                More capable.
                <br />
                More freedom.
              </div>

              <div className="mentico-banner-cta-box">
                <h2 className="mentico-banner-heading">
                  Ready to start your
                  <br />
                  Social Freedom journey?
                </h2>
                <button
                  type="button"
                  onClick={handlePurchaseClick}
                  className="mentico-btn-banner-cta"
                >
                  {hasPurchased ? 'Access PDF Book Now' : 'Get the PDF Book Now'}
                  <ArrowRight size={18} />
                </button>
                <div className="mentico-banner-subtext">
                  Instant access • 90 pages • 30-day challenge • Lifetime value
                </div>
              </div>

              <div />
            </div>
          </div>
        </section>
      </main>

      {/* 11. Footer */}
      <footer className="mentico-site-footer">
        <div className="mentico-container">
          <div className="mentico-footer-grid">
            <div className="mentico-footer-col">
              <span className="mentico-brand" style={{ marginBottom: '12px', display: 'block' }}>
                MENTICO
              </span>
              <p style={{ fontSize: '14.5px', lineHeight: 1.6, maxWidth: '280px', margin: 0 }}>
                A practical psychology-informed field guide to natural confidence, honest
                connections, and social courage.
              </p>
            </div>

            <div className="mentico-footer-col">
              <h4>Navigation</h4>
              <ul className="mentico-footer-links">
                <li>
                  <a href="#top" onClick={(e) => handleNavClick(e, 'top')} className="mentico-footer-link">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#whats-inside" onClick={(e) => handleNavClick(e, 'whats-inside')} className="mentico-footer-link">
                    What's Inside
                  </a>
                </li>
                <li>
                  <a href="#challenge" onClick={(e) => handleNavClick(e, 'challenge')} className="mentico-footer-link">
                    30-Day Challenge
                  </a>
                </li>
                <li>
                  <a href="#reviews" onClick={(e) => handleNavClick(e, 'reviews')} className="mentico-footer-link">
                    Reviews & Proof
                  </a>
                </li>
              </ul>
            </div>

            <div className="mentico-footer-col">
              <h4>Resources</h4>
              <ul className="mentico-footer-links">
                <li>
                  <Link to="/about" className="mentico-footer-link">
                    About Mentico
                  </Link>
                </li>
                <li>
                  <Link to={hasPurchased ? '/library' : '/purchase'} className="mentico-footer-link">
                    {hasPurchased ? 'My Library' : 'Get the Book'}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="mentico-footer-link">
                    Support & Contact
                  </Link>
                </li>
                <li>
                  <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="mentico-footer-link">
                    Common Questions
                  </a>
                </li>
              </ul>
            </div>

            <div className="mentico-footer-col">
              <h4>Legal & Privacy</h4>
              <ul className="mentico-footer-links">
                <li>
                  <Link to="/legal" className="mentico-footer-link">
                    Terms & Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="mentico-footer-link">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="mentico-footer-link">
                    Content Ethics
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mentico-footer-bottom">
            <span>© 2026 Mentico. All rights reserved.</span>
            <span>Designed for real-world social freedom.</span>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal for Full Preview Spread */}
      {lightboxImage && (
        <div
          className="mentico-lightbox-overlay"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="mentico-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="mentico-lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Close preview"
            >
              <X size={20} />
            </button>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  const currentIdx = sneakPeekItems.findIndex((it) => it.id === lightboxImage.id);
                  const prevIdx = (currentIdx - 1 + sneakPeekItems.length) % sneakPeekItems.length;
                  setLightboxImage(sneakPeekItems[prevIdx]);
                }}
                className="mentico-carousel-btn"
                style={{ position: 'absolute', left: '16px', zIndex: 5, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                aria-label="Previous preview spread"
              >
                <ChevronLeft size={22} />
              </button>

              <img
                src={lightboxImage.full}
                alt={lightboxImage.title}
                className="mentico-lightbox-img"
              />

              <button
                type="button"
                onClick={() => {
                  const currentIdx = sneakPeekItems.findIndex((it) => it.id === lightboxImage.id);
                  const nextIdx = (currentIdx + 1) % sneakPeekItems.length;
                  setLightboxImage(sneakPeekItems[nextIdx]);
                }}
                className="mentico-carousel-btn"
                style={{ position: 'absolute', right: '16px', zIndex: 5, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                aria-label="Next preview spread"
              >
                <ChevronRight size={22} />
              </button>
            </div>
            <div className="mentico-lightbox-caption">
              <div>
                <strong style={{ display: 'block', color: 'var(--color-primary-heading)' }}>
                  {lightboxImage.title}
                </strong>
                <span style={{ fontSize: '13.5px', color: 'var(--color-body)' }}>
                  Complete field guide preview spread • Click arrows to view chapters
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLightboxImage(null);
                  handlePurchaseClick();
                }}
                className="mentico-btn-cta"
                style={{ padding: '8px 18px', fontSize: '14px' }}
              >
                {hasPurchased ? 'Read in Library' : 'Get Full Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

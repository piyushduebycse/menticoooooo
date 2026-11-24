import PurchasePlans from '../components/PurchasePlans';
import usePurchaseAccess from '../hooks/usePurchaseAccess';
import './HomeRefresh.css';
import { PRODUCT_PRICE_INR, PRODUCT_ORIGINAL_PRICE_INR } from '../../shared/product.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import '../landing.css';

export default function Home() {
  const navigate = useNavigate();
  const { access } = usePurchaseAccess();
  const hasPurchased = Boolean(access);

  const originalPrice = PRODUCT_ORIGINAL_PRICE_INR;
  const currentPrice = PRODUCT_PRICE_INR;

  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  useBodyScrollLock(Boolean(lightboxImage), () => setLightboxImage(null));

  // Scroll listener for sticky header & floating bottom buy bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 260);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePurchaseClick = () => {
    document.getElementById('purchase-options')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const sneakPeekItems = [
    {
      id: 1,
      badge: 'Framework',
      title: 'Charisma, Perspective & Connection',
      art: '/images/sneak_peek_1.jpg',
      width: 576,
      height: 1024,
      full: '/images/sneak_peek_1.jpg',
    },
    {
      id: 2,
      badge: 'A Real Truth',
      title: 'The Belief Cycle & Overcoming Anxiety',
      art: '/images/sneak_peek_2.jpg',
      width: 682,
      height: 1024,
      full: '/images/sneak_peek_2.jpg',
    },
    {
      id: 3,
      badge: 'Action Guide',
      title: 'Storytelling, Humour & Going Deeper',
      art: '/images/sneak_peek_3.jpg',
      width: 682,
      height: 1024,
      full: '/images/sneak_peek_3.jpg',
    },
  ];

  const touchStartXRef = useRef(null);

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => (prev + 1) % sneakPeekItems.length);
  };

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => (prev - 1 + sneakPeekItems.length) % sneakPeekItems.length);
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    if (e.changedTouches && e.changedTouches.length > 0) {
      const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
      if (diffX > 40) {
        handleCarouselNext();
      } else if (diffX < -40) {
        handleCarouselPrev();
      }
    }
    touchStartXRef.current = null;
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

  const testimonialsList = initialTestimonials;

  const faqItems = [
    { question: 'Will this work for introverts?', answer: "Yes. Social Freedom isn’t about becoming louder or more outgoing. It’s about getting comfortable participating in ways that suit you. The 30-day challenge starts with small, low-pressure actions, like saying hello or asking one question, and builds at your own pace. It’s designed for introverts and overthinkers." },
    { question: 'How long does it take?', answer: "The guide is 90 pages, so you can read it in a few sittings or work through it gradually. The 30-day challenge asks for 10–15 minutes a day of small real-world actions. The aim is to make starting conversations feel more manageable through practice. It isn’t a quick fix; results depend on how consistently you apply it." },
    { question: 'Is it manipulative?', answer: "No, the opposite. There are no scripts, pickup lines, tricks or fake personas. Social Freedom teaches you to read reciprocity, respect boundaries and express interest honestly, so connections are mutual and genuine. It works for friendships, networking and everyday life, not just dating." },
    { question: 'How will I receive the field guide?', answer: 'After successful payment, you’ll see a download page with a prominent Download PDF button. Your confirmation email also includes a link to your purchase. Save the PDF to read offline, on any device, or print it for personal use.' },
    { question: 'What does Private Community & Support include?', answer: 'The ₹499 plan includes everything in the ₹299 field guide, plus the private Mentico Telegram community and guidance from the Mentico mentor, subject to availability. You’ll get the Telegram join link after payment and in your confirmation email. There are no guaranteed response times or scheduled one-to-one sessions.' },
    { question: 'Will this guarantee dates or relationships?', answer: 'No. Other people’s feelings and choices are their own. The guide helps you practise starting conversations, listening, respecting boundaries and handling different outcomes. Progress depends on practice, and individual results vary.' },
    { question: 'Can I get a refund?', answer: 'Purchases are non-refundable once access to the digital field guide is provided, except where required by law. If your payment succeeded but you cannot download the book, contact support with your payment ID before purchasing again.' },
  ];

  return (
    <div className="mentico-home refreshed-home" id="top">
      <div className="home-sections">
        <section className="promise-hero mentico-container" aria-labelledby="promise-title">
          <span className="mentico-label-pill">A 30-DAY FIELD GUIDE FOR OVERTHINKERS</span>
          <h1 id="promise-title">Stop overthinking people.<span>Start talking to them.</span></h1>
          <p className="promise-audience">For people who freeze in social situations.</p>
          <p className="promise-description">A 90-page field guide and 30-day challenge that turns “what if they judge me?” into one small, real conversation at a time.</p>
          <button type="button" onClick={handlePurchaseClick} className="mentico-btn-cta promise-cta">Get the Field Guide · ₹{currentPrice}<ArrowRight size={20}/></button>
          <div className="promise-badges" aria-label="Field guide highlights"><span><Download size={15}/>Instant PDF download</span><span><ShieldCheck size={15}/>No scripts or pickup lines</span><span><Calendar size={15}/>30-day challenge</span></div>
        </section>

        <section className="mentico-container near-top-proof" aria-labelledby="proof-title">
          <h2 className="mentico-section-heading" id="proof-title">Real People. Real Progress.</h2>
          <div className="near-top-proof-grid">{testimonialsList.map(review => <figure key={review.id}><blockquote>{review.quote}</blockquote><figcaption>{review.author}</figcaption></figure>)}</div>
        </section>

        {/* 5. Problem: Does This Sound Familiar? */}
        <section id="problem" className="mentico-container" style={{ marginBottom: '36px' }}>
          <div className="mentico-card-familiar mentico-card-familiar-full">
            <img
              src="/images/familiar_thinking_man.jpg"
              alt="Thoughtful man reflecting in warm lighting"
              className="mentico-card-familiar-bg"
            />
            <div className="mentico-card-familiar-content">
              <h3 className="mentico-card-familiar-title">Does This Sound Familiar?</h3>
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
        <section className="mentico-who-section" id="who-should-read">
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
                  src="/images/who_students_custom.jpg?v=20261118"
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
                  src="/images/who_professionals_custom.jpg?v=20261118"
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
                  src="/images/who_introverts_custom.jpg?v=20261118"
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
                  src="/images/who_afresh_custom.jpg?v=20261118"
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

<section className="mentico-container inside-section" id="whats-inside">
          {/* Card: What's Inside? */}
          <div className="mentico-card-inside">
            <h2 className="mentico-section-heading">What's Inside?</h2>

            <div className="mentico-inside-layout">
              <div>
                <img
                  src="/images/book_isolated.jpg"
                  width="400"
                  height="580"
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


</section>
        <section className="mentico-container benefits-section" aria-label="What Social Freedom helps you practise">
          <div className="benefits-illustration"><img src="/images/hero_social_freedom_journey.jpg" width="1024" height="664" alt="Calm overthinking and social anxiety, build confidence, learn practical conversation skills, handle rejection, create meaningful connections and become more socially expressive" loading="lazy"/></div>
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

              <div
                className="mentico-sneak-items"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {sneakPeekItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`mentico-sneak-card ${idx === carouselIndex ? 'is-active' : ''}`}
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
                        width={item.width}
                        height={item.height}
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

            {/* Mobile Carousel Pagination Dots & Counter */}
            <div className="mentico-sneak-dots">
              {sneakPeekItems.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCarouselIndex(idx)}
                  className={`mentico-sneak-dot ${idx === carouselIndex ? 'is-active' : ''}`}
                  aria-label={`Go to preview ${idx + 1} of ${sneakPeekItems.length}`}
                />
              ))}
              <span className="mentico-sneak-counter">
                {carouselIndex + 1} / {sneakPeekItems.length}
              </span>
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


        {/* 7. Action / Solution: The 30-Day Social Freedom Challenge */}
        <section className="mentico-container" style={{ marginBottom: '36px' }} id="challenge">
          <div className="mentico-card-challenge mentico-card-challenge-full">
            <div>
              <h2 className="mentico-section-heading" style={{ marginBottom: '6px' }}>
                The 30-Day Social Freedom Challenge
              </h2>
              <p className="mentico-section-subheading">
                10–15 minutes a day. Small actions, repeated until starting feels less daunting.
              </p>
            </div>

            <div className="challenge-outcome"><strong>Aim for 60–90 small conversations in 30 days.</strong><span>That’s 2–3 everyday starts a day: a hello, one question, a short exchange. It’s a practice goal, not a guaranteed result. Build at your own pace.</span></div>
            <div className="mentico-challenge-timeline">
              {[
                { phase: '01', days: 'Days 1–10', title: 'PRESENCE & SMALL ACTIONS', description: 'Get comfortable being present. Take small steps and start simple conversations.' },
                { phase: '02', days: 'Days 11–20', title: 'BUILD MOMENTUM', description: 'Go deeper in conversations, join groups and explore new social situations.' },
                { phase: '03', days: 'Days 21–30', title: 'PUT IT INTO PRACTICE', description: 'Handle uncertainty, build meaningful connections and reflect on your progress.' },
              ].map((phase) => (
                <article className="mentico-timeline-step" key={phase.phase}>
                  <span className="mentico-phase-number" aria-hidden="true">{phase.phase}</span>
                  <div>
                    <span className="mentico-timeline-pill">PHASE {phase.phase} · {phase.days}</span>
                    <h3 className="mentico-timeline-title">{phase.title}</h3>
                    <p className="mentico-timeline-desc">{phase.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>


        <div className="mentico-container" id="purchase-options"><PurchasePlans/></div>
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

          <div className="mentico-card-formula">
            <span className="mentico-formula-eyebrow">THE CONFIDENCE FORMULA</span>
            <h2 className="mentico-section-heading">Give your courage a receipt.</h2>
            <p className="mentico-formula-intro">Every small conversation gives you something overthinking never can: proof you can handle it.</p>
            <ol className="mentico-proof-loop">
              {[
                ['01', 'Make the first move', 'Ask a question. Say hello. Give yourself one small moment to try.'],
                ['02', 'Let reality answer', 'Notice what actually happened, rather than the outcome you imagined.'],
                ['03', 'Keep the evidence', 'Write down what you handled, what you learned and what you would try again.'],
                ['04', 'Raise the stakes a little', 'Take that proof into your next conversation. Confidence grows through practice.'],
              ].map(([number, title, description]) => (
                <li key={number}><span className="mentico-proof-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>
              ))}
            </ol>
            <p className="mentico-formula-note">One hello → one real experience → one reason to try again.</p>
          </div>
        </div>

        <section className="mentico-container home-access" aria-labelledby="home-access-title">
          <div className="home-access-icon"><BookOpen size={28}/></div>
          <div><span className="section-kicker">YOUR FIELD GUIDE, YOURS TO KEEP</span><h2 id="home-access-title">{hasPurchased ? 'Your next chapter is ready.' : 'Already purchased? Your email has your download link.'}</h2><p>{hasPurchased ? 'Download Social Freedom and read it on your phone, laptop or offline—whenever you’re ready.' : 'Open the purchase link in your confirmation email to download your PDF. If it hasn’t arrived, check spam or contact us with your payment ID. Please don’t pay again.'}</p></div>
          {hasPurchased ? <button className="btn btn-primary" onClick={() => navigate('/library')}><Download size={18}/>Open my downloads</button> : <button className="btn btn-secondary" onClick={() => navigate('/contact')}>Get help with my purchase<ArrowRight size={16}/></button>}
        </section>
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
                      aria-controls={`faq-answer-${idx}`}
                    >
                      <span>{item.question}</span>
                      <span className="mentico-faq-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && <div id={`faq-answer-${idx}`} className="mentico-faq-content">{item.answer}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        <section className="mentico-container final-invitation"><div><span className="section-kicker">START SMALL. KEEP GOING.</span><h2>One hello can be your first step.</h2><p>Instant access · 90 pages · 30-day challenge · Lifetime access</p></div><button className="mentico-btn-cta" onClick={handlePurchaseClick}>Choose my field guide<ArrowRight size={18}/></button></section>
      </div>
      {/* Lightbox Modal for Full Preview Spread */}
      {lightboxImage && (
        <div
          className="mentico-lightbox-overlay"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Book preview"
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
                {hasPurchased ? 'Read in Library' : 'Get Full Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStickyBar && <aside className="mentico-sticky-bar is-visible" aria-label="Field guide purchase"><div className="mentico-sticky-bar-inner"><div className="mentico-sticky-pricing"><div className="mentico-sticky-price-row"><span className="mentico-sticky-title">Social Freedom</span><span className="mentico-sticky-price">₹{currentPrice}</span><span className="mentico-sticky-original-price">₹{originalPrice}</span></div><span className="mentico-sticky-sublabel">Downloadable PDF · Lifetime access</span></div><button type="button" onClick={handlePurchaseClick} className="mentico-sticky-btn">Choose my plan<ArrowRight size={16}/></button></div></aside>}
    </div>
  );
}

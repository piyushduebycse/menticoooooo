import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../landing.css';

export default function Home() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const [isPaused, setIsPaused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const videoRef = useRef(null);

  // Scroll listener for sticky header styling & active section tracker
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      const sectionIds = ['pricing', 'testimonials', 'who', 'founder', 'method', 'roadmap', 'top'];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('mf-revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.mf-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  // Mouse parallax motion for hero video
  const handleMouseMove = (e) => {
    if (isPaused) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = ((clientX / innerWidth) - 0.5) * 22;
    const y = ((clientY / innerHeight) - 0.5) * 22;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const togglePause = () => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePurchaseClick = () => {
    if (!user) {
      navigate('/login?redirect=%2Fpurchase');
    } else if (user.hasPurchased) {
      navigate('/library');
    } else {
      navigate('/purchase');
    }
  };

  const navLinks = [
    { label: 'Roadmap', href: '#roadmap' },
    { label: 'The Method', href: '#method' },
    { label: 'The Story', href: '#founder' },
    { label: "Who It's For", href: '#who' },
    { label: 'Results', href: '#testimonials' },
    { label: 'Get The Manual', href: '#pricing' },
  ];

  return (
    <div className="landing-page-root bg-grain-overlay antialiased">
      {/* Fixed Luxury Navigation Header */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-colors duration-300 ${scrolled
          ? 'border-white/10 bg-ink/85 backdrop-blur-md'
          : 'border-transparent bg-transparent'
          }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="#top"
            onClick={(e) => handleNavClick(e, '#top')}
            className="flex items-center"
            aria-label="Mentico Home"
          >
            <img
              alt="Mentico"
              src="/mentico-badge-logo.png"
              className="h-8 w-auto rounded"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden gap-8 text-sm md:flex">
            {navLinks.map((item) => {
              const sectionId = item.href.slice(1);
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative pb-1 transition-colors ${isActive ? 'text-paper' : 'text-muted hover:text-paper'
                    }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-brass transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Header Action Button */}
          <div className="flex items-center gap-3">
            <a
              href="#pricing"
              onClick={(e) => handleNavClick(e, '#pricing')}
              className="hidden rounded-full border border-brass/60 px-5 py-2 text-sm font-bold text-brass-light transition hover:bg-brass hover:text-ink sm:block"
            >
              Start Now
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-full border border-white/15 md:hidden"
            >
              <span className="h-px w-4 bg-paper"></span>
              <span className="h-px w-4 bg-paper"></span>
              <span className="h-px w-4 bg-paper"></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="border-b border-white/10 bg-ink/95 px-6 py-6 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-4 text-sm">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    handleNavClick(e, item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="text-paper/90 transition hover:text-brass py-1"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full rounded-full border border-brass/60 py-3 text-center text-sm font-bold text-brass-light hover:bg-brass hover:text-ink"
                  >
                    Go to Social Freedom Hub
                  </button>
                ) : (
                  <a
                    href="#pricing"
                    onClick={(e) => {
                      handleNavClick(e, '#pricing');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-full bg-brass py-3 text-center text-sm font-bold text-ink"
                  >
                    Start Now
                  </a>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Landing Sections */}
      <main className="min-h-screen bg-ink">
        {/* HERO SECTION */}
        <section
          id="top"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`relative isolate min-h-[680px] overflow-hidden px-6 pb-24 pt-40 ${isPaused ? 'is-paused' : ''
            }`}
        >
          {/* Background Video with Mouse Parallax */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[4%] z-0 origin-center will-change-transform"
            style={{
              transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0) scale(1.06)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <video
              ref={videoRef}
              className="hero-video h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/video/nightclub-hero-poster.webp"
            >
              <source src="/video/nightclub-hero-loop.webm" type="video/webm" />
              <source src="/video/nightclub-hero-loop.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Golden Ambient Glow & Vignette Overlays */}
          <div
            aria-hidden="true"
            className="hero-light pointer-events-none absolute z-[1]"
            style={{ inset: '4% 48% 34% -16%' }}
          />
          <div
            aria-hidden="true"
            className="hero-haze pointer-events-none absolute z-[2]"
            style={{ inset: '42% -22% 0' }}
          />
          <div
            aria-hidden="true"
            className="hero-vignette pointer-events-none absolute inset-0 z-[3]"
          />

          {/* Hero Content */}
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h1 className="mx-auto max-w-[700px] text-[clamp(40px,5vw,50px)] font-bold leading-[1.15] tracking-[-1px] text-white text-balance">
              Stop letting fear <span className="text-caramel">Decide how you live</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[25px] font-semibold text-white">
              You need the courage to stop hiding the one you already have.
            </p>
            <p className="mx-auto mt-8 max-w-2xl text-balance text-[20px] font-normal leading-relaxed text-muted">
              Stop letting fear, overthinking and rejection control your social life. Mentico's{' '}
              <span className="font-bold text-brass">Social Freedom</span> is a field manual for social confidence, connection and courage - built from{' '}
              <span className="font-bold text-brass">real evidence, not scripts</span>.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#pricing"
                onClick={(e) => handleNavClick(e, '#pricing')}
                className="rounded-full bg-brass px-8 py-4 text-sm font-semibold uppercase tracking-wide text-ink shadow-lg shadow-brass/25 transition hover:-translate-y-0.5 hover:bg-brass-light hover:shadow-xl hover:shadow-brass/35"
              >
                Get Social Freedom
              </a>
              <a
                href="#roadmap"
                onClick={(e) => handleNavClick(e, '#roadmap')}
                className="rounded-full border border-white/15 px-8 py-4 text-sm font-semibold text-paper/90 transition hover:border-white/30"
              >
                See the roadmap
              </a>
            </div>
          </div>

          {/* Bottom Badges */}
          <p
            aria-hidden="true"
            className="absolute bottom-6 left-6 z-10 hidden rounded-full border border-white/15 bg-ink/40 px-3.5 py-2.5 text-xs text-paper/90 backdrop-blur-md sm:block"
          >
            Move your cursor for depth
          </p>
          <button
            type="button"
            aria-pressed={isPaused}
            onClick={togglePause}
            className="absolute bottom-6 right-6 z-10 rounded-full border border-white/15 bg-ink/40 px-3.5 py-2.5 text-xs text-paper/90 backdrop-blur-md transition hover:border-white/30 cursor-pointer"
          >
            {isPaused ? 'Play motion' : 'Pause motion'}
          </button>
        </section>

        {/* SECTION 2: BEFORE YOU START */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mf-reveal">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-brass">
                Before You Start
              </p>
              <h2 className="mt-4 text-center font-serif text-3xl font-bold text-paper sm:text-4xl">
                That gap is exactly what this manual is about.
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <div className="mf-reveal" style={{ transitionDelay: '0ms' }}>
                <div className="h-full rounded-2xl border border-white/10 bg-charcoal/60 p-6 mf-card-interactive">
                  <span className="font-serif text-3xl font-bold text-brass/70">01</span>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    You know exactly what you want to say - until the moment arrives.
                  </p>
                </div>
              </div>
              <div className="mf-reveal" style={{ transitionDelay: '100ms' }}>
                <div className="h-full rounded-2xl border border-white/10 bg-charcoal/60 p-6 mf-card-interactive">
                  <span className="font-serif text-3xl font-bold text-brass/70">02</span>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    You see someone you want to meet, rehearse the opening in your head, wait for the perfect moment… and watch it disappear.
                  </p>
                </div>
              </div>
              <div className="mf-reveal" style={{ transitionDelay: '200ms' }}>
                <div className="h-full rounded-2xl border border-white/10 bg-charcoal/60 p-6 mf-card-interactive">
                  <span className="font-serif text-3xl font-bold text-brass/70">03</span>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    You're confident at work, competent in your career, capable in almost every area of life - yet something changes when the interaction becomes personal.
                  </p>
                </div>
              </div>
            </div>
            <div className="mf-reveal" style={{ transitionDelay: '150ms' }}>
              <p className="mx-auto mt-12 max-w-2xl text-center text-lg leading-relaxed text-paper/90">
                Social confidence is not a personality gift reserved for naturally charismatic men. It is a collection of skills, beliefs and behaviours that can be trained through real experience.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE CENTRAL IDEA */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mf-reveal mx-auto max-w-3xl rounded-3xl border border-brass/30 bg-gradient-to-br from-brass/25 via-brass/5 to-transparent p-10 text-center sm:p-14">
            <p className="text-xs uppercase tracking-[0.2em] text-brass">The Central Idea</p>
            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-paper sm:text-4xl">
              You do not have to feel confident before you act.
            </h2>
            <p className="mt-4 font-serif text-xl italic text-brass-light/90">
              Very often, confidence comes after you act.
            </p>
            <div className="divider-brass mx-auto mt-8 w-24"></div>
            <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-muted">
              Example: you want to say hello to someone at the gym. Your brain says, “I need to feel confident first.” You wait. Confidence never arrives. Social Freedom reverses the order -
            </p>
            <p className="mx-auto mt-4 max-w-xl font-serif text-lg text-paper">
              take a small, respectful action → get experience → learn what happened → build confidence.
            </p>
          </div>
        </section>

        {/* SECTION 4: THE MENTICO SOCIAL FREEDOM METHOD */}
        <section id="method" className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mf-reveal">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-brass">
                The Mentico Social Freedom Method
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-center font-serif text-3xl font-bold text-paper sm:text-4xl">
                Eight stages, applied in the real world.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-center font-serif italic text-muted">
                Social freedom is not becoming fearless. It is becoming less controlled by fear.
              </p>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '1', title: 'Understand', desc: 'Your anxiety, avoidance, beliefs and patterns.' },
                { step: '2', title: 'Regulate', desc: 'Tolerate discomfort without immediately escaping.' },
                { step: '3', title: 'Reframe', desc: 'Question unhelpful predictions and test assumptions.' },
                { step: '4', title: 'Expose', desc: 'Enter avoided situations gradually and repeatedly.' },
                { step: '5', title: 'Connect', desc: 'Learn listening, conversation, friendship and social awareness.' },
                { step: '6', title: 'Express', desc: 'Show your personality, humour, preferences and genuine interest.' },
                { step: '7', title: 'Accept', desc: 'Grow comfortable with rejection, uncertainty and imperfect interactions.' },
                { step: '8', title: 'Live', desc: 'Build friendships, dating experiences, community and meaningful relationships.' },
              ].map((item, idx) => (
                <div
                  key={item.step}
                  className="mf-reveal"
                  style={{ transitionDelay: `${(idx % 4) * 80}ms` }}
                >
                  <div className="h-full rounded-2xl border border-white/10 bg-charcoal/50 p-6 transition duration-300 hover:-translate-y-1 hover:border-brass/30 hover:bg-charcoal/80 hover:shadow-2xl hover:shadow-black/40">
                    <span className="font-serif text-2xl text-brass/70">{item.step}</span>
                    <p className="mt-3 font-serif text-lg text-paper">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: COURSE ROADMAP */}
        <section id="roadmap" className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mf-reveal">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-brass">Course Roadmap</p>
                <h2 className="mt-4 font-serif text-3xl font-bold text-paper sm:text-4xl">
                  The psychology of social confidence, applied to real life.
                </h2>
                <p className="mt-4 text-muted">
                  This expanded edition connects confidence, conversation, approach behaviour, attraction, consent, friendship and social conditioning into one practical system.
                </p>
              </div>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-3">
              {[
                { num: '01', desc: 'Understand why social situations feel difficult.' },
                { num: '02', desc: 'Learn how anxiety, avoidance and overthinking reinforce each other.' },
                { num: '03', desc: 'Build confidence through gradual action and real-world evidence.' },
                { num: '04', desc: 'Learn to start conversations naturally rather than relying on scripts.' },
                { num: '05', desc: 'Understand approaching women as one part of broader social confidence.' },
                { num: '06', desc: 'Maintain conversations through curiosity, reciprocity and self-expression.' },
                { num: '07', desc: 'Understand feminine socialisation without reducing women to stereotypes.' },
                { num: '08', desc: 'Recognise mutual interest while respecting boundaries and consent.' },
                { num: '09', desc: 'Build friendships, community and a social life - not only dating outcomes.' },
              ].map((item, idx) => (
                <div
                  key={item.num}
                  className="mf-reveal"
                  style={{ transitionDelay: `${(idx % 3) * 80}ms` }}
                >
                  <div className="h-full bg-ink p-6">
                    <span className="font-serif text-sm text-brass/80">{item.num}</span>
                    <p className="mt-3 text-sm leading-relaxed text-paper/90">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: THE MENTICO SYSTEM */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mf-reveal">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-brass">
                The Mentico System
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-center font-serif text-3xl font-bold text-paper sm:text-4xl">
                Three engines, one coherent framework.
              </h2>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  name: 'The Confidence Engine',
                  formula: 'Action → Experience → Evidence → Confidence → More Action',
                  desc: "You act despite nerves, discover what actually happens, collect evidence, and your trust in yourself increases - so you're willing to act again.",
                },
                {
                  name: 'The Conversation Engine',
                  formula: 'Observe → Open → Thread → Amplify → Relate → Play → Deep Dive → Invite / Close',
                  desc: "Notice what's happening, start naturally, find something worth exploring, and let both people contribute - respectfully, and to a natural end.",
                },
                {
                  name: 'The Ethical Attraction Engine',
                  formula: 'Interest → Reciprocity → Clear Communication → Consent → Mutual Next Step',
                  desc: "You're interested, they show interest too, you communicate clearly, both people consent to the next step. If they say no, you respect it.",
                },
              ].map((engine, idx) => (
                <div
                  key={engine.name}
                  className="mf-reveal"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-charcoal/50 p-6">
                    <p className="font-serif text-lg text-paper">{engine.name}</p>
                    <p className="mt-3 font-serif text-sm leading-relaxed text-brass-light/90">
                      {engine.formula}
                    </p>
                    <div className="divider-brass my-5 w-full"></div>
                    <p className="text-sm leading-relaxed text-muted">{engine.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7: WHAT'S INSIDE */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mf-reveal">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-brass">
                What's Inside
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-center font-serif text-3xl font-bold text-paper sm:text-4xl">
                Sixteen parts. Eighty lessons. One field manual.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-center text-muted">
                From understanding why social situations feel hard, to the full Mentico Social Freedom System - built to be read in pieces and practiced in the real world.
              </p>
            </div>
            <div className="mt-12 grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {[
                'Understanding Why You Feel Socially Stuck',
                'The Psychology Behind Your Patterns',
                'Rewire the Inner Conversation',
                'Regulate, Do Not Run',
                'Build Social Courage Gradually',
                'Presence, Charisma & Social Calibration',
                'Master Conversations',
                'Advanced Conversation & Attraction',
                'Approach Without Needing an Outcome',
                'Texting & Real-World Connection',
                'Build a Social Life',
                'Approach Theory: From Fear to Social Participation',
                'Social Conditioning: Relearning How to Connect',
                'The Mentico Social Freedom Method™',
                'The Mentico Social Freedom System',
                'Mentico Advanced Social Frameworks',
              ].map((title, idx) => (
                <div
                  key={title}
                  className="mf-reveal"
                  style={{ transitionDelay: `${(idx % 8) * 40}ms` }}
                >
                  <div className="flex items-baseline gap-4 border-b border-white/5 py-4">
                    <span className="font-serif text-sm text-brass/70">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-paper/90">{title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8: THE FOUNDER STORY */}
        <section id="founder" className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1fr_1.4fr]">
            <div className="mf-reveal">
              <p className="text-xs uppercase tracking-[0.2em] text-brass">
                Why I Built Social Freedom
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-paper">
                The Founder Story
              </h2>
              <div className="divider-brass mt-6 w-16"></div>
              <p className="mt-6 text-sm leading-relaxed text-muted">
                I did not build this manual from the perspective of someone who always knew how to talk, connect or handle social situations. For a long time, I was the opposite.
              </p>
            </div>
            <div
              className="mf-reveal space-y-5 text-sm leading-relaxed text-paper/85"
              style={{ transitionDelay: '100ms' }}
            >
              <p>
                I used to fumble while interacting with girls. I would get nervous, overthink simple moments and jump mentally from one thought to another mid-conversation. College didn't magically fix it - some approaches were awkward enough that girls visibly did not want to continue.
              </p>
              <p>
                Then came the corporate years. I could function in a professional environment and still become genuinely nervous talking to women. I could handle work, but I did not know how to handle myself socially. Underneath it all was loneliness I didn't understand - I'd absorbed the idea that career success would make the rest of life fall into place. It did not.
              </p>
              <p>
                What I was missing was social intelligence: knowing what to say when, when to speak and when to listen, tolerating awkwardness, handling rejection without collapsing, and recognising that connection is created by two people - not engineered by one.
              </p>
              <p className="rounded-xl border border-brass/20 bg-brass/5 p-5 font-serif text-base italic text-brass-light">
                That is the philosophy behind Mentico. I am not asking you to become a different personality overnight. I am asking you to build the same kind of evidence that changed me - small actions, real experiences, honest reflection, repeated practice.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 9: WHO THIS IS FOR */}
        <section id="who" className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mf-reveal">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-brass">
                Who This Is For
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-center font-serif text-3xl font-bold text-paper sm:text-4xl">
                Not “become good with girls.” Become the kind of man who can walk into a room.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-center text-muted">
                Someone who can read the situation, start a conversation, express himself, create connection, handle a no, build friendships, pursue romantic interest ethically - and keep living his life without making any single interaction responsible for his self-worth.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {[
                'In college and never learned this at school',
                'Starting a career and socially stalled',
                'Established professionally, still nervous personally',
                'Rebuilding a social life after a hard chapter',
                'Dating, but tired of scripts and pickup lines',
                'Tired of letting fear decide what he does',
              ].map((item, idx) => (
                <div
                  key={item}
                  className="mf-reveal"
                  style={{ transitionDelay: `${(idx % 2) * 80}ms` }}
                >
                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-charcoal/50 p-4">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brass"></span>
                    <span className="text-sm text-paper/90">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 10: BUILT ON CONSENT */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mf-reveal">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-sage">
                Built On Consent
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-center font-serif text-3xl font-bold italic text-paper sm:text-4xl">
                Skill can be trained. People cannot be controlled.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-center leading-relaxed text-muted">
                Consent means a person freely agrees to something. Flirting, clothing, friendliness, nervousness, silence, body language or previous consent do not automatically mean consent. A clear “no” or boundary must be respected immediately.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {[
                'A previous yes does not mean yes now.',
                'Flirting does not equal consent.',
                'Silence is not consent.',
                'A no does not require persuasion.',
              ].map((item, idx) => (
                <div
                  key={item}
                  className="mf-reveal"
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-start gap-3 rounded-xl border border-sage/20 bg-sage/5 p-5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sage"></span>
                    <span className="text-sm text-paper/90">{item}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mf-reveal" style={{ transitionDelay: '150ms' }}>
              <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted">
                Every framework in this manual - approach, conversation, flirting, escalation - is filtered through one standard: does it help you connect honestly, or does it try to manufacture a result the other person hasn't chosen? Mentico only teaches the first kind.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 11: 30-DAY SOCIAL FREEDOM CHALLENGE */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mf-reveal">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-brass">
                The 30-Day Social Freedom Challenge
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-center font-serif text-3xl font-bold text-paper sm:text-4xl">
                Behaviour, built gradually.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-center text-muted">
                Repeat a day. Make a step smaller if you need to. Every step ends with the same three questions: what did I predict, what actually happened, what did I learn?
              </p>
            </div>
            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { days: '1–3', title: 'Presence', desc: 'Phone away. Natural eye contact. Say thank you.' },
                { days: '4–6', title: 'Small questions', desc: 'Ask one cashier, staff member or acquaintance a simple question.' },
                { days: '7–9', title: 'Short conversations', desc: 'Have a 30–60 second conversation without rushing away.' },
                { days: '10–12', title: 'Share yourself', desc: 'State an opinion, preference or small personal story.' },
                { days: '13–15', title: 'Follow threads', desc: 'When someone says something interesting, ask one follow-up.' },
                { days: '16–18', title: 'Join in', desc: 'Enter a group conversation or introduce yourself in a new setting.' },
                { days: '19–21', title: 'Express interest', desc: 'Give one sincere compliment, without demanding a response.' },
                { days: '22–24', title: 'Handle uncertainty', desc: "Do one small action while accepting you can't control the outcome." },
                { days: '25–27', title: 'Invitation', desc: 'If mutual interest is clear, make one simple invitation.' },
                { days: '28–30', title: 'Review & repeat', desc: "Write what you predicted, what happened, and what's next." },
              ].map((item, idx) => (
                <div
                  key={item.days}
                  className="mf-reveal"
                  style={{ transitionDelay: `${(idx % 5) * 70}ms` }}
                >
                  <div className="h-full rounded-xl border border-white/10 bg-charcoal/50 p-5">
                    <span className="text-xs uppercase tracking-[0.15em] text-brass/80">
                      Days {item.days}
                    </span>
                    <p className="mt-2 font-serif text-base text-paper">{item.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 12: REAL RESULTS (TESTIMONIALS) */}
        <section id="testimonials" className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mf-reveal">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-brass">
                Real Results
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl text-center font-serif text-3xl font-bold text-paper sm:text-4xl">
                What others have to say.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-center font-serif text-lg italic text-brass-light/90">
                You can be one of them too.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  tag: 'STOPPED BLENDING IN:',
                  text: 'Before Mentico, I was just a face in the crowd. Now, when I walk into a room, people notice. The strategies are brutal, honest, and entirely effective.',
                  name: 'Arjun Malhotra',
                  achievement: 'Promoted within 6 months',
                },
                {
                  tag: 'TOTAL MENTAL REBUILD:',
                  text: "I didn't just learn how to talk to women. I learned how to respect myself. The internal shift is massive. No more hesitation.",
                  name: 'Rohan Iyer',
                  achievement: 'Eliminated approach anxiety',
                },
                {
                  tag: 'OWNING THE NARRATIVE:',
                  text: 'Mentico dismantled my weak excuses. The program forced me to take accountability for my communication. The results speak for themselves.',
                  name: 'Aditya Sharma',
                  achievement: '3× closing rate in sales',
                },
              ].map((item, idx) => (
                <div
                  key={item.name}
                  className="mf-reveal"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-charcoal/50 p-6 transition duration-300 hover:-translate-y-1 hover:border-brass/30 hover:bg-charcoal/80 hover:shadow-2xl hover:shadow-black/40">
                    <p className="text-xs uppercase tracking-[0.15em] text-brass">{item.tag}</p>
                    <span className="mt-2 font-serif text-4xl leading-none text-brass/40">“</span>
                    <p className="mt-2 flex-1 font-serif text-lg italic leading-relaxed text-paper/95">
                      {item.text}
                    </p>
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <p className="font-serif text-sm text-paper">- {item.name}</p>
                      <p className="mt-1.5 text-sm text-muted">{item.achievement}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 13: INSPIRATIONAL QUOTE */}
        <section className="border-t border-white/5 px-6 py-24">
          <div className="mf-reveal mx-auto max-w-2xl text-center">
            <p className="font-serif text-2xl italic leading-relaxed text-paper sm:text-3xl">
              Be interesting, not performative; warm, not needy; playful, not manipulative; courageous, not reckless; confident, not controlling.
            </p>
            <div className="divider-brass mx-auto mt-8 w-24"></div>
            <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-muted">
              You are not trying to become a person who never feels awkward, nervous or rejected. You are building the ability to participate in life even when those things happen.
            </p>
          </div>
        </section>

        {/* SECTION 14: COMPLETE EDITION / PRICING */}
        <section id="pricing" className="border-t border-white/5 px-6 py-24">
          <div className="mx-auto max-w-xl">
            <div className="mf-reveal">
              <div className="rounded-3xl border border-white/10 bg-charcoal/70 p-10 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-brass">Complete Edition</p>
                <h2 className="mt-4 font-serif text-3xl font-bold text-paper">Get Social Freedom</h2>
                
                {/* Price Display */}
                <div className="mt-4 flex items-baseline justify-center gap-3">
                  <span className="font-serif text-4xl font-bold text-paper">₹499</span>
                  <span className="text-lg text-muted line-through">₹999</span>
                  <span className="rounded-full bg-brass/10 border border-brass/30 px-2.5 py-0.5 text-xs font-semibold text-brass-light">
                    50% OFF
                  </span>
                </div>

                <p className="mt-3 font-serif text-sm italic text-muted">
                  The transformation begins when the page ends.
                </p>
                <ul className="mt-8 space-y-3 text-left">
                  {[
                    'The complete Social Freedom manual - 16 parts, 80 lessons',
                    'Psychology-informed frameworks for anxiety, avoidance and overthinking',
                    'The Mentico Method, Conversation Engine and Ethical Attraction Engine',
                    'The 30-Day Social Freedom Challenge',
                    'Practical, consent-centered approach and conversation guidance',
                    'Lifetime access to updates',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-paper/90">
                      <span className="mt-1 text-brass">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handlePurchaseClick}
                  className="mt-10 block w-full rounded-full bg-brass px-8 py-4 text-center text-sm font-semibold uppercase tracking-wide text-ink shadow-lg shadow-brass/25 transition hover:-translate-y-0.5 hover:bg-brass-light hover:shadow-xl hover:shadow-brass/35 cursor-pointer"
                >
                  {user?.hasPurchasedPdf ? 'Review Manual / Purchase Addons' : 'Get Instant Access'}
                </button>
                {user?.hasPurchasedPdf && (
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="mt-3 block w-full text-center text-xs font-semibold uppercase tracking-wider text-brass-light hover:underline cursor-pointer"
                  >
                    You are already enrolled • Open Social Freedom Hub →
                  </button>
                )}
                <p className="mt-4 text-xs text-muted">
                  Read a little. Go outside. Try something. Come back.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 px-6 py-16">
          <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
            <div>
              <img
                alt="Mentico"
                src="/mentico-badge-logo.png"
                className="h-6 w-auto opacity-80 rounded"
              />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
                A field manual for social confidence, connection and courage.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-brass">Contact</p>
              <a
                href="mailto:hello@mentico.com"
                className="mt-4 block text-sm text-paper/90 transition hover:text-brass-light"
              >
                hello@mentico.com
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-brass">Follow</p>
              <div className="mt-4 flex gap-3">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-paper/80 transition hover:border-brass/60 hover:text-brass-light"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-4 w-4"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                    <circle cx="12" cy="12" r="4"></circle>
                    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"></circle>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="X"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-paper/80 transition hover:border-brass/60 hover:text-brass-light"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M18.9 3H21.6L15.5 10.1L22.7 21H16.9L12.5 14.7L7.4 21H4.7L11.3 13.4L4.3 3H10.3L14.2 8.7L18.9 3ZM17.9 19.2H19.5L9.1 4.7H7.4L17.9 19.2Z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-paper/80 transition hover:border-brass/60 hover:text-brass-light"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-4 w-4"
                  >
                    <rect x="3" y="5.5" width="18" height="13" rx="4"></rect>
                    <path d="M10.5 9.5L15 12L10.5 14.5V9.5Z" fill="currentColor" stroke="none"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-6xl border-t border-white/5 pt-6 text-center text-xs text-muted sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>© 2026 Mentico. All rights reserved.</div>
            <div className="flex gap-4">
              <Link to="/legal" className="hover:text-brass-light transition">
                Privacy & Terms
              </Link>
              <Link to="/about" className="hover:text-brass-light transition">
                About
              </Link>
              <Link to="/contact" className="hover:text-brass-light transition">
                Support
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

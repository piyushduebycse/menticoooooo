import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ZoomIn } from 'lucide-react';
import './ChatTestimonials.css';
const messages = [
  { src: '/images/reader-chat-1.jpg', width: 1280, height: 1169, caption: 'Starting small. Feeling the difference.', alt: 'Redacted reader chat: after five to six days of practice, a reader started a conversation at a café and reports less hesitation at the gym, office and when meeting new people.' },
  { src: '/images/reader-chat-2.jpg', width: 1169, height: 1280, caption: 'More comfortable in everyday conversations.', alt: 'Redacted reader chat: a reader finds the frameworks practical and reports feeling more comfortable starting conversations at work, social events and in daily life.' },
  { src: '/images/reader-chat-3.jpg', width: 1169, height: 1280, caption: 'One conversation. A real first step.', alt: 'Redacted reader chat: a reader shares a short, natural conversation at a coffee counter and says repeated small interactions feel less awkward.' },
];

const AUTO_SCROLL_DELAY = 2000;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function move(grid, direction, wrap = false) {
  const cards = Array.from(grid.children);
  const maxScroll = grid.scrollWidth - grid.clientWidth;
  const positions = cards.map(card => Math.min(card.offsetLeft - cards[0].offsetLeft, maxScroll));
  const current = positions.reduce((nearest, position, index) =>
    Math.abs(position - grid.scrollLeft) < Math.abs(positions[nearest] - grid.scrollLeft) ? index : nearest, 0);
  const next = current + direction;
  const target = wrap ? (next + positions.length) % positions.length : next;
  if (positions[target] === undefined) return;

  grid.scrollTo({
    left: positions[target],
    behavior: next !== target || window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'instant' : 'smooth',
  });
}

export default function ChatTestimonials() {
  const gridRef = useRef(null);
  const lastInteraction = useRef(-Infinity);
  const [playing, setPlaying] = useState(() => !window.matchMedia(REDUCED_MOTION_QUERY).matches);

  useEffect(() => {
    if (!playing) return;
    const grid = gridRef.current;
    const timer = window.setInterval(() => {
      // Touch can leave the region focused after a swipe. Only keyboard focus
      // should pause autoplay until focus leaves; touch pauses are temporary.
      if (document.hidden || grid.scrollWidth <= grid.clientWidth || grid.matches(':focus-visible, :active') || grid.querySelector(':focus-visible') ||
        performance.now() - lastInteraction.current < AUTO_SCROLL_DELAY) return;

      const bounds = grid.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) move(grid, 1, true);
    }, AUTO_SCROLL_DELAY);
    return () => window.clearInterval(timer);
  }, [playing]);

  function moveManually(direction) {
    lastInteraction.current = performance.now();
    move(gridRef.current, direction);
  }

  return <div className="chat-testimonials">
    <p className="chat-proof-intro">Real messages from readers. Tap a screenshot to view it full size. Individual experiences vary.</p>
    <div ref={gridRef} className="chat-testimonial-grid" role="region" aria-label="Three reader chat testimonials" tabIndex={0} onPointerDown={() => { lastInteraction.current = performance.now(); }} onPointerUp={() => { lastInteraction.current = performance.now(); }}>
      {messages.map((message,index) => <figure key={message.src} className="chat-testimonial-card"><a href={message.src} target="_blank" rel="noopener noreferrer" aria-label={`Open reader chat ${index + 1} full size`}><img src={message.src} width={message.width} height={message.height} alt={message.alt} loading="lazy"/><span className="chat-enlarge"><ZoomIn size={15}/>View full chat</span></a><figcaption><strong>{message.caption}</strong><span>Reader message {index + 1} of 3</span></figcaption></figure>)}
    </div>
    <div className="chat-testimonial-controls">
      <button type="button" className="btn btn-secondary" onClick={() => moveManually(-1)} aria-label="Previous reader testimonial"><ChevronLeft size={20}/></button>
      <span>Swipe to read all 3 messages</span>
      <button type="button" className="btn btn-secondary" onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause automatic scrolling' : 'Resume automatic scrolling'}>{playing ? <Pause size={20}/> : <Play size={20}/>}</button>
      <button type="button" className="btn btn-secondary" onClick={() => moveManually(1)} aria-label="Next reader testimonial"><ChevronRight size={20}/></button>
    </div>
  </div>;
}

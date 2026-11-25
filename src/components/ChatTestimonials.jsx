import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import './ChatTestimonials.css';
const messages = [
  { src: '/images/reader-chat-1.jpg', width: 1280, height: 1169, caption: 'Starting small. Feeling the difference.', alt: 'Redacted reader chat: after five to six days of practice, a reader started a conversation at a café and reports less hesitation at the gym, office and when meeting new people.' },
  { src: '/images/reader-chat-2.jpg', width: 1169, height: 1280, caption: 'More comfortable in everyday conversations.', alt: 'Redacted reader chat: a reader finds the frameworks practical and reports feeling more comfortable starting conversations at work, social events and in daily life.' },
  { src: '/images/reader-chat-3.jpg', width: 1169, height: 1280, caption: 'One conversation. A real first step.', alt: 'Redacted reader chat: a reader shares a short, natural conversation at a coffee counter and says repeated small interactions feel less awkward.' },
];
export default function ChatTestimonials() {
  const move = (event, direction) => {
    const grid = event.currentTarget.closest('.chat-testimonials').querySelector('.chat-testimonial-grid');
    grid.scrollBy({ left: direction * (grid.firstElementChild.offsetWidth + 16), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <div className="chat-testimonials">
    <p className="chat-proof-intro">Real messages from readers. Tap a screenshot to view it full size. Individual experiences vary.</p>
    <div className="chat-testimonial-grid" role="region" aria-label="Three reader chat testimonials" tabIndex={0}>
      {messages.map((message,index) => <figure key={message.src} className="chat-testimonial-card"><a href={message.src} target="_blank" rel="noopener noreferrer" aria-label={`Open reader chat ${index + 1} full size`}><img src={message.src} width={message.width} height={message.height} alt={message.alt} loading="lazy"/><span className="chat-enlarge"><ZoomIn size={15}/>View full chat</span></a><figcaption><strong>{message.caption}</strong><span>Reader message {index + 1} of 3</span></figcaption></figure>)}
    </div>
    <div className="chat-testimonial-controls"><button className="btn btn-secondary" onClick={event => move(event,-1)} aria-label="Previous reader testimonial"><ChevronLeft size={20}/></button><span>Swipe to read all 3 messages</span><button className="btn btn-secondary" onClick={event => move(event,1)} aria-label="Next reader testimonial"><ChevronRight size={20}/></button></div>
  </div>;
}

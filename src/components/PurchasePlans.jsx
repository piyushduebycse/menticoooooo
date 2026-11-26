import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCT_PLANS } from '../../shared/product.js';
import PaymentMethods from './PaymentMethods';
import './PurchasePlans.css';

const communityBenefits = [
  'Access to the private Mentico Telegram community',
  'Guidance from the Mentico mentor',
];

export default function PurchasePlans({ selected, onSelect, disabled = false }) {
  const gridRef = useRef(null);
  const gridId = `pricing-${useId().replace(/:/g, '')}`;
  const [activeIndex, setActiveIndex] = useState(selected === 'pdf_mentor' ? 1 : 0);
  const scrollToPlan = useCallback((index, behavior = 'smooth') => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = [...grid.children];
    const next = Math.max(0, Math.min(cards.length - 1, index));
    grid.scrollTo({ left: cards[next].offsetLeft - cards[0].offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : behavior });
  }, []);
  useEffect(() => {
    if (selected && window.matchMedia('(max-width:767px)').matches) scrollToPlan(selected === 'pdf_mentor' ? 1 : 0, 'instant');
  }, [selected, scrollToPlan]);
  useEffect(() => {
    let frame;
    const alignSelectedPlan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (selected && window.matchMedia('(max-width:767px)').matches) scrollToPlan(selected === 'pdf_mentor' ? 1 : 0, 'instant');
      });
    };
    window.addEventListener('resize', alignSelectedPlan);
    return () => { window.removeEventListener('resize', alignSelectedPlan); cancelAnimationFrame(frame); };
  }, [selected, scrollToPlan]);
  const handleScroll = () => {
    const grid = gridRef.current;
    const cards = [...grid.children];
    let closest = 0;
    cards.forEach((card,index) => {
      if (Math.abs(card.offsetLeft - cards[0].offsetLeft - grid.scrollLeft) < Math.abs(cards[closest].offsetLeft - cards[0].offsetLeft - grid.scrollLeft)) closest = index;
    });
    setActiveIndex(closest);
  };
  const selecting = typeof onSelect === 'function';
  return <section className={`purchase-plans ${selecting ? 'is-selecting' : ''}`} aria-labelledby="purchase-plans-title">
    <div className="purchase-plans-intro"><span className="badge-red">YOUR NEXT SMALL STEP</span><h2 id="purchase-plans-title">{selecting ? 'Choose your plan.' : 'Choose how you want to begin.'}</h2><p>One payment. Lifetime access to your downloadable field guide.</p></div>
    <div className="pricing-slider-tabs" role="group" aria-label="Compare purchase options"><button type="button" aria-pressed={activeIndex === 0} aria-controls={gridId} onClick={() => { if (selecting) onSelect('pdf'); scrollToPlan(0); }} disabled={disabled}>₹299 · Field Guide</button><button type="button" aria-pressed={activeIndex === 1} aria-controls={gridId} onClick={() => { if (selecting) onSelect('pdf_mentor'); scrollToPlan(1); }} disabled={disabled}>₹499 · Most popular</button></div>
    <div className="purchase-plan-grid" id={gridId} ref={gridRef} onScroll={handleScroll} role="region" aria-label="Purchase plans — swipe to compare" tabIndex={0} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); scrollToPlan(activeIndex + (event.key === 'ArrowRight' ? 1 : -1)); }
    }}>
      {Object.values(PRODUCT_PLANS).map(plan => <div key={plan.id} className={`purchase-plan ${selected === plan.id ? 'is-selected' : ''} ${plan.hasTelegramAccess ? 'is-mentor' : ''}`}>
        <div className="purchase-plan-badges">
          <span className="purchase-plan-discount">{Math.round((1 - plan.priceInr / plan.originalPriceInr) * 100)}% OFF</span>
          {plan.hasTelegramAccess && <span className="purchase-plan-popular">MOST POPULAR</span>}
        </div>
        <div className="purchase-plan-heading"><h3>{plan.name}</h3>{plan.hasTelegramAccess && <MessageCircle size={22} aria-hidden="true"/>}</div>
        <div className="purchase-plan-price">
          <del aria-label={`Original price ₹${plan.originalPriceInr.toLocaleString('en-IN')}`}>₹{plan.originalPriceInr.toLocaleString('en-IN')}</del>
          <strong>₹{plan.priceInr.toLocaleString('en-IN')}</strong>
          <span>Discounted price · one-time payment</span>
        </div>
        <ul>
            <li><Check size={17} aria-hidden="true"/><span>Comprehensive downloadable Social Freedom Course</span></li>
            <li><Check size={17} aria-hidden="true"/><span>30-day challenge, practical frameworks & exercises</span></li>
            <li><Check size={17} aria-hidden="true"/><span>Read offline on your phone, tablet or laptop</span></li>
          {communityBenefits.map(benefit => plan.hasTelegramAccess ? (
            <li key={benefit}><Check size={17} aria-hidden="true"/><span>{benefit}</span></li>
          ) : (
            <li key={benefit} className="purchase-plan-excluded"><X size={17} aria-hidden="true"/><span>{benefit} <small>Not included</small></span></li>
          ))}
        </ul>
        {selecting ? <label className={`purchase-plan-select ${disabled ? 'is-disabled' : ''}`}><input type="radio" name="purchase-plan" value={plan.id} aria-label={plan.hasTelegramAccess ? 'Choose Field Guide + Community — ₹499' : 'Choose the Field Guide — ₹299'} checked={selected === plan.id} onChange={() => onSelect(plan.id)} disabled={disabled}/><span>{selected === plan.id ? 'Selected' : 'Choose plan'}</span></label> : <Link className="btn btn-primary" to={`/purchase?plan=${plan.id}#checkout-card`}>{plan.hasTelegramAccess ? 'Get Field Guide + Community' : 'Get the Field Guide'}<ArrowRight size={16}/></Link>}
        <p className="purchase-plan-assurance">UPI, cards, wallets · No refunds after access is provided.*</p>
      </div>)}
    </div>
    <div className="pricing-slider-controls"><button type="button" className="btn btn-secondary" aria-label="Previous pricing plan" aria-controls={gridId} disabled={disabled || activeIndex === 0} onClick={() => scrollToPlan(activeIndex - 1)}><ChevronLeft size={20}/></button><span aria-live="polite">{activeIndex + 1} of 2 · Swipe to compare</span><button type="button" className="btn btn-secondary" aria-label="Next pricing plan" aria-controls={gridId} disabled={disabled || activeIndex === 1} onClick={() => scrollToPlan(activeIndex + 1)}><ChevronRight size={20}/></button></div>
    <p className="purchase-plan-note">Mentor participation and responses are subject to availability. No guaranteed response times or scheduled one-to-one sessions. *Except where required by law. <Link to="/terms#refunds">Read the refund policy</Link>.</p>
    {!selecting && <PaymentMethods compact/>}
  </section>;
}

import { Link } from 'react-router-dom';
import { Check, ArrowRight, MessageCircle } from 'lucide-react';
import { PRODUCT_PLANS } from '../../shared/product.js';
import './PurchasePlans.css';
export default function PurchasePlans({ selected, onSelect, disabled = false }) {
  const selecting = typeof onSelect === 'function';
  return <section className="purchase-plans" aria-labelledby="purchase-plans-title">
    <div className="purchase-plans-intro"><span className="badge-red">CHOOSE YOUR WAY FORWARD</span><h2 id="purchase-plans-title">The guide. Or the guide, with guidance.</h2><p>One payment. Choose the support that works for you.</p></div>
    <div className="purchase-plan-grid">
      {Object.values(PRODUCT_PLANS).map(plan => <div key={plan.id} className={`purchase-plan ${selected === plan.id ? 'is-selected' : ''} ${plan.hasTelegramAccess ? 'is-mentor' : ''}`}>
        <div className="purchase-plan-heading"><h3>{plan.hasTelegramAccess ? 'PDF + Telegram' : 'PDF only'}</h3>{plan.hasTelegramAccess && <MessageCircle size={22} aria-hidden="true"/>}</div>
        <p className="purchase-plan-price">₹{plan.priceInr}<span>one-time payment</span></p>
        <ul><li><Check size={17}/><span>Complete Social Freedom PDF in the protected reader</span></li><li><Check size={17}/><span>30-day challenge, frameworks & practical exercises</span></li>{plan.hasTelegramAccess && <><li><Check size={17}/><span>Access to the Mentico Telegram community</span></li><li><Check size={17}/><span>Guidance from the Mentico mentor, subject to availability</span></li></>}</ul>
        {selecting ? <label className={`purchase-plan-select ${disabled ? 'is-disabled' : ''}`}><input type="radio" name="purchase-plan" value={plan.id} checked={selected === plan.id} onChange={() => onSelect(plan.id)} disabled={disabled}/><span>{plan.hasTelegramAccess ? 'Choose PDF + Telegram — ₹499' : 'Choose PDF only — ₹299'}</span></label> : <Link className="btn btn-primary" to={`/purchase?plan=${plan.id}`}>{plan.hasTelegramAccess ? 'Get PDF + Telegram' : 'Get the PDF'}<ArrowRight size={16}/></Link>}
      </div>)}
    </div>
    <p className="purchase-plan-note">Mentor participation and responses are subject to availability. No guaranteed response times or scheduled one-to-one sessions.</p>
  </section>;
}

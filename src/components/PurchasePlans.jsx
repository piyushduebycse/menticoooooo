import { Link } from 'react-router-dom';
import { Check, ArrowRight, MessageCircle } from 'lucide-react';
import { PRODUCT_PLANS } from '../../shared/product.js';
import PaymentMethods from './PaymentMethods';
import './PurchasePlans.css';
export default function PurchasePlans({ selected, onSelect, disabled = false }) {
  const selecting = typeof onSelect === 'function';
  return <section className={`purchase-plans ${selecting ? 'is-selecting' : ''}`} aria-labelledby="purchase-plans-title">
    <div className="purchase-plans-intro"><span className="badge-red">YOUR NEXT SMALL STEP</span><h2 id="purchase-plans-title">{selecting ? 'Choose your plan.' : 'Choose how you want to begin.'}</h2><p>One payment. Lifetime access to your downloadable field guide.</p></div>
    <div className="purchase-plan-grid">
      {Object.values(PRODUCT_PLANS).map(plan => <div key={plan.id} className={`purchase-plan ${selected === plan.id ? 'is-selected' : ''} ${plan.hasTelegramAccess ? 'is-mentor' : ''}`}>
        {plan.hasTelegramAccess && <span className="purchase-plan-popular">MOST POPULAR</span>}
        <div className="purchase-plan-heading"><h3>{plan.hasTelegramAccess ? 'Private Community & Support' : 'The Field Guide'}</h3>{plan.hasTelegramAccess && <MessageCircle size={22} aria-hidden="true"/>}</div>
        <p className="purchase-plan-price">₹{plan.priceInr}<span>one-time payment</span></p>
        {plan.hasTelegramAccess && <p className="purchase-plan-upgrade">Everything in the ₹299 Field Guide, plus:</p>}
        <ul>{plan.hasTelegramAccess ? <><li><Check size={17}/><span>Access to the private Mentico Telegram community</span></li><li><Check size={17}/><span>Guidance from the Mentico mentor</span></li></> : <><li><Check size={17}/><span>90-page downloadable Social Freedom PDF</span></li><li><Check size={17}/><span>30-day challenge, practical frameworks & exercises</span></li><li><Check size={17}/><span>Read offline on your phone, tablet or laptop</span></li></>}</ul>
        {selecting ? <label className={`purchase-plan-select ${disabled ? 'is-disabled' : ''}`}><input type="radio" name="purchase-plan" value={plan.id} aria-label={plan.hasTelegramAccess ? 'Choose Community & Support — ₹499' : 'Choose the Field Guide — ₹299'} checked={selected === plan.id} onChange={() => onSelect(plan.id)} disabled={disabled}/><span>{selected === plan.id ? 'Selected' : 'Choose plan'}</span></label> : <Link className="btn btn-primary" to={`/purchase?plan=${plan.id}#checkout-card`}>{plan.hasTelegramAccess ? 'Get Community & Support' : 'Get the Field Guide'}<ArrowRight size={16}/></Link>}
        <p className="purchase-plan-assurance">UPI, cards, wallets · No refunds after access is provided.*</p>
      </div>)}
    </div>
    <p className="purchase-plan-note">Mentor participation and responses are subject to availability. No guaranteed response times or scheduled one-to-one sessions. *Except where required by law. <Link to="/terms#refunds">Read the refund policy</Link>.</p>
    {!selecting && <PaymentMethods compact/>}
  </section>;
}

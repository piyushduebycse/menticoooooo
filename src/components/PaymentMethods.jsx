import { LockKeyhole, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PaymentMethods.css';
export default function PaymentMethods({ compact = false }) {
  return <div className={`payment-methods ${compact ? 'is-compact' : ''}`}>
    <div className="payment-logos" role="img" aria-label="UPI, Mastercard, Visa, RuPay and wallets">
      <svg viewBox="0 0 115 38" aria-hidden="true"><text x="1" y="28" fontFamily="Arial,sans-serif" fontSize="30" fontWeight="900" fontStyle="italic" fill="#525454">UPI</text><path d="M81 4 74 33 94 18Z" fill="#e67824"/><path d="M92 4 85 33 105 18Z" fill="#258343"/></svg>
      <svg viewBox="0 0 100 58" aria-hidden="true"><circle cx="34" cy="23" r="21" fill="#eb001b"/><circle cx="62" cy="23" r="21" fill="#f79e1b" fillOpacity=".94"/><text x="48" y="55" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="10" fill="#333">mastercard</text></svg>
      <svg viewBox="0 0 105 38" aria-hidden="true"><text x="1" y="30" fontFamily="Arial,sans-serif" fontSize="35" fontWeight="900" fontStyle="italic" fill="#123975">VISA</text></svg>
      <svg viewBox="0 0 116 38" aria-hidden="true"><text x="1" y="28" fontFamily="Arial,sans-serif" fontSize="26" fontWeight="900" fontStyle="italic" fill="#172a61">RuPay</text><path d="M97 5 90 32 106 18Z" fill="#e67824"/><path d="M107 5 100 32 116 18Z" fill="#258343"/></svg>
    </div>
    <p className="payment-methods-caption"><WalletCards size={16}/>UPI, cards, wallets <span>·</span><LockKeyhole size={14}/>Secure checkout via Razorpay</p>
    {!compact && <nav className="payment-policy-links" aria-label="Payment policies"><Link to="/terms">Terms & conditions</Link><Link to="/terms#privacy">Privacy policy</Link><Link to="/terms#refunds">Refund policy</Link></nav>}
  </div>;
}

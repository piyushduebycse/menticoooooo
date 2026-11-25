import PurchasePlans from '../components/PurchasePlans';
import { PENDING_PAYMENT_KEY, readPendingPayment, confirmPayment } from '../services/purchase';
import { getProductPlan } from '../../shared/product.js';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { openRazorpayCheckout } from '../services/razorpay';
import { trackCheckoutInitiated, trackPurchaseSuccess } from '../services/analytics';
import { celebratePurchase } from '../services/celebratePurchase';
import PaymentMethods from '../components/PaymentMethods';
import usePurchaseAccess from '../hooks/usePurchaseAccess';
import './Checkout.css';



export default function Product() {
  const { user, markPurchased } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storedPass = (() => {
    try {
      return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mentico_access_pass') || '{}') : {};
    } catch {
      return {};
    }
  })();

  const { access } = usePurchaseAccess();
  const hasPurchased = Boolean(access);

  const [couponError, setCouponError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Guest Checkout Fields: Name, Email & Phone
  const [buyerName, setBuyerName] = useState(user?.displayName || user?.name || storedPass?.name || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || storedPass?.email || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phoneNumber || '');

  useEffect(() => {
    if (searchParams.get('denied') === 'true') {
      setPaymentNotice({
        type: 'cancelled',
        message: 'A verified purchase is required to download the field guide. No active purchase was found.',
      });
    } else if (searchParams.get('cancelled') === 'true' || searchParams.get('payment') === 'cancelled') {
      setPaymentNotice({
        type: 'cancelled',
        message: "Payment was cancelled. No access has been granted. You can try again whenever you're ready.",
      });
    } else if (searchParams.get('failed') === 'true' || searchParams.get('error') === 'true') {
      setPaymentNotice({
        type: 'failed',
        message: 'Payment was not completed. If you were charged, contact support before trying again.',
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.displayName && !buyerName) setBuyerName(user.displayName);
    if (user?.email && !buyerEmail) setBuyerEmail(user.email);
    if (user?.phoneNumber && !buyerPhone) setBuyerPhone(user.phoneNumber);
  }, [user]);

  const [selectedPlan, setSelectedPlan] = useState(() => getProductPlan(searchParams.get('plan'))?.id || 'pdf');
  const plan = getProductPlan(selectedPlan);
  const currentPrice = plan.priceInr;

  const [pendingPayment, setPendingPayment] = useState(readPendingPayment);
  const activatePurchase = async (receipt) => {
    const data = await confirmPayment(receipt);
    const accessPass = { ...data, hasPurchased: true };
    try {
      localStorage.setItem('mentico_access_pass', JSON.stringify(accessPass));
      localStorage.removeItem(PENDING_PAYMENT_KEY);
    } catch {}
    setPendingPayment(null);
    markPurchased?.(accessPass);
    trackPurchaseSuccess({ orderId: data.orderId, paymentId: data.paymentId, amount: data.amountInPaise / 100 });
    try { celebratePurchase(); } catch {}
    window.dispatchEvent(new Event('mentico:purchase'));
    navigate('/library', { state: { fromPayment: true, accessPass } });
  };

  const handlePurchase = async () => {
    setCouponError('');
    setPaymentNotice(null);

    if (hasPurchased) {
      navigate('/library');
      return;
    }

    if (pendingPayment) {
      setIsPurchasing(true);
      try { await activatePurchase(pendingPayment); }
      catch (err) { setPaymentNotice({ type: 'pending', message: err.message }); }
      finally { setIsPurchasing(false); }
      return;
    }

    const trimmedName = buyerName.trim();
    const trimmedEmail = buyerEmail.trim().toLowerCase();

    if (!trimmedName) {
      setCouponError('Please enter your full name to personalize your manual.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setCouponError('Please enter a valid email address to receive your access pass.');
      return;
    }

    setIsPurchasing(true);

    try {
      const headers = { 'Content-Type': 'application/json' };

      trackCheckoutInitiated({ price: currentPrice, userEmail: trimmedEmail });

      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: buyerPhone.trim(),
          planId: selectedPlan,
          displayedAmountInPaise: Math.round(currentPrice * 100),
        }),
      });

      let orderData;
      const orderContentType = orderRes.headers.get('content-type') || '';
      if (orderContentType.includes('application/json')) {
        orderData = await orderRes.json();
      } else {
        const textError = await orderRes.text();
        throw new Error(textError || `Order creation failed (Server HTTP ${orderRes.status}).`);
      }

      if (!orderRes.ok || !orderData.success) {
        if (orderData.code === 'razorpay/not-configured') {
          throw new Error('Checkout is not configured yet. Please contact support.');
        }
        throw new Error(orderData.error || 'Could not initiate payment order.');
      }

      if (orderData.alreadyPurchased) {
        navigate('/library');
        return;
      }

      await openRazorpayCheckout({
        order: orderData,
        user: {
          name: trimmedName,
          displayName: trimmedName,
          email: trimmedEmail,
          phoneNumber: buyerPhone.trim(),
        },
        onSuccess: async (paymentResponse) => {
          const receipt = { orderId: paymentResponse.razorpay_order_id, paymentId: paymentResponse.razorpay_payment_id,
            signature: paymentResponse.razorpay_signature };
          try { localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(receipt)); } catch {}
          setPendingPayment(receipt);
          await activatePurchase(receipt);
        },
        onFailure: (err) => {
          if (readPendingPayment()) { setPaymentNotice({ type: 'pending', message: err.message }); return; }
          if (err.isCancelled || err.code === 'PAYMENT_CANCELLED' || err.message?.includes('cancelled') || err.message?.includes('closed before completion')) {
            setPaymentNotice({
              type: 'cancelled',
              message: "Payment was cancelled. No access has been granted. You can try again whenever you're ready.",
            });
            setCouponError('');
          } else {
            setPaymentNotice({
              type: 'failed',
              message: err.message || 'Payment did not complete. If you were charged, contact support before trying again.',
            });
          }
        },
      });
    } catch (err) {
      console.error('[Purchase Error]:', err);
      if (readPendingPayment()) { setPaymentNotice({ type: 'pending', message: err.message }); return; }
      if (err.isCancelled || err.code === 'PAYMENT_CANCELLED' || err.message?.includes('cancelled') || err.message?.includes('closed before completion')) {
        setPaymentNotice({
          type: 'cancelled',
          message: "Payment was cancelled. No access has been granted. You can try again whenever you're ready.",
        });
      } else {
        setPaymentNotice({
          type: 'failed',
          message: err.message || 'Payment initiation failed. Please try again.',
        });
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return <section className="purchase-page container">
    <header className="checkout-intro"><span className="badge-red">SOCIAL FREEDOM · BY MENTICO</span><h1>One small step.<br/>More real conversations.</h1><p>Choose your field guide, pay once, and download your Course. Start practising today.</p></header>
    {hasPurchased ? <div className="checkout-owned card"><CheckCircle2 size={30}/><h2>Your field guide is ready.</h2><p>You’ve already purchased. Open your download page to save the Course and see everything included in your plan.</p><Link className="btn btn-primary" to="/library"><BookOpen size={20}/>Open my downloads<ArrowRight size={18}/></Link></div> : <>
      <PurchasePlans selected={selectedPlan} onSelect={setSelectedPlan} disabled={isPurchasing || Boolean(pendingPayment)}/>
      <div className="checkout-layout">
        <div className="checkout-form-card" id="checkout-card">
          <div className="checkout-order-heading"><div><span className="checkout-eyebrow">YOUR SELECTED PLAN</span><h2>{plan.name}</h2></div><div className="checkout-total"><strong>₹{currentPrice}</strong><del aria-label={`Original price ₹${plan.originalPriceInr.toLocaleString('en-IN')}`}>₹{plan.originalPriceInr.toLocaleString('en-IN')}</del></div></div>
          <form onSubmit={event => { event.preventDefault(); handlePurchase(); }}>
            <label htmlFor="checkout-buyer-name">Full name</label><input id="checkout-buyer-name" type="text" autoComplete="name" placeholder="Your name" value={buyerName} onChange={event => setBuyerName(event.target.value)} maxLength={120} required={!pendingPayment} disabled={isPurchasing}/>
            <label htmlFor="checkout-buyer-email">Purchase email</label><input id="checkout-buyer-email" type="email" autoComplete="email" placeholder="you@example.com" value={buyerEmail} onChange={event => setBuyerEmail(event.target.value)} maxLength={254} required={!pendingPayment} disabled={isPurchasing}/>
            <p className="checkout-email-hint">Your purchase confirmation and download link go here. Please check the spelling.</p>
            {couponError && <p className="checkout-notice checkout-notice-error" role="alert">{couponError}</p>}
            {paymentNotice && <div className={`checkout-notice ${paymentNotice.type === 'pending' ? '' : 'checkout-notice-error'}`} role="alert"><strong>{paymentNotice.type === 'pending' ? 'Payment confirmation pending' : paymentNotice.type === 'cancelled' ? 'Payment cancelled' : 'Payment not completed'}</strong><p>{paymentNotice.message}</p></div>}
            <button type="submit" className="btn btn-primary checkout-pay-button" disabled={isPurchasing}>{isPurchasing ? <><Spinner size="sm"/>Confirming…</> : <>{pendingPayment ? 'Confirm payment & get my Course' : `Pay ₹${currentPrice} & get my Course`}<ArrowRight size={20}/></>}</button>
            <p className="checkout-no-refunds">Instant digital delivery. No refunds after access is provided, except where required by law. <Link to="/terms#refunds">Read the policy</Link>.</p>
          </form>
          <PaymentMethods/>
        </div>
        <aside className="checkout-summary"><img src="/images/book_isolated.jpg" alt="Social Freedom by Mentico"/><h2>Yours to read.<br/>Yours to practise.</h2><ul><li><CheckCircle2 size={17}/>90-page downloadable Course</li><li><CheckCircle2 size={17}/>30-day social confidence challenge</li><li><CheckCircle2 size={17}/>Read offline or print for personal use</li><li><CheckCircle2 size={17}/>Lifetime access to your field guide</li>{plan.hasTelegramAccess && <><li><CheckCircle2 size={17}/>Private Telegram community</li><li><CheckCircle2 size={17}/>Mentor guidance, subject to availability</li></>}</ul><p>Already purchased? Open the download link in your confirmation email. <Link to="/contact">Need help?</Link></p></aside>
      </div>
    </>}
  </section>;
}

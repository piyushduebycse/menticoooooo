import { PENDING_PAYMENT_KEY, readPendingPayment, confirmPayment } from '../services/purchase';
import { PRODUCT_PRICE_INR, PRODUCT_ORIGINAL_PRICE_INR } from '../../shared/product.js';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  Shield,
  Star,
  ArrowRight,
  BookOpen,
  Sparkles,
  X,
  AlertTriangle,
  Compass,
  User,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { openRazorpayCheckout } from '../services/razorpay';
import { trackCheckoutInitiated, trackPurchaseSuccess } from '../services/analytics';
import confetti from 'canvas-confetti';

const courseLoadingNote = '* After purchase, please allow up to 1 minute for the course to load.';

export default function Product() {
  const { user, markPurchased } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  useEffect(() => {
    const card = document.getElementById('checkout-card');
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => setCheckoutVisible(entry.isIntersecting), { rootMargin: '-76px 0px -30px 0px' });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);


  const storedPass = (() => {
    try {
      return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mentico_access_pass') || '{}') : {};
    } catch {
      return {};
    }
  })();

  const isRevoked = user?.status === 'cancelled' || user?.status === 'refunded' || user?.status === 'failed';
  const hasPurchased = !isRevoked && Boolean(storedPass?.accessToken);

  const [couponError, setCouponError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Guest Checkout Fields: Name, Email & Phone
  const [buyerName, setBuyerName] = useState(user?.displayName || user?.name || storedPass?.name || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || storedPass?.email || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phoneNumber || '');

  useEffect(() => {
    if (searchParams.get('denied') === 'true') {
      setPaymentNotice({
        type: 'cancelled',
        message: 'A verified purchase is required to access the Protected PDF Reader. No active purchase was found.',
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

  const originalPrice = PRODUCT_ORIGINAL_PRICE_INR; // in INR
  const currentPrice = PRODUCT_PRICE_INR;

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
    trackPurchaseSuccess({ orderId: data.orderId, paymentId: data.paymentId, amount: currentPrice });
    try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch {}
    setPurchaseSuccess(true);
    navigate('/library?openPdf=true', { state: { openPdf: true, fromPayment: true, accessPass } });
  };

  const handlePurchase = async () => {
    setCouponError('');
    setPaymentNotice(null);

    if (hasPurchased) {
      navigate('/library?openPdf=true', { state: { openPdf: true } });
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
        navigate('/library?openPdf=true');
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

  const whatYoureGetting = [
    '90 pages of practical, actionable content',
    'Step-by-step social confidence frameworks',
    'Conversation starters and engagement techniques',
    'Approaching women ethically and respectfully',
    'Handling rejection without losing your composure',
    'Real-life scenarios and practical examples',
    '30-day Social Freedom Challenge',
    'Quick-reference cheat sheets and final field card',
  ];

  return (
    <div className="section" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
      <div className="container product-page-container">
        
        {/* ==================================================================
            HERO SECTION
            ================================================================== */}
        <div className="product-intro" style={{ maxWidth: '880px', margin: '0 auto 3rem', textAlign: 'left' }}>
          <div className="badge-red" style={{ marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>SOCIAL FREEDOM BY MENTICO</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.1rem, 4.8vw, 3.2rem)',
              fontWeight: 800,
              lineHeight: 1.18,
              color: 'var(--text-main)',
              marginBottom: '1.15rem',
              letterSpacing: '-0.02em',
            }}
          >
            Your next conversation starts here.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.15rem, 2.2vw, 1.35rem)',
              fontWeight: 600,
              color: 'var(--red-primary)',
              lineHeight: 1.4,
              marginBottom: '1rem',
            }}
          >
            Stop overthinking every interaction. Start showing up with confidence.
          </p>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              maxWidth: '820px',
            }}
          >
            Get the practical system to help you approach people, start conversations, handle awkward moments, navigate rejection and build meaningful social connections.
          </p>
        </div>

        {/* ==================================================================
            MAIN CONTENT & STICKY CHECKOUT GRID
            ================================================================== */}
        <div className="product-overview-grid" style={{ alignItems: 'start' }}>
          
          {/* Left Column: What You're Getting, Practice Philosophy & Call to Action */}
          <div className="product-details" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Section 1: What You're Getting */}
            <div className="card product-inclusions" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--red-subtle)',
                    border: '1px solid var(--red-subtle-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--red-primary)',
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>What You're Getting</h2>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ACTIONABLE SOCIAL CONFIDENCE MANUAL
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {whatYoureGetting.map((item, idx) => (
                  <div
                    key={idx}
                    className="product-inclusion-item"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <CheckCircle2
                      size={20}
                      color="var(--red-primary)"
                      style={{ flexShrink: 0, marginTop: '2px' }}
                    />
                    <span
                      style={{
                        fontSize: '0.96rem',
                        color: 'var(--text-main)',
                        fontWeight: 500,
                        lineHeight: 1.45,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: This Isn't Just Something to Read. It's Something to Practise. */}
            <div
              className="card"
              style={{
                padding: '2rem',
                backgroundColor: 'var(--bg-surface)',
                borderLeft: '4px solid var(--red-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <Compass size={22} color="var(--red-primary)" />
                <h3
                  style={{
                    fontSize: '1.35rem',
                    margin: 0,
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  This Isn't Just Something to Read. It's Something to Practise.
                </h3>
              </div>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.65,
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                Understand the concepts, apply the exercises and gradually put yourself in more social situations.
              </p>
            </div>

            {/* Section 3: Your Social Freedom Starts Here. */}
            <div className="card" style={{ padding: '2.25rem 2rem' }}>
              <h3
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  marginBottom: '1.5rem',
                  color: 'var(--text-main)',
                  letterSpacing: '-0.01em',
                }}
              >
                Your Social Freedom Starts Here.
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  fontSize: '1.02rem',
                  lineHeight: 1.75,
                  color: 'var(--text-secondary)',
                }}
              >
                <p style={{ margin: 0 }}>
                  Think about all those conversations you wanted to start but never did. All those moments you overthought. All those opportunities you let pass because you weren't sure what to say or how to approach.
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize: '1.18rem',
                    fontWeight: 700,
                    color: 'var(--red-primary)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  What if things started changing from here?
                </p>

                <p style={{ margin: 0 }}>
                  You don't have to wait until you magically become confident. You can start practising today, one conversation at a time.
                </p>

                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
                  Don't let another month go by wishing you were more confident.
                </p>

                <div
                  style={{
                    padding: '1.1rem 1.25rem',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '1.02rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <ArrowRight size={18} color="var(--red-primary)" />
                  <span>Take the first step. Show up. Participate. Connect.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Checkout Card */}
          <div>
            <div
              className="card card-red-accent product-checkout-card"
              id="checkout-card"
              style={{
                padding: '2.25rem 2rem',
                backgroundColor: '#FAF6F0',
                border: '2px solid #D6C7BC',
                boxShadow: '0 14px 40px rgba(36, 23, 15, 0.14), 0 2px 10px rgba(36, 23, 15, 0.06)',
                borderRadius: '16px',
              }}
            >
              {hasPurchased ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="badge-mono" style={{ fontSize: '0.72rem', borderColor: '#22c55e', color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.08)' }}>
                      ✓ ACTIVE ACCESS // UNLOCKED
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 700 }}>
                      LICENSE ACTIVE
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.7rem', marginBottom: '0.5rem' }}>You Own Social Freedom</h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                    Your license grants full lifetime access to the complete 90-page manual, frameworks, and exercises.
                  </p>

                  <div
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      marginBottom: '1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={18} />
                      <span>Protected Web Reader Unlocked</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0' }}>
                      Student ID: <code style={{ color: 'var(--text-main)', fontWeight: 700 }}>{user?.licenseKey || 'MENTICO-IN-VIP'}</code>
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{
                      width: '100%',
                      marginBottom: '0.85rem',
                      backgroundColor: '#16a34a',
                      borderColor: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                    onClick={() => navigate('/library?openPdf=true', { state: { openPdf: true } })}
                    id="btn-read-the-book-checkout"
                  >
                    <BookOpen size={20} />
                    <span>Read Social Freedom (Web Reader)</span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: '100%', marginBottom: '1.25rem' }}
                    onClick={() => navigate('/library')}
                  >
                    <span>Open Student Dashboard</span>
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Signed in as: <strong style={{ color: 'var(--text-main)' }}>{user?.email}</strong>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="badge-red" style={{ fontSize: '0.72rem' }}>INSTANT DIGITAL ACCESS</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--red-primary)', fontSize: '0.85rem' }}>
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.45rem', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                    Get instant access to Social Freedom by Mentico.
                  </h3>
                  
                  {/* Pricing row */}
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      marginBottom: '1.25rem',
                    }}
                  >
                    ₹{currentPrice} | One-time payment | Instant Digital PDF Access
                  </div>

                  {/* Price display in INR */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.75rem',
                      marginBottom: '1.35rem',
                      paddingBottom: '1.25rem',
                      borderBottom: '1.5px solid #E2D7CC',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 6vw, 2.8rem)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                      ₹{currentPrice.toLocaleString('en-IN')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--red-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        SPECIAL PRICE
                      </span>
                    </div>
                  </div>

                  {/* Buyer details */}
                  <div className="product-buyer-details"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D6C7BC',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginBottom: '1.35rem',
                      boxShadow: '0 6px 20px rgba(36, 23, 15, 0.07)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        paddingBottom: '0.65rem',
                        borderBottom: '1.5px solid #F0E6DC',
                      }}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--red-primary)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        1
                      </span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          letterSpacing: '0.6px',
                          color: '#24170F',
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase',
                        }}
                      >
                        Enter Your Details Below
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ fontSize: '.88rem', lineHeight: 1.5 }}>Already purchased? <Link to="/restore" style={{ textDecoration: 'underline', fontWeight: 600 }}>Restore your access</Link> — no need to pay again.</p>
                      {/* Name Input Field */}
                      <div>
                        <label
                          htmlFor="checkout-buyer-name"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            color: '#24170F',
                            marginBottom: '0.4rem',
                          }}
                        >
                          <User size={15} color="var(--red-primary)" />
                          <span>Your Full Name</span>
                          <span style={{ color: 'var(--red-primary)', fontWeight: 800 }}>*</span>
                        </label>
                        <input
                          id="checkout-buyer-name"
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.8rem 0.95rem',
                            borderRadius: '8px',
                            border: '2px solid #C4B5A5',
                            backgroundColor: '#FFFFFF',
                            color: '#1A110B',
                            fontSize: '0.96rem',
                            fontWeight: 600,
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: 'inset 0 1px 3px rgba(36, 23, 15, 0.05)',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--red-primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(229, 62, 62, 0.18)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#C4B5A5';
                            e.target.style.boxShadow = 'inset 0 1px 3px rgba(36, 23, 15, 0.05)';
                          }}
                        />
                      </div>

                      {/* Email Input Field */}
                      <div>
                        <label
                          htmlFor="checkout-buyer-email"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            color: '#24170F',
                            marginBottom: '0.4rem',
                          }}
                        >
                          <Mail size={15} color="var(--red-primary)" />
                          <span>Your Email Address</span>
                          <span style={{ color: 'var(--red-primary)', fontWeight: 800 }}>*</span>
                        </label>
                        <input
                          id="checkout-buyer-email"
                          type="email"
                          placeholder="e.g. rahul@gmail.com"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.8rem 0.95rem',
                            borderRadius: '8px',
                            border: '2px solid #C4B5A5',
                            backgroundColor: '#FFFFFF',
                            color: '#1A110B',
                            fontSize: '0.96rem',
                            fontWeight: 600,
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: 'inset 0 1px 3px rgba(36, 23, 15, 0.05)',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--red-primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(229, 62, 62, 0.18)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#C4B5A5';
                            e.target.style.boxShadow = 'inset 0 1px 3px rgba(36, 23, 15, 0.05)';
                          }}
                        />
                        <div
                          style={{
                            fontSize: '0.74rem',
                            color: '#5C4B40',
                            marginTop: '0.45rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 600,
                          }}
                        >
                          <Lock size={12} color="#16A34A" />
                          <span>Use this email to identify your purchase.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {paymentNotice && (
                    <div
                      role="alert"
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.84rem',
                        lineHeight: 1.45,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        backgroundColor: paymentNotice.type !== 'failed' ? '#FEF3C7' : '#FEE2E2',
                        border: `1px solid ${paymentNotice.type !== 'failed' ? '#F59E0B' : '#EF4444'}`,
                        color: paymentNotice.type !== 'failed' ? '#92400E' : '#B91C1C',
                      }}
                    >
                      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                          {paymentNotice.type === 'pending' ? 'Payment confirmation pending' : paymentNotice.type === 'cancelled' ? 'Payment Cancelled' : 'Payment Not Completed'}
                        </div>
                        <div>{paymentNotice.message}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentNotice(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0 2px' }}
                        aria-label="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <div role="alert" style={{ color: 'var(--red-primary)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>
                      {couponError}
                    </div>
                  )}

                  {/* Primary Purchase CTA with Loading Spinner */}
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{
                      width: '100%',
                      marginBottom: '0.5rem',
                      padding: '1rem 1.5rem',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      boxShadow: '0 6px 22px rgba(78, 35, 19, 0.18)',
                      letterSpacing: '0.2px',
                    }}
                    onClick={handlePurchase}
                    disabled={isPurchasing || purchaseSuccess}
                    id="btn-purchase-blueprint"
                  >
                    {isPurchasing ? (
                      <Spinner size="sm" color="white" text="Activating Access..." />
                    ) : purchaseSuccess ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={18} />
                        <span>Enrolled! Opening Social Freedom...</span>
                      </span>
                    ) : (
                      <>
                        <BookOpen size={18} />
                        <span>{pendingPayment ? 'Confirm payment & open course' : `Get Instant Access (₹${currentPrice})`}</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                    {courseLoadingNote}
                  </p>
                </>
              )}

              {/* Guarantee / Security badge */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Shield size={22} color="var(--red-primary)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>One-time digital purchase</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                    Purchases are non-refundable once course access is provided, except where required by law.{' '}<Link to="/terms" style={{ textDecoration: 'underline', color: 'var(--red-primary)' }}>Read the terms</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ==================================================================
          MOBILE PINNED BOTTOM ACTION BAR
          ================================================================== */}
      <div className={`mobile-pinned-bottom-bar ${checkoutVisible ? 'checkout-visible' : ''}`} id="mobile-bottom-bar" style={hasPurchased ? undefined : { flexWrap: 'wrap', rowGap: '0.25rem' }}>
        {hasPurchased ? (
          <>
            <div className="mobile-pinned-pricing-box">
              <div className="mobile-pinned-price-line" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Active Member</span>
              </div>
              <div className="mobile-pinned-sublabel" style={{ color: '#16a34a', fontWeight: 600 }}>
                Web Reader Unlocked
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary mobile-pinned-cta-btn"
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
              onClick={() => navigate('/library?openPdf=true', { state: { openPdf: true } })}
              id="btn-mobile-pinned-cta"
            >
              <span>Read Social Freedom</span>
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="mobile-pinned-pricing-box">
              <div className="mobile-pinned-price-line">
                <span className="mobile-pinned-price">₹{currentPrice.toLocaleString('en-IN')}</span>
                <span className="mobile-pinned-original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                <span className="mobile-pinned-badge">SPECIAL PRICE</span>
              </div>
              <div className="mobile-pinned-sublabel">
                Social Freedom // Instant PDF Access
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary mobile-pinned-cta-btn"
              onClick={() => {
                const card = document.getElementById('checkout-card');
                if (card) {
                  const rect = card.getBoundingClientRect();
                  const isCardInView = rect.top >= -50 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 150;
                  if (isCardInView && !isPurchasing) {
                    handlePurchase();
                  } else {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                } else {
                  handlePurchase();
                }
              }}
              disabled={isPurchasing || purchaseSuccess}
              id="btn-mobile-pinned-cta"
            >
              {isPurchasing ? (
                <Spinner size="sm" color="white" text="" />
              ) : purchaseSuccess ? (
                <span>Redirecting...</span>
              ) : (
                <>
                  <span>{pendingPayment ? 'Confirm payment' : 'Get Instant Access'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <p style={{ flexBasis: '100%', margin: 0, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {courseLoadingNote}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

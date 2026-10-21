import React, { useState } from 'react';
import {
  Mail,
  Shield,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PhoneCall,
  MapPin,
  HelpCircle,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function Contact() {
  const { user, submitTicket } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    inquiryType: 'Course Access & PDF Support',
    priority: 'Standard Support (< 6h)',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [activeFaq, setActiveFaq] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));

      const ticket = await submitTicket({
        ...formData,
        userId: user?.uid || 'guest_student',
      });

      setSubmittedTicket(ticket);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'I am naturally an introvert and feel intense stage fright. Can Mentico help me?',
      a: 'Yes, 100%. Over 65% of our 25,000+ enrolled students identify as introverts. Mentico does not try to turn you into a loud, obnoxious extrovert; we teach you how to channel your quiet focus into grounded, magnetic authority and calm speaking presence.',
    },
    {
      q: 'My English is not super fluent. Is this program suitable for Hinglish / Indian accents?',
      a: 'Absolutely. In India, people often confuse complex vocabulary with good communication. Mentico teaches clarity, vocal tone, and presence over pretentious words. The blueprints include actionable phrasing drills in both clean English and natural professional Hinglish.',
    },
    {
      q: 'How quickly do I get access to the 180-page PDF and audio sessions?',
      a: 'Immediately upon completing your checkout (or using a student access code like MENTICO100), your license key is generated on the spot and you are redirected straight into your Social Freedom Hub.',
    },
    {
      q: 'Can I invite Aryan Sharma to speak at our college fest or company bootcamp?',
      a: 'Yes. Select "College Fest & Campus Speech Workshop" in the form above and include your college name, expected audience size, and tentative dates. Our student outreach team responds within 24 hours.',
    },
    {
      q: 'What is Mentico’s 30-Day Money-Back Guarantee?',
      a: 'If you complete the 30-day confidence challenge, listen to the audio drills, and do not experience a noticeable improvement in your speaking confidence, simply email support@mentico.in for a full, prompt refund. Zero questions asked.',
    },
  ];

  return (
    <div className="section" style={{ paddingTop: '3.5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 4rem' }}>
          <div className="badge-red" style={{ marginBottom: '1.25rem' }}>
            MENTICO STUDENT CONCIERGE & DESK
          </div>
          <h1 style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>
            We’re Here To Back You Up
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Got questions about the course, need PDF access assistance, or want to invite Mentico to
            your college or organization? Reach out to our team below.
          </p>
        </div>

        {/* Main Grid: Form on Left, Concierge info on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: '3.5rem',
            alignItems: 'start',
            marginBottom: '6rem',
          }}
        >
          {/* Left Column: Support Form */}
          <div className="card card-red-accent">
            {submittedTicket ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--red-subtle)',
                    border: '1px solid var(--red-subtle-border)',
                    color: 'var(--red-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <div className="badge-red" style={{ marginBottom: '0.75rem' }}>
                  TICKET LOGGED // MENTICO SUPPORT
                </div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
                  Inquiry Dispatched Successfully
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Our youth mentorship desk has received your details and will get back to you shortly.
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-main)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'left',
                    marginBottom: '2rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Ticket ID:</span>
                    <strong style={{ color: 'var(--red-primary)' }}>{submittedTicket.ticketId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                    <span>{submittedTicket.inquiryType}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Expected Reply:</span>
                    <span>Under 4 Hours</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSubmittedTicket(null);
                    setFormData({
                      ...formData,
                      message: '',
                    });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>Student & Campus Desk</h3>
                  <p style={{ fontSize: '0.88rem' }}>
                    Average response time for enrolled Mentico members: Under 4 hours.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">
                    Full Name & College / Company
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kunal Roy (IIT Kharagpur / Infosys)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="form-input"
                    placeholder="kunal.roy@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-type">
                      Topic of Inquiry
                    </label>
                    <select
                      id="contact-type"
                      className="form-select"
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    >
                      <option value="Course Access & PDF Support">Course Access & PDF Support</option>
                      <option value="College Fest & Campus Workshop">College Fest & Campus Workshop</option>
                      <option value="1-on-1 Speech Audit">1-on-1 Speech & Viva Audit</option>
                      <option value="Corporate Fresher Training">Corporate Fresher Training</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-priority">
                      Urgency
                    </label>
                    <select
                      id="contact-priority"
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="Standard Support (< 6h)">Standard (&lt; 6h)</option>
                      <option value="Urgent Viva / Placement Tomorrow">Urgent (Interview Tomorrow)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">
                    How can we help you?
                  </label>
                  <textarea
                    id="contact-message"
                    className="form-textarea"
                    placeholder="Tell us about your speech challenge, college fest details, or inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  disabled={isSubmitting}
                  id="contact-submit-btn"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" color="white" text="Transmitting to Mentico Desk..." />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Message to Mentico</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Channels & Indian Hubs */}
          <div>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Direct Support Channels</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
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
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Student Support Email</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      support@mentico.in
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Response within 4–6 hours</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
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
                      flexShrink: 0,
                    }}
                  >
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>WhatsApp Helpline (India)</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      +91 98450 21900
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Mon–Sat, 10:00–19:00 IST</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
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
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Learning Hubs</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Koramangala, Bengaluru & Connaught Place, New Delhi
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Commitment Card */}
            <div
              className="card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-main)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock size={16} color="var(--red-primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>The Mentico Promise</span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                Every young Indian who reaches out to Mentico is treated as a valued future leader.
                We provide practical, empathetic coaching free of judgment and academic rigidity.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================
            FAQ ACCORDION
            ================================================================== */}
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge-red" style={{ marginBottom: '1rem' }}>
              INDIAN YOUTH FAQ
            </div>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div>
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className={`accordion-item ${isOpen ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="accordion-header"
                    onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} color="var(--red-primary)" /> : <ChevronDown size={20} />}
                  </button>
                  {isOpen && <div className="accordion-content">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

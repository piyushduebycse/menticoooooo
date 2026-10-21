# Mentico — Production Launch Roadmap & Vercel Security Guide 🚀

This roadmap outlines everything required to transition **Mentico** from a development build into a secure, revenue-generating commercial platform ready for live customer traffic, real payment processing, and enterprise-grade hosting on Vercel.

---

## 📋 Table of Contents
1. [Master Production Launch To-Do List](#-master-production-launch-to-do-list)
2. [Secure Hosting Guide for Vercel](#-secure-hosting-guide-for-vercel)
3. [Strategic Growth & Conversion Recommendations](#-strategic-growth--conversion-recommendations)

---

## 📌 Master Production Launch To-Do List

### Phase 1: Real Payment Gateway Integration 💳 `[CRITICAL - BLOCKER]`
*Currently, [src/pages/Product.jsx](file:///e:/Mentico/src/pages/Product.jsx#L63-L85) uses a simulated timer and unlocks courses for free.*
- [ ] **Create & Verify Merchant Account**:
  - Sign up on **Razorpay** (recommended for India — native support for UPI, Google Pay, PhonePe, Paytm, NetBanking, and Credit/Debit cards) or **Stripe** (for international).
  - Complete Business KYC (PAN, GSTIN/Bank Account details).
- [ ] **Install Payment SDK**:
  - Add Razorpay checkout script (`https://checkout.razorpay.com/v1/checkout.js`) or npm package.
- [ ] **Create Server-Side Order & Webhook Verification**:
  - *Never trust client-side payment success callbacks alone!*
  - Create a Vercel Serverless Function (`api/create-order.js` and `api/verify-payment.js`).
  - Cryptographically verify the payment signature (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) using your `RAZORPAY_KEY_SECRET` before updating Firestore.
- [ ] **Automated Invoicing & Receipts**:
  - Automatically generate a GST-compliant invoice / payment confirmation receipt sent to the buyer's email (via Resend, Postmark, or SendGrid).

---

### Phase 2: Live Firebase Database & Auth Lockdown 🔐 `[CRITICAL - BLOCKER]`
- [ ] **Deploy Production Firebase Project**:
  - Create `mentico-production` in Firebase Console (location: `asia-south1` / Mumbai).
  - Enable **Authentication**: Email/Password + Google Sign-In.
- [ ] **Disable Demo Mode Fallback in Production**:
  - Update [src/services/firebase.js](file:///e:/Mentico/src/services/firebase.js#L32-L36) so mock guest logins (`loginDemo`) cannot bypass payments in production environments.
  - Require a real, verified account before course checkout.
- [ ] **Deploy Production Firestore Rules**:
  - Lock down read/write access so users can only access their own documents:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId
          // Prevent users from granting themselves purchased status
          && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['hasPurchasedPdf', 'licenseKey']));
      }
      match /orders/{orderId} {
        allow read: if request.auth != null && resource.data.userId == request.auth.uid;
        // Orders can only be created by serverless verification functions using Admin SDK
        allow write: if false;
      }
      match /support_tickets/{ticketId} {
        allow create: if true;
        allow read, update, delete: if false;
      }
    }
  }
  ```

---

### Phase 3: Secure PDF Cloud Storage & Streaming 📄 `[HIGH PRIORITY]`
*Currently, the raw PDF is inside [public/Mentico_Mastery_Blueprint.pdf](file:///e:/Mentico/public/Mentico_Mastery_Blueprint.pdf), accessible to anyone who enters the direct URL.*
- [ ] **Move PDF to Firebase Cloud Storage**:
  - Upload the file to private storage bucket: `gs://mentico-prod.firebasestorage.app/vault/blueprint.pdf`.
  - Remove the file from `public/` so it is not statically hosted by Vercel.
- [ ] **Apply Storage Security Rules**:
  ```javascript
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /vault/{fileName} {
        allow read: if request.auth != null && 
          firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.hasPurchasedPdf == true;
        allow write: if false;
      }
    }
  }
  ```
- [ ] **Connect Blob Stream to Reader**:
  - In [ProtectedPdfReader.jsx](file:///e:/Mentico/src/components/ProtectedPdfReader.jsx), fetch the PDF binary via Firebase Storage SDK / authenticated memory Blob instead of a static URL.

---

### Phase 4: Custom Domain & Branding 🌐 `[HIGH PRIORITY]`
- [ ] **Purchase Domain**: Buy `mentico.in` or `mentico.com` (from Namecheap, GoDaddy, or Cloudflare).
- [ ] **Connect to Vercel**:
  - Add domain in Vercel Project Settings ➜ Domains.
  - Set DNS A & CNAME records.
- [ ] **Authorize in Firebase**:
  - In Firebase Console ➜ Authentication ➜ Settings ➜ **Authorized Domains**, add your custom domain so Google Sign-In functions seamlessly.

---

### Phase 5: Legal & Payment Gateway Compliance ⚖️ `[HIGH PRIORITY]`
*Payment gateways (Razorpay, Cashfree, Stripe) legally require these before activating live merchant payouts:*
- [ ] **Verify Legal Pages**:
  - Check [src/pages/Legal.jsx](file:///e:/Mentico/src/pages/Legal.jsx) — ensure company legal name, registered address, refund window (e.g., "7 days" or "No refunds on digital downloads once accessed"), and support email are accurate.
- [ ] **Contact Information**:
  - Ensure [src/pages/Contact.jsx](file:///e:/Mentico/src/pages/Contact.jsx) lists a working support email (`support@mentico.in`), phone/WhatsApp number, and expected response time (e.g., "Within 24 hours").
- [ ] **Delivery Policy**:
  - State clearly on checkout: *"Digital course material is delivered instantly upon successful payment in your Mentico Student Dashboard."*

---

### Phase 6: Marketing Pixels & Conversion Tracking 📊 `[MEDIUM PRIORITY]`
- [ ] **Meta (Facebook/Instagram) Pixel**:
  - Add Meta Pixel for PageView, ViewContent, InitiateCheckout, and Purchase events (essential for running targeted Instagram ads).
- [ ] **Google Analytics 4 (GA4)**:
  - Add GA4 Measurement ID to track funnel drop-offs.
- [ ] **OpenGraph Social Preview Tags**:
  - Ensure `index.html` has high-converting OpenGraph image previews (`og:image`, `og:title`, `og:description`) so links look clean and attractive when shared on WhatsApp, LinkedIn, or Twitter.

---

### Phase 7: Performance & Final Polish 🚀 `[MEDIUM PRIORITY]`
- [ ] Clean up unused imports flagged by `npm run lint` (58 warnings).
- [ ] Verify mobile viewport responsiveness on Android (Chrome) and iOS (Safari).
- [ ] Verify Dark/Light mode theme persistence across all 6 core pages.

---

## 🛡️ Secure Hosting Guide for Vercel

Vercel provides edge networking, automatic SSL, and DDoS mitigation. Follow these best practices to ensure your site is completely hardened:

### 1. Hardening HTTP Security Headers
Update your [vercel.json](file:///e:/Mentico/vercel.json) to include strict enterprise security headers. This prevents clickjacking, cross-site scripting (XSS), MIME-type sniffing, and man-in-the-middle attacks:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), browsing-topics=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

---

### 2. Environment Variables & Secret Isolation
* **Separate Production vs Preview vs Development**:
  In Vercel Dashboard ➜ **Settings** ➜ **Environment Variables**, you can scope keys:
  * `VITE_FIREBASE_*` (Client safe) ➜ Scope to Production, Preview, Development.
  * `RAZORPAY_KEY_ID` (Client safe) ➜ Scope to Production & Development.
  * `RAZORPAY_KEY_SECRET` (PRIVATE SERVER KEY) ➜ **Never prefix with `VITE_`!** Only accessible inside serverless functions (`api/`), never bundled into frontend JS.
* **Sensitive Environment Variables**:
  Toggle **"Automatically expose System Environment Variables"** to **OFF** if you don't need them.

---

### 3. Vercel Attack Challenge Mode & DDoS Protection
* In Vercel Project Settings ➜ **Security**:
  * **Attack Challenge Mode**: Can be toggled ON if your site ever experiences bot spam, scraping, or DDoS attacks during high-traffic ad campaigns.
  * **Vercel Web Analytics**: Enable privacy-friendly analytics with zero cookie banners required.

---

### 4. Git Branch Protection & Zero-Downtime Rollbacks
* Protect your `main` branch in GitHub (`Settings` ➜ `Branches` ➜ `Require pull request before merging`).
* Every Pull Request creates a live **Preview Deployment** on Vercel where you can test payments and layout changes without affecting paying customers.
* In case a bug ever reaches production, Vercel allows **Instant 1-Click Rollback** in the Deployments tab to revert to a previous working build in 2 seconds.

---

## 💡 Strategic Growth & Conversion Recommendations

To maximize sales and student retention once you begin driving traffic:

### 1. Add WhatsApp Chat / Lead Capture Button (Highest ROI in India)
* **The Reality**: Over 80% of Indian youth consumers browse on mobile and prefer asking 1 quick question before buying.
* **Implementation**: Add a floating WhatsApp widget in the bottom-right corner linking to `https://wa.me/91XXXXXXXXXX?text=Hi%20Mentico,%20I%20have%20a%20question%20about%20the%20Mastery%20Blueprint`.
* **Impact**: Typically increases checkout completion rates by **25%–40%**.

### 2. Exit-Intent Discount Popup
* If a visitor moves their cursor to close the tab or presses the back button on mobile without purchasing:
  * Trigger a modal: *"Wait! Here is an extra ₹200 OFF valid for the next 15 minutes. Use code: `ACTION200`"*.
* Recovers visitors who were hesitating on price.

### 3. VIP Community Access (Telegram / Discord)
* Include an exclusive invite link inside the student's [Dashboard](file:///e:/Mentico/src/pages/Dashboard.jsx) upon successful payment.
* Building a private peer community increases perceived value far beyond a standalone PDF guide and reduces refund requests to near zero.

### 4. Post-Purchase WhatsApp Automated Delivery
* Using a WhatsApp Business API (like Wati, Interakt, or AiSensy):
  * Instantly send a WhatsApp confirmation message upon payment:
    *"Welcome to Mentico, Aarav! 🎉 Your license key is MENTICO-IN-9842-X1. Access your student dashboard here: https://mentico.in/dashboard"*
  * Increases course completion rates and builds brand trust.

### 5. Video Testimonials & Authentic Student Proof
* Replace or supplement static reviews with short 20–30 second selfie video testimonials from early beta readers speaking about overcoming interview anxiety or public speaking fear.
* Video proof drastically outperforms written reviews for digital educational products.

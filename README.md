# Mentico 🚀

A modern, high-performance career acceleration & mentorship web platform designed to empower aspiring professionals with industry-ready blueprints, curated roadmaps, interactive learning dashboards, and protected digital resource access.

---

## ✨ Features

- **🎓 Interactive Learning & Course Blueprint**: Guided curriculum with milestone tracking.
- **📄 Downloadable PDF**: Complete field-guide downloads for paid customers, ready for offline reading.
- **🔐 Multi-Tier Authentication**: Seamless Firebase Auth integration with instant guest/demo simulation mode.
- **🌓 Theme Support**: Polished Dark & Light mode system with smooth CSS variable transitions.
- **🎉 Gamified Micro-Interactions**: Confetti rewards, interactive milestones, and responsive animations.
- **📱 Responsive Design**: Mobile-first, fluid layout across all device viewports.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Engine**: [PDF.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`)
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Backend / Auth**: Vercel functions, Razorpay payment verification, private R2 storage; optional Firebase login

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- `npm` or `pnpm`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mentico

# Install dependencies
npm install
```

### Environment Variables (Optional)

Create a `.env` file in the project root if you want to connect a live Firebase project:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note**: If environment variables are omitted, Mentico automatically runs in an interactive **Offline/Demo Mode** with mock storage and instant guest logins.

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Razorpay checkout setup

Checkout and PDF access do not require Firebase Admin or Firestore. The server creates Razorpay orders, validates the checkout signature, and confirms the captured amount and current refund state directly with Razorpay before issuing or accepting a signed purchase pass. Browser profile flags never authorize PDF access. Firebase login is optional and separate from purchase verification.

Configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and private R2 credentials from `.env.example` in the Vercel runtime. `ACCESS_TOKEN_SECRET` is optional; otherwise the Razorpay key secret signs passes. Keep that signing key stable to preserve existing passes. Prices live in `shared/product.js`: original ₹799, normal sale ₹249, active sale price ₹249. Testing mode is disabled.

PDFs must stay in a private R2 bucket with public URLs disabled. Every PDF request checks Razorpay, including refunds; provider outages fail closed with a retry message. PDF range requests generate provider API reads. Checkout stores an unfinished confirmation locally so retrying confirmation does not initiate a second charge. Purchase access is a bearer pass stored in the buyer's browser. Legacy recovery APIs can verify the purchase email and payment ID; the public restore form has been retired in favour of the original purchase-email link. Configure server-only `RESEND_API_KEY` and `RECOVERY_FROM_EMAIL` (a verified sender) for delivery. Recovery links last 15–30 minutes and are reusable during that window; a fresh provider check runs for every exchange. Link tokens use a separate signing context from access passes and travel in URL fragments, then POST bodies. Resend idempotency suppresses duplicate emails for a purchase in each 15-minute window. Wrong email, missing purchases, and refunds return the same neutral response. Do not log tokens. Support handles missing receipts or incorrect checkout emails. Authorized readers necessarily receive document bytes and can copy them.

GitHub Actions runs tests and builds on main and PRs. For Actions-controlled production deployment, configure repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`, and set repository variable `ACTIONS_DEPLOY_ENABLED=true`. Existing Vercel runtime variables remain in Vercel. Disable Vercel automatic Git deployments only after the Actions deployment succeeds, to avoid duplicate deployments. GitHub Pages cannot run these payment APIs.

Run `npm test`, `npm run lint`, and `npm run build` before release. The development PDF under `private/` is ignored and must never enter `public/`, `dist/`, or Git history. Older public commits containing the PDF still require repository privacy/history remediation by an administrator.

### Building for Production

```bash
npm run build
```

Production output will be generated inside the `dist/` directory.

---

## 📂 Project Structure

```
mentico/
├── public/                 # Public static assets and logos (no paid PDFs)
├── src/
│   ├── assets/             # Images and local styles
│   ├── components/         # Reusable UI components (Navbar, Footer, ProtectedPdfReader, etc.)
│   ├── context/            # AuthContext, ThemeContext
│   ├── pages/              # Core pages (Home, About, Product, Dashboard, Contact, Legal)
│   ├── services/           # Firebase initialization & mock engine
│   ├── App.jsx             # Main router & page layout
│   ├── main.jsx            # React root mount
│   └── index.css           # Global design system & theme variables
├── package.json
└── vite.config.js
```

---

## 📄 License

This project is licensed under the MIT License.

### Purchase and download experience

The homepage leads with the promise, three existing testimonials, everyday situations, contents, the 30-day challenge, and then pricing. The ₹299 Field Guide includes the downloadable PDF; ₹499 Private Community & Support adds Telegram access and mentor guidance subject to availability. The server verifies `planId` and payment amount; historical purchases retain PDF access.

After payment, the customer sees a download page and purchase confetti. The PDF is downloaded as a complete file in authenticated 1 MiB range requests to stay within hosting response limits, then saved using the browser's download mechanism. There is no restricted browser reader or screenshot blocking in this flow. Downloaded files can be opened offline or printed for personal use. The existing purchase-email link opens the same download page. The restore-purchase form has been removed from navigation and routing; legacy server recovery APIs remain for backwards compatibility. Customer-support email remains margmanpath@gmail.com by the owner's instruction.

The ₹499 customer's download page and confirmation email include the supplied shared Telegram invite; no bot is used. The public pricing cards do not contain the invite.

# Mentico 🚀

A modern, high-performance career acceleration & mentorship web platform designed to empower aspiring professionals with industry-ready blueprints, curated roadmaps, interactive learning dashboards, and protected digital resource access.

---

## ✨ Features

- **🎓 Interactive Learning & Course Blueprint**: Guided curriculum with milestone tracking.
- **📄 Protected In-Browser PDF Reader**: Secure, custom-styled document viewer powered by PDF.js with watermarking and chapter bookmarks.
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

Configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and private R2 credentials from `.env.example` in the Vercel runtime. `ACCESS_TOKEN_SECRET` is optional; otherwise the Razorpay key secret signs passes. Keep that signing key stable to preserve existing passes. Prices live in `shared/product.js`: original ₹799, normal sale ₹299, active testing price ₹1. Set `PRODUCT_TESTING_PRICE_ENABLED` to false when testing is complete.

PDFs must stay in a private R2 bucket with public URLs disabled. Every PDF request checks Razorpay, including refunds; provider outages fail closed with a retry message. PDF range requests generate provider API reads. Checkout stores an unfinished confirmation locally so retrying confirmation does not initiate a second charge. Purchase access is a bearer pass stored in the buyer's browser; it is not automatically emailed or restored on another device. Support must reconcile a lost pass against the original Razorpay order. Authorized readers necessarily receive document bytes and can copy them.

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

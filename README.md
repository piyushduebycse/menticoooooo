# Mentico 🚀

A modern, high-performance career acceleration & mentorship web platform designed to empower aspiring professionals with industry-ready blueprints, curated roadmaps, interactive learning dashboards, and protected digital resource access.

---

## ✨ Features

- **🎓 Interactive Learning & Course Blueprint**: Guided curriculum with milestone tracking.
- **📄 Protected In-Browser PDF Reader**: Secure, custom-styled document viewer powered by PDF.js with watermarking, anti-screenshot measures, and chapter bookmarks.
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
- **Backend / Auth**: [Firebase](https://firebase.google.com/) (Auth & Firestore) with fallback demo simulation

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
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

The checkout uses server-created Razorpay orders. Copy `.env.example` to `.env` and configure real Firebase Web and Admin credentials, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Keep `PRODUCT_PRICE_INR` (server charge) and `VITE_PRODUCT_PRICE_INR` (display price) equal. Use Razorpay test keys for test payments and live keys only after testing the full flow.

Deploy [Firestore rules](firestore.rules) to the Firebase project so browsers cannot set their own purchase entitlement. Enable automatic payment capture in Razorpay. On the Razorpay dashboard, register `https://<your-domain>/api/razorpay/webhook` and subscribe to `payment.captured`; use the same webhook secret in the server environment. Deploy all server variables to Vercel as well as your local `.env`. Run `npm test`, `npm run lint`, and `npm run build` before release.

Demo accounts and sample checkout codes do not activate paid access. A real Firebase session is required for payments. The current full PDF remains under `public/`, so its direct URL is still accessible; move it to private storage with an authenticated delivery route before selling access to the file itself.

### Building for Production

```bash
npm run build
```

Production output will be generated inside the `dist/` directory.

---

## 📂 Project Structure

```
mentico/
├── public/                 # Static assets, logos, and blueprint PDFs
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

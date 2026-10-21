# Mentico Platform — Security, Authorization & DRM Architecture 🛡️

This document outlines the security architecture implemented in the Mentico platform, detailing how user authorization is enforced, how multiple sessions/logging are synchronized, and how the intellectual property of the digital resources (PDF Blueprints) is protected via multi-layered Digital Rights Management (DRM).

---

## 1. Authorization Protection Architecture

Mentico enforces authorization through a **Three-Tier Security Model** spanning Route Level, Global State Level, and Backend Database Level.

```
+-------------------------------------------------------------+
|                      User Navigation                        |
+-------------------------------------------------------------+
                              |
                              v
       [ Tier 1: Route Guard (ProtectedRoute.jsx) ]
       * Validates active auth state & prevents URL tampering
       * Blocks unauthorized DOM rendering
                              |
                              v
       [ Tier 2: Global State (AuthContext.jsx) ]
       * Single source of truth for user profile & entitlements
       * Verifies `hasPurchasedPdf` & dynamic roles
                              |
                              v
       [ Tier 3: Database Security (Cloud Firestore) ]
       * Server-enforced rules: `request.auth.uid == userId`
       * Disallows unauthorized profile or order edits
```

### Tier 1: Route-Level Guarding (`src/components/ProtectedRoute.jsx`)
* **Pre-Render Credential Verification**: Before any protected page (such as `/dashboard`) renders, `<ProtectedRoute>` checks the auth `loading` status. If credentials are still resolving, it displays a loading animation (`VERIFYING MENTICO STUDENT CREDENTIALS...`), completely eliminating content flashes or unauthorized access leaks.
* **Unauthenticated Access Block**: If `!user`, the component halts all rendering of the private dashboard. Instead, it renders an access-gate card with an interactive trigger (`openAuthModal('login')` / `loginDemo()`), disallowing direct URL manipulation.

### Tier 2: Global Entitlement State (`src/context/AuthContext.jsx`)
* `AuthProvider` wraps the entire application tree and continuously subscribes to `firebaseAuthService.onAuthChange()`.
* **Entitlement Verification**: Along with standard identity fields (`uid`, `email`), the context maintains verified entitlement metadata:
  * `hasPurchasedPdf`: Boolean flag determining access to the reader.
  * `licenseKey`: Unique student license identifier (e.g., `MENTICO-IN-9842-X1`).
  * `role`: Student membership rank (`Mentico Student`, `Mentico Member`, `Mentico Pro Member`).
* Protected actions (such as opening the blueprint reader or accessing audio vaults) verify these flags before granting access.

### Tier 3: Database Level Authorization (`Firestore Security Rules`)
* Under production Firebase, authorization is validated server-side by Cloud Firestore security rules.
* Requests attempting to inspect or overwrite another student's account, order history, or license key are rejected by the database:
  ```javascript
  match /users/{userId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  match /orders/{orderId} {
    allow create: if request.auth != null;
    allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  }
  ```

---

## 2. Multi-Logging & Session Security

To prevent session hijacking, orphaned logins, and account misuse across devices or browser tabs, Mentico utilizes the following mechanisms:

### Real-Time Cross-Tab Synchronization
* In `src/services/firebase.js`, an event listener subscribes to native browser storage events:
  ```javascript
  window.addEventListener('storage', notifyMock);
  ```
* **Instant Session Purge**: If a user logs out in Tab 1, a `storage` event broadcasts to all other open tabs (Tab 2, Tab 3, etc.). The other tabs immediately wipe their user context and kick the viewer back to an unauthenticated view.
* **Account Switching**: Switching accounts in one tab immediately refreshes entitlements across all other open tabs in real-time.

### Cryptographic Token Lifecycle (JWTs)
* Under live Firebase, authentication utilizes short-lived JSON Web Tokens (JWTs) with an automatic 1-hour expiration window.
* Authentication tokens are automatically refreshed in the background via secure refresh tokens managed in browser persistence (`IndexedDB` / `localStorage`).
* Plaintext passwords are never stored in React state, component memory, or local storage.

### Identity & License Accountability
* Upon purchase, each student is assigned an indelible license code (`MENTICO-IN-XXXX-LIC`).
* Because the student's email and license key are permanently watermarked across all digital assets, sharing accounts with unauthorized parties directly exposes the buyer's identity.

---

## 3. PDF Privacy & Anti-Piracy Protection (DRM)

The PDF reader (`src/components/ProtectedPdfReader.jsx`) is engineered to prevent copying, unauthorized redistribution, printing, and direct downloading through a **5-Layer DRM Architecture**:

### Layer 1: In-Memory Canvas Rendering (No Direct Embeds)
* Standard `<embed>`, `<iframe>`, or direct `<a href="...pdf">` elements are strictly avoided, as native browsers equip them with "Save As", "Print", "Download", and URL inspection tools.
* Mozilla's `pdfjs-dist` worker fetches the document stream directly in memory and renders vector page geometry onto an **HTML5 `<canvas>` element**.
* The raw PDF file path is never directly exposed to the DOM as a downloadable resource.

### Layer 2: Forensic Pixel Watermark (Baked into Canvas Context)
* In `drawCanvasWatermark()` (`ProtectedPdfReader.jsx`), user-specific identity information is drawn directly onto the 2D canvas bitmap:
  ```javascript
  const text = `LICENSED TO: ${studentEmail} • ID: ${licenseKey} • MENTICO PROTECTED VAULT`;
  ```
* **Tamper-Proof Graphic Layer**:
  * Rotated at a `-25°` angle across dynamic grid coordinates spanning the entire canvas.
  * Rendered at `rgba(220, 38, 38, 0.14)` using a monospace font.
  * **Why it cannot be stripped**: Because it is drawn directly onto the image pixels alongside the PDF content, it **cannot be removed or hidden using Developer Tools, ad-blockers, or DOM inspection**.

### Layer 3: Floating DOM Watermark Overlay
* Positioned directly above the canvas container is an overlay (`.reader-watermark-overlay`) configured with:
  * `pointer-events: none;`
  * `user-select: none;`
  * High `z-index: 50`
* It continuously repeats diagonal warning banners over the viewport. If someone takes an external camera photo or monitor capture, the student's email and license are visibly superimposed over the text.

### Layer 4: Right-Click & Context Menu Interception
* The reader captures the `contextmenu` event and suppresses default browser options:
  ```javascript
  const handleContextMenu = (e) => {
    e.preventDefault();
    triggerDrmWarning('Right-click is disabled to protect Mentico copyright.');
  };
  ```
* Prevents users from right-clicking to "Save image as...", "Copy image address", or "Inspect element".

### Layer 5: Anti-Piracy Keyboard Interception
* An active `keydown` listener intercepts and blocks common piracy combinations:
  * **`Ctrl + S` / `Cmd + S`**: Blocks saving the webpage or asset.
  * **`Ctrl + P` / `Cmd + P`**: Blocks printing to physical printers or "Print to PDF".
  * **`Ctrl + U` / `Cmd + U`**: Blocks viewing raw page source code.
  * **`Ctrl + C` / `Cmd + C`**: Blocks clipboard text copying from the document.
  * **`F12`**: Suppresses opening developer console shortcuts.
  * **`PrintScreen`**: Detects and alerts against screen capture attempts.
* When triggered, a DRM toast notification (`.drm-toast`) alerts the user to copyright restrictions.

---

## 4. Comprehensive Security Matrix

| Security Domain | Defense Mechanism | Implementation File |
| :--- | :--- | :--- |
| **Route Protection** | Loading gate, unauthorized access denial, login redirect | `src/components/ProtectedRoute.jsx` |
| **Entitlement Verification** | Verified purchase flags (`hasPurchasedPdf`), dynamic student roles | `src/context/AuthContext.jsx` |
| **Database Access Control** | Per-user document authorization rules (`request.auth.uid == userId`) | Cloud Firestore Security Rules |
| **Session Synchronization** | Real-time cross-tab logout and state synchronization | `src/services/firebase.js` (`storage` event) |
| **Credential Safety** | Short-lived JWTs, automated refresh, zero plaintext passwords | Firebase Authentication Engine |
| **PDF Rendering** | In-memory binary parsing into HTML5 Canvas (no direct download) | `src/components/ProtectedPdfReader.jsx` |
| **Pixel Watermark** | Email and license key stamped directly into canvas bitmap pixels | `src/components/ProtectedPdfReader.jsx` (`drawCanvasWatermark`) |
| **Screen Capture Shield** | Diagonal unselectable floating DOM watermark overlay | `src/index.css` (`.reader-watermark-overlay`) |
| **Piracy Interception** | Suppresses Right-Click, Print (`Ctrl+P`), Save (`Ctrl+S`), Source (`Ctrl+U`) | `src/components/ProtectedPdfReader.jsx` (`handleKeyDown`) |

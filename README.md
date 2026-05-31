<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./frontend/src/assets/ResuMatch%20logo.png">
    <source media="(prefers-color-scheme: light)" srcset="./frontend/src/assets/ResuMatch%20logo.png">
    <img alt="ResuMatch.ai" src="./frontend/src/assets/ResuMatch%20logo.png" width="160" style="border-radius: 20px;">
  </picture>
</p>

<h1 align="center">ResuMatch<span style="color:#6366f1">.ai</span></h1>

<p align="center">
  <strong>AI-Powered ATS Resume Analyzer — Smart, Fair</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Status-Maintained-22c55e?style=flat&labelColor=0f172a" alt="Maintained"></a>
  <a href="#"><img src="https://img.shields.io/badge/React-19-6366f1?style=flat&logo=react&labelColor=0f172a" alt="React 19"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vite-8.0-646cff?style=flat&logo=vite&labelColor=0f172a" alt="Vite 8"></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=nodedotjs&labelColor=0f172a" alt="Node.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&labelColor=0f172a" alt="MongoDB Atlas"></a>
  <a href="#"><img src="https://img.shields.io/badge/OpenRouter-API-ff6a00?style=flat&logo=openai&labelColor=0f172a" alt="OpenRouter API"></a>
  <a href="#"><img src="https://img.shields.io/badge/License-All%20Rights%20Reserved-ef4444?style=flat&labelColor=0f172a" alt="License"></a>
</p>

<p align="center">
  <sub><strong>All Rights Reserved.</strong> Viewing & evaluation only. See <a href="./LICENSE">LICENSE</a>.</sub>
</p>

<br>

---

<h2> Live Demo</h2>

<p align="center">
  <table>
    <tr>
      <th align="center">Service</th>
      <th align="center">URL</th>
    </tr>
    <tr>
      <td align="center"><b>Frontend App</b></td>
      <td align="center"><a href="https://resumatch-hub.vercel.app">resumatch-hub.vercel.app</a></td>
    </tr>
    <tr>
      <td align="center"><b>Backend API</b></td>
      <td align="center"><a href="https://resumatchai-three.vercel.app">resumatchai-three.vercel.app</a></td>
    </tr>
  </table>
</p>

<br>

---

<h2> Overview</h2>

<p align="center">
  <em>"ResuMatch.ai is an advanced, AI-powered ATS (Applicant Tracking System) resume analyzer SaaS platform. It eliminates recruiter bias and LLM politeness inflation by enforcing a strict mathematical scoring formula. Upload a PDF resume, specify the target role and required skills, and receive an objective, data-driven compatibility report in seconds."</em>
</p>

<br>

<h2> Core Features</h2>

<table>
  <tr>
    <td width="50%">
      <h4> Dynamic Keyword Matching</h4>
      <p>Accepts up to 12 required skills. Each keyword is checked against the resume verbatim — no inference, no hallucinations.</p>
    </td>
    <td width="50%">
      <h4> Fair Mathematical Scoring</h4>
      <p>Score = <code>(matched / total) × 10</code>. Server-side ground-truth override ensures the AI cannot inflate scores out of politeness.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h4> Actionable Revision Bullets</h4>
      <p>Short, specific suggestions like <code>"Add 'Docker' to your skills section."</code> — not vague paragraphs.</p>
    </td>
    <td width="50%">
      <h4> Section-Specific Feedback</h4>
      <p>Honest, critical analysis across Skills, Experience, and Education with exact match counts.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h4> Secure Data Parsing</h4>
      <p>PDF parsed in-memory via <code>pdf-parse</code>. No files stored on disk. JWT-authenticated API.</p>
    </td>
    <td width="50%">
      <h4> Multi-Provider Auth</h4>
      <p>Email/password registration + Google OAuth 2.0 with reCAPTCHA v3 spam protection.</p>
    </td>
  </tr>
</table>

<br>

---

<h2> Tech Stack</h2>

<p align="center">
  <strong>Frontend</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-6366f1?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-8.0-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Lucide_React-0.400-a855f7?style=for-the-badge&logo=react&logoColor=white" alt="Lucide">
</p>

<p align="center">
  <strong>Backend & Database</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB_Atlas-8.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas">
  <img src="https://img.shields.io/badge/Mongoose-9.0-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose">
</p>

<p align="center">
  <strong>AI, Auth & Security</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/OpenRouter_API-ff6a00?style=for-the-badge&logo=openai&logoColor=white" alt="OpenRouter">
  <img src="https://img.shields.io/badge/Gemini_1.5_Flash-4285f4?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/Google_OAuth_2.0-4285f4?style=for-the-badge&logo=google&logoColor=white" alt="Google OAuth">
  <img src="https://img.shields.io/badge/reCAPTCHA_v3-34a853?style=for-the-badge&logo=google&logoColor=white" alt="reCAPTCHA">
  <img src="https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT">
</p>

<br>

---

<h2> UI / UX Preview</h2>

<p align="center">
  <img src="https://raw.githubusercontent.com/muhammadkhuzaima25/Ai_Resume_Analyzer/main/frontend/src/assets/hero.png" alt="ResuMatch.ai Dashboard Preview" width="85%" style="border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);" />
</p>

<br>

---

<h2> Getting Started</h2>

<h3> Prerequisites</h3>

- <b>Node.js</b> 18+ (recommended: 20 LTS)
- <b>MongoDB Atlas</b> account (free tier works)
- <b>OpenRouter</b> API key
- <b>Gemini API</b> key
- <b>Google OAuth 2.0</b> client ID
- <b>reCAPTCHA v3</b> site key & secret key

<h3> Installation</h3>

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/resumatch-analyzer.git
cd resumatch-analyzer

# 2. Install all dependencies (backend + frontend)
npm run install-all

# 3. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

<h3> Environment Variables</h3>

<p>Edit <code>backend/.env</code> with your credentials:</p>

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>.mongodb.net/resumatch?retryWrites=true&w=majority
OPENROUTER_API_KEY=sk-or-v1-your-key-here
GEMINI_API_KEY=your-gemini-api-key
JWT_SECRET=your-random-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
NODE_ENV=development
BASE_URL=http://localhost:5173
```

<p>Edit <code>frontend/.env</code> with your public keys:</p>

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
VITE_API_URL=http://localhost:5000
```

<h3> Run Development Servers</h3>

```bash
# Start both backend & frontend concurrently
npm run dev
```

| Service | URL |
|---------|-----|
| **Frontend** | `http://localhost:5173` |
| **Backend API** | `http://localhost:5000` |

<br>

---

<h2> Project Structure</h2>

<pre>
resumatch-analyzer/
│
├── <b>backend/</b>
│   ├── config/            # DB connection, email transporter
│   │   ├── db.js
│   │   └── email.js
│   ├── controllers/       # Auth, analyze, contact business logic
│   │   ├── authController.js
│   │   ├── analyzeController.js
│   │   └── contactController.js
│   ├── middleware/         # JWT authentication guard
│   │   └── authMiddleware.js
│   ├── models/            # Mongoose schemas (User, Analysis, Contact)
│   ├── routes/            # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── analyzeRoutes.js
│   │   └── contactRoutes.js
│   ├── server.js          # Entry point
│   ├── vercel.json        # Vercel deployment config
│   ├── package.json
│   └── .env.example
│
├── <b>frontend/</b>
│   ├── public/            # Static assets (favicon)
│   ├── src/
│   │   ├── assets/        # Images, logos
│   │   ├── components/    # Navbar, Footer, ProtectedRoute
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/         # All route pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Analyze.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── SkillAnalytics.jsx
│   │   │   ├── AtsTemplates.jsx
│   │   │   ├── About.jsx
│   │   │   └── Contact.jsx
│   │   ├── utils/         # Axios API client
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── .env.example
│
├── <b>package.json</b>        # Root scripts (dev, install-all)
├── <b>.gitignore</b>
├── <b>LICENSE</b>
└── <b>README.md</b>
</pre>

<br>

---

<h2> Deployment (Vercel)</h2>

<h3> Prerequisites</h3>

- A <a href="https://vercel.com">Vercel</a> account
- <b>Frontend repo</b> or directory connected to Vercel
- <b>Backend repo</b> or directory connected to Vercel
- All environment variables set in Vercel dashboard

<h3> Backend Deployment</h3>

<p>The backend includes a <code>vercel.json</code> — it's ready to deploy as a <b>Serverless Function</b> on Vercel.</p>

<ol>
  <li>Push the <code>backend/</code> folder (or the whole repo) to a Git provider (GitHub, GitLab, Bitbucket).</li>
  <li>In Vercel Dashboard → <b>Add New Project</b> → Import the repository.</li>
  <li>Set <b>Root Directory</b> to <code>backend</code>.</li>
  <li>Set <b>Framework Preset</b> → <code>Other</code>.</li>
  <li>Add the following <b>Environment Variables</b>:</li>
</ol>

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>.mongodb.net/resumatch?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret
OPENROUTER_API_KEY=sk-or-v1-your-key
GEMINI_API_KEY=your-gemini-key
GOOGLE_CLIENT_ID=your-google-client-id
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
NODE_ENV=production
BASE_URL=https://resumatch-hub.vercel.app
```

<p>After deployment, you'll get a URL like <code>https://resumatchai-three.vercel.app</code>.</p>

<h3> Frontend Deployment</h3>

<ol>
  <li>In Vercel Dashboard → <b>Add New Project</b> → Import the same repository.</li>
  <li>Set <b>Root Directory</b> to <code>frontend</code>.</li>
  <li>Vercel will auto-detect <b>Vite</b> as the framework.</li>
  <li>Add the following <b>Environment Variables</b>:</li>
</ol>

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
VITE_API_URL=https://resumatchai-three.vercel.app
```

<p>After deployment, you'll get a URL like <code>https://resumatch-hub.vercel.app</code>.</p>

<h3> Post-Deployment Steps</h3>

<ol>
  <li><b>Google OAuth:</b> In Google Cloud Console → Credentials → add these to your OAuth client:
    <ul>
      <li>Authorized JavaScript origins: <code>https://resumatch-hub.vercel.app</code></li>
      <li>Authorized redirect URIs: <code>https://resumatch-hub.vercel.app</code></li>
    </ul>
  </li>
  <li><b>MongoDB Atlas:</b> Add <code>0.0.0.0/0</code> (allow all) in Network Access — Vercel functions have dynamic IPs.</li>
  <li><b>reCAPTCHA:</b> Add <code>https://resumatch-hub.vercel.app</code> to your reCAPTCHA v3 allowed domains.</li>
</ol>

<br>

---

<h2> Scoring Formula</h2>

<p align="center">
  <code><big><b>Score = (Matched Keywords / Total Required Keywords) × 10</b></big></code>
</p>

| Rule | Detail |
|------|--------|
| <b>Max Keywords</b> | Capped at 12 for accuracy & token efficiency |
| <b>Ground Truth</b> | Server re-checks each keyword against raw resume text |
| <b>AI Override</b> | If LLM inflates score, server-side cap enforces fairness |
| <b>Summary Alignment</b> | Score < 5 → <code>"Low Match"</code>, 5–7 → <code>"Moderate Match"</code>, 8+ → <code>"Strong Match"</code> |

<br>

---

<h2> License</h2>

<p>
  <strong>All Rights Reserved.</strong> Copyright © 2026 Muhammad Khuzaima.
</p>
<p>
  This project is provided for <strong>viewing and evaluation</strong> purposes only.
  No permission is granted to copy, modify, distribute, or republish any portion
  of this code. See the full <a href="./LICENSE">LICENSE</a> file for details.
</p>

<br>



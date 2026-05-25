# TechFest Frontend

A React single-page application hosting two independent products:

- **Offer Tracker** — Gmail-based job offer management with NLP classification
- **FallSafe** — Real-time fall detection via webcam and video upload

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 (JSX) |
| Build toolchain | Create React App (`react-scripts` 5) |
| Routing | React Router v6 |
| Styling | Tailwind CSS 3 + PostCSS |
| HTTP | Axios |
| Real-time | Socket.IO client |
| Animation | Framer Motion |
| Backend | Node.js REST API + WebSocket on port `3001` |

---

## Project Structure

```
frontend/
├── public/
│   ├── index.html              # HTML shell
│   └── manifest.json           # PWA manifest
└── src/
    ├── App.jsx                 # Router and route definitions
    ├── index.js                # App bootstrap
    ├── index.css               # Tailwind + global styles
    ├── components/
    │   ├── nlp/                # Offer Tracker product
    │   │   ├── LandingPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Navigation.jsx
    │   │   ├── HeroSection.jsx
    │   │   ├── Jumbotron.jsx
    │   │   ├── TextImageAnimation.jsx
    │   │   └── EmailCompanyList.jsx
    │   └── dl/                 # FallSafe product
    │       ├── FallSafe.jsx
    │       ├── FallSafeHeader.jsx
    │       └── FallSafeVideoUploader.jsx
    ├── services/
    │   └── UserService.js      # Auth / user info API calls
    └── utils/
        └── StatusEnum.js       # Email classification labels
```

---

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Offer Tracker landing / marketing page |
| `/dashboard` | `Dashboard` | Gmail offer management (requires Google login) |
| `/dl` | `FallSafe` | Live fall detection via webcam or Raspberry Pi stream |
| `/dl/video` | `FallSafeVideoUploader` | Upload a video for offline fall detection |

---

## Local Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Backend API running on port `3001` (see backend README)

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment variables

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_RASBERY_STREAM=http://<raspberry-pi-ip>:8000/stream
```

| Variable | Description |
|---|---|
| `REACT_APP_BACKEND_URL` | Base URL of the backend REST API |
| `REACT_APP_RASBERY_STREAM` | MJPEG stream URL from a Raspberry Pi camera (FallSafe only) |

> **Note:** The `.env` file is gitignored. You must create it manually.

### 3. Start the development server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000) with hot reload enabled.

---

## Production Build

```bash
npm run build
```

Outputs optimised static files to the `build/` directory. Serve with any static file host (e.g. `serve`, nginx, Vercel, Netlify).

```bash
# Quick local preview with the `serve` package
npx serve -s build
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start development server on port 3000 |
| `npm run build` | Create an optimised production build |
| `npm test` | Run tests with Jest |
| `npm run eject` | Eject from CRA (irreversible) |

---

## Backend Dependency

The frontend requires the backend to be running at `REACT_APP_BACKEND_URL` (default `http://localhost:3001`). Key backend endpoints used:

| Endpoint | Feature |
|---|---|
| `GET /auth/user-info` | Retrieve authenticated Google user |
| `GET/POST /gmail/*` | Gmail offer fetch and management |
| `POST /dl/phone/make-call` | Trigger emergency Twilio call (FallSafe) |
| `WS /dl/ws` | WebSocket stream for live fall detection frames |
| `POST /dl/video/*` | Video upload and processed result retrieval |

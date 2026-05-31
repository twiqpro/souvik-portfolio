# Portfolio — Fresh Start

React + Vite + Three.js portfolio with animated **GLSL hills** as the full-viewport background. UI follows tokens in `portfolio.md` (Midnight Command Console).

## Stack

- **React 18** + **Vite 5**
- **Three.js** — `GLSLHills` shader terrain (`src/components/GLSLHills.jsx`)
- Design tokens — `src/index.css`, `src/App.css`

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Project structure

```
src/
├── components/
│   └── GLSLHills.jsx   # Your shader hills (Three.js + GLSL)
├── App.jsx             # Layout + overlay UI
├── App.css
├── index.css           # Design tokens from portfolio.md
└── main.jsx
```

## Hero card assets

| File | Purpose |
|------|---------|
| `public/avatar.jpg` | Profile photo (cropped from your reference; replace anytime) |
| `public/bits-pilani.svg` | Education emblem in footer row |
| `public/resume.pdf` | Linked from **Resume ↗** (add when ready) |

## Customize hills

Props on `<GLSLHills />` in `App.jsx`:

| Prop | Default | Effect |
|------|---------|--------|
| `cameraZ` | `125` | Camera distance |
| `planeSize` | `256` | Mesh resolution / size |
| `speed` | `0.5` | Animation speed |

## Build & deploy

```bash
npm run build
npm run preview   # test production build
```

Deploy the `dist/` folder to Vercel or Netlify.

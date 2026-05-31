# Active Theory Portfolio — Design & Technical Breakdown
> Reference document for recreating a similar experience for your own portfolio.
> Source: [activetheory.net](https://activetheory.net)

---

## 1. Studio Overview

Active Theory is a Venice Beach–based creative digital production studio, founded in 2012. Their clients include Google, Nike, and Netflix. The portfolio site itself *is* their case study — every technical decision doubles as a demonstration of capability.

**Core philosophy:** Don't describe what you do. Build an experience where visitors *feel* it.

---

## 2. Visual Identity & Aesthetics

### Color Palette
| Role | Description |
|---|---|
| Background | Near-black (`#000000` / very dark navy) |
| Primary accent | Electric neon — cyan, electric blue, hot pink/magenta |
| Secondary accent | Amber/orange glow (used in tube trails) |
| Text | Pure white, occasionally with slight glow/blur |
| Environment light | Volumetric colored fog matching the neon accents |

### Typography
- **Display / Hero:** Alien-influenced, condensed sci-fi typefaces — feels custom or heavily modified
- **Body / UI:** Minimal, monospace or geometric sans — ultra-light weight
- **Style rules:** All-caps labels, tight tracking, very small point sizes for navigation; oversized for hero moments

### Aesthetic Direction
- **Dark, immersive, neon-noir** — evokes cyberpunk installations and nightclub environments
- Volumetric lighting: glowing tubes, particle halos, light bleed
- No whitespace "minimalism" — the darkness itself is the breathing room
- Everything exists in 3D space; the camera moves *through* the environment

---

## 3. Layout & Navigation Structure

### Navigation
- **Ultra-minimal pillbox nav** — just two links: Work and Contact
- The pillbox physically *reacts to scroll velocity* — it stretches/squishes with momentum
- No hamburger menus, no dropdowns, no sidebars
- Navigation floats over the 3D environment, never blocks the experience

### Page Structure
```
[ Full-screen WebGL canvas (always full viewport) ]
  └── Floating minimal nav (top center)
  └── AI chat widget (bottom, floats around the portfolio)
  └── Project cards (scroll-triggered, embedded in the 3D world)
  └── Contact (one-liner at bottom)
```

### Scroll Behavior
- Vertical scroll drives camera movement *inside* the 3D scene
- Scroll velocity affects physics of UI elements (the pillbox nav)
- No traditional page transitions — you're flying through a world, not loading pages

---

## 4. Key Interaction Patterns

### 1. Mouse/Touch Trails (Networked)
- Colored glowing tubes spawn from your cursor position at top and bottom of the site
- **Networked in real time** — you can see other visitors' mouse trails simultaneously
- Creates a sense of shared social presence — subtle but eerie and memorable

### 2. AI Chat Navigation
- A floating chat widget lets you navigate by natural language
- Example prompts the studio mentions:
  - *"Show me a fun project"*
  - *"Have you done any crypto projects?"*
  - *"Show me your best work for film clients"*
- The chat "moves around" the portfolio — it physically animates to position itself contextually

### 3. Environmental Exploration
- Multiple 3D scenes/environments toggle as you scroll (or by keyboard in earlier versions: Spacebar)
- Environments inspired by real-world spaces — their LA and Amsterdam offices
- Scene changes feel like teleporting between locations, not clicking through slides

### 4. Hover States
- Elements light up, shift, or subtly respond on hover
- No static hover color changes — everything has a micro-physics feel
- Cursor itself may transform on interactive elements

---

## 5. Technical Stack

### Core Technology
| Layer | Tool |
|---|---|
| Rendering engine | **WebGL** (custom, not Three.js) |
| Internal framework | **Hydra** — Active Theory's proprietary JS framework |
| Animation library | **GSAP** (GreenSock) for timeline control |
| Shader language | Custom **GLSL** shaders for all visual effects |
| Programming style | **Functional / state-based** JavaScript (not OOP) |
| 3D asset compression | **Draco** mesh compression |
| Media | Lazy-loaded video, compressed textures |

### Hydra Framework (Proprietary)
- Built to survive the Flash-to-HTML5 transition; refined over 12+ years
- Includes a **visual GUI** that lets designers build and tweak 3D scenes *without writing code*
- Handles state management for all scene transitions and interaction states
- Enables modular scene composition

### Performance
- LCP (Largest Contentful Paint): ~1.3 seconds on desktop despite heavy shader work
- Draco-compressed 3D meshes to reduce asset payload
- Lazy-loaded video segments — scenes load progressively
- Functional JS architecture keeps code modular and avoids memory leaks

---

## 6. Visual Effects Breakdown

### Particle Systems
- Real-time particle simulations — hundreds to thousands of points in 3D space
- Particles react to cursor proximity (magnetic/repel effects)
- Used to create atmosphere — depth fog, star-fields, ambient life

### GLSL Shaders
- Custom shader programs run directly on GPU
- Used for: glowing neon tubes, volumetric light halos, material surfaces, color grading
- Post-processing effects: bloom, chromatic aberration, film grain, vignette

### Neon Tube Trails
- Bezier-curve geometry that follows cursor velocity
- Color tied to each user's session (for the networked effect)
- Physics-informed: tubes have tension, spring, and damping

### Environment Lighting
- Point lights with falloff placed inside 3D scenes
- Emissive materials on neon signage and interactive elements
- Ambient occlusion and shadow baking for grounding elements in space

---

## 7. Content Strategy

### What's Shown
- **Work / case studies** — project title, client, category, and a visual (video or rendered scene)
- **About** (implicit — you understand who they are from the experience itself)
- **Contact** — one minimal call-to-action

### What's *Not* Shown
- No team headshots
- No lengthy bio paragraphs
- No services list
- No testimonials section
- No pricing, no blog

**The principle:** Let the work speak entirely through experience, not explanation.

### Project Cards
- Appear embedded in the 3D world, not as flat HTML overlays
- Project titles in large display type, clients in small caps
- Transitioning between projects feels like moving through space

---

## 8. Audio (Optional / Subtle)
- Ambient sound design in some versions — low drone, subtle UI click sounds
- Audio is never forced; often tied to scene transitions
- Adds to the "you are inside something" feeling

---

## 9. Mobile Considerations
- Touch replaces mouse: swipe drives the camera, tap triggers interactions
- Tube trails follow touch position
- Performance is carefully managed — lower particle counts on mobile
- `viewport-fit=cover` and `user-scalable=no` ensure full-bleed immersion
- `apple-mobile-web-app-capable: yes` — supports Add to Home Screen as a PWA-style experience

---

## 10. Adapting This for Your Portfolio (PM / Product)

You don't need to build a full WebGL engine. Here's how to translate the *principles* into a realistic personal portfolio:

### Tier 1 — High Impact, Achievable (HTML/CSS/GSAP)
- **Dark, full-bleed hero** with subtle animated gradient or noise texture background
- **Custom cursor** that leaves a fading trail or morphs on hover
- **Pill/capsule nav** that reacts to scroll (scale or opacity transition)
- **Smooth scroll** with momentum using Lenis or locomotive-scroll
- **Case study cards** with reveal animations on scroll (GSAP ScrollTrigger)
- **Hover states** that feel physical — slight perspective tilt (CSS `perspective` + JS mouse tracking)

### Tier 2 — Elevated (Add Three.js)
- **Particle background** — floating dots in 3D space reacting to cursor
- **3D text** or floating geometric shapes as hero decoration
- **Scene transition** between sections using fade + camera move
- **Post-processing** — bloom and chromatic aberration via Three.js EffectComposer

### Tier 3 — Full Immersion (Custom WebGL / Shaders)
- Custom GLSL shader backgrounds (noise, displacement, fluid sims)
- Networked real-time cursor sharing (Socket.io)
- Full 3D environment with interactive navigation
- AI chat for portfolio navigation (Claude/OpenAI API)

### Key UX Principles to Steal Regardless of Tech Level
1. **Minimal navigation** — max 2–3 links, floating, reacts to scroll
2. **Black canvas** — darkness is your friend; it makes everything glow
3. **Motion is content** — every transition should feel considered, never instant
4. **No clutter** — one thing on screen at a time, let the work breathe
5. **Interaction = discovery** — don't explain features, let users find them
6. **Performance obsession** — compress everything, lazy load, measure LCP

---

## 11. Recommended Tech Stack for Your Build

```
Core:         HTML5 + CSS3 + Vanilla JS  (or Next.js for routing)
Animation:    GSAP + ScrollTrigger
3D (opt):     Three.js
Smooth scroll: Lenis
Fonts:        Google Fonts or Fontshare — pick something distinctive
Shaders:      glslify (if going custom GLSL)
Deployment:   Vercel or Netlify
```

---

## 12. Reference Links & Inspiration

| Resource | URL |
|---|---|
| Active Theory (live) | https://activetheory.net |
| CommArts interview | https://www.commarts.com/webpicks/active-theory-2 |
| WebGPU community writeup | https://www.webgpu.com/showcase/active-theory-portfolio/ |
| GSAP (animation) | https://greensock.com/gsap/ |
| Three.js | https://threejs.org |
| Lenis (smooth scroll) | https://lenis.darkroom.engineering |
| Awwwards inspiration | https://www.awwwards.com |
| Codrops tutorials | https://tympanus.net/codrops |
| Shader examples | https://shadertoy.com |
| Font inspiration | https://fontshare.com |

---

*Document compiled: May 2026. Based on public analysis of activetheory.net and published interviews with Active Theory co-founders Michael Modena and Andy Thelander.*
import { useCallback, useEffect, useRef } from 'react';
import { toCanvas } from 'html-to-image';
import { HeroCard } from './HeroCard';
import './HeroCardScatter.css';

const DUST_STEP = 3;
const CANVAS_PAD = 220;
const DRIFT = 200;
const DISSOLVE_START = 0.015;
const DISSOLVE_END = 0.1;

function getDive() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dive')) || 0;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function buildDustFromSnapshot(sourceCanvas, width, height) {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return [];

  const { data } = ctx.getImageData(0, 0, width, height);
  const particles = [];

  for (let y = 0; y < height; y += DUST_STEP) {
    for (let x = 0; x < width; x += DUST_STEP) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3] / 255;

      if (a < 0.06) continue;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.12 + Math.random() * 0.38;

      particles.push({
        ox: x + CANVAS_PAD + (Math.random() - 0.5) * DUST_STEP,
        oy: y + CANVAS_PAD + (Math.random() - 0.5) * DUST_STEP,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.15,
        vy: Math.sin(angle) * speed * 0.55 + 0.08 + Math.random() * 0.12,
        r,
        g,
        b,
        baseAlpha: a * (0.45 + Math.random() * 0.55),
        size: 0.5 + Math.random() * 1.1,
        delay: Math.random() * 0.14,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 1.5 + Math.random() * 3,
      });
    }
  }

  return particles;
}

function HeroCardScatter() {
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);
  const rafRef = useRef(null);
  const reducedMotionRef = useRef(false);
  const captureGenRef = useRef(0);

  const captureDust = useCallback(async () => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (!card || !canvas) return;

    const rect = card.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    const gen = captureGenRef.current + 1;
    captureGenRef.current = gen;

    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasW = w + CANVAS_PAD * 2;
    const canvasH = h + CANVAS_PAD * 2;

    canvas.width = Math.round(canvasW * dpr);
    canvas.height = Math.round(canvasH * dpr);
    canvas.style.width = `${canvasW}px`;
    canvas.style.height = `${canvasH}px`;

    try {
      await document.fonts.ready;
      const img = card.querySelector('img');
      if (img && !img.complete) {
        await new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      }

      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });

      if (captureGenRef.current !== gen) return;

      const snapshot = await toCanvas(card, {
        width: w,
        height: h,
        pixelRatio: 1,
        backgroundColor: 'transparent',
        cacheBust: true,
      });

      if (captureGenRef.current !== gen) return;

      particlesRef.current = {
        width: canvasW,
        height: canvasH,
        list: buildDustFromSnapshot(snapshot, w, h),
      };
    } catch {
      particlesRef.current = null;
    }
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    captureDust();

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(captureDust, 180);
    };

    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [captureDust]);

  useEffect(() => {
    const tick = () => {
      const dive = getDive();
      const canvas = canvasRef.current;
      const card = cardRef.current;
      const data = particlesRef.current;

      if (card) {
        if (reducedMotionRef.current) {
          card.style.opacity = String(Math.max(0, 1 - dive * 1.4));
        } else {
          const dissolve = clamp((dive - DISSOLVE_START) / (DISSOLVE_END - DISSOLVE_START), 0, 1);
          const cardOpacity = 1 - dissolve;
          card.style.opacity = String(cardOpacity);
          card.style.visibility = cardOpacity <= 0.01 ? 'hidden' : 'visible';
        }
      }

      if (!canvas || !data || reducedMotionRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const ctx = canvas.getContext('2d');
      const dpr = canvas.width / data.width;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, data.width, data.height);

      if (dive > DISSOLVE_START) {
        for (const p of data.list) {
          const local = Math.max(0, dive - p.delay * 0.08);
          const dissolve = clamp(
            (local - DISSOLVE_START) / (DISSOLVE_END - DISSOLVE_START),
            0,
            1,
          );
          const drift = clamp((local - DISSOLVE_END) / (1 - DISSOLVE_END), 0, 1);
          const driftEased = drift * drift;

          if (dissolve <= 0 && drift <= 0) continue;

          const wobble = Math.sin(dive * p.wobbleSpeed + p.wobble) * driftEased * 6;
          const x = p.ox + p.vx * DRIFT * driftEased + wobble;
          const y = p.oy + p.vy * DRIFT * driftEased + driftEased * driftEased * 18;

          const alpha =
            drift <= 0
              ? dissolve * p.baseAlpha
              : p.baseAlpha * (1 - driftEased * 0.97);

          if (alpha <= 0.006) continue;

          const grain = p.size * (1 - driftEased * 0.4);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
          ctx.fillRect(x - grain * 0.5, y - grain * 0.5, grain, grain);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="hero-scatter">
      <div className="hero-scatter__inner">
        <div className="hero-scatter__card-wrap" ref={cardRef}>
          <HeroCard />
        </div>
        <canvas className="hero-scatter__canvas" ref={canvasRef} aria-hidden="true" />
      </div>
    </div>
  );
}

export { HeroCardScatter };

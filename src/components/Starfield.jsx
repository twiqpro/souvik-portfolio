import { useEffect, useRef } from 'react';
import './Starfield.css';

/**
 * Canvas starfield — Section 4 background.
 * Star tuple: [x, y, z, sx, sy, prevSx, prevSy, visible]
 */
function Starfield({
  active = true,
  starColor = 'rgba(255,255,255,1)',
  bgColor = 'rgba(0,0,0,1)',
  mouseAdjust = true,
  easing = 1,
  clickToWarp = false,
  warpFactor = 10,
  speed = 1,
  quantity = 480,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const frameRef = useRef(0);
  const warpRef = useRef(false);
  const cursorRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const activeRef = useRef(active);
  activeRef.current = active;

  const sd = useRef({
    w: 0,
    h: 0,
    ctx: null,
    x: 0,
    y: 0,
    z: 0,
    star: { colorRatio: 0, arr: [] },
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    const ratio = quantity / 2;

    const measure = () => {
      sd.current.w = wrap.clientWidth;
      sd.current.h = wrap.clientHeight;
      sd.current.x = Math.round(sd.current.w / 2);
      sd.current.y = Math.round(sd.current.h / 2);
      sd.current.z = (sd.current.w + sd.current.h) / 2;
      sd.current.star.colorRatio = 1 / sd.current.z;
      if (!cursorRef.current.x && !cursorRef.current.y) {
        cursorRef.current.x = sd.current.x;
        cursorRef.current.y = sd.current.y;
      }
    };

    const bigBang = () => {
      const { w, h, x, y, z } = sd.current;
      sd.current.star.arr = Array.from({ length: quantity }, () => [
        Math.random() * w * 2 - x * 2,
        Math.random() * h * 2 - y * 2,
        Math.round(Math.random() * z),
        0,
        0,
        0,
        0,
        true,
      ]);
    };

    const setup = () => {
      measure();
      const ctx = canvas.getContext('2d');
      sd.current.ctx = ctx;
      canvas.width = sd.current.w;
      canvas.height = sd.current.h;
      if (!sd.current.star.arr.length) bigBang();
    };

    const resize = () => {
      measure();
      const { ctx, w, h } = sd.current;
      if (!ctx) return;
      if (ctx.canvas.width !== w || ctx.canvas.height !== h) {
        ctx.canvas.width = w;
        ctx.canvas.height = h;
      }
    };

    const update = () => {
      const s = sd.current;
      mouseRef.current.x = (cursorRef.current.x - s.x) / easing;
      mouseRef.current.y = (cursorRef.current.y - s.y) / easing;
      const compSpeed = warpRef.current ? speed * warpFactor : speed;

      s.star.arr = s.star.arr.map((star) => {
        const next = [...star];
        next[7] = true;
        next[5] = next[3];
        next[6] = next[4];
        next[0] += mouseRef.current.x >> 4;

        if (next[0] > s.x << 1) {
          next[0] -= s.w << 1;
          next[7] = false;
        }
        if (next[0] < -s.x << 1) {
          next[0] += s.w << 1;
          next[7] = false;
        }

        next[1] += mouseRef.current.y >> 4;
        if (next[1] > s.y << 1) {
          next[1] -= s.h << 1;
          next[7] = false;
        }
        if (next[1] < -s.y << 1) {
          next[1] += s.h << 1;
          next[7] = false;
        }

        next[2] -= compSpeed;
        if (next[2] > s.z) {
          next[2] -= s.z;
          next[7] = false;
        }
        if (next[2] < 0) {
          next[2] += s.z;
          next[7] = false;
        }

        next[3] = s.x + (next[0] / next[2]) * ratio;
        next[4] = s.y + (next[1] / next[2]) * ratio;
        return next;
      });
    };

    const draw = () => {
      const { ctx, w, h, star } = sd.current;
      if (!ctx) return;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = starColor;

      for (const st of star.arr) {
        if (st[5] > 0 && st[5] < w && st[6] > 0 && st[6] < h && st[7]) {
          ctx.lineWidth = (1 - star.colorRatio * st[2]) * 2;
          ctx.beginPath();
          ctx.moveTo(st[5], st[6]);
          ctx.lineTo(st[3], st[4]);
          ctx.stroke();
        }
      }
    };

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (!activeRef.current) return;
      resize();
      update();
      draw();
    };

    const onMouse = (e) => {
      const rect = wrap.getBoundingClientRect();
      cursorRef.current.x = e.clientX - rect.left;
      cursorRef.current.y = e.clientY - rect.top;
    };

    const onDown = () => {
      warpRef.current = true;
    };
    const onUp = () => {
      warpRef.current = false;
    };

    setup();
    frameRef.current = requestAnimationFrame(tick);

    if (mouseAdjust) wrap.addEventListener('mousemove', onMouse);
    if (clickToWarp) {
      wrap.addEventListener('mousedown', onDown);
      wrap.addEventListener('mouseup', onUp);
      wrap.addEventListener('mouseleave', onUp);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      if (mouseAdjust) wrap.removeEventListener('mousemove', onMouse);
      if (clickToWarp) {
        wrap.removeEventListener('mousedown', onDown);
        wrap.removeEventListener('mouseup', onUp);
        wrap.removeEventListener('mouseleave', onUp);
      }
      sd.current.star.arr = [];
      sd.current.ctx = null;
    };
  }, [
    bgColor,
    clickToWarp,
    easing,
    mouseAdjust,
    quantity,
    speed,
    starColor,
    warpFactor,
  ]);

  return (
    <div ref={wrapRef} className="starfield">
      <canvas ref={canvasRef} className="starfield__canvas" />
    </div>
  );
}

export { Starfield };

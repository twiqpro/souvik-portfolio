import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { tunnelFragmentShader, tunnelVertexShader } from '../shaders/tunnel';
import { mapScrollProgress } from '../utils/scrollProgress';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

const SCROLL_KEYS = [
  'dive',
  'section2',
  'section2Content',
  'section2Phase',
  'section2StackPhase',
  'section2TunnelPhase',
  'section3',
  'section3Content',
  'section3Phase',
  'section3TunnelPhase',
  'section4',
  'section4Content',
  'section4Phase',
  'forwardProgress',
  'tunnelProgress',
];

function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function syncRendererSize(renderer, material, width, height) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);
  material.uniforms.iResolution.value.set(
    Math.round(width * dpr),
    Math.round(height * dpr),
    1,
  );
}

function createTunnelContext(canvas, width, height, vertexShader, fragmentShader) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(width, height, 1) },
    },
    vertexShader,
    fragmentShader,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  syncRendererSize(renderer, material, width, height);

  return { renderer, scene, camera, material, mesh, geometry };
}

function disposeTunnelContext(ctx) {
  ctx.scene.remove(ctx.mesh);
  ctx.mesh.geometry.dispose();
  ctx.material.dispose();
  ctx.renderer.dispose();
}

/**
 * Full-bleed tunnel shader; iTime is driven by scroll (not free-running time).
 */
function TunnelBackground({
  diveRef = null,
  className = 'section-2__bg',
  canvasClassName = 'section-2__canvas',
  scrollKey = 'tunnelProgress',
  scrollTime = 14,
  speedMultiplier = 1,
  vertexShader = tunnelVertexShader,
  fragmentShader = tunnelFragmentShader,
  visibilityKey = 'section2',
}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const pausedRef = useRef(false);
  const rafResizeRef = useRef(false);
  const diveRefStable = useRef(diveRef);
  diveRefStable.current = diveRef;

  const renderFrame = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || pausedRef.current) return;

    const dive = diveRefStable.current;
    const progress = dive?.current?.current ?? 0;
    const mapped = dive?.current?.mapped ?? mapScrollProgress(progress);
    const visibility = mapped[visibilityKey] ?? 0;

    if (visibility < 0.02) {
      ctx.renderer.clear(true);
      return;
    }

    const scrollChannel = SCROLL_KEYS.includes(scrollKey)
      ? mapped[scrollKey]
      : mapped.tunnelProgress;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ctx.material.uniforms.iTime.value = reducedMotion
      ? 0
      : scrollChannel * scrollTime * speedMultiplier;

    ctx.renderer.render(ctx.scene, ctx.camera);
  }, [scrollKey, scrollTime, speedMultiplier, visibilityKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const { width, height } = getViewportSize();
    const ctx = createTunnelContext(canvas, width, height, vertexShader, fragmentShader);
    ctxRef.current = ctx;

    const resize = () => {
      if (!ctxRef.current) return;
      const next = getViewportSize();
      syncRendererSize(
        ctxRef.current.renderer,
        ctxRef.current.material,
        next.width,
        next.height,
      );
    };

    const resizeObserver = new ResizeObserver(() => {
      if (!ctxRef.current || rafResizeRef.current) return;
      rafResizeRef.current = true;
      requestAnimationFrame(() => {
        rafResizeRef.current = false;
        resize();
      });
    });
    resizeObserver.observe(document.documentElement);
    window.addEventListener('resize', resize);

    const onVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (ctxRef.current) {
        disposeTunnelContext(ctxRef.current);
        ctxRef.current = null;
      }
    };
  }, [vertexShader, fragmentShader]);

  useAnimationFrame(renderFrame);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} className={canvasClassName} />
    </div>
  );
}

export { TunnelBackground };

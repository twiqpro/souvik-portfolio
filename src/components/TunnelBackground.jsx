import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { tunnelFragmentShader, tunnelVertexShader } from '../shaders/tunnel';
import { mapScrollProgress } from '../utils/scrollProgress';

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
  'section4',
  'section4Content',
  'section4Phase',
  'forwardProgress',
  'tunnelProgress',
];

function createTunnelContext(canvas, width, height, vertexShader, fragmentShader) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height);

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
 *
 * @param {object} props
 * @param {React.MutableRefObject<{ current: number }>|null} props.diveRef
 * @param {string} [props.className]
 * @param {string} [props.canvasClassName]
 * @param {keyof ReturnType<typeof mapScrollProgress>} [props.scrollKey='section2']
 * @param {number} [props.scrollTime=14] — virtual seconds mapped across scrollKey 0→1
 * @param {number} [props.speedMultiplier=0.5] — extra uniform time scale (future sections)
 * @param {string} [props.vertexShader]
 * @param {string} [props.fragmentShader]
 * @param {keyof ReturnType<typeof mapScrollProgress>} [props.visibilityKey] — skip WebGL when low
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

  const renderFrame = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || pausedRef.current) return;

    const progress = diveRef?.current?.current ?? 0;
    const mapped = diveRef?.current?.mapped ?? mapScrollProgress(progress);
    const visibility = mapped[visibilityKey] ?? 0;
    if (visibility < 0.02) return;

    const scrollChannel = SCROLL_KEYS.includes(scrollKey)
      ? mapped[scrollKey]
      : mapped.tunnelProgress;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ctx.material.uniforms.iTime.value = reducedMotion
      ? 0
      : scrollChannel * scrollTime * speedMultiplier;

    ctx.renderer.render(ctx.scene, ctx.camera);
  }, [diveRef, scrollKey, scrollTime, speedMultiplier, visibilityKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const ctx = createTunnelContext(canvas, width, height, vertexShader, fragmentShader);
    ctxRef.current = ctx;

    const resizeObserver = new ResizeObserver(() => {
      if (!ctxRef.current || rafResizeRef.current) return;
      rafResizeRef.current = true;
      requestAnimationFrame(() => {
        rafResizeRef.current = false;
        const c = canvas.parentElement;
        if (!c || !ctxRef.current) return;
        const w = c.clientWidth;
        const h = c.clientHeight;
        ctxRef.current.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        ctxRef.current.renderer.setSize(w, h);
        ctxRef.current.material.uniforms.iResolution.value.set(w, h, 1);
      });
    });
    resizeObserver.observe(container);

    const onVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();

    let frameId = 0;
    const loop = () => {
      frameId = requestAnimationFrame(loop);
      renderFrame();
    };
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (ctxRef.current) {
        disposeTunnelContext(ctxRef.current);
        ctxRef.current = null;
      }
    };
  }, [renderFrame, vertexShader, fragmentShader]);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} className={canvasClassName} />
    </div>
  );
}

export { TunnelBackground };

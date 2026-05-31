import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { section2AuroraFragment, section2AuroraVertex } from '../shaders/section2Aurora';

const TIME_STEP = 0.016;

/**
 * Full-screen aurora shader for Section 2 (from AnoAI).
 */
function Section2AuroraBackground({ active = false }) {
  const containerRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = 'section-2__canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: section2AuroraVertex,
      fragmentShader: section2AuroraFragment,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const setSize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      material.uniforms.iResolution.value.set(w, h);
    };

    setSize();
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);

    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (activeRef.current && !reducedMotion) {
        material.uniforms.iTime.value += TIME_STEP;
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="section-2__bg" aria-hidden="true" />;
}

export { Section2AuroraBackground };

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import './DottedSurface.css';

const SEPARATION = 150;
const AMOUNT_X = 40;
const AMOUNT_Y = 60;

function DottedSurface({ active = false, className = '' }) {
  const containerRef = useRef(null);
  const runtimeRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(60, 1, 1, 10000);
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const positions = [];
    const colors = [];

    for (let ix = 0; ix < AMOUNT_X; ix += 1) {
      for (let iy = 0; iy < AMOUNT_Y; iy += 1) {
        const x = ix * SEPARATION - (AMOUNT_X * SEPARATION) / 2;
        const z = iy * SEPARATION - (AMOUNT_Y * SEPARATION) / 2;
        positions.push(x, 0, z);
        colors.push(0.78, 0.78, 0.78);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
    };

    resize();
    window.addEventListener('resize', resize);

    runtimeRef.current = {
      scene,
      camera,
      renderer,
      geometry,
      material,
      points,
      count: 0,
    };

    return () => {
      window.removeEventListener('resize', resize);
      scene.remove(points);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      runtimeRef.current = null;
    };
  }, []);

  useAnimationFrame(() => {
    const runtime = runtimeRef.current;
    if (!runtime || !activeRef.current || document.hidden) return;

    const { geometry, renderer, scene, camera } = runtime;
    const positionAttribute = geometry.attributes.position;
    const positions = positionAttribute.array;

    let i = 0;
    for (let ix = 0; ix < AMOUNT_X; ix += 1) {
      for (let iy = 0; iy < AMOUNT_Y; iy += 1) {
        const index = i * 3;
        positions[index + 1] =
          Math.sin((ix + runtime.count) * 0.3) * 50
          + Math.sin((iy + runtime.count) * 0.5) * 50;
        i += 1;
      }
    }

    positionAttribute.needsUpdate = true;
    renderer.render(scene, camera);
    runtime.count += 0.05;
  });

  return (
    <div
      ref={containerRef}
      className={`dotted-surface${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    />
  );
}

export { DottedSurface };

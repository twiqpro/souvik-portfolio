import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GALLERY_IMAGES, GALLERY_IMAGE_COUNT } from '../data/galleryImages';
import { createClothCardMaterial } from '../shaders/clothCard';
import './TunnelCardGallery.css';

const MAX_VISIBLE_COUNT = 9;
const DEPTH_RANGE = 50;
const MAX_HORIZONTAL_OFFSET = 6;
const MAX_VERTICAL_OFFSET = 4;
const STACK_HOLD = 0.08;
const PLANE_BASE_SCALE = 2.05;
const CAMERA_FOV = 68;
const VISUAL_SLOT_ORDER_BY_COUNT = {
  8: [3, 1, 2, 0, 7, 6, 5, 4],
  9: [3, 1, 2, 0, 8, 7, 6, 5, 4],
};

const FADE_SETTINGS = {
  fadeIn: { start: 0.05, end: 0.22 },
  fadeOut: { start: 0.58, end: 0.74 },
};

const BLUR_SETTINGS = {
  blurIn: { start: 0.0, end: 0.12 },
  blurOut: { start: 0.58, end: 0.74 },
  maxBlur: 5.0,
};

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function getStackProgress(rawPhase) {
  if (rawPhase <= STACK_HOLD) return 0;
  return clamp01((rawPhase - STACK_HOLD) / (1 - STACK_HOLD));
}

function getTunnelVisibility(mapped) {
  return Math.max(mapped?.section2 ?? 0, mapped?.section3 ?? 0);
}

function getNearScaleDampen(worldZ) {
  if (worldZ <= 6) return 1;
  return Math.max(0.7, 1 - (worldZ - 6) * 0.014);
}

function getOpacityForPosition(normalizedPosition) {
  let opacity = 1;

  if (
    normalizedPosition >= FADE_SETTINGS.fadeIn.start
    && normalizedPosition <= FADE_SETTINGS.fadeIn.end
  ) {
    const t =
      (normalizedPosition - FADE_SETTINGS.fadeIn.start)
      / (FADE_SETTINGS.fadeIn.end - FADE_SETTINGS.fadeIn.start);
    opacity = t;
  } else if (normalizedPosition < FADE_SETTINGS.fadeIn.start) {
    opacity = 0;
  } else if (
    normalizedPosition >= FADE_SETTINGS.fadeOut.start
    && normalizedPosition <= FADE_SETTINGS.fadeOut.end
  ) {
    const t =
      (normalizedPosition - FADE_SETTINGS.fadeOut.start)
      / (FADE_SETTINGS.fadeOut.end - FADE_SETTINGS.fadeOut.start);
    opacity = 1 - t;
  } else if (normalizedPosition > FADE_SETTINGS.fadeOut.end) {
    opacity = 0;
  }

  return clamp01(opacity);
}

function getBlurForPosition(normalizedPosition) {
  let blur = 0;

  if (
    normalizedPosition >= BLUR_SETTINGS.blurIn.start
    && normalizedPosition <= BLUR_SETTINGS.blurIn.end
  ) {
    const t =
      (normalizedPosition - BLUR_SETTINGS.blurIn.start)
      / (BLUR_SETTINGS.blurIn.end - BLUR_SETTINGS.blurIn.start);
    blur = BLUR_SETTINGS.maxBlur * (1 - t);
  } else if (normalizedPosition < BLUR_SETTINGS.blurIn.start) {
    blur = BLUR_SETTINGS.maxBlur;
  } else if (
    normalizedPosition >= BLUR_SETTINGS.blurOut.start
    && normalizedPosition <= BLUR_SETTINGS.blurOut.end
  ) {
    const t =
      (normalizedPosition - BLUR_SETTINGS.blurOut.start)
      / (BLUR_SETTINGS.blurOut.end - BLUR_SETTINGS.blurOut.start);
    blur = BLUR_SETTINGS.maxBlur * t;
  } else if (normalizedPosition > BLUR_SETTINGS.blurOut.end) {
    blur = BLUR_SETTINGS.maxBlur;
  }

  return Math.max(0, Math.min(BLUR_SETTINGS.maxBlur, blur));
}

function buildSpatialPositions(count) {
  const positions = [];

  for (let i = 0; i < count; i += 1) {
    const horizontalAngle = (i * 2.618) % (Math.PI * 2);
    const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
    const horizontalRadius = (i % 3) * 1.2;
    const verticalRadius = ((i + 1) % 4) * 0.8;

    positions.push({
      x: (Math.sin(horizontalAngle) * horizontalRadius * MAX_HORIZONTAL_OFFSET) / 3,
      y: (Math.cos(verticalAngle) * verticalRadius * MAX_VERTICAL_OFFSET) / 4,
    });
  }

  return positions;
}

function getInitialImageIndexForPlane(planeIndex, visibleCount) {
  const visualOrder =
    VISUAL_SLOT_ORDER_BY_COUNT[visibleCount]
      ?? Array.from({ length: visibleCount }, (_, i) => i);

  const imageIndex = visualOrder.indexOf(planeIndex);
  return imageIndex === -1 ? planeIndex % GALLERY_IMAGE_COUNT : imageIndex % GALLERY_IMAGE_COUNT;
}

function getImageIndexForCycle(planeIndex, visibleCount, cycleIndex) {
  const initialIndex = getInitialImageIndexForPlane(planeIndex, visibleCount);
  return (initialIndex + cycleIndex * visibleCount) % GALLERY_IMAGE_COUNT;
}

/**
 * Scroll-driven 3D image gallery for Sections 2 & 3.
 */
function TunnelCardGallery({ diveRef = null, active = false }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const diveRefStable = useRef(diveRef);
  const activeRef = useRef(active);
  const lastPhaseRef = useRef(0);

  diveRefStable.current = diveRef;
  activeRef.current = active;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const visibleCount = Math.min(MAX_VISIBLE_COUNT, GALLERY_IMAGE_COUNT);
    const spatialPositions = buildSpatialPositions(visibleCount);
    const halfRange = DEPTH_RANGE / 2;
    const depthStep = DEPTH_RANGE / visibleCount;

    const planesData = Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: (depthStep * i) % DEPTH_RANGE,
      imageIndex: getInitialImageIndexForPlane(i, visibleCount),
      x: spatialPositions[i].x,
      y: spatialPositions[i].y,
    }));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 200);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const textures = GALLERY_IMAGES.map((src) => {
      const texture = loader.load(src);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    });

    const materials = Array.from({ length: visibleCount }, () => {
      const config = createClothCardMaterial();
      return new THREE.ShaderMaterial(config);
    });

    const meshes = planesData.map((plane, i) => {
      const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
      const mesh = new THREE.Mesh(geometry, materials[i]);
      mesh.userData.planeIndex = i;
      scene.add(mesh);
      return mesh;
    });

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const clock = new THREE.Clock();
    let frameId = 0;

    const tick = () => {
      frameId = requestAnimationFrame(tick);

      const mapped = diveRefStable.current?.current?.mapped;
      const visibility = getTunnelVisibility(mapped);
      const section3Exit = mapped?.section3Exit ?? 0;
      const exitFade = clamp01(1 - section3Exit * 1.15);
      const tunnelProgress = mapped?.tunnelProgress ?? 0;
      const stackPhase = getStackProgress(tunnelProgress);
      const scrollForce = (tunnelProgress - lastPhaseRef.current) * 80;
      lastPhaseRef.current = tunnelProgress;

      container.style.opacity = String(visibility * exitFade);
      container.style.visibility = visibility * exitFade < 0.02 ? 'hidden' : 'visible';

      if (!activeRef.current || visibility * exitFade < 0.02) {
        renderer.render(scene, camera);
        return;
      }

      const scrollOffset = stackPhase * DEPTH_RANGE * (GALLERY_IMAGE_COUNT / visibleCount);
      const time = clock.getElapsedTime();

      materials.forEach((material) => {
        material.uniforms.time.value = time;
        material.uniforms.scrollForce.value = reducedMotion ? 0 : scrollForce;
      });

      planesData.forEach((plane, i) => {
        const mesh = meshes[i];
        const material = materials[i];
        const baseZ = depthStep * i;
        const totalZ = baseZ + scrollOffset;
        const newZ = ((totalZ % DEPTH_RANGE) + DEPTH_RANGE) % DEPTH_RANGE;
        const cycleIndex = Math.floor(totalZ / DEPTH_RANGE);

        plane.z = newZ;
        plane.imageIndex = getImageIndexForCycle(i, visibleCount, cycleIndex);
        plane.x = spatialPositions[i].x;
        plane.y = spatialPositions[i].y;

        const texture = textures[plane.imageIndex];
        if (!texture?.image) return;

        const normalizedPosition = plane.z / DEPTH_RANGE;
        const opacity = getOpacityForPosition(normalizedPosition) * visibility * exitFade;
        const blur = reducedMotion ? 0 : getBlurForPosition(normalizedPosition);

        material.uniforms.map.value = texture;
        material.uniforms.opacity.value = opacity;
        material.uniforms.blurAmount.value = blur;

        const worldZ = plane.z - halfRange;
        const scaleMul = PLANE_BASE_SCALE * getNearScaleDampen(worldZ);
        const aspect = texture.image.width / texture.image.height;
        const scaleX = aspect > 1 ? scaleMul * aspect : scaleMul;
        const scaleY = aspect > 1 ? scaleMul : scaleMul / aspect;

        mesh.position.set(plane.x, plane.y, worldZ);
        mesh.scale.set(scaleX, scaleY, 1);
        mesh.visible = opacity > 0.005;
      });

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        scene.remove(mesh);
      });
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="tunnel-card-gallery" aria-label="Work gallery">
      <canvas ref={canvasRef} className="tunnel-card-gallery__canvas" />
    </div>
  );
}

export { TunnelCardGallery, GALLERY_IMAGES, GALLERY_IMAGE_COUNT };

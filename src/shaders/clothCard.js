/** Cloth-style card plane — blur, opacity, and scroll-driven curvature. */

export const clothCardVertexShader = `
  uniform float scrollForce;
  uniform float time;
  uniform float isHovered;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normal;

    vec3 pos = position;
        float curveIntensity = scrollForce * 0.22;
    float distanceFromCenter = length(pos.xy);
    float curve = distanceFromCenter * distanceFromCenter * curveIntensity;

    float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
    float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
    float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;

    float flagWave = 0.0;
    if (isHovered > 0.5) {
      float wavePhase = pos.x * 3.0 + time * 8.0;
      float waveAmplitude = sin(wavePhase) * 0.1;
      float dampening = smoothstep(-0.5, 0.5, pos.x);
      flagWave = waveAmplitude * dampening;
      flagWave += sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
    }

    pos.z -= (curve + clothEffect + flagWave);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const clothCardFragmentShader = `
  uniform sampler2D map;
  uniform float opacity;
  uniform float blurAmount;
  uniform float scrollForce;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec4 color = texture2D(map, vUv);

    if (blurAmount > 0.0) {
      vec2 texelSize = 1.0 / vec2(textureSize(map, 0));
      vec4 blurred = vec4(0.0);
      float total = 0.0;

      for (float x = -2.0; x <= 2.0; x += 1.0) {
        for (float y = -2.0; y <= 2.0; y += 1.0) {
          vec2 offset = vec2(x, y) * texelSize * blurAmount;
          float weight = 1.0 / (1.0 + length(vec2(x, y)));
          blurred += texture2D(map, vUv + offset) * weight;
          total += weight;
        }
      }
      color = blurred / total;
    }

    float curveHighlight = abs(scrollForce) * 0.05;
    color.rgb += vec3(curveHighlight * 0.1);

    gl_FragColor = vec4(color.rgb, color.a * opacity);
  }
`;

export function createClothCardMaterial() {
  return {
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: clothCardVertexShader,
    fragmentShader: clothCardFragmentShader,
  };
}

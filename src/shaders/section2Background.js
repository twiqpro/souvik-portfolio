/**
 * Interstellar / Gargantua-style black hole (ref: user reference frames).
 * - Black event horizon + thin white/cyan photon ring (bloom)
 * - Tilted accretion disk: white → orange → pink → magenta/purple clouds
 * - Gravitational lensing: bright arc over hole, fainter arc below
 * - Slow inward swirl + subtle core pulse
 */
export const section2ShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x, R.y)

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.86, -0.5, 0.5, 0.86);
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = rot * p * 2.04 + vec2(1.4, -0.9);
    a *= 0.5;
  }
  return v;
}

float stars(vec2 p) {
  vec2 g = floor(p * 400.0);
  vec2 f = fract(p * 400.0) - 0.5;
  float n = hash(g);
  float d = length(f);
  float s = smoothstep(0.18, 0.0, d) * n;
  s += smoothstep(0.04, 0.0, d) * step(0.988, n) * 2.2;
  return s * (0.72 + 0.28 * sin(T * 1.1 + n * 36.0));
}

vec3 gargantuaColor(float r, float mist) {
  vec3 white = vec3(1.0, 0.99, 0.98);
  vec3 cyan = vec3(0.72, 0.9, 1.0);
  vec3 orange = vec3(1.0, 0.38, 0.1);
  vec3 rose = vec3(1.0, 0.42, 0.52);
  vec3 magenta = vec3(0.82, 0.18, 0.55);
  vec3 purple = vec3(0.32, 0.06, 0.28);
  vec3 c = mix(white, cyan, smoothstep(0.1, 0.18, r));
  c = mix(c, orange, smoothstep(0.16, 0.3, r));
  c = mix(c, rose, smoothstep(0.28, 0.42, r));
  c = mix(c, magenta, smoothstep(0.4, 0.58, r));
  c = mix(c, purple, smoothstep(0.56, 0.9, r));
  return c * (0.35 + 1.15 * mist);
}

float diskClouds(float ang, float rDisk, float spin) {
  float c1 = fbm(vec2(ang * 5.0 - spin * 1.4, rDisk * 7.0 - T * 0.03));
  float c2 = fbm(vec2(ang * 9.0 + spin * 0.5, rDisk * 13.0));
  float c3 = fbm(vec2(ang * 2.8 - spin * 2.0, log(rDisk + 0.08) * 4.5));
  float arms = sin(ang * 4.0 - spin * 2.5 + rDisk * 9.0) * 0.5 + 0.5;
  return mix(c1 * 0.4 + c2 * 0.35 + c3 * 0.25, arms, 0.35);
}

void main(void) {
  vec2 uv = (FC - 0.5 * R) / MN;
  vec2 p = uv;

  vec3 col = vec3(0.006, 0.004, 0.012);
  col += vec3(0.75, 0.78, 0.95) * stars(p + T * 0.002);
  col += vec3(0.5, 0.4, 0.62) * stars(p * 1.6 + 7.0) * 0.35;

  vec2 center = vec2(0.0, 0.02);
  vec2 q = p - center;
  float r = length(q);
  float pulse = 0.9 + 0.1 * sin(T * 0.75);

  vec2 diskP = vec2(q.x, q.y / 0.22);
  float rDisk = length(diskP);
  float ang = atan(diskP.y, diskP.x);
  float spin = T * 0.13;

  float clouds = pow(diskClouds(ang, rDisk, spin), 0.82);

  float diskIn = smoothstep(0.11, 0.17, rDisk);
  float diskOut = smoothstep(1.0, 0.32, rDisk);
  float diskMask = diskIn * diskOut;
  float slab = exp(-pow(q.y / (0.09 + rDisk * 0.14), 2.0));
  float diskLit = diskMask * slab * (0.15 + 1.85 * clouds);

  vec3 dcol = gargantuaColor(rDisk, clouds);

  float photonCore = exp(-pow((r - 0.128) / 0.0038, 2.0));
  float photonBloom = exp(-pow((r - 0.128) / 0.014, 2.0));
  vec3 photonCol = mix(vec3(1.0, 0.98, 0.96), vec3(0.68, 0.88, 1.0), 0.45);

  float lensR = 0.13;
  float lensTight = exp(-pow((r - lensR) / 0.016, 2.0));
  lensTight *= exp(-pow(abs(q.y) / (0.014 + r * 0.18), 2.0));
  float lensCloud = fbm(vec2(ang * 7.0 - spin * 2.2, rDisk * 4.0));
  lensTight *= 0.3 + 1.0 * lensCloud;

  vec2 foldP = vec2(q.x, abs(q.y) + 0.05 + r * 0.04);
  vec2 foldDisk = vec2(foldP.x, foldP.y / 0.2);
  float rFold = length(foldDisk);
  float foldAng = atan(foldDisk.y, foldDisk.x);
  float foldC = diskClouds(foldAng, rFold, spin + 0.4);
  float topArc = exp(-pow((rFold - 0.33) / 0.1, 2.0)) * (0.2 + 1.5 * foldC);
  topArc *= exp(-pow(abs(foldP.x) / 0.92, 3.0));
  topArc *= exp(-pow(max(q.y, 0.0) / 0.38, 1.6));
  topArc *= 1.35;

  float botArc = exp(-pow((rFold - 0.3) / 0.11, 2.0)) * (0.15 + 1.1 * foldC);
  botArc *= exp(-pow(abs(foldP.x) / 0.88, 3.0));
  botArc *= exp(-pow(max(-q.y, 0.0) / 0.32, 1.8));
  botArc *= 0.55;

  float hole = smoothstep(0.118, 0.102, r);

  col += dcol * diskLit * 2.6;
  col += photonCol * photonCore * 7.5 * pulse;
  col += photonCol * photonBloom * 2.2 * pulse;
  col += dcol * lensTight * 3.0;
  col += dcol * (topArc + botArc) * 1.85;

  col *= hole;

  float spiralR = length(p - center) + 0.01;
  float spiralA = atan(p.y - center.y, p.x - center.x) - spin * 0.7;
  float spiral = fbm(vec2(spiralA * 3.5, log(spiralR) * 3.0 - T * 0.02));
  float spiralMask = smoothstep(0.95, 0.25, spiralR) * smoothstep(0.18, 0.42, spiralR);
  spiralMask *= sin(spiralA * 5.0 + spiralR * 6.0 - spin * 3.0) * 0.5 + 0.5;
  col += vec3(0.45, 0.1, 0.42) * spiral * spiralMask * 0.45;
  col += vec3(0.85, 0.35, 0.75) * spiral * spiralMask * clouds * 0.2;

  float corner = fbm(p * 1.2 + vec2(T * 0.015, 0.0));
  col += vec3(0.08, 0.02, 0.1) * corner * smoothstep(0.5, 1.4, length(p)) * 0.25;

  col *= smoothstep(1.5, 0.35, length(p * 0.95));
  col = pow(col, vec3(0.84));
  col = min(col, vec3(8.0));

  O = vec4(col, 1.0);
}
`;

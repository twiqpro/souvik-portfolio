/** Aurora flow — monochrome void black / ash / silver (portfolio theme). */
export const section2AuroraFragment = `
uniform float iTime;
uniform vec2 iResolution;

#define NUM_OCTAVES 3
#define ASH 0.30
#define SILVER 0.78

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);

  float res = mix(
    mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
    mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
    u.y
  );
  return res * res;
}

float fbm(vec2 x) {
  float v = 0.0;
  float a = 0.3;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < NUM_OCTAVES; ++i) {
    v += a * noise(x);
    x = rot * x * 2.0 + shift;
    a *= 0.4;
  }
  return v;
}

float greyStars(vec2 uv) {
  vec2 p = uv * vec2(420.0, 420.0 * (iResolution.y / max(iResolution.x, 1.0)));
  vec2 g = floor(p);
  vec2 f = fract(p) - 0.5;
  float n = rand(g);
  float d = length(f);
  float s = smoothstep(0.2, 0.0, d) * step(0.9, n);
  s += smoothstep(0.055, 0.0, d) * step(0.988, n) * 1.6;
  float tw = 0.55 + 0.45 * sin(iTime * 1.0 + n * 40.0);
  return s * tw;
}

void main() {
  vec2 shake = vec2(sin(iTime * 1.2) * 0.005, cos(iTime * 2.1) * 0.005);
  vec2 p = ((gl_FragCoord.xy + shake * iResolution.xy) - iResolution.xy * 0.5) / iResolution.y
    * mat2(6.0, -4.0, 4.0, 6.0);
  vec2 v;
  vec4 o = vec4(0.0);

  float f = 2.0 + fbm(p + vec2(iTime * 5.0, 0.0)) * 0.5;

  for (float i = 0.0; i < 35.0; i++) {
    v = p + cos(i * i + (iTime + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5
      + vec2(sin(iTime * 3.0 + i) * 0.003, cos(iTime * 3.5 - i) * 0.003);
    float tailNoise = fbm(v + vec2(iTime * 0.5, i)) * 0.3 * (1.0 - (i / 35.0));
    float lum = ASH + 0.22 * sin(i * 0.2 + iTime * 0.35) + 0.1 * cos(i * 0.28 + iTime * 0.25);
    lum = mix(lum * 0.45, lum + 0.35, smoothstep(0.35, 1.0, i / 35.0));
    lum = clamp(lum, 0.04, SILVER);
    vec3 auroraGrey = vec3(lum);
    vec3 currentContribution = auroraGrey
      * exp(sin(i * i + iTime * 0.8))
      / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
    float thinnessFactor = smoothstep(0.0, 1.0, i / 35.0) * 0.55;
    o.rgb += currentContribution * (1.0 + tailNoise * 0.7) * thinnessFactor;
  }

  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float stars = greyStars(uv);
  vec3 starCol = mix(vec3(ASH), vec3(SILVER), stars);

  o = tanh(pow(vec4(o.rgb / 110.0, 1.0), vec4(1.65)));
  vec3 col = o.rgb * 1.1;
  col = mix(vec3(0.0), col, 0.92);
  col += starCol * stars * 0.55;
  col = pow(col, vec3(1.08));
  col = clamp(col, 0.0, SILVER);

  gl_FragColor = vec4(col, 1.0);
}
`;

export const section2AuroraVertex = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

import { useMemo } from 'react';
import './WireBundle.css';

const VB_W = 100;
const VB_H = 300;
const CX = 50;
const AMPLITUDE = 14;
const PITCH = 42;
const STRAND_RADIUS = 3.4;
const PHASES = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

function strandX(y, phase) {
  return CX + AMPLITUDE * Math.sin((2 * Math.PI * y) / PITCH + phase);
}

function strandDepth(y, phase) {
  return Math.cos((2 * Math.PI * y) / PITCH + phase);
}

function frontStrandAt(y) {
  let best = 0;
  let bestDepth = -Infinity;
  for (let i = 0; i < 3; i += 1) {
    const d = strandDepth(y, PHASES[i]);
    if (d > bestDepth) {
      bestDepth = d;
      best = i;
    }
  }
  return best;
}

/** Smooth cubic path through sampled centerline points. */
function pointsToPath(points) {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
  }

  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const cx = x1;
    const cy = y1;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    d += ` Q ${cx} ${cy} ${mx} ${my}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}

/**
 * Split each strand into visible segments (only while that strand is in front)
 * so paths weave over / under like a twisted tri-strand cable.
 */
function buildWeaveSegments(height, step = 1.5) {
  const segments = [[], [], []];
  const open = [null, null, null];

  for (let y = 0; y <= height; y += step) {
    const front = frontStrandAt(y);

    for (let i = 0; i < 3; i += 1) {
      const pt = [strandX(y, PHASES[i]), y];

      if (i === front) {
        if (!open[i]) {
          open[i] = [pt];
        } else {
          open[i].push(pt);
        }
      } else if (open[i]) {
        segments[i].push(open[i]);
        open[i] = null;
      }
    }
  }

  for (let i = 0; i < 3; i += 1) {
    if (open[i]?.length) {
      segments[i].push(open[i]);
    }
  }

  return segments;
}

/** Filled ribbon around centerline for a cylindrical strand cross-section. */
function buildRibbonPath(points, radius) {
  if (points.length < 2) return '';

  const left = [];
  const right = [];

  for (let i = 0; i < points.length; i += 1) {
    const [x, y] = points[i];
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * radius;
    const ny = (dx / len) * radius;
    left.push([x + nx, y + ny]);
    right.push([x - nx, y - ny]);
  }

  let d = `M ${left[0][0]} ${left[0][1]}`;
  for (let i = 1; i < left.length; i += 1) {
    d += ` L ${left[i][0]} ${left[i][1]}`;
  }
  for (let i = right.length - 1; i >= 0; i -= 1) {
    d += ` L ${right[i][0]} ${right[i][1]}`;
  }
  d += ' Z';
  return d;
}

function WireBundle() {
  const { visibleSegments, shadowPaths } = useMemo(() => {
    const weave = buildWeaveSegments(VB_H);
    const shadows = PHASES.map((phase) => {
      const pts = [];
      for (let y = 0; y <= VB_H; y += 2) {
        pts.push([strandX(y, phase), y]);
      }
      return pointsToPath(pts);
    });

    const visible = weave.map((strandSegs, strandIndex) =>
      strandSegs.map((pts, segIndex) => ({
        key: `${strandIndex}-${segIndex}`,
        ribbon: buildRibbonPath(pts, STRAND_RADIUS),
        center: pointsToPath(pts),
        strandIndex,
      })),
    );

    return { visibleSegments: visible.flat(), shadowPaths: shadows };
  }, []);

  return (
    <svg
      className="wire-bundle"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="wire-glow" x="-50%" y="-2%" width="200%" height="104%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="wire-strand-a" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(40,40,48,0.95)" />
          <stop offset="28%" stopColor="rgba(210,210,218,0.98)" />
          <stop offset="50%" stopColor="rgba(255,255,255,1)" />
          <stop offset="72%" stopColor="rgba(175,175,185,0.95)" />
          <stop offset="100%" stopColor="rgba(35,35,42,0.92)" />
        </linearGradient>

        <linearGradient id="wire-strand-b" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(30,30,38,0.9)" />
          <stop offset="32%" stopColor="rgba(165,165,175,0.92)" />
          <stop offset="52%" stopColor="rgba(235,235,242,0.98)" />
          <stop offset="78%" stopColor="rgba(130,130,140,0.88)" />
          <stop offset="100%" stopColor="rgba(28,28,36,0.9)" />
        </linearGradient>

        <linearGradient id="wire-strand-c" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(45,45,52,0.92)" />
          <stop offset="25%" stopColor="rgba(190,190,200,0.96)" />
          <stop offset="48%" stopColor="rgba(248,248,252,1)" />
          <stop offset="70%" stopColor="rgba(155,155,165,0.9)" />
          <stop offset="100%" stopColor="rgba(32,32,40,0.9)" />
        </linearGradient>

        <linearGradient id="wire-cable-fade" x1="50" y1="0" x2="50" y2={VB_H} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,1)" />
          <stop offset="88%" stopColor="rgba(255,255,255,1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
        </linearGradient>

        <mask id="wire-fade-mask">
          <rect width={VB_W} height={VB_H} fill="url(#wire-cable-fade)" />
        </mask>
      </defs>

      <g className="wire-bundle__cap">
        {PHASES.map((phase, i) => {
          const x = strandX(0, phase);
          return (
            <circle
              key={`cap-${i}`}
              cx={x}
              cy={4}
              r={STRAND_RADIUS + 0.6}
              fill={
                i === 0 ? 'url(#wire-strand-a)' : i === 1 ? 'url(#wire-strand-b)' : 'url(#wire-strand-c)'
              }
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.4"
            />
          );
        })}
      </g>

      <g className="wire-bundle__cable" mask="url(#wire-fade-mask)">
        {/* Deep groove shadows — full-length strands underneath */}
        <g className="wire-bundle__shadows" filter="url(#wire-glow)">
          {shadowPaths.map((d, i) => (
            <path
              key={`shadow-${i}`}
              d={d}
              stroke="rgba(0,0,0,0.55)"
              strokeWidth={STRAND_RADIUS * 2.85}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
        </g>

        {/* Visible woven segments */}
        <g className="wire-bundle__strands" filter="url(#wire-glow)">
          {visibleSegments.map(({ key, ribbon, strandIndex }) => (
            <path
              key={key}
              d={ribbon}
              fill={
                strandIndex === 0
                  ? 'url(#wire-strand-a)'
                  : strandIndex === 1
                    ? 'url(#wire-strand-b)'
                    : 'url(#wire-strand-c)'
              }
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.35"
            />
          ))}
        </g>
      </g>
    </svg>
  );
}

export { WireBundle };

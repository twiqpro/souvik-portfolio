import { useEffect, useRef } from 'react';
import { section2ShaderSource } from '../shaders/section2Background';

/** Lower = slower Gargantua swirl (Interstellar-style). */
const SHADER_TIME_SCALE = 0.44;

const vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

const vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

class WebGLRenderer {
  constructor(canvas, scale) {
    this.canvas = canvas;
    this.scale = scale;
    this.gl = canvas.getContext('webgl2');
    if (!this.gl) throw new Error('WebGL2 not supported');
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
    this.shaderSource = section2ShaderSource;
    this.mouseMove = [0, 0];
    this.mouseCoords = [0, 0];
    this.pointerCoords = [0, 0];
    this.nbrOfPointers = 0;
    this.program = null;
    this.vs = null;
    this.fs = null;
    this.buffer = null;
  }

  updateShader(source) {
    this.reset();
    this.shaderSource = source;
    this.setup();
    this.init();
  }

  updateMove(deltas) {
    this.mouseMove = deltas;
  }

  updateMouse(coords) {
    this.mouseCoords = coords;
  }

  updatePointerCoords(coords) {
    this.pointerCoords = coords;
  }

  updatePointerCount(nbr) {
    this.nbrOfPointers = nbr;
  }

  updateScale(scale) {
    this.scale = scale;
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
  }

  compile(shader, source) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[Section2 shader]', gl.getShaderInfoLog(shader));
      }
  }

  test(source) {
    const gl = this.gl;
    const shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    const log = ok ? null : gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    return log;
  }

  reset() {
    const gl = this.gl;
    if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
      if (this.vs) {
        gl.detachShader(this.program, this.vs);
        gl.deleteShader(this.vs);
      }
      if (this.fs) {
        gl.detachShader(this.program, this.fs);
        gl.deleteShader(this.fs);
      }
      gl.deleteProgram(this.program);
    }
  }

  setup() {
    const gl = this.gl;
    this.vs = gl.createShader(gl.VERTEX_SHADER);
    this.fs = gl.createShader(gl.FRAGMENT_SHADER);
    this.compile(this.vs, vertexSrc);
    this.compile(this.fs, this.shaderSource);
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('[Section2 shader link]', gl.getProgramInfoLog(this.program));
    }
  }

  init() {
    const gl = this.gl;
    const program = this.program;

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    program.resolution = gl.getUniformLocation(program, 'resolution');
    program.time = gl.getUniformLocation(program, 'time');
  }

  render(now = 0) {
    const gl = this.gl;
    const program = this.program;
    if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    gl.uniform2f(program.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(program.time, now * 1e-3 * SHADER_TIME_SCALE);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

class PointerHandler {
  constructor(element, scale) {
    this.scale = scale;
    this.active = false;
    this.pointers = new Map();
    this.lastCoords = [0, 0];
    this.moves = [0, 0];

    const mapCoords = (el, s, x, y) => [x * s, el.height - y * s];

    element.addEventListener('pointerdown', (e) => {
      this.active = true;
      this.pointers.set(e.pointerId, mapCoords(element, this.scale, e.clientX, e.clientY));
    });

    element.addEventListener('pointerup', (e) => {
      if (this.pointers.size === 1) this.lastCoords = this.first;
      this.pointers.delete(e.pointerId);
      this.active = this.pointers.size > 0;
    });

    element.addEventListener('pointerleave', (e) => {
      if (this.pointers.size === 1) this.lastCoords = this.first;
      this.pointers.delete(e.pointerId);
      this.active = this.pointers.size > 0;
    });

    element.addEventListener('pointermove', (e) => {
      if (!this.active) return;
      this.lastCoords = [e.clientX, e.clientY];
      this.pointers.set(e.pointerId, mapCoords(element, this.scale, e.clientX, e.clientY));
      this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
    });
  }

  updateScale(scale) {
    this.scale = scale;
  }

  get count() {
    return this.pointers.size;
  }

  get move() {
    return this.moves;
  }

  get coords() {
    return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0];
  }

  get first() {
    return this.pointers.values().next().value || this.lastCoords;
  }
}

/**
 * WebGL2 shader fullscreen background for Section 2.
 * @returns {React.RefObject<HTMLCanvasElement>}
 */
export function useShaderBackground() {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const rendererRef = useRef(null);
  const pointersRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

    const resize = () => {
      const d = Math.max(1, 0.5 * window.devicePixelRatio);
      canvas.width = window.innerWidth * d;
      canvas.height = window.innerHeight * d;
      rendererRef.current?.updateScale(d);
    };

    const loop = (now) => {
      const renderer = rendererRef.current;
      const pointers = pointersRef.current;
      if (!renderer || !pointers) return;

      renderer.updateMouse(pointers.first);
      renderer.updatePointerCount(pointers.count);
      renderer.updatePointerCoords(pointers.coords);
      renderer.updateMove(pointers.move);
      renderer.render(now);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    try {
      rendererRef.current = new WebGLRenderer(canvas, dpr);
      pointersRef.current = new PointerHandler(canvas, dpr);
      rendererRef.current.setup();
      rendererRef.current.init();
      resize();

      if (rendererRef.current.test(section2ShaderSource) === null) {
        rendererRef.current.updateShader(section2ShaderSource);
      }

      loop(0);
      window.addEventListener('resize', resize);

      return () => {
        window.removeEventListener('resize', resize);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        rendererRef.current?.reset();
      };
    } catch (err) {
      console.warn('Section 2 shader disabled:', err);
      return undefined;
    }
  }, []);

  return canvasRef;
}

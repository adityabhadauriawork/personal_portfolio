/**
 * Compact GPU fluid solver (stable-fluids / semi-Lagrangian), modelled on
 * PavelDoGreat/WebGL-Fluid-Simulation:
 *   splat (velocity + dye) -> curl -> vorticity confinement -> divergence
 *   -> pressure (Jacobi) -> gradient subtract -> advect velocity -> advect dye
 * All buffers are ping-pong half-float render targets allocated once (and on resize).
 * Raw WebGL2 keeps the overlay to a single tiny context with no scene graph overhead.
 */

export interface FluidOptions {
  simResolution: number;
  dyeResolution: number;
  pressureIterations: number;
  curl: number;
  pressure: number;
  velocityDissipation: number;
  densityDissipation: number;
  splatRadius: number; // fraction of the screen (squared-space radius /100, like Pavel's)
  splatForce: number;
  maxAlpha: number; // caps overlay opacity so text is never obscured
  pixelRatio: number;
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelX: number;
  texelY: number;
}

interface DoubleFBO {
  read: FBO;
  write: FBO;
  swap: () => void;
}

interface Program {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
}

const VERT = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
out vec4 fragColor;
`;

const FRAG = {
  clear: `${HEAD}
uniform sampler2D uTexture; uniform float value;
void main () { fragColor = value * texture(uTexture, vUv); }`,

  splat: `${HEAD}
uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
void main () {
  vec2 p = vUv - point; p.x *= aspectRatio;
  vec3 s = exp(-dot(p, p) / radius) * color;
  fragColor = vec4(texture(uTarget, vUv).xyz + s, 1.0);
}`,

  advection: `${HEAD}
uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  fragColor = texture(uSource, coord) / (1.0 + dissipation * dt);
}`,

  divergence: `${HEAD}
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).x; float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y; float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,

  curl: `${HEAD}
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).y; float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x; float B = texture(uVelocity, vB).x;
  fragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,

  vorticity: `${HEAD}
uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
void main () {
  float L = texture(uCurl, vL).x; float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x; float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C; force.y *= -1.0;
  vec2 v = texture(uVelocity, vUv).xy + force * dt;
  fragColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`,

  pressure: `${HEAD}
uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main () {
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  float d = texture(uDivergence, vUv).x;
  fragColor = vec4((L + R + B + T - d) * 0.25, 0.0, 0.0, 1.0);
}`,

  gradient: `${HEAD}
uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main () {
  float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
  vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  fragColor = vec4(v, 0.0, 1.0);
}`,

  // Dye is stored as colour intensity; display treats it as premultiplied colour with
  // alpha = brightest channel, capped so the overlay stays translucent over text.
  display: `${HEAD}
uniform sampler2D uTexture; uniform float maxAlpha;
void main () {
  vec3 c = max(texture(uTexture, vUv).rgb, 0.0);
  float a = max(c.r, max(c.g, c.b));
  float capped = min(a, maxAlpha);
  vec3 rgb = a > 0.0001 ? c * (capped / a) : vec3(0.0);
  // soft shaping so faint wisps fade out smoothly instead of leaving a haze
  float shape = smoothstep(0.0, 0.035, capped);
  fragColor = vec4(rgb * shape, capped * shape);
}`,
};

export class FluidSim {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private opts: FluidOptions;
  private programs!: Record<keyof typeof FRAG, Program>;
  private vao!: WebGLVertexArrayObject;
  private buffers: WebGLBuffer[] = [];
  private velocity!: DoubleFBO;
  private dye!: DoubleFBO;
  private pressureFBO!: DoubleFBO;
  private divergenceFBO!: FBO;
  private curlFBO!: FBO;
  private formats!: { rgba: number; rg: number; r: number; fmtRG: number; fmtR: number };
  private allTextures: WebGLTexture[] = [];
  private allFBOs: WebGLFramebuffer[] = [];
  private shaders: WebGLShader[] = [];

  private constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, opts: FluidOptions) {
    this.canvas = canvas;
    this.gl = gl;
    this.opts = opts;
  }

  /** Returns null when WebGL2 / renderable half-float textures are unavailable. */
  static create(canvas: HTMLCanvasElement, opts: FluidOptions): FluidSim | null {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return null;
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) {
      return null;
    }
    const sim = new FluidSim(canvas, gl, opts);
    try {
      if (!sim.init()) {
        sim.dispose();
        return null;
      }
    } catch {
      sim.dispose();
      return null;
    }
    return sim;
  }

  private compile(type: number, src: string): WebGLShader {
    const gl = this.gl;
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || 'shader compile failed');
    }
    this.shaders.push(s);
    return s;
  }

  private makeProgram(vs: WebGLShader, fsSrc: string): Program {
    const gl = this.gl;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, this.compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'link failed');
    }
    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  }

  private init(): boolean {
    const gl = this.gl;
    const vs = this.compile(gl.VERTEX_SHADER, VERT);
    const p = {} as Record<keyof typeof FRAG, Program>;
    (Object.keys(FRAG) as (keyof typeof FRAG)[]).forEach((k) => {
      p[k] = this.makeProgram(vs, FRAG[k]);
    });
    this.programs = p;

    // Fullscreen quad
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    const vb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const ib = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.buffers.push(vb, ib);

    // Prefer compact R/RG formats; fall back to RGBA16F if they are not renderable.
    this.formats = { rgba: gl.RGBA16F, rg: gl.RG16F, r: gl.R16F, fmtRG: gl.RG, fmtR: gl.RED };
    if (!this.testRenderable(gl.RG16F, gl.RG)) {
      this.formats.rg = gl.RGBA16F;
      this.formats.fmtRG = gl.RGBA;
      this.formats.r = gl.RGBA16F;
      this.formats.fmtR = gl.RGBA;
    }
    if (!this.testRenderable(gl.RGBA16F, gl.RGBA)) return false;

    this.resize();
    return true;
  }

  private testRenderable(internal: number, format: number): boolean {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fbo);
    gl.deleteTexture(tex);
    return ok;
  }

  private createFBO(w: number, h: number, internal: number, format: number): FBO {
    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.allTextures.push(texture);
    this.allFBOs.push(fbo);
    return { texture, fbo, width: w, height: h, texelX: 1 / w, texelY: 1 / h };
  }

  private createDouble(w: number, h: number, internal: number, format: number): DoubleFBO {
    const d: DoubleFBO = {
      read: this.createFBO(w, h, internal, format),
      write: this.createFBO(w, h, internal, format),
      swap() {
        const t = d.read;
        d.read = d.write;
        d.write = t;
      },
    };
    return d;
  }

  private resolution(res: number) {
    const aspect = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
    const a = aspect < 1 ? 1 / aspect : aspect;
    const min = Math.round(res);
    const max = Math.round(res * a);
    return aspect > 1 ? { w: max, h: min } : { w: min, h: max };
  }

  private freeTargets() {
    const gl = this.gl;
    this.allTextures.forEach((t) => gl.deleteTexture(t));
    this.allFBOs.forEach((f) => gl.deleteFramebuffer(f));
    this.allTextures = [];
    this.allFBOs = [];
  }

  /** (Re)allocates targets for the current canvas size. Called on init and on viewport resize. */
  resize() {
    const gl = this.gl;
    const pr = this.opts.pixelRatio;
    const w = Math.max(1, Math.floor(window.innerWidth * pr));
    const h = Math.max(1, Math.floor(window.innerHeight * pr));
    this.canvas.width = w;
    this.canvas.height = h;
    this.freeTargets();
    const sim = this.resolution(this.opts.simResolution);
    const dye = this.resolution(this.opts.dyeResolution);
    const f = this.formats;
    this.dye = this.createDouble(dye.w, dye.h, f.rgba, gl.RGBA);
    this.velocity = this.createDouble(sim.w, sim.h, f.rg, f.fmtRG);
    this.divergenceFBO = this.createFBO(sim.w, sim.h, f.r, f.fmtR);
    this.curlFBO = this.createFBO(sim.w, sim.h, f.r, f.fmtR);
    this.pressureFBO = this.createDouble(sim.w, sim.h, f.r, f.fmtR);
  }

  private use(p: Program) {
    this.gl.useProgram(p.program);
    return p.uniforms;
  }

  private bindTex(unit: number, fbo: FBO) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
    return unit;
  }

  private blit(target: FBO | null) {
    const gl = this.gl;
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  /**
   * Inject velocity + dye. x,y in [0,1] (y up); dx,dy are the pointer delta in uv units.
   */
  splat(x: number, y: number, dx: number, dy: number, color: [number, number, number], radiusScale = 1) {
    const gl = this.gl;
    const aspect = this.canvas.width / this.canvas.height;
    let radius = (this.opts.splatRadius * radiusScale) / 100;
    if (aspect > 1) radius *= aspect;

    gl.bindVertexArray(this.vao);
    let u = this.use(this.programs.splat);
    gl.uniform1i(u.uTarget, this.bindTex(0, this.velocity.read));
    gl.uniform1f(u.aspectRatio, aspect);
    gl.uniform2f(u.point, x, y);
    gl.uniform3f(u.color, dx * this.opts.splatForce, dy * this.opts.splatForce, 0);
    gl.uniform1f(u.radius, radius);
    gl.uniform2f(u.texelSize, this.velocity.read.texelX, this.velocity.read.texelY);
    this.blit(this.velocity.write);
    this.velocity.swap();

    u = this.use(this.programs.splat);
    gl.uniform1i(u.uTarget, this.bindTex(0, this.dye.read));
    gl.uniform3f(u.color, color[0], color[1], color[2]);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  step(dt: number) {
    const gl = this.gl;
    const o = this.opts;
    gl.disable(gl.BLEND);
    gl.bindVertexArray(this.vao);
    const vt = [this.velocity.read.texelX, this.velocity.read.texelY] as const;

    let u = this.use(this.programs.curl);
    gl.uniform2f(u.texelSize, vt[0], vt[1]);
    gl.uniform1i(u.uVelocity, this.bindTex(0, this.velocity.read));
    this.blit(this.curlFBO);

    if (o.curl > 0) {
      u = this.use(this.programs.vorticity);
      gl.uniform2f(u.texelSize, vt[0], vt[1]);
      gl.uniform1i(u.uVelocity, this.bindTex(0, this.velocity.read));
      gl.uniform1i(u.uCurl, this.bindTex(1, this.curlFBO));
      gl.uniform1f(u.curl, o.curl);
      gl.uniform1f(u.dt, dt);
      this.blit(this.velocity.write);
      this.velocity.swap();
    }

    u = this.use(this.programs.divergence);
    gl.uniform2f(u.texelSize, vt[0], vt[1]);
    gl.uniform1i(u.uVelocity, this.bindTex(0, this.velocity.read));
    this.blit(this.divergenceFBO);

    u = this.use(this.programs.clear);
    gl.uniform1i(u.uTexture, this.bindTex(0, this.pressureFBO.read));
    gl.uniform1f(u.value, o.pressure);
    this.blit(this.pressureFBO.write);
    this.pressureFBO.swap();

    u = this.use(this.programs.pressure);
    gl.uniform2f(u.texelSize, vt[0], vt[1]);
    gl.uniform1i(u.uDivergence, this.bindTex(0, this.divergenceFBO));
    for (let i = 0; i < o.pressureIterations; i++) {
      gl.uniform1i(u.uPressure, this.bindTex(1, this.pressureFBO.read));
      this.blit(this.pressureFBO.write);
      this.pressureFBO.swap();
    }

    u = this.use(this.programs.gradient);
    gl.uniform2f(u.texelSize, vt[0], vt[1]);
    gl.uniform1i(u.uPressure, this.bindTex(0, this.pressureFBO.read));
    gl.uniform1i(u.uVelocity, this.bindTex(1, this.velocity.read));
    this.blit(this.velocity.write);
    this.velocity.swap();

    u = this.use(this.programs.advection);
    gl.uniform2f(u.texelSize, vt[0], vt[1]);
    gl.uniform1i(u.uVelocity, this.bindTex(0, this.velocity.read));
    gl.uniform1i(u.uSource, this.bindTex(0, this.velocity.read));
    gl.uniform1f(u.dt, dt);
    gl.uniform1f(u.dissipation, o.velocityDissipation);
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform1i(u.uVelocity, this.bindTex(0, this.velocity.read));
    gl.uniform1i(u.uSource, this.bindTex(1, this.dye.read));
    gl.uniform1f(u.dissipation, o.densityDissipation);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  render() {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const u = this.use(this.programs.display);
    gl.uniform2f(u.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);
    gl.uniform1i(u.uTexture, this.bindTex(0, this.dye.read));
    gl.uniform1f(u.maxAlpha, this.opts.maxAlpha);
    this.blit(null);
  }

  clearScreen() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  dispose() {
    const gl = this.gl;
    this.freeTargets();
    if (this.programs) Object.values(this.programs).forEach((p) => gl.deleteProgram(p.program));
    this.shaders.forEach((s) => gl.deleteShader(s));
    this.buffers.forEach((b) => gl.deleteBuffer(b));
    if (this.vao) gl.deleteVertexArray(this.vao);
  }
}

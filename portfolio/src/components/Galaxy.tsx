import { Color, Mesh, Program, Renderer, Triangle } from 'ogl';
import { useEffect, useImperativeHandle, useRef } from 'react';
import type { HTMLAttributes, Ref } from 'react';
import './Galaxy.css';

const vertexShader = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uScrollDepth;
uniform vec2 uScrollVelocity;
uniform float uCenterRepulsion;
uniform float uRadialStretch;
uniform float uDeepZoom;
uniform float uRepulsionSuppressed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform bool uTransparent;
uniform float uLightMode;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * base;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uRepulsionSuppressed < 0.5 && uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  vec2 radialDirection = normalize(uv + vec2(0.0001));
  uv += radialDirection * uCenterRepulsion * 0.08 * (1.0 - uDeepZoom) * (1.0 - uRepulsionSuppressed);
  float vortexAngle = uScrollVelocity.y * 0.12;
  mat2 vortexRotation = mat2(cos(vortexAngle), -sin(vortexAngle), sin(vortexAngle), cos(vortexAngle));
  uv = vortexRotation * uv;
  uv *= 1.0 + uRadialStretch * smoothstep(0.0, 0.9, length(uv));
  uv *= 1.0 + uDeepZoom * 2.8;

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uScrollDepth * 0.35);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    scale *= 1.0 + uRadialStretch * 0.8 * (1.0 - depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
    vec3 ink = clamp(col * 0.48, 0.0, 0.82);
    gl_FragColor = vec4(mix(vec3(1.0), ink, coverage), 1.0);
  } else if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

export type GalaxyProps = {
  ref?: Ref<GalaxyHandle>;
  focal?: [number, number];
  rotation?: [number, number];
  starSpeed?: number;
  density?: number;
  hueShift?: number;
  disableAnimation?: boolean;
  speed?: number;
  mouseInteraction?: boolean;
  glowIntensity?: number;
  saturation?: number;
  mouseRepulsion?: boolean;
  repulsionStrength?: number;
  twinkleIntensity?: number;
  rotationSpeed?: number;
  transparent?: boolean;
  lightMode?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export type GalaxyHandle = {
  setScrollDepth: (value: number) => void;
  setScrollVelocity: (x: number, y: number) => void;
  setDeepZoom: (enabled: boolean) => void;
  setRepulsionSuppressed: (suppressed: boolean) => void;
  setFastTrack: (enabled: boolean) => void;
};

export function Galaxy({
  ref,
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.5,
  density = 1,
  hueShift = 140,
  disableAnimation = false,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.3,
  saturation = 0.0,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  transparent = true,
  lightMode = false,
  ...rest
}: GalaxyProps) {
  const ctnDom = useRef<HTMLDivElement | null>(null);
  const targetMousePos = useRef({ x: 0.5, y: 0.5 });
  const smoothMousePos = useRef({ x: 0.5, y: 0.5 });
  const targetMouseActive = useRef(0.0);
  const smoothMouseActive = useRef(0.0);
  const scrollDepth = useRef(0);
  const smoothScrollDepth = useRef(0);
  const depthVel = useRef(0);
  const scrollVelocity = useRef({ x: 0, y: 0 });
  const smoothScrollVelocity = useRef({ x: 0, y: 0 });
  const velDotX = useRef(0);
  const velDotY = useRef(0);
  const deepZoomTarget = useRef(0);
  const smoothDeepZoom = useRef(0);
  const repulsionSuppressed = useRef(0);
  const smoothRepulsionSuppressed = useRef(0);
  const fastTrack = useRef(0);
  const previousTime = useRef(0);
  const animationTime = useRef(0);
  const lastMoveMs = useRef(0);
  const mouseIdleMs = 350;

  useImperativeHandle(ref, () => ({
    setScrollDepth: (value: number) => {
      scrollDepth.current = Math.max(-40, Math.min(40, value));
    },
    setScrollVelocity: (x: number, y: number) => {
      scrollVelocity.current.x = Math.max(-1, Math.min(1, x));
      scrollVelocity.current.y = Math.max(-1, Math.min(1, y));
    },
    setDeepZoom: (enabled: boolean) => {
      deepZoomTarget.current = enabled ? 1 : 0;
    },
    setRepulsionSuppressed: (suppressed: boolean) => {
      repulsionSuppressed.current = suppressed ? 1 : 0;
      if (suppressed) {
        scrollVelocity.current.y = 0;
      }
    },
    setFastTrack: (enabled: boolean) => {
      fastTrack.current = enabled ? 1 : 0;
    },
  }));

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    const renderer = new Renderer({
      alpha: transparent,
      premultipliedAlpha: false
    });
    const gl = renderer.gl;

    if (lightMode) {
      gl.clearColor(1, 1, 1, 1);
    } else if (transparent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(0, 0, 0, 1);
    }

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uFocal: { value: new Float32Array(focal) },
        uRotation: { value: new Float32Array(rotation) },
        uStarSpeed: { value: starSpeed },
        uScrollDepth: { value: 0 },
        uScrollVelocity: { value: new Float32Array([0, 0]) },
        uCenterRepulsion: { value: 0 },
        uRadialStretch: { value: 0 },
        uDeepZoom: { value: 0 },
        uRepulsionSuppressed: { value: 0 },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uMouse: {
          value: new Float32Array([smoothMousePos.current.x, smoothMousePos.current.y])
        },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uMouseRepulsion: { value: mouseRepulsion },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRepulsionStrength: { value: repulsionStrength },
        uMouseActiveFactor: { value: 0.0 },
        uTransparent: { value: transparent },
        uLightMode: { value: lightMode ? 1 : 0 }
      }
    });

    function resize() {
      const scale = 1;
      renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
      program.uniforms.uResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height
      );
    }
    window.addEventListener('resize', resize, false);
    resize();

    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });
    let animateId: number;
    ctn.appendChild(gl.canvas);
    resize();
    previousTime.current = performance.now();

    function update(t: number) {
      animateId = requestAnimationFrame(update);
      const frameDelta = Math.min(0.1, Math.max(0, (t - previousTime.current) * 0.001));
      previousTime.current = t;
      if (!disableAnimation) {
        animationTime.current += frameDelta;
        program.uniforms.uTime.value = animationTime.current;
        program.uniforms.uStarSpeed.value = (animationTime.current * starSpeed) / 10.0;
      }

      const gStiff = fastTrack.current > 0 ? 400 : 64;
      const gDamp = fastTrack.current > 0 ? 40 : 16;
      depthVel.current +=
        (scrollDepth.current - smoothScrollDepth.current) * gStiff * frameDelta;
      depthVel.current *= Math.exp(-gDamp * frameDelta);
      smoothScrollDepth.current += depthVel.current * frameDelta;
      velDotX.current +=
        (scrollVelocity.current.x - smoothScrollVelocity.current.x) * gStiff * frameDelta;
      velDotX.current *= Math.exp(-gDamp * frameDelta);
      smoothScrollVelocity.current.x += velDotX.current * frameDelta;
      velDotY.current +=
        (scrollVelocity.current.y - smoothScrollVelocity.current.y) * gStiff * frameDelta;
      velDotY.current *= Math.exp(-gDamp * frameDelta);
      smoothScrollVelocity.current.y += velDotY.current * frameDelta;
      smoothDeepZoom.current +=
        (deepZoomTarget.current - smoothDeepZoom.current) * 0.08;
      smoothRepulsionSuppressed.current +=
        (repulsionSuppressed.current - smoothRepulsionSuppressed.current) * 0.18;
      program.uniforms.uScrollDepth.value = smoothScrollDepth.current;
      program.uniforms.uScrollVelocity.value[0] = smoothScrollVelocity.current.x;
      program.uniforms.uScrollVelocity.value[1] = smoothScrollVelocity.current.y;
    const velocityMagnitude = Math.abs(smoothScrollVelocity.current.y);
program.uniforms.uCenterRepulsion.value = 0;
program.uniforms.uRadialStretch.value = velocityMagnitude * 3.5;
      program.uniforms.uDeepZoom.value = smoothDeepZoom.current;
      program.uniforms.uRepulsionSuppressed.value = smoothRepulsionSuppressed.current;

      if (performance.now() - lastMoveMs.current > mouseIdleMs) {
        targetMouseActive.current = 0.0;
      }

      const lerpFactor = 0.05;
      smoothMousePos.current.x += (targetMousePos.current.x - smoothMousePos.current.x) * lerpFactor;
      smoothMousePos.current.y += (targetMousePos.current.y - smoothMousePos.current.y) * lerpFactor;

      smoothMouseActive.current += (targetMouseActive.current - smoothMouseActive.current) * lerpFactor;

      program.uniforms.uMouse.value[0] = smoothMousePos.current.x;
      program.uniforms.uMouse.value[1] = smoothMousePos.current.y;
      program.uniforms.uMouseActiveFactor.value = smoothMouseActive.current;

      renderer.render({ scene: mesh });
    }
    animateId = requestAnimationFrame(update);

    function handleMouseMove(e: MouseEvent) {
      const rect = ctn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMousePos.current = { x, y };
      targetMouseActive.current = 1.0;
      lastMoveMs.current = performance.now();
    }

    function handleMouseLeave() {
      targetMouseActive.current = 0.0;
    }

    if (mouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('resize', resize);
      if (mouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    focal,
    rotation,
    starSpeed,
    density,
    hueShift,
    disableAnimation,
    speed,
    mouseInteraction,
    glowIntensity,
    saturation,
    mouseRepulsion,
    twinkleIntensity,
    rotationSpeed,
    repulsionStrength,
    transparent,
    lightMode
  ]);

  return <div ref={ctnDom} className="galaxy-container" {...rest} />;
}

export default Galaxy;
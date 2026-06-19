'use client'

import { useEffect, useRef } from 'react'

const vertexShaderSource = `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`

// Patterns encodés en float pour éviter les tableaux d'entiers (meilleure compatibilité GPU)
// et le bit-shifting qui peut être lent sur certains drivers mobiles.
// On utilise une lookup texture 8x9 bits aplatie en 3 vec3 (27 composantes pour 8 patterns x 9 bits)
const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_dpr;
uniform vec3  u_bgColor;
uniform vec3  u_pixelColor;
uniform float u_squareSize;

out vec4 outColor;

// Hash rapide 2D → [0,1)
float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
}

// Décoded un bit d'un pattern (0-7) à l'index bit (0-8)
// Stockés comme constantes float pour éviter les tableaux int et le bit-shift
// 341=101010101, 292=100100100, 448=111000000, 170=010101010,
// 256=100000000, 273=100010001, 84=001010100, 186=010111010
float getPatternBit(int patIdx, int bitIdx) {
    // 8 patterns × 9 bits — décodage via fract sur constantes
    const float patterns[72] = float[72](
        1.,0.,1., 0.,1.,0., 1.,0.,1.,   // 341
        1.,0.,0., 1.,0.,0., 1.,0.,0.,   // 292
        1.,1.,1., 0.,0.,0., 0.,0.,0.,   // 448
        0.,1.,0., 1.,0.,1., 0.,1.,0.,   // 170
        1.,0.,0., 0.,0.,0., 0.,0.,0.,   // 256
        1.,0.,0., 0.,1.,0., 0.,0.,1.,   // 273
        0.,0.,1., 0.,1.,0., 1.,0.,0.,   // 84
        0.,1.,0., 1.,1.,1., 0.,1.,0.    // 186
    );
    return patterns[patIdx * 9 + bitIdx];
}

void main() {
    float SQUARE_SIZE = u_squareSize;

    // Coordonnées CSS (top-left origin)
    vec2 coord = vec2(gl_FragCoord.x / u_dpr,
                      u_resolution.y - gl_FragCoord.y / u_dpr);

    vec2 cell      = floor(coord / SQUARE_SIZE);
    vec2 local     = fract(coord / SQUARE_SIZE);
    vec2 localSub  = floor(local * 3.0); // sous-pixel 3×3

    float h = hash(cell);

    // Intervalle de changement de pattern (5s – 60s)
    float interval   = 5.0 + h * 55.0;
    float changeTime = floor(u_time / interval);

    // Pattern courant
    float patternRand = hash(cell + changeTime);
    int   patternIdx  = int(floor(patternRand * 8.0));

    int bitIndex = int(localSub.y) * 3 + int(localSub.x);
    float isOn   = getPatternBit(patternIdx, bitIndex);

    if (isOn < 0.5) {
        outColor = vec4(u_bgColor, 1.0);
        return;
    }

    // Oscillation autour de u_pixelColor
    float phase = h * 6.28318 + u_time * ((0.005 + h * 0.02) * 60.0);
    float osc   = (sin(phase) + 1.0) * 0.5;
    vec3 color  = mix(u_pixelColor, u_bgColor, osc * 0.45);

    outColor = vec4(color, 1.0);
}
`

// Convertit un hex (#rrggbb ou #rgb) en composantes [0,1]
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h
  const n = parseInt(full, 16)
  return [
    ((n >> 16) & 255) / 255,
    ((n >> 8)  & 255) / 255,
    ( n        & 255) / 255,
  ]
}

// Calcule une couleur de pixel contrastée par rapport au fond
// On assombrit les fonds clairs, on éclaircit les fonds sombres
function derivePixelColor(bg, shift) {
  const luminance = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2]
  const s = luminance > 0.5 ? -shift : shift
  return bg.map(c => Math.max(0, Math.min(1, c + s)))
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl, vs, fs) {
  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    return null
  }
  return program
}

export default function AnimatedBackground({ bgColor = '#ffffff', squareSize = 30, shift = 0.02 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const bg = hexToRgb(bgColor)
    const px = derivePixelColor(bg, shift)

    // powerPreference: laisse le driver choisir le GPU discret si dispo,
    // desynchronized: réduit la latence d'affichage sur les navigateurs supportés
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      powerPreference: 'default',
      desynchronized: true,
    })

    if (!gl) {
      console.error('WebGL2 non supporté.')
      return
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    const program = createProgram(gl, vs, fs)

    // Quad plein écran
    const posLoc = gl.getAttribLocation(program, 'a_position')
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)

    const resLoc      = gl.getUniformLocation(program, 'u_resolution')
    const timeLoc     = gl.getUniformLocation(program, 'u_time')
    const dprLoc      = gl.getUniformLocation(program, 'u_dpr')
    const bgColorLoc    = gl.getUniformLocation(program, 'u_bgColor')
    const pxColorLoc    = gl.getUniformLocation(program, 'u_pixelColor')
    const squareSizeLoc = gl.getUniformLocation(program, 'u_squareSize')

    // Dimensions mises en cache — mises à jour seulement au resize
    let cssW = window.innerWidth
    let cssH = window.innerHeight
    let dpr  = Math.min(window.devicePixelRatio || 1, 2) // cap DPR à 2 pour économiser des fragments

    function resize() {
      dpr  = Math.min(window.devicePixelRatio || 1, 2)
      cssW = window.innerWidth
      cssH = window.innerHeight
      canvas.width  = cssW * dpr
      canvas.height = cssH * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    let rafId
    const startTime = performance.now()

    function animate() {
      const t = (performance.now() - startTime) / 1000.0

      gl.clearColor(bg[0], bg[1], bg[2], 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)
      gl.bindVertexArray(vao)

      gl.uniform2f(resLoc, cssW, cssH)
      gl.uniform1f(timeLoc, t)
      gl.uniform1f(dprLoc, dpr)
      gl.uniform3f(bgColorLoc, bg[0], bg[1], bg[2])
      gl.uniform3f(pxColorLoc, px[0], px[1], px[2])
      gl.uniform1f(squareSizeLoc, squareSize)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      rafId = requestAnimationFrame(animate)
    }

    // ResizeObserver > window resize : déclenché uniquement si le canvas change vraiment
    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas)
    resize()
    animate()

    return () => {
      ro.disconnect()
      cancelAnimationFrame(rafId)
      // Nettoyage complet des ressources GPU
      gl.deleteVertexArray(vao)
      gl.deleteBuffer(buf)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteProgram(program)
    }
  }, [bgColor, squareSize])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen -z-10 pointer-events-none mask-[linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
    />
  )
}
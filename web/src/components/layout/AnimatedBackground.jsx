'use client'

import { useEffect, useRef } from 'react'

const vertexShaderSource = `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dpr;

out vec4 outColor;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    float SQUARE_SIZE = 30.0;
    
    vec2 coord = vec2(gl_FragCoord.x / u_dpr, u_resolution.y - (gl_FragCoord.y / u_dpr));
    
    vec2 cell = floor(coord / SQUARE_SIZE);
    vec2 local = fract(coord / SQUARE_SIZE);
    vec2 localPixel = floor(local * 3.0); // Coordonnées du sous-pixel 3x3 : 0, 1 ou 2
    
    float h = hash(cell);
    
    float interval = 5.0 + h * 55.0; 
    float changeTime = floor(u_time / interval);
    
    float patternRandom = hash(cell + vec2(changeTime, changeTime));
    int patternIndex = int(floor(patternRandom * 8.0));
    
    int patterns[8] = int[8](341, 292, 448, 170, 256, 273, 84, 186);
    int pat = patterns[patternIndex];
    
    int bitIndex = int(localPixel.y) * 3 + int(localPixel.x);
    bool isOn = ((pat >> (8 - bitIndex)) & 1) == 1;
    
    if (!isOn) {
        outColor = vec4(0.0);
        return;
    }
    
    float speed = 0.005 + h * 0.02; 
    float phase = h * 6.28318 + u_time * (speed * 60.0);
    float randomOscillation = (sin(phase) + 1.0) / 2.0;
    
    float baseLightness = 0.90 + (randomOscillation * 0.05);
    
    outColor = vec4(vec3(baseLightness), 1.0); // Nuance de gris
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Erreur de compilation du shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Erreur de linkage du programme:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        console.error("WebGL2 n'est pas supporté par votre navigateur.");
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    const positions = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const dprLoc = gl.getUniformLocation(program, "u_dpr");

    let animationFrameId;
    let startTime = performance.now();

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function animate() {
        const dpr = window.devicePixelRatio || 1;
        
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        const currentTime = (performance.now() - startTime) / 1000.0;

        gl.uniform2f(resolutionLoc, window.innerWidth, window.innerHeight);
        gl.uniform1f(timeLoc, currentTime);
        gl.uniform1f(dprLoc, dpr);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen -z-10 pointer-events-none mask-[linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
    />
  );
}
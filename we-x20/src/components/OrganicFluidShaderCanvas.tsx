import React, { useEffect, useRef } from 'react';

interface OrganicFluidShaderCanvasProps {
  className?: string;
  opacity?: number;
}

export const OrganicFluidShaderCanvas: React.FC<OrganicFluidShaderCanvasProps> = ({
  className = 'fixed inset-0 w-full h-full pointer-events-none z-[-1]',
  opacity = 0.25,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let lastFrameTime = 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);

    function syncSize() {
      if (!canvas) return;
      const w = Math.round((canvas.clientWidth || window.innerWidth || 1280) * pixelRatio);
      const h = Math.round((canvas.clientHeight || window.innerHeight || 720) * pixelRatio);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    syncSize();

    const gl = canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_isDark;
      varying vec2 v_texCoord;

      void main() {
        vec2 uv = v_texCoord;
        float time = u_time * 0.18;

        // Mouse influence
        vec2 m = u_mouse / u_resolution;
        float distToMouse = length(uv - m);
        float mouseWave = sin(distToMouse * 8.0 - time * 2.0) * 0.05 * smoothstep(0.8, 0.0, distToMouse);

        // Multi-sine organic fluid motion
        float noise = sin(uv.x * 2.5 + time + mouseWave) * 0.5 + 0.5;
        noise += sin(uv.y * 3.8 - time * 1.1) * 0.3;
        noise += sin((uv.x + uv.y) * 3.2 + time * 0.7) * 0.2;

        // Rich Aesthetic Dark Mode: Deep Midnight Navy into Aurora Emerald & Indigo rays
        vec3 colorA = u_isDark > 0.5 ? vec3(0.025, 0.04, 0.075) : vec3(0.12, 0.11, 0.10);
        vec3 colorB = u_isDark > 0.5 ? vec3(0.06, 0.10, 0.20) : vec3(0.96, 0.94, 0.91);
        vec3 accent1 = u_isDark > 0.5 ? vec3(0.05, 0.52, 0.40) : vec3(0.02, 0.58, 0.41); // Emerald hint
        vec3 accent2 = u_isDark > 0.5 ? vec3(0.35, 0.22, 0.65) : vec3(0.92, 0.88, 0.82); // Violet ray

        vec3 finalColor = mix(colorA, colorB, noise * 0.5 + 0.2);
        finalColor = mix(finalColor, accent1, smoothstep(0.7, 1.0, noise) * (u_isDark > 0.5 ? 0.35 : 0.15));
        finalColor = mix(finalColor, accent2, smoothstep(0.75, 1.0, 1.0 - noise) * (u_isDark > 0.5 ? 0.25 : 0.05));

        // Subtle organic film grain texture
        float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
        finalColor += (grain - 0.5) * 0.02;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function createShader(glContext: WebGLRenderingContext, type: number, source: string) {
      const shader = glContext.createShader(type);
      if (!shader) return null;
      glContext.shaderSource(shader, source);
      glContext.compileShader(shader);
      if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        glContext.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uIsDark = gl.getUniformLocation(prog, 'u_isDark');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        mouse.x = event.clientX - rect.left;
        mouse.y = rect.height - (event.clientY - rect.top);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resizeObserver = new ResizeObserver(() => {
      syncSize();
    });
    resizeObserver.observe(canvas);

    function render(t: number) {
      if (!gl || !canvas) return;
      if (document.hidden || (t - lastFrameTime < 33 && !prefersReducedMotion)) {
        if (!prefersReducedMotion) animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = t;
      gl.viewport(0, 0, canvas.width, canvas.height);

      const isDark = document.documentElement.classList.contains('dark') ? 1.0 : 0.0;

      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (uIsDark) gl.uniform1f(uIsDark, isDark);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!prefersReducedMotion) animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      if (prog) gl.deleteProgram(prog);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      if (buf) gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div
      className={className}
      style={{ opacity, transition: 'opacity 0.5s ease' }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};

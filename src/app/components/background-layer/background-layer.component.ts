import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from '@angular/core';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 vUv;
  void main() {
    vUv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform float uTime;
  varying vec2 vUv;

  float blob(vec2 uv, vec2 center, float radius) {
    float d = length(uv - center);
    return exp(-d * d / (radius * radius));
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.15;

    vec3 color = vec3(0.973, 0.961, 0.980);

    vec2 c1 = vec2(0.20 + sin(t * 1.10) * 0.13, 0.28 + cos(t * 0.85) * 0.14);
    vec2 c2 = vec2(0.80 + cos(t * 0.75) * 0.11, 0.22 + sin(t * 1.15) * 0.13);
    vec2 c3 = vec2(0.50 + sin(t * 0.65) * 0.14, 0.72 + cos(t * 0.95) * 0.11);
    vec2 c4 = vec2(0.28 + cos(t * 1.25) * 0.10, 0.60 + sin(t * 0.60) * 0.12);
    vec2 c5 = vec2(0.70 + sin(t * 0.90) * 0.12, 0.55 + cos(t * 1.05) * 0.10);
    vec2 c6 = vec2(0.55 + cos(t * 0.70) * 0.11, 0.15 + sin(t * 1.20) * 0.09);

    color = mix(color, vec3(1.000, 0.800, 0.800), blob(uv, c1, 0.32) * 0.48);
    color = mix(color, vec3(0.820, 0.725, 0.960), blob(uv, c2, 0.28) * 0.40);
    color = mix(color, vec3(0.698, 0.882, 0.922), blob(uv, c3, 0.30) * 0.36);
    color = mix(color, vec3(1.000, 0.870, 0.745), blob(uv, c4, 0.26) * 0.34);
    color = mix(color, vec3(0.725, 0.933, 0.875), blob(uv, c5, 0.28) * 0.34);
    color = mix(color, vec3(0.725, 0.800, 0.980), blob(uv, c6, 0.24) * 0.32);

    float iriR = sin(uv.x * 4.5 + uv.y * 2.5 + t * 1.00) * 0.5 + 0.5;
    float iriG = sin(uv.x * 3.0 - uv.y * 4.0 + t * 0.85 + 2.094) * 0.5 + 0.5;
    float iriB = sin(uv.x * 3.5 + uv.y * 3.5 + t * 0.70 + 4.189) * 0.5 + 0.5;
    float mask = sin(uv.x * 6.0 + uv.y * 4.0 + t * 0.5) * 0.5 + 0.5;
    color = mix(color, vec3(iriR, iriG, iriB), 0.055 * mask);

    gl_FragColor = vec4(color, 1.0);
  }
`;

@Component({
  selector: 'app-background-layer',
  standalone: true,
  imports: [],
  templateUrl: './background-layer.component.html',
  styleUrl: './background-layer.component.scss',
})
export class BackgroundLayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private gl!: WebGLRenderingContext;
  private program!: WebGLProgram;
  private uTimeLocation!: WebGLUniformLocation | null;
  private startTime!: number;
  private frameId!: number;
  private onResize!: () => void;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.init());
  }

  private init(): void {
    const canvas = this.canvasRef.nativeElement;
    const gl = canvas.getContext('webgl')!;
    this.gl = gl;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    this.onResize = resize;
    window.addEventListener('resize', this.onResize);

    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
    this.program = program;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this.uTimeLocation = gl.getUniformLocation(program, 'uTime');
    this.startTime = performance.now();

    this.loop();
  }

  private compileShader(type: number, src: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);
    return shader;
  }

  private loop(): void {
    this.frameId = requestAnimationFrame(() => this.loop());
    const t = (performance.now() - this.startTime) / 1000;
    this.gl.uniform1f(this.uTimeLocation, t);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    if (this.program) this.gl.deleteProgram(this.program);
  }
}

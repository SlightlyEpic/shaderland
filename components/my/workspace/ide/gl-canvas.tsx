import React, { useCallback, useEffect, useRef, useState } from 'react';

type GLCanvasProps = {
    vertShaderSource?: string,
    fragShaderSource?: string,
    refresh: boolean,
    timeUniform: boolean,
    mouseUniform: boolean,
};

export function GLCanvas(props: GLCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const glContextRef = useRef<WebGLRenderingContext | null>(null);
    const animationFrameRef = useRef<number>();
    const startTimeRef = useRef<number>(Date.now());
    // const [mousePos, setMousePos] = useState<[number, number]>([0, 0]);
    const mousePos = useRef<[number, number]>([0, 0]);
    const programRef = useRef<WebGLProgram | null>(null);
    const uniformLocationsRef = useRef<{
        time?: WebGLUniformLocation | null;
        mouse?: WebGLUniformLocation | null;
        resolution?: WebGLUniformLocation | null;
    }>({});

    // Initialize WebGL context
    useEffect(() => {
        if (!canvasRef.current) return;
        if (!props.vertShaderSource) return;
        if (!props.fragShaderSource) return;

        const gl = canvasRef.current.getContext('webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }
        glContextRef.current = gl;

        // Create shader program
        const program = createShaderProgram(gl, props.vertShaderSource, props.fragShaderSource);
        if (!program) return;
        
        programRef.current = program;
        gl.useProgram(program);

        // Get uniform locations
        uniformLocationsRef.current = {
            time: gl.getUniformLocation(program, 'u_time'),
            mouse: gl.getUniformLocation(program, 'u_mouse'),
            resolution: gl.getUniformLocation(program, 'u_resolution')
        };

        // Create a simple quad that fills the canvas
        const positions = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0,
        ]);

        // Create and bind position buffer
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        // Get position attribute location and enable it
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        // Start animation loop
        startTimeRef.current = Date.now();
        animate();

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (gl) {
                gl.deleteProgram(program);
                gl.deleteBuffer(positionBuffer);
            }
        };
    }, [props.refresh]);

    // Handle mouse move
    useEffect(() => {
        function handleMouseMove(event: MouseEvent) {
            if (!canvasRef.current) return;
            
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = 1.0 - (event.clientY - rect.top) / rect.height;
            // setMousePos([x, y]);
            mousePos.current = [x, y];
        }

        if (canvasRef.current) {
            canvasRef.current.addEventListener('mousemove', handleMouseMove);
            return () => {
                canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, []);


    // Animation loop
    const animate = useCallback(() => {
        if (!glContextRef.current || !programRef.current) return;

        const gl = glContextRef.current;
        const uniforms = uniformLocationsRef.current;
        
        if (uniforms.time && props.timeUniform) {
            const currentTime = (Date.now() - startTimeRef.current) / 1000.0;
            gl.uniform1f(uniforms.time, currentTime);
        }

        if (uniforms.mouse && props.mouseUniform) {
            gl.uniform2f(uniforms.mouse, mousePos.current[0], mousePos.current[1]);
        }

        if (uniforms.resolution) {
            gl.uniform2f(uniforms.resolution, gl.canvas.width, gl.canvas.height);
        }

        render(gl);
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [props.mouseUniform, props.timeUniform])

    // Shader creation functions remain the same...
    function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
        const shader = gl.createShader(type);
        if (!shader) {
            console.error('Failed to create shader');
            return null;
        }

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    function createShaderProgram(
        gl: WebGLRenderingContext,
        vertSource: string,
        fragSource: string
    ): WebGLProgram | null {
        const vertShader = createShader(gl, gl.VERTEX_SHADER, vertSource);
        const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragSource);

        if (!vertShader || !fragShader) return null;

        const program = gl.createProgram();
        if (!program) {
            console.error('Failed to create program');
            return null;
        }

        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            gl.deleteShader(vertShader);
            gl.deleteShader(fragShader);
            return null;
        }

        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);

        return program;
    }

    function render(gl: WebGLRenderingContext) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Size observer setup
    useEffect(() => {
        if (!containerRef.current || !canvasRef.current || !glContextRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === containerRef.current) {
                    const canvas = canvasRef.current;
                    const gl = glContextRef.current;
                    if (!canvas || !gl) return;

                    const dpr = window.devicePixelRatio || 1;
                    const width = entry.contentRect.width;
                    const height = entry.contentRect.height;
                    const displayWidth = Math.floor(width * dpr);
                    const displayHeight = Math.floor(height * dpr);

                    canvas.style.width = `${width}px`;
                    canvas.style.height = `${height}px`;
                    canvas.width = displayWidth;
                    canvas.height = displayHeight;

                    if (uniformLocationsRef.current.resolution) {
                        gl.uniform2f(uniformLocationsRef.current.resolution, displayWidth, displayHeight);
                    }

                    render(gl);
                }
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <canvas 
                ref={canvasRef}
                className="absolute top-0 left-0"
            />
        </div>
    );
}
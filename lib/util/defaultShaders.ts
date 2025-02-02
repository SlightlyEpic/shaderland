export const defaultVertexShaderSource = `
    attribute vec2 a_position;
    
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

export const defaultFragmentShaderSource = `
    precision mediump float;

    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;

    void main() {
        // Normalize pixel coordinates
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        
        // Create a moving ripple effect from mouse position
        float d = distance(uv, u_mouse);
        float ripple = sin(d * 20.0 - u_time * 5.0) * 0.5 + 0.5;
        
        // Create a color gradient based on position
        vec3 color = vec3(0.0);
        color.r = uv.x;
        color.g = uv.y;
        color.b = abs(sin(u_time * 0.5));
        
        // Mix the ripple effect with the color gradient
        vec3 finalColor = mix(color, vec3(1.0), ripple * 0.5);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

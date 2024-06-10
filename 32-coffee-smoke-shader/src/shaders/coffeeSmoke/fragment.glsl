uniform sampler2D uPerlinTexture;
uniform float uTime;
uniform float uSpeed;
uniform vec3 uSmokeColor;
uniform float uSmokeThickness;
uniform float uXEges;
uniform float uYEges;

varying vec2 vUv;

void main() 
{
    // 1. Scale and animate
    vec2 smokeUv = vUv;
    smokeUv.x *= 0.5;
    smokeUv.y *= 0.3;
    smokeUv.y -= uTime * uSpeed;
    
    // 2. Smoke
    float smoke = texture2D(uPerlinTexture, smokeUv).r;
    
    // 3. Remap
    smoke = smoothstep(uSmokeThickness, 1.0, smoke);

    // 4. Edges
    smoke *= smoothstep(0.0, (0.1 + uXEges), vUv.x);
    smoke *= smoothstep(1.0, (0.9 - uXEges), vUv.x);
    smoke *= smoothstep(0.0, 0.1, vUv.y);
    smoke *= smoothstep(1.0, (0.9 - uYEges), vUv.y);

    gl_FragColor = vec4(uSmokeColor, smoke);


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
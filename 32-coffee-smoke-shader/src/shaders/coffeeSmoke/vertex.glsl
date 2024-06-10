uniform float uTime;
uniform bool uWind;
uniform sampler2D uPerlinTexture;
uniform float uSmokeRotationFrequency;
uniform float uWindFrequency;
uniform float uTwistAmplitude;

varying vec2 vUv;

#include ../include/rotate2D.glsl;

vec2 applyWind() {

    vec2 windOffset = vec2(
        texture2D(uPerlinTexture, vec2(0.25, uTime * uWindFrequency)).r - 0.5,
        texture2D(uPerlinTexture, vec2(0.75, uTime * uWindFrequency)).r - 0.5
    );
    windOffset *= pow(uv.y, 3.0) * 10.0;

    return windOffset;
}

void main() {

    vec3 newPosition = position;

    // Twist
    float twistPerlin = texture2D(uPerlinTexture, vec2(0.5, uv.y * uTwistAmplitude)).r;
    float angle = (twistPerlin + (-uTime * uSmokeRotationFrequency)) * 10.0 ;
    newPosition.xz = rotate2D(newPosition.xz, angle);

    // Wind
    if ( uWind )
    {
        newPosition.xz += applyWind();
    }
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
}
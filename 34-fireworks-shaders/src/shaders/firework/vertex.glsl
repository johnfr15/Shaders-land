uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

// Exploding uniforms
uniform float uRemapOriginMin;
uniform float uRemapOriginMax;
uniform float uRemapDestinationMin;
uniform float uRemapDestinationMax;
uniform float uClampMin;
uniform float uClampMax;
uniform float uRadiusMultiplier;

uniform float uFallingMultiplier;
uniform float uScaleMultiplier;


attribute float aSize; 
attribute float aTimeMultipliers; 

#include ../include/remap.glsl;

// Animation of particles explosion
// This will define how far particles will explodes
float explodingAnimation(float progress) {
    float explodingProgress = remap(progress, uRemapOriginMin, uRemapOriginMax, uClampMin, uClampMax);
    explodingProgress = clamp(explodingProgress, uClampMin, uClampMax);
    explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0);

    return explodingProgress * uRadiusMultiplier;
}

float fallingAnimation(float progress) {
    float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
    fallingProgress = clamp(fallingProgress, 0.0, 1.0);
    fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
    
    return fallingProgress * 0.2 * uFallingMultiplier;
}

float scaleAnimation(float progress) {
    float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0 );
    float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0 );

    return min(sizeOpeningProgress, sizeClosingProgress) * uScaleMultiplier;
}

float twinkleAnimation(float progress) {
    float twinkleProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
    twinkleProgress = clamp(twinkleProgress, 0.0, 1.0);
    float sizeTwinkle = sin(30.0 * progress) * 0.5 + 0.5;

    return 1.0 - sizeTwinkle * twinkleProgress;
}



void main() {
    float progress = uProgress * aTimeMultipliers;
    vec3 newPosition = position;

    // 1. Explosion animation
    newPosition *= explodingAnimation(progress);
    // 2. Falling particles animation
    newPosition.y -= fallingAnimation(progress);
    // 3. Scaling animation
    float scaleProgress = scaleAnimation(progress);
    // 4. Twinkle animation
    float twinkleProgress = twinkleAnimation(progress);

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    // Final Size
    gl_PointSize = uSize * aSize * uResolution.y * scaleProgress * twinkleProgress;
    gl_PointSize *= 1.0 / -viewPosition.z;

    // Get it out of sight
    if (gl_PointSize < 1.0)
        gl_Position = vec4(9999.9);
}
uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform float uProgress;

// Exploding uniforms
uniform float uSmoothProgressMin;
uniform float uSmoothProgressMax;

// Falling uniforms
uniform float uFallRemapOriginMin;
uniform float uFallRemapOriginMax;
uniform float uFallRemapDestinationMin;
uniform float uFallRemapDestinationMax;
uniform float uFallClampMin;
uniform float uFallClampMax;
uniform float uFallingMultiplier;

// Scaling uniforms
uniform float uOpeningRemapOriginMin;
uniform float uOpeningRemapOriginMax;
uniform float uOpeningRemapDestinationMin;
uniform float uOpeningRemapDestinationMax;
uniform float uClosingRemapOriginMin;
uniform float uClosingRemapOriginMax;
uniform float uClosingRemapDestinationMin;
uniform float uClosingRemapDestinationMax;
uniform float uScaleMultiplier;

// Twinkles uniforms
uniform float uTwinkleRemapOriginMin;
uniform float uTwinkleRemapOriginMax;
uniform float uTwinkleRemapDestinationMin;
uniform float uTwinkleRemapDestinationMax;
uniform float uTwinkleClampMin;
uniform float uTwinkleClampMax;
uniform float uTwinkleFrequency;

attribute float aTimeMultipliers; 
attribute vec3 aTargetPosition; 

varying vec2 vUv;

#include ../include/remap.glsl;


float fallingAnimation(float progress) {
    float fallingProgress = remap(progress, uFallRemapOriginMin, uFallRemapOriginMax, uFallRemapDestinationMin, uFallRemapDestinationMax);
    fallingProgress = clamp(fallingProgress, uFallClampMin, uFallClampMax);
    fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
    
    return fallingProgress * 0.2 * uFallingMultiplier;
}

float scaleAnimation(float progress) {
    float sizeOpeningProgress = remap(progress, uOpeningRemapOriginMin, uOpeningRemapOriginMax, uOpeningRemapDestinationMin, uOpeningRemapDestinationMax );
    float sizeClosingProgress = remap(progress, uClosingRemapOriginMin, uClosingRemapOriginMax, uClosingRemapDestinationMin, uClosingRemapDestinationMax );

    return min(sizeOpeningProgress, sizeClosingProgress) * uScaleMultiplier;
}

float twinkleAnimation(float progress) {
    float twinkleProgress = remap(progress, uTwinkleRemapOriginMin, uTwinkleRemapOriginMax, uTwinkleRemapDestinationMin, uTwinkleRemapDestinationMax);
    twinkleProgress = clamp(twinkleProgress, uTwinkleClampMin, uTwinkleClampMax);
    float sizeTwinkle = sin(uTwinkleFrequency * progress) * 0.5 + 0.5;

    return 1.0 - sizeTwinkle * twinkleProgress;
}

void main()
{
    float progress = uProgress * aTimeMultipliers;
    vec3 pos = vec3(position);

    // 1. Explosion animation
    pos = mix(position, aTargetPosition, smoothstep(uSmoothProgressMin, uSmoothProgressMax, progress));
    // 2. Falling particles animation
    pos.y -= fallingAnimation(progress);
    // 3. Scaling animation
    float scaleProgress = scaleAnimation(progress);
    // 4. Twinkle animation
    float twinkleProgress = twinkleAnimation(progress);

    // Final position
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Picture
    float pictureIntensity = 0.2 + normalize(texture(uPictureTexture, uv)).r;

    // Point size
    gl_PointSize = 0.1 * pictureIntensity * uResolution.y * scaleProgress * twinkleProgress;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vUv = uv;

    // Get it out of sight
    if (gl_PointSize < 1.0)
        gl_Position = vec4(9999.9);
        
}
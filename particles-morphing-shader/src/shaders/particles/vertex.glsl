uniform vec2 uResolution;
uniform float uParticuleSize;
uniform float uTime;
uniform float uProgress;
// uSmoothTransition: How smooth is the transition
uniform float uSmoothTransition;
// uAutoMix: Paritcules will shift one another due to cosine
uniform bool uAutoMix; 
uniform float uSpeed;
uniform vec3 uColorA;
uniform vec3 uColorB;

#include ../includes/simplexNoise3d.glsl

attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;

void main()
{
    // Apply both noise on origin model pos and target model pos
    float Tnoise = simplexNoise3d(aPositionTarget * 0.2);
    float Onoise = simplexNoise3d(position * 0.2);
    float noise = mix(Onoise, Tnoise, uProgress);
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = uSmoothTransition;
    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    float progress = 0.0;
    

   
    if ( uAutoMix ) // Auto mix animation
    {
        float cycle = cos( sqrt(uTime) * uSpeed * 3.0 );

        if (cycle > 0.0)
            progress = smoothstep(delay, end, cycle);
        else
            progress = smoothstep(delay, end, abs(cycle));
    }
    else // Normal animation
        progress = smoothstep(delay, end, uProgress);

    // Mixed position
    vec3 mixedPosition = mix(position, aPositionTarget, progress);

    // Final position
    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = uParticuleSize * aSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = mix(uColorA, uColorB, noise);
}
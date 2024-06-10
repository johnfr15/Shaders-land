uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize; 

float linearSmoothStep(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}


void main() {

    vec3 newPosition = position;

    // 1. Animation Exploding Progress
    float explodingProgress = linearSmoothStep(uProgress, 0.0, 0.1, 0.0, 1.0);
    newPosition *= explodingProgress;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    // Final Size
    gl_PointSize = uSize * aSize * uResolution.y;
    gl_PointSize *= 1.0 / -viewPosition.z;
}
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

#include "../utils/random.glsl"

void main()
{
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 normalPosition = modelMatrix * vec4(normal, 0.0);

    // Glitch
    float glitchTime = uTime - modelPosition.y;
    float glithStrength = sin(glitchTime) + sin(glitchTime * 3.1415) + sin(glitchTime * 8.78);
    glithStrength /= 3.0;
    glithStrength = smoothstep(0.3, 1.0, glithStrength);
    glithStrength *= 0.25;

    modelPosition.x += random2D(modelPosition.xz + uTime) * glithStrength; 
    modelPosition.z += random2D(modelPosition.zx + uTime) * glithStrength; 

    //Final position
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // varyings
    vPosition = modelPosition.xyz;
    vNormal = normalPosition.xyz;
}
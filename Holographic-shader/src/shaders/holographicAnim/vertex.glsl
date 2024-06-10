uniform float uTime;        // Time uniform for animation
uniform float uDirection;   // Direction of animation (-1: fall down, 1: rise up)
uniform float uSpeed;       // Speed of animation
uniform float uPointSize;   // Set the point size

attribute vec3 initialPosition; // Initial positions of vertices

void main() 
{
    gl_PointSize = uPointSize; 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // Get current vertex position
    vec3 position = gl_Position.xyz;

    // Calculate animation based on direction
    // if ( uDirection < 0.0 ) { // Fall down animation 

    //     // Calculate new position by moving the vertex downwards
    //     position.y -= uSpeed * 0.01 * sin(uTime * 0.5) * 0.5;

    // } else { // Rise up animation

    //     // Calculate new position by moving the vertex upwards
    //     vec3 direction = initialPosition - position;
    //     position += direction * uSpeed * 0.01 * sin(uTime * 0.5) * 0.5;

    // }

    gl_Position.xyz = position;
}

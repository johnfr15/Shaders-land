uniform vec3 uResolution;
uniform float uTime;
uniform vec3 uStartPosition;
uniform vec3 uTargetPosition;
uniform float uSpeed;
uniform float uRadius;
uniform float uPointSize;

varying vec2 vUv;
varying vec3 vColor;

vec2 rotate2D(vec2 value, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, s, -s, c);
    return m * value;
}

// Function to create a rotation matrix that aligns the circular spread with the target direction
mat3 createRotationMatrix(vec3 from, vec3 to) {
    vec3 forward = normalize(to - from);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);
    return mat3(right, up, forward);
}

void main() 
{
    vec3 newPosition = position;

    // Calculate the direction from start to target
    vec3 direction = normalize(uTargetPosition - uStartPosition);

    // Calculate the distance between the start and target positions
    float totalDistance = distance(uStartPosition, uTargetPosition);

    // Calculate the particle's current position along the direction
    float distanceTravelled = mod(uTime * uSpeed + position.y * totalDistance, totalDistance);
    newPosition = uStartPosition + direction * distanceTravelled;

    // Add circular spread
    float angle = uTime + position.z * 6.28318530718; // position.z should be a random value between 0 and 1
    vec2 offset = vec2(cos(angle), sin(angle)) * uRadius;
    vec3 offset3D = vec3(offset, 0.0);

    // Rotate the offset to face the target
    mat3 rotationMatrix = createRotationMatrix(uStartPosition, uTargetPosition);
    offset3D = rotationMatrix * offset3D;
    newPosition += offset3D;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = uPointSize * uResolution.y;
    gl_PointSize *= (1.0 / -viewPosition.z);

    vUv = uv;
}

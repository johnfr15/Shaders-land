uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uCanvasTexture;
uniform float uIntensityMul;
uniform float uPictureIntensityMul;

varying vec3 vColor;
varying vec2 vUv;

attribute float aIntensity;
attribute float aAngles;

void main()
{
    vec3 pos = vec3(position);

    float displacementIntensity = texture2D(uCanvasTexture, uv).r;
    displacementIntensity = smoothstep(0.05, 0.1, displacementIntensity);

    vec3 displacement = vec3(
        cos(aAngles) * 0.2,
        sin(aAngles) * 0.2,
        1.0 
    );
    displacement = normalize(displacement);
    displacement *= displacementIntensity * uIntensityMul * aIntensity;

    pos += displacement;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Picture
    float pictureIntensity = texture(uPictureTexture, uv).r;

    // Point size
    gl_PointSize = 0.1 * pictureIntensity * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    pictureIntensity = pow(pictureIntensity, uPictureIntensityMul);
    vColor = vec3( pictureIntensity );
    vUv = uv;

}
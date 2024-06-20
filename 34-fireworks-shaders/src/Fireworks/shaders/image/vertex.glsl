uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform float uPictureIntensityMul;
uniform float uProgress;

varying vec3 vColor;
varying vec2 vUv;

void main()
{
    vec3 pos = vec3(position);

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
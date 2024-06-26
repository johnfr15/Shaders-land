uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0, 0.0, 0.0);

    // Day / night color
    vec3 dayColor = texture(uDayTexture, vUv).rgb; 
    vec3 nightColor = texture(uNightTexture, vUv).rgb; 
    vec3 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rgb; 

    // Final color
    gl_FragColor = vec4(dayColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
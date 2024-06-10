uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

uniform float uDayMixMin;
uniform float uDayMixMax;
uniform float uCloudMixMin;
uniform float uCloudMixMax;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0, 0.0, 0.0);

    vec3 sunDirection = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    // Day / night color
    float dayMix = smoothstep(uDayMixMin, uDayMixMax, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb; 
    vec3 nightColor = texture(uNightTexture, vUv).rgb; 

    color = mix(nightColor, dayColor, dayMix);

    // Clouds
    vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;
    float cloudsMix = smoothstep(uCloudMixMin, uCloudMixMax, specularCloudsColor.g);
    cloudsMix *= dayMix;
    color = mix(color, vec3(1.0), cloudsMix);

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Adding "Atmosphere layer" to color
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix); // On night no atmosphere at all

    // Specular
    vec3 reflection = reflect(uSunDirection, normal);
    float specular = dot(reflection, viewDirection); 
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0);
    specular *= specularCloudsColor.r;

    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    color += specular * specularColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
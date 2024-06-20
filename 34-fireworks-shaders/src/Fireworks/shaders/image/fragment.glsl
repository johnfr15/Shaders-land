uniform sampler2D uPictureTexture;
uniform bool uActiveColor;
uniform vec3 uColor;
uniform float uColorMixFactor;

varying vec2 vUv;

void main()
{
    vec2 uv = gl_PointCoord;

    float distance_to_center =  distance(uv, vec2(0.5));
    if ( distance_to_center > 0.5 )
        discard;

    vec4 pictureColor = texture2D(uPictureTexture, vUv);
    if (pictureColor.a < 0.1)
        discard;

    if ( uActiveColor )
        gl_FragColor = vec4(mix(pictureColor.rgb, uColor, uColorMixFactor), 1.0);
    else
        gl_FragColor = texture2D(uPictureTexture, vUv);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
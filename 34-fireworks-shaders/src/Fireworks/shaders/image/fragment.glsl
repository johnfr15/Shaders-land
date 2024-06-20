uniform sampler2D uPictureTexture;

varying vec3 vColor;
varying vec2 vUv;

void main()
{
    vec2 uv = gl_PointCoord;
    float distance_to_center =  distance(uv, vec2(0.5));

    if ( distance_to_center > 0.5 )
        discard;

    gl_FragColor = texture2D(uPictureTexture, vUv);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
varying vec2 vUv;

void main() 
{
    vec2 uv = gl_PointCoord;
    float distance_to_center = distance(uv, vec2(0.5));

    if ( distance_to_center > 0.5 )
        discard;

    gl_FragColor = vec4(vUv, 0.5 + 0.5 , 1.0);
}
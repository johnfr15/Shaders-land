uniform vec3 uColor;

#include ../include/circle.glsl;

void main() {

    // Make our particles as a cirlcle
    vec2 uv = gl_PointCoord;
    circle_fragment( uv );

    // Final color
    gl_FragColor = vec4(uColor, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
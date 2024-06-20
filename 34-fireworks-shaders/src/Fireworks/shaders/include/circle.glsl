void circle_fragment(vec2 uv) {
    // Make the particle as a cirlcle
    float distance_to_center =  distance(uv, vec2(0.5));

    if ( distance_to_center > 0.5 )
        discard;
}
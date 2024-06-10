uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// Matrix 4x4 (mat4)
// https://www.3dgep.com/understanding-the-view-matrix/
//
// ⎡𝑟𝑖𝑔ℎ𝑡𝑥,  𝑢𝑝𝑥,  𝑓𝑜𝑟𝑤𝑎𝑟𝑑𝑥,  𝑝𝑜𝑠𝑖𝑡𝑖𝑜𝑛𝑥⎤
// ⎢𝑟𝑖𝑔ℎ𝑡𝑦,  𝑢𝑝𝑦,  𝑓𝑜𝑟𝑤𝑎𝑟𝑑𝑦,  𝑝𝑜𝑠𝑖𝑡𝑖𝑜𝑛𝑦⎥
// ⎢𝑟𝑖𝑔ℎ𝑡𝑧,  𝑢𝑝𝑧,  𝑓𝑜𝑟𝑤𝑎𝑟𝑑𝑧,  𝑝𝑜𝑠𝑖𝑡𝑖𝑜𝑛𝑧⎥
// ⎣ 0      0       0         1   ⎦
                     
uniform float utime;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uModifier;

attribute vec3 position;
attribute vec2 uv;
attribute float aRandom;

varying float vRandom;
varying vec3 vPosition;
varying vec2 vUv;
varying float vElevation;



/**
 * https://learnopengl.com/Getting-started/Coordinate-Systems
 */
void main()
{

    /***********************************|
    |           MODEL MATRIX            |
    |__________________________________*/

    /**
     * Scale the modelMatrix along all three axes
     * https://stackoverflow.com/questions/32565827/whats-the-purpose-of-magic-4-of-last-row-in-matrix-4x4-for-3d-graphics
     */
    mat4 scaledModelMatrix = modelMatrix;
    scaledModelMatrix[0][0] = abs( uAmplitude * cos( utime * uFrequency )); // Scale along X-axis
    scaledModelMatrix[1][1] *= 1.0; // Scale along Y-axis
    scaledModelMatrix[2][2] *= 1.0; // Scale along Z-axis



    /**
     * Translate components of the modelMatrix
     * https://stackoverflow.com/questions/32565827/whats-the-purpose-of-magic-4-of-last-row-in-matrix-4x4-for-3d-graphics
     */
    mat4 translatedModelMatrix = modelMatrix;
    translatedModelMatrix[3][0] *= 1.0; // Translate along X-axis
    translatedModelMatrix[3][1] = cos(utime); // Translate along Y-axis
    translatedModelMatrix[3][2] *= 1.0; // Translate along Z-axis



    /**
     * Apply rotation transformations around each axis
     * https://stackoverflow.com/questions/32565827/whats-the-purpose-of-magic-4-of-last-row-in-matrix-4x4-for-3d-graphics
     */
    mat4 rotatedModelMatrix = modelMatrix;

    // Rotate around X-axis
    // rotatedModelMatrix[1][1] = cos(utime);
    // rotatedModelMatrix[1][2] = -sin(utime);
    // rotatedModelMatrix[2][1] = sin(utime);
    // rotatedModelMatrix[2][2] = cos(utime);

    // Rotate around Y-axis
    rotatedModelMatrix[0][0] = cos(utime);
    rotatedModelMatrix[0][2] = sin(utime);
    rotatedModelMatrix[2][0] = -sin(utime);
    rotatedModelMatrix[2][2] = cos(utime);

    // Rotate around Z-axis
    // rotatedModelMatrix[0][0] = cos(utime * uFrequency);
    // rotatedModelMatrix[0][1] = -sin(utime * uFrequency);
    // rotatedModelMatrix[1][0] = sin(utime * uFrequency);
    // rotatedModelMatrix[1][1] = cos(utime * uFrequency);




    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPosition.x * uFrequency - utime) * uModifier;

    // Flag simulation
    modelPosition.z += uAmplitude * sin( (modelPosition.x * uFrequency) + utime * uModifier );
    // Messy verteces
    // modelPosition.z += uAmplitude * sin( (aRandom * uFrequency) + utime * 5.0 );
    
    modelPosition *= rotatedModelMatrix;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vRandom = aRandom;
    vPosition = position;
    vUv = uv;
    vElevation = elevation;
}
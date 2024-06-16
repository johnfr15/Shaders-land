import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import fireworkVertexShader from "./shaders/firework/vertex.glsl"
import fireworkFragmentShader from "./shaders/firework/fragment.glsl"
import gsap from 'gsap'
import { Sky } from 'three/addons/objects/Sky.js';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
}

sizes.resolution = new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2),
    sizes.resolution.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})



/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1.5, 0, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Fireworks
 */
const fireworkSettings = {
    particlesSize: 1,
    duration: 3,

    // Explosion uniforms
    // To understand exploding values => https://threejs-journey.com/lessons/fireworks-shaders#exploding 
    remapOriginMin: 0,
    remapOriginMax: 0.1,
    remapDestinationMin: 0,
    remapDestinationMax: 1,
    clampMin: 0,
    clampMax: 1,
    radiusMultiplier: 1,

    fallingRemapOriginMin: 0.1,
    fallingRemapOriginMax: 1,
    fallingRemapDestinationMin: 0,
    fallingRemapDestinationMax: 1,
    fallingClampMin: 0,
    fallingClampMax: 1,
    fallingMultiplier: 1,

    openingRemapOriginMin: 0,
    openingRemapOriginMax: 0.125,
    openingRemapDestinationMin: 0,
    openingRemapDestinationMax: 1,
    closingRemapOriginMin: 0.125,
    closingRemapOriginMax: 1,
    closingRemapDestinationMin: 1,
    closingRemapDestinationMax: 0,
    scalingMultiplier: 1,

    twinkleRemapOriginMin: 0.2,
    twinkleRemapOriginMax: 0.8,
    twinkleRemapDestinationMin: 0,
    twinkleRemapDestinationMax: 1,
    twinkleClampMin: 0,
    twinkleClampMax: 1,
    twinkleFrequency: 30,
}

// gui
const fireworksFolder = gui.addFolder("Firework")
fireworksFolder.add( fireworkSettings, 'particlesSize').min(0).max(100).step(0.1)
fireworksFolder.add( fireworkSettings, 'duration').min(0).max(30).step(0.1)

const explosionFolder = fireworksFolder.addFolder("explosion").close()
explosionFolder.add( fireworkSettings, 'remapOriginMin').min(0).max(1).step(0.01)
explosionFolder.add( fireworkSettings, 'remapOriginMax').min(0).max(1).step(0.01)
explosionFolder.add( fireworkSettings, 'remapDestinationMin').min(0).max(1).step(0.01)
explosionFolder.add( fireworkSettings, 'remapDestinationMax').min(0).max(1).step(0.01)
explosionFolder.add( fireworkSettings, 'clampMin').min(0).max(1).step(0.01)
explosionFolder.add( fireworkSettings, 'clampMax').min(0).max(1).step(0.01)
explosionFolder.add( fireworkSettings, 'radiusMultiplier').min(0).max(40).step(0.1)
explosionFolder.add( explosionFolder, 'reset')

const fallingFolder = fireworksFolder.addFolder("falling").close()
fallingFolder.add( fireworkSettings, 'fallingRemapOriginMin').min(0).max(1).step(0.01)
fallingFolder.add( fireworkSettings, 'fallingRemapOriginMax').min(0).max(1).step(0.01)
fallingFolder.add( fireworkSettings, 'fallingRemapDestinationMin').min(0).max(1).step(0.01)
fallingFolder.add( fireworkSettings, 'fallingRemapDestinationMax').min(0).max(1).step(0.01)
fallingFolder.add( fireworkSettings, 'fallingClampMin').min(0).max(1).step(0.01)
fallingFolder.add( fireworkSettings, 'fallingClampMax').min(0).max(1).step(0.01)
fallingFolder.add( fireworkSettings, 'fallingMultiplier').min(0).max(100).step(1)
fallingFolder.add( fallingFolder, 'reset')

const scalingFolder = fireworksFolder.addFolder("scaling").close()
scalingFolder.add( fireworkSettings, 'openingRemapOriginMin').min(0).max(1).step(0.01)
scalingFolder.add( fireworkSettings, 'openingRemapOriginMax').min(0).max(1).step(0.01)
scalingFolder.add( fireworkSettings, 'openingRemapDestinationMin').min(0).max(1).step(0.01)
scalingFolder.add( fireworkSettings, 'openingRemapDestinationMax').min(0).max(1).step(0.01)
scalingFolder.add( fireworkSettings, 'closingRemapOriginMin').min(0).max(1).step(0.01)
scalingFolder.add( fireworkSettings, 'closingRemapOriginMax').min(0).max(1).step(0.01)
scalingFolder.add( fireworkSettings, 'closingRemapDestinationMin').min(0).max(1).step(0.01)
scalingFolder.add( fireworkSettings, 'closingRemapDestinationMax').min(0).max(1).step(0.01)
scalingFolder.add( fireworkSettings, 'scalingMultiplier').min(0).max(20).step(0.1)
scalingFolder.add( scalingFolder, 'reset')

const twinkleFolder = fireworksFolder.addFolder("twinkle").close()
twinkleFolder.add( fireworkSettings, 'twinkleRemapOriginMin').min(0).max(1).step(0.01)
twinkleFolder.add( fireworkSettings, 'twinkleRemapOriginMax').min(0).max(1).step(0.01)
twinkleFolder.add( fireworkSettings, 'twinkleRemapDestinationMin').min(0).max(1).step(0.01)
twinkleFolder.add( fireworkSettings, 'twinkleRemapDestinationMax').min(0).max(1).step(0.01)
twinkleFolder.add( fireworkSettings, 'twinkleClampMin').min(0).max(1).step(0.01)
twinkleFolder.add( fireworkSettings, 'twinkleClampMax').min(0).max(1).step(0.01)
twinkleFolder.add( fireworkSettings, 'twinkleFrequency').min(0).max(300).step(1)
twinkleFolder.add( twinkleFolder, 'reset')

const textures = [
    textureLoader.load("/particles/1.png"),
    textureLoader.load("/particles/2.png"),
    textureLoader.load("/particles/3.png"),
    textureLoader.load("/particles/4.png"),
    textureLoader.load("/particles/5.png"),
    textureLoader.load("/particles/6.png"),
    textureLoader.load("/particles/7.png"),
    textureLoader.load("/particles/8.png"),
]

const createFirework = (count, position, size, texture, radius, color) => 
{
    // Geometry
    const positionArray = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);
    const timeMultipliers = new Float32Array(count);

    for (let i = 0; i < count*3; i++)
    {
        const i3 = i * 3;

        const spherical = new THREE.Spherical(
            radius * 0.75 + Math.random() * 0.25,
            Math.random() * Math.PI,
            Math.random() * Math.PI * 2
        )
        const position = new THREE.Vector3()
        position.setFromSpherical(spherical)

        positionArray[i3 + 0] = position.x
        positionArray[i3 + 1] = position.y
        positionArray[i3 + 2] = position.z

        sizeArray[i] = Math.random()
        timeMultipliers[i] = 1 + Math.random()
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3))
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizeArray, 1))
    geometry.setAttribute('aTimeMultipliers', new THREE.Float32BufferAttribute(timeMultipliers, 1))


    // Material
    texture.flipY = false
    texture.o
    const material = new THREE.ShaderMaterial({
        vertexShader: fireworkVertexShader,
        fragmentShader: fireworkFragmentShader,
        uniforms: {
            uSize: new THREE.Uniform( size * fireworkSettings.particlesSize ),
            uResolution: new THREE.Uniform( sizes.resolution ),
            uTexture: new THREE.Uniform( texture ),
            uColor: new THREE.Uniform( color ),
            uProgress: new THREE.Uniform( 0 ),

            // explosion
            uRemapOriginMin: new THREE.Uniform( fireworkSettings.remapOriginMin ),
            uRemapOriginMax: new THREE.Uniform( fireworkSettings.remapOriginMax ),
            uRemapDestinationMin: new THREE.Uniform( fireworkSettings.remapOriginMin ),
            uRemapDestinationMax: new THREE.Uniform( fireworkSettings.remapOriginMax ),
            uClampMin: new THREE.Uniform( fireworkSettings.clampMin ),
            uClampMax: new THREE.Uniform( fireworkSettings.clampMax ),
            uRadiusMultiplier: new THREE.Uniform( fireworkSettings.radiusMultiplier ),

            // fall
            uFallRemapOriginMin: new THREE.Uniform( fireworkSettings.fallingRemapOriginMin),
            uFallRemapOriginMax: new THREE.Uniform( fireworkSettings.fallingRemapOriginMax),
            uFallRemapDestinationMin: new THREE.Uniform( fireworkSettings.fallingRemapDestinationMin),
            uFallRemapDestinationMax: new THREE.Uniform( fireworkSettings.fallingRemapDestinationMax),
            uFallClampMin: new THREE.Uniform( fireworkSettings.fallingClampMin),
            uFallClampMax: new THREE.Uniform( fireworkSettings.fallingClampMax),
            uFallingMultiplier: new THREE.Uniform( fireworkSettings.fallingMultiplier ),

            // scale
            uOpeningRemapOriginMin: new THREE.Uniform( fireworkSettings.openingRemapOriginMin),
            uOpeningRemapOriginMax: new THREE.Uniform( fireworkSettings.openingRemapOriginMax),
            uOpeningRemapDestinationMin: new THREE.Uniform( fireworkSettings.openingRemapDestinationMin),
            uOpeningRemapDestinationMax: new THREE.Uniform( fireworkSettings.openingRemapDestinationMax),
            uClosingRemapOriginMin: new THREE.Uniform( fireworkSettings.closingRemapOriginMin),
            uClosingRemapOriginMax: new THREE.Uniform( fireworkSettings.closingRemapOriginMax),
            uClosingRemapDestinationMin: new THREE.Uniform( fireworkSettings.closingRemapDestinationMin),
            uClosingRemapDestinationMax: new THREE.Uniform( fireworkSettings.closingRemapDestinationMax),
            uScaleMultiplier: new THREE.Uniform( fireworkSettings.scalingMultiplier ),

            // twinkle
            uTwinkleRemapOriginMin: new THREE.Uniform( fireworkSettings.twinkleRemapOriginMin),
            uTwinkleRemapOriginMax: new THREE.Uniform( fireworkSettings.twinkleRemapOriginMax),
            uTwinkleRemapDestinationMin: new THREE.Uniform( fireworkSettings.twinkleRemapDestinationMin),
            uTwinkleRemapDestinationMax: new THREE.Uniform( fireworkSettings.twinkleRemapDestinationMax),
            uTwinkleClampMin: new THREE.Uniform( fireworkSettings.twinkleClampMin),
            uTwinkleClampMax: new THREE.Uniform( fireworkSettings.twinkleClampMax),
            uTwinkleFrequency: new THREE.Uniform( fireworkSettings.twinkleFrequency ),
        },
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        transparent: true,
    })

    // Points
    const firework = new THREE.Points(geometry, material)
    firework.position.copy(position)
    scene.add(firework)

    // Destroy
    const destroy = () => {
        scene.remove(firework)
        geometry.dispose()
        material.dispose()
        console.log("Destroy")
    }

    // Animate
    const duration = fireworkSettings.duration
    gsap.to(
        material.uniforms.uProgress,
        { value: 1, duration: duration, ease: "linear", onComplete: destroy },
    )
}


const createRandomFirework = () => {
    const count = Math.round(400 + Math.random() * 1000);
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 2,
        (Math.random() - 0.5) * 10,
    )
    const size = 0.1 + Math.random() * 0.1;
    const texture = textures[Math.floor(Math.random() * textures.length)]
    const radius = 0.5 + Math.random()
    const color = new THREE.Color()
    color.setHSL(Math.random(), 1, 0.7);
    createFirework(count, position, size, texture, radius, color);
}
createRandomFirework()
window.addEventListener("click", createRandomFirework)





/**
 * Sky
 */
let sky, sun
function initSky() {

    // Add Sky
    sky = new Sky();
    sky.scale.setScalar( 450000 );
    scene.add( sky );

    sun = new THREE.Vector3();

    /// GUI

    const skySettings = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.95,
        elevation: -2.2,
        azimuth: 180,
        exposure: renderer.toneMappingExposure
    };

    function guiChanged() {

        const uniforms = sky.material.uniforms;
        uniforms[ 'turbidity' ].value = skySettings.turbidity;
        uniforms[ 'rayleigh' ].value = skySettings.rayleigh;
        uniforms[ 'mieCoefficient' ].value = skySettings.mieCoefficient;
        uniforms[ 'mieDirectionalG' ].value = skySettings.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad( 90 - skySettings.elevation );
        const theta = THREE.MathUtils.degToRad( skySettings.azimuth );

        sun.setFromSphericalCoords( 1, phi, theta );

        uniforms[ 'sunPosition' ].value.copy( sun );

        renderer.toneMappingExposure = skySettings.exposure;
        renderer.render( scene, camera );

    }

    const skyFolder = gui.addFolder("sky").close()
    skyFolder.add( skySettings, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged );
    skyFolder.add( skySettings, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged );
    skyFolder.add( skySettings, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
    skyFolder.add( skySettings, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
    skyFolder.add( skySettings, 'elevation', -3, 90, 0.1 ).onChange( guiChanged );
    skyFolder.add( skySettings, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged );
    skyFolder.add( skySettings, 'exposure', 0, 1, 0.0001 ).onChange( guiChanged );
    skyFolder.add( skyFolder, 'reset' )
    guiChanged();

}
initSky()


/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
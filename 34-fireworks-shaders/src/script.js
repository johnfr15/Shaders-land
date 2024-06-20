import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { Sky } from 'three/addons/objects/Sky.js';
import Firework from "./Fireworks/Firework"
import ImageFireworkStrategy from './Fireworks/strategies/ImageFireworkStrategy'
import ParticlesFireworkStrategy from './Fireworks/strategies/ParticlesFireworkStrategy';
import PointFireworkStrategy from "./Fireworks/strategies/PointFireworkStrategy"

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340, autoPlace: true })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()



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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const myImageTextures = [
    textureLoader.load("/john-gotchi.png"),
]
const myParticlesTextures = [
    textureLoader.load("/moi.jpg"),
]


/**
 * Firework
 */


gui.add({particles: () => firework.changeStrategy(firework.defaultStrategy)}, "particles")
gui.add({points: () => firework.changeStrategy(pointStrategy)}, "points")
gui.add({images: () => firework.changeStrategy(catStrategy)}, "images")

// Set up context
const firework = new Firework(scene, camera, gui)
window.firework = firework
window.addEventListener("click", firework.trigger)

// Set up Point strategy
const pointStrategy = new PointFireworkStrategy(firework)
// Set up Cat strategy
const catStrategy = new ImageFireworkStrategy(firework)

// My strategy
const myImageStrategy = new ImageFireworkStrategy(firework, { textures: myImageTextures, name: "john-gotchi" })
gui.add({myImageStrategy: () => firework.changeStrategy(myImageStrategy)}, "myImageStrategy").name("my image strategy")
// My strategy 2
const myParticlesStrategy = new ParticlesFireworkStrategy(firework, { textures: myParticlesTextures, name: "john" })
gui.add({myParticlesStrategy: () => firework.changeStrategy(myParticlesStrategy)}, "myParticlesStrategy").name("my particles strategy")



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


window.Firework = firework
window.gui = gui

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
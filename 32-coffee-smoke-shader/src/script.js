import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import coffeeSmokeVertexShader from './shaders/coffeeSmoke/vertex.glsl'
import coffeeSmokeFragmentShader from './shaders/coffeeSmoke/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 300})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 8
camera.position.y = 10
camera.position.z = 12
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3
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
 * Model
 */
gltfLoader.load(
    './bakedModel.glb',
    (gltf) =>
    {
        gltf.scene.getObjectByName('baked').material.map.anisotropy = 8
        scene.add(gltf.scene)
    }
)

/**
 * Smoke 
 */


// Geometry
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64)
smokeGeometry.translate(0, 0.5, 0)
smokeGeometry.scale(1.5, 6, 1.5)

// Perlin Texture
const perlinTexture = textureLoader.load("./perlin.png")
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping

// Material
const smokeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    vertexShader: coffeeSmokeVertexShader,
    fragmentShader: coffeeSmokeFragmentShader,
    uniforms: {
        // Both
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform( perlinTexture ),
        // Vertex
        uSmokeRotationFrequency: new THREE.Uniform(0.01),
        uTwistAmplitude: new THREE.Uniform(0.2),
        uWind: new THREE.Uniform(true),
        uWindFrequency: new THREE.Uniform(0.01),
        // Fragment
        uSmokeColor: new THREE.Uniform(new THREE.Color(0.6, 0.3, 0.2)),
        uSpeed: new THREE.Uniform(0.1),
        uSmokeThickness: new THREE.Uniform(0.5),
        uXEges: new THREE.Uniform(0),
        uYEges: new THREE.Uniform(0),
    },
    side: THREE.DoubleSide,
    depthWrite: false,
    // wireframe: true,
})

const vertexFolder = gui.addFolder("Vertex")
const uSmokeRotationFrequency = vertexFolder.add(smokeMaterial.uniforms.uSmokeRotationFrequency, "value").name("uSmokeRotationFrequency").min(0).max(2).step(0.001)
const uTwistAmplitude = vertexFolder.add(smokeMaterial.uniforms.uTwistAmplitude, "value").name("uTwistAmplitude").min(0).max(2).step(0.001)
const uWind = vertexFolder.add(smokeMaterial.uniforms.uWind, "value").name("uWind")
const uWindFrequency = vertexFolder.add(smokeMaterial.uniforms.uWindFrequency, "value").name("uWindFrequency").min(0).max(1).step(0.001)
const fragmentFolder = gui.addFolder("Fragment")
const uSmokeColor = fragmentFolder.addColor(smokeMaterial.uniforms.uSmokeColor, "value").name("uSmokeColor")
const uSpeed = fragmentFolder.add(smokeMaterial.uniforms.uSpeed, "value").name("uSpeed").min(-2).max(2).step(0.001)
const uSmokeThickness = fragmentFolder.add(smokeMaterial.uniforms.uSmokeThickness, "value").name("uSmokeThickness").min(-1).max(1).step(0.01)
const uXEges = fragmentFolder.add(smokeMaterial.uniforms.uXEges, "value").name("uXEges").min(-0.09).max(0.89).step(0.01)
const uYEges = fragmentFolder.add(smokeMaterial.uniforms.uYEges, "value").name("uYEges").min(-0.09).max(4).step(0.01)

const reset = () => {
    uSmokeRotationFrequency.setValue( 0.01 ),
    uTwistAmplitude.setValue( 0.2 ),
    uWind.setValue( true ),
    uWindFrequency.setValue( 0.01 ),
    uSmokeColor.setValue( new THREE.Color(0.6, 0.3, 0.2) ),
    uSpeed.setValue( 0.1 ),
    uSmokeThickness.setValue( 0.5 ),
    uXEges.setValue( 0 ),
    uYEges.setValue( 0 )
}
gui.add({ reset: reset }, "reset");


// Mesh 
const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
smoke.position.y = 1.8
scene.add(smoke)


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // UpdateSmoke
    smokeMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
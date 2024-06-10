import * as THREE from 'three'
import { GUI } from "dat.gui"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import particlesVertexShader from './shaders/particles/vertex.glsl'
import particlesFragmentShader from './shaders/particles/fragment.glsl'

/**
 * Base
 */
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
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 0, 18)
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
renderer.setClearColor('#181818')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)


/**
 * Particles
 */

// Create the particle system
const geometry = new THREE.BufferGeometry();
const positions = [];
const numParticles = 500;

for (let i = 0; i < numParticles; i++) {
    const x = Math.random() * 2 - 0.5;
    const y = Math.random() * 2 - 0.5;
    const z = Math.random(); // Random value between 0 and 1 for circular spread
    positions.push(x, y, z);
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
        uPointSize: new THREE.Uniform(0.1),
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio) ),
        uTime: new THREE.Uniform( 1.0 ),
        uStartPosition: new THREE.Uniform( new THREE.Vector3(0, 0, 0) ),
        uTargetPosition: new THREE.Uniform( new THREE.Vector3(20, 20, 0) ),
        uSpeed: new THREE.Uniform( 1.0 ),
        uRadius: new THREE.Uniform( 1.0 )
    },
    transparent: true
});

// Create the particle system
const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);

/**
 * GUI
 */
const gui = new GUI()

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    // Clock
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Update uniforms
    material.uniforms.uTime.value = elapsedTime;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { threshold } from 'three/examples/jsm/nodes/Nodes.js'
import fireworkVertexShader from "./shaders/firework/vertex.glsl"
import fireworkFragmentShader from "./shaders/firework/fragment.glsl"
import gsap from 'gsap'

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
const texture = [
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
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3))
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizeArray, 1))


    // Material
    texture.flipY = false
    texture.o
    const material = new THREE.ShaderMaterial({
        vertexShader: fireworkVertexShader,
        fragmentShader: fireworkFragmentShader,
        uniforms: {
            uSize: new THREE.Uniform( size ),
            uResolution: new THREE.Uniform( sizes.resolution ),
            uTexture: new THREE.Uniform(texture),
            uColor: new THREE.Uniform( color ),
            uProgress: new THREE.Uniform( 0 ),
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
    gsap.to(
        material.uniforms.uProgress,
        { value: 1, duration: 3, ease: "linear", onComplete: destroy },
    )
}


window.addEventListener("click", () => {
    createFirework(
        1000,                   // count
        new THREE.Vector3(),    // position
        0.1,                    // size
        texture[7],             // Texture
        1,                      // Radius
        new THREE.Color("#0affff") // Colors
    )
})
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
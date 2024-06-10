import gsap from 'gsap'
import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import particlesFragmentShader from './shaders/particles/fragment.glsl'
import particlesVertexShader from './shaders/particles/vertex.glsl'





/***********************************|
|               META                |
|__________________________________*/
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color("#000000")

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Clock
const clock = new THREE.Clock()





/***********************************|
|              SCREEN               |
|__________________________________*/
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
    if (particles)
        particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})





/***********************************|
|             CAMERA                |
|__________________________________*/
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 8 * 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true





/***********************************|
|            RENDERER               |
|__________________________________*/
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

debugObject.clearColor = '#160920'
gui.addColor(debugObject, 'clearColor').onChange(() => { renderer.setClearColor(debugObject.clearColor) })
renderer.setClearColor(debugObject.clearColor)





/***********************************|
|            PARTICLES              |
|__________________________________*/
// Models
let particles = null;
gltfLoader.load("./models.glb", (gltf) => {

    particles = {};
    particles.index = 0;

    // Positions
    // For each models we want to extract the positions of their verteces
    const positions = gltf.scene.children.map((child) => 
    {
        return child.geometry.attributes.position;
    })

    // Among all the models get the one that has the most verteces
    particles.maxCount = positions.map((p) => p.count).sort((a, b) => b - a)[0];
    
    // Make sure that all models has the same amount of verces
    // amongt themselves
    particles.positions = positions.map(p => {
        const diff = particles.maxCount - p.count
        const fillArr = new Float32Array( diff * 3 ).fill(0)

        // For every padded veteces we position it to a random vertex of our model so they don't appear all in the center of our model
        for( let i = 0; i < fillArr.length; i += 3)
        {
            let randomIndex = Math.floor(p.count * Math.random()) * 3
            fillArr[i + 0] = p.array[randomIndex + 0]; // x
            fillArr[i + 1] = p.array[randomIndex + 1]; // y
            fillArr[i + 2] = p.array[randomIndex + 2]; // z
        }

        const paddedArr = [...p.array, ...fillArr]
        return new THREE.Float32BufferAttribute(paddedArr, 3)
    });

    // Geometry
    const sizeArray = new Float32Array(particles.maxCount)
    for(let i = 0; i < particles.maxCount; i++)
        sizeArray[i] = Math.random()

    particles.geometry = new THREE.BufferGeometry()
    particles.geometry.setAttribute('position', particles.positions[particles.index])
    particles.geometry.setAttribute('aPositionTarget', particles.positions[3])
    particles.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizeArray, 1))
    particles.geometry.setIndex(null)

    // Material
    particles.colorA = "#52ffcb"
    particles.colorB = "#ff248e"
    particles.material = new THREE.ShaderMaterial({
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        uniforms:
        {
            uColorA: new THREE.Uniform(new THREE.Color(particles.colorA)),
            uColorB: new THREE.Uniform(new THREE.Color(particles.colorB)),
            uParticuleSize: new THREE.Uniform(0.2),
            uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
            uTime: new THREE.Uniform(0),
            uSmoothTransition: new THREE.Uniform(0.4),
            uAutoMix: { value: false },
            uSpeed: new THREE.Uniform(1),
            uProgress: new THREE.Uniform(0),
        },
        
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    })

    // Points
    particles.points = new THREE.Points(particles.geometry, particles.material)
    particles.points.frustimCulling = false
    scene.add(particles.points)

    // Methods
    particles.morph = (index) => 
    {
        console.log(particles.material.uniforms.uSpeed)
        // Update attributes
        particles.geometry.attributes.position = particles.positions[particles.index]
        particles.geometry.attributes.aPositionTarget = particles.positions[index]

        // During transition of both model, use gsap for a bezier-curve style animatino
        gsap.fromTo(
            particles.material.uniforms.uProgress,
            { value: 0 },
            { value: 1, duration: (3 / particles.material.uniforms.uSpeed.value), ease: 'linear' }
        )

        // Save index
        particles.index = index
    }
    particles.morph0 = () => particles.morph(0)
    particles.morph1 = () => particles.morph(1)
    particles.morph2 = () => particles.morph(2)
    particles.morph3 = () => particles.morph(3)

    // Gui
    gui.addColor(particles, 'colorA').onChange(() => particles.material.uniforms.uColorA.value.set(particles.colorA))
    gui.addColor(particles, 'colorB').onChange(() => particles.material.uniforms.uColorB.value.set(particles.colorB))
    gui.add(particles.material.uniforms.uParticuleSize, 'value').min(0).max(1).step(0.001).name("uParticuleSize")
    gui.add(particles.material.uniforms.uProgress, 'value').min(0).max(1).step(0.01).name("uProgress").listen()
    gui.add(particles.material.uniforms.uSpeed, 'value').min(0).max(20).step(0.01).name("uSpeed")
    gui.add(particles.material.uniforms.uSmoothTransition, 'value').min(0).max(1).step(0.01).name("uSmoothTransition")
    gui.add(particles.material.uniforms.uAutoMix, 'value').min(0).max(1).step(0.01).name("uAutoMix")
    gui.add(particles, 'morph0').name("torus")
    gui.add(particles, 'morph1').name("suzanne")
    gui.add(particles, 'morph2').name("sphere")
    gui.add(particles, 'morph3').name("threejs")

})





/***********************************|
|             ANIMATE               |
|__________________________________*/
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    if ( particles )
    {
        particles.material.uniforms.uTime.value = elapsedTime
    }

    // Render normal scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
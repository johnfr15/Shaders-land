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
    displacement.canvas.style.height = sizes.height / 4 + 'px'
    displacement.canvas.style.width = displacement.canvas.style.height
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    particlesMaterial.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

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
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
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
 * Displacement 
 */
const displacement = {}

// 2D canvas
displacement.canvas = document.createElement("canvas")
displacement.canvas.width = 256
displacement.canvas.height = 256
displacement.canvas.style.position = 'fixed'
displacement.canvas.style.height = sizes.height / 4 + 'px'
displacement.canvas.style.width = displacement.canvas.style.height
displacement.canvas.style.top = 0
displacement.canvas.style.left = 0
displacement.canvas.style.zIndex = 10
document.body.append( displacement.canvas )

// Context
displacement.context = displacement.canvas.getContext('2d')
displacement.context.fillRect(0, 0, displacement.canvas.width, displacement.canvas.height)

// Glow image 
displacement.glowImage = new Image()
displacement.glowImage.src = "./glow.png"
displacement.glowSize = displacement.canvas.width * 0.25

// Interactive plane 
displacement.interactivePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide })
)
scene.add(displacement.interactivePlane)
displacement.interactivePlane.visible = false

// Raycaster
displacement.raycaster = new THREE.Raycaster()

// Coordinate
displacement.screenCursor = new THREE.Vector2(1000, 1000)
displacement.canvasCursor = new THREE.Vector2(1000, 1000)
displacement.canvasCursorPrevious = new THREE.Vector2(1000, 1000)

window.addEventListener('pointermove', (e) => {
    displacement.screenCursor.x = (e.clientX / sizes.width) * 2 - 1
    displacement.screenCursor.y = -(e.clientY / sizes.height) * 2 + 1
})

// Textures
const textures = {
    "john": textureLoader.load("./john.png"), 
    "picture-1": textureLoader.load("./picture-1.png"), 
    "picture-2": textureLoader.load("./picture-2.png"), 
    "picture-3": textureLoader.load("./picture-3.png"), 
    "picture-4": textureLoader.load("./picture-4.png"), 
    "picture-5": textureLoader.load("./picture-5.png"), 
}
displacement.texture = new THREE.CanvasTexture(displacement.canvas)

/**
 * Particles
 */
let particlesNumber = { value: 128 }
let particlesGeometry = new THREE.PlaneGeometry(10, 10, particlesNumber.value, particlesNumber.value)
particlesGeometry.setIndex(null)
particlesGeometry.deleteAttribute("normal")

let intensitiesArray = new Float32Array(particlesGeometry.attributes.position.count)
let anglesArray = new Float32Array(particlesGeometry.attributes.position.count)
for(let i = 0; i < particlesGeometry.attributes.position.count; i++)
{
    intensitiesArray[i] = Math.random();
    anglesArray[i] = Math.random() * Math.PI * 2;
}
particlesGeometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensitiesArray, 1))
particlesGeometry.setAttribute('aAngles', new THREE.BufferAttribute(anglesArray, 1))

const particlesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms:
    {
        uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)),
        uPictureTexture: new THREE.Uniform(textures["john"]),
        uCanvasTexture: new THREE.Uniform(displacement.texture),
        uIntensityMul: new THREE.Uniform(3),
        uPictureIntensityMul: new THREE.Uniform(2),
        uBlackAndWhite: new THREE.Uniform(false),
    },
    // blending: THREE.AdditiveBlending
})
let particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * GUI
 */
const gui = new GUI()
const cubeFolder = gui.addFolder('shader')
cubeFolder.add(particlesNumber, 'value').min(1).max(2**12).step(1).name('particules')
cubeFolder.add({ apply: function(){ 
    
    scene.remove(particles)
    particles.geometry.dispose()

    const n = particlesNumber.value
    particlesGeometry = new THREE.PlaneGeometry(10, 10, n, n)
    particlesGeometry.setIndex(null)
    particlesGeometry.deleteAttribute("normal")
    intensitiesArray = new Float32Array(particlesGeometry.attributes.position.count)
    anglesArray = new Float32Array(particlesGeometry.attributes.position.count)
    for(let i = 0; i < particlesGeometry.attributes.position.count; i++)
    {
        intensitiesArray[i] = Math.random();
        anglesArray[i] = Math.random() * Math.PI * 2;
    }
    particlesGeometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensitiesArray, 1))
    particlesGeometry.setAttribute('aAngles', new THREE.BufferAttribute(anglesArray, 1))


    particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

}}, 'apply').name("Apply particles")
cubeFolder.add(particlesMaterial.uniforms.uIntensityMul, 'value').min(0).max(50).name('disPlacementIntensity')
cubeFolder.add(displacement, "glowSize").min(0).max(300).name('glowSize')
cubeFolder.add(particlesMaterial.uniforms.uBlackAndWhite, "value").name('black & white')
cubeFolder.add(particlesMaterial.uniforms.uPictureIntensityMul, 'value').min(0).max(100).step(0.001).name('pictureIntensity')
cubeFolder.add({click: function(){particlesMaterial.uniforms.uPictureTexture = new THREE.Uniform(textures['john'])}}, 'click').name('john')
cubeFolder.add({click: function(){particlesMaterial.uniforms.uPictureTexture = new THREE.Uniform(textures['picture-1'])}}, 'click').name('picture 1')
cubeFolder.add({click: function(){particlesMaterial.uniforms.uPictureTexture = new THREE.Uniform(textures['picture-2'])}}, 'click').name('picture 2')
cubeFolder.add({click: function(){particlesMaterial.uniforms.uPictureTexture = new THREE.Uniform(textures['picture-3'])}}, 'click').name('picture 3')
cubeFolder.add({click: function(){particlesMaterial.uniforms.uPictureTexture = new THREE.Uniform(textures['picture-4'])}}, 'click').name('picture 4')
cubeFolder.add({click: function(){particlesMaterial.uniforms.uPictureTexture = new THREE.Uniform(textures['picture-5'])}}, 'click').name('picture 5')
cubeFolder.open()

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    /**
     * Raycaster
     */
    displacement.raycaster.setFromCamera(displacement.screenCursor, camera)
    const intersections = displacement.raycaster.intersectObject(displacement.interactivePlane)

    if (intersections.length)
    {
        const uv = intersections[0].uv
        displacement.canvasCursor.x = (uv.x * displacement.canvas.width)
        displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height 
    }

    /**
     * Displacement
     */
    // 1. First step drawing 
    // Draw everything black with 10% alpha
    displacement.context.globalCompositeOperation = 'source-over'
    displacement.context.globalAlpha = 0.1
    displacement.context.fillRect(0,0, displacement.canvas.width, displacement.canvas.height)

    // Speed alpha
    const cursorDistance = displacement.canvasCursorPrevious.distanceTo(displacement.canvasCursor)
    displacement.canvasCursorPrevious.copy(displacement.canvasCursor)
    const alpha = Math.min(cursorDistance * 0.1, 1)

    // 2. Second step drawing
    // Draw the glow image
    displacement.context.globalCompositeOperation = 'lighten'
    displacement.context.globalAlpha = alpha
    displacement.context.drawImage(
        displacement.glowImage, 
        displacement.canvasCursor.x - (displacement.glowSize * 0.5), 
        displacement.canvasCursor.y - (displacement.glowSize * 0.5), 
        displacement.glowSize, 
        displacement.glowSize
    )
    displacement.texture.needsUpdate = true


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
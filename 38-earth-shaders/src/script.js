import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Earth
 */

const earthParameters = {
    atmosphereDayColor: new THREE.Color("#00aaff"),
    atmosphereTwilightColor: new THREE.Color("#ff6600"),
    dayMixMin: -0.25,
    dayMixMax: 0.5,
    cloudMixMin: 0.3,
    cloudMixMax: 1,
    uSunDirection: new THREE.Vector3(),
}
gui
    .addColor(earthParameters, 'atmosphereDayColor')
    .onChange(() => {
        earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
        atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
    })

gui
    .addColor(earthParameters, 'atmosphereTwilightColor')
    .onChange(() => {
        earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
        atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
    })
gui.add(earthParameters, "dayMixMin").min(-1).max(1).step(0.01).onChange(() => earthMaterial.uniforms.uDayMixMin.value = earthParameters.dayMixMin)
gui.add(earthParameters, "dayMixMax").min(-1).max(1).step(0.01).onChange(() => earthMaterial.uniforms.uDayMixMax.value = earthParameters.dayMixMax)
gui.add(earthParameters, "cloudMixMin").min(-1).max(1).step(0.01).onChange(() => earthMaterial.uniforms.uCloudMixMin.value = earthParameters.cloudMixMin)
gui.add(earthParameters, "cloudMixMax").min(-1).max(1).step(0.01).onChange(() => earthMaterial.uniforms.uCloudMixMax.value = earthParameters.cloudMixMax)


// Textures
let earthDayTexture = textureLoader.load("/earth/day.jpg");
earthDayTexture.colorSpace = THREE.SRGBColorSpace
earthDayTexture.anisotropy = 8
let earthNightTexture = textureLoader.load("/earth/night.jpg");
earthNightTexture.colorSpace = THREE.SRGBColorSpace
earthNightTexture.anisotropy = 8
let speculareCloudsTexture = textureLoader.load("/earth/specularClouds.jpg");
speculareCloudsTexture.colorSpace = THREE.SRGBColorSpace
speculareCloudsTexture.anisotropy = 8

// geometry
const earthGeometry = new THREE.SphereGeometry(2, 64, 64)

// Material
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform( earthDayTexture ),
        uNightTexture: new THREE.Uniform( earthNightTexture ),
        uSpecularCloudsTexture: new THREE.Uniform( speculareCloudsTexture ),
        uDayMixMin: new THREE.Uniform( -0.25 ),
        uDayMixMax: new THREE.Uniform( 0.5 ),
        uCloudMixMin: new THREE.Uniform( 0.3 ),
        uCloudMixMax: new THREE.Uniform( 1 ),
        uSunDirection: new THREE.Uniform(new THREE.Vector3()),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
    },
    wireframe: false
})

// Mesh
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)



/**
 * Atmosphere
 */

const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms:
    {
        uSunDirection: new THREE.Uniform(new THREE.Vector3()),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
    },
    side: THREE.BackSide,
    transparent: true,
})

const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial)
atmosphere.scale.set(1.04, 1.04, 1.04)
scene.add(atmosphere)



/**
 * Sun
 */

const sunSpherical = new THREE.Spherical(1, Math.PI*0.5, 0.5)
const sunDirection = new THREE.Vector3()

// Debug sun
const debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial()
)
scene.add(debugSun)

// Update
const updateSun = () => 
{
    sunDirection.setFromSpherical(sunSpherical)
    
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)

    // Debug
    debugSun.position
        .copy(sunDirection)
        .multiplyScalar(5)
    
}
updateSun()

// Teak
gui.add(sunSpherical, 'phi').min(-Math.PI).max(Math.PI).onChange(updateSun)
gui.add(sunSpherical, 'theta').min(-Math.PI).max(Math.PI).onChange(updateSun)

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

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
    renderer.setClearColor("#000011")
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 5
camera.position.z = 4
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
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    earth.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

gui.add(gui, "reset")

tick()
import * as THREE from 'three';
import gsap from 'gsap';
import GUI from 'lil-gui';
import AbstractFireworkStrategy from './AbstractFireworkStrategy';
import { FireworkMode, Options } from '../types.ts';
import fireworkVertexShader from "../shaders/point/vertex.glsl";
import fireworkFragmentShader from "../shaders/point/fragment.glsl";
import Firework from '../Firework';

/**
 * Table of contents
 * 
 *  - CONSTRUCTOR:  When Class is intanciated for the first time (run only once).
 *  - EVENTS:       When Class is 'turned on' events are listening, when 'turned off' events are cleaned.
 *  - PRIVATE:      Internal functions that serve public API.
 *  - API:          Functions callable from external.
 */
class PointFireworkStrategy extends AbstractFireworkStrategy {
    private _fireworkSettings!: {[key: string]: number | string | boolean}
    private _gui!: GUI;
    public name: string;





    /***********************************|
    |            CONSTRUCTOR            |
    |__________________________________*/
    constructor(context: Firework, options: Options = {}) 
    {
        super(context)

        this.name = options.name || "Point firework strategy"

        this._initSettings();
        this._initGui();
    }

    private _initSettings(): void 
    {
        this._fireworkSettings = {
            particlesSize: 1,
            particlesColor: "#ff0000",
            randomParticlesColor: true,
            duration: 3,
        
            // Explosion uniforms
            // To understand exploding values => https://threejs-journey.com/lessonsparticles-shaders#exploding 
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
    }


    private _initGui(): void 
    {
        this._gui = this._GUI.addFolder(this.name).close();
        this._gui.add( this._fireworkSettings, 'particlesSize').min(0).max(100).step(0.1)
        this._gui.add( this._fireworkSettings, 'randomParticlesColor')
        this._gui.addColor( this._fireworkSettings, 'particlesColor').onChange((c: any) => this._fireworkSettings.particlesColor = c)
        this._gui.add( this._fireworkSettings, 'duration').min(0).max(30).step(0.1)
        this._gui.add( this, 'mode', ['Random', 'Mouse']).name("Modes").onChange((m: string) => {
            if (m === 'Random') this._mode = FireworkMode.RANDOM
            if (m === 'Mouse') this._mode = FireworkMode.MOUSE
        })
        
        const explosionFolder = this._gui.addFolder("explosion").close()
        explosionFolder.add( this._fireworkSettings, 'remapOriginMin').min(0).max(1).step(0.01)
        explosionFolder.add( this._fireworkSettings, 'remapOriginMax').min(0).max(1).step(0.01)
        explosionFolder.add( this._fireworkSettings, 'remapDestinationMin').min(0).max(1).step(0.01)
        explosionFolder.add( this._fireworkSettings, 'remapDestinationMax').min(0).max(1).step(0.01)
        explosionFolder.add( this._fireworkSettings, 'clampMin').min(0).max(1).step(0.01)
        explosionFolder.add( this._fireworkSettings, 'clampMax').min(0).max(1).step(0.01)
        explosionFolder.add( this._fireworkSettings, 'radiusMultiplier').min(0).max(40).step(0.1)
        explosionFolder.add( explosionFolder, 'reset')
        
        const fallingFolder = this._gui.addFolder("falling").close()
        fallingFolder.add( this._fireworkSettings, 'fallingRemapOriginMin').min(0).max(1).step(0.01)
        fallingFolder.add( this._fireworkSettings, 'fallingRemapOriginMax').min(0).max(1).step(0.01)
        fallingFolder.add( this._fireworkSettings, 'fallingRemapDestinationMin').min(0).max(1).step(0.01)
        fallingFolder.add( this._fireworkSettings, 'fallingRemapDestinationMax').min(0).max(1).step(0.01)
        fallingFolder.add( this._fireworkSettings, 'fallingClampMin').min(0).max(1).step(0.01)
        fallingFolder.add( this._fireworkSettings, 'fallingClampMax').min(0).max(1).step(0.01)
        fallingFolder.add( this._fireworkSettings, 'fallingMultiplier').min(0).max(100).step(1)
        fallingFolder.add( fallingFolder, 'reset')
        
        const scalingFolder = this._gui.addFolder("scaling").close()
        scalingFolder.add( this._fireworkSettings, 'openingRemapOriginMin').min(0).max(1).step(0.01)
        scalingFolder.add( this._fireworkSettings, 'openingRemapOriginMax').min(0).max(1).step(0.01)
        scalingFolder.add( this._fireworkSettings, 'openingRemapDestinationMin').min(0).max(1).step(0.01)
        scalingFolder.add( this._fireworkSettings, 'openingRemapDestinationMax').min(0).max(1).step(0.01)
        scalingFolder.add( this._fireworkSettings, 'closingRemapOriginMin').min(0).max(1).step(0.01)
        scalingFolder.add( this._fireworkSettings, 'closingRemapOriginMax').min(0).max(1).step(0.01)
        scalingFolder.add( this._fireworkSettings, 'closingRemapDestinationMin').min(0).max(1).step(0.01)
        scalingFolder.add( this._fireworkSettings, 'closingRemapDestinationMax').min(0).max(1).step(0.01)
        scalingFolder.add( this._fireworkSettings, 'scalingMultiplier').min(0).max(20).step(0.1)
        scalingFolder.add( scalingFolder, 'reset')
        
        const twinkleFolder = this._gui.addFolder("twinkle").close()
        twinkleFolder.add( this._fireworkSettings, 'twinkleRemapOriginMin').min(0).max(1).step(0.01)
        twinkleFolder.add( this._fireworkSettings, 'twinkleRemapOriginMax').min(0).max(1).step(0.01)
        twinkleFolder.add( this._fireworkSettings, 'twinkleRemapDestinationMin').min(0).max(1).step(0.01)
        twinkleFolder.add( this._fireworkSettings, 'twinkleRemapDestinationMax').min(0).max(1).step(0.01)
        twinkleFolder.add( this._fireworkSettings, 'twinkleClampMin').min(0).max(1).step(0.01)
        twinkleFolder.add( this._fireworkSettings, 'twinkleClampMax').min(0).max(1).step(0.01)
        twinkleFolder.add( this._fireworkSettings, 'twinkleFrequency').min(0).max(300).step(1)
        twinkleFolder.add( twinkleFolder, 'reset')
    }










    /***********************************|
    |              PRIVATE              |
    |__________________________________*/
    private _createFirework(count: number, position: THREE.Vector3, size: number, radius: number, color: THREE.Color) {
        const positionArray = new Float32Array(count * 3);
        const sizeArray = new Float32Array(count);
        const timeMultipliers = new Float32Array(count);


        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            const spherical = new THREE.Spherical(
                radius * 0.75 + Math.random() * 0.25,
                Math.random() * Math.PI,
                Math.random() * Math.PI * 2
            );
            const pos = new THREE.Vector3();
            pos.setFromSpherical(spherical);

            positionArray[i3 + 0] = pos.x;
            positionArray[i3 + 1] = pos.y;
            positionArray[i3 + 2] = pos.z;

            sizeArray[i] = Math.random();
            timeMultipliers[i] = 1 + Math.random();
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
        geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizeArray, 1));
        geometry.setAttribute('aTimeMultipliers', new THREE.Float32BufferAttribute(timeMultipliers, 1));

        const material = new THREE.ShaderMaterial({
            vertexShader: fireworkVertexShader,
            fragmentShader: fireworkFragmentShader,
            uniforms: {
                uSize: new THREE.Uniform(size * (this._fireworkSettings.particlesSize as number)),
                uResolution: new THREE.Uniform(this._window.resolution),
                uColor: new THREE.Uniform(color),
                uProgress: new THREE.Uniform(0),

                // explosion
                uRemapOriginMin: new THREE.Uniform(this._fireworkSettings.remapOriginMin),
                uRemapOriginMax: new THREE.Uniform(this._fireworkSettings.remapOriginMax),
                uRemapDestinationMin: new THREE.Uniform(this._fireworkSettings.remapDestinationMin),
                uRemapDestinationMax: new THREE.Uniform(this._fireworkSettings.remapDestinationMax),
                uClampMin: new THREE.Uniform(this._fireworkSettings.clampMin),
                uClampMax: new THREE.Uniform(this._fireworkSettings.clampMax),
                uRadiusMultiplier: new THREE.Uniform(this._fireworkSettings.radiusMultiplier),

                // fall
                uFallRemapOriginMin: new THREE.Uniform(this._fireworkSettings.fallingRemapOriginMin),
                uFallRemapOriginMax: new THREE.Uniform(this._fireworkSettings.fallingRemapOriginMax),
                uFallRemapDestinationMin: new THREE.Uniform(this._fireworkSettings.fallingRemapDestinationMin),
                uFallRemapDestinationMax: new THREE.Uniform(this._fireworkSettings.fallingRemapDestinationMax),
                uFallClampMin: new THREE.Uniform(this._fireworkSettings.fallingClampMin),
                uFallClampMax: new THREE.Uniform(this._fireworkSettings.fallingClampMax),
                uFallingMultiplier: new THREE.Uniform(this._fireworkSettings.fallingMultiplier),

                // scale
                uOpeningRemapOriginMin: new THREE.Uniform(this._fireworkSettings.openingRemapOriginMin),
                uOpeningRemapOriginMax: new THREE.Uniform(this._fireworkSettings.openingRemapOriginMax),
                uOpeningRemapDestinationMin: new THREE.Uniform(this._fireworkSettings.openingRemapDestinationMin),
                uOpeningRemapDestinationMax: new THREE.Uniform(this._fireworkSettings.openingRemapDestinationMax),
                uClosingRemapOriginMin: new THREE.Uniform(this._fireworkSettings.closingRemapOriginMin),
                uClosingRemapOriginMax: new THREE.Uniform(this._fireworkSettings.closingRemapOriginMax),
                uClosingRemapDestinationMin: new THREE.Uniform(this._fireworkSettings.closingRemapDestinationMin),
                uClosingRemapDestinationMax: new THREE.Uniform(this._fireworkSettings.closingRemapDestinationMax),
                uScaleMultiplier: new THREE.Uniform(this._fireworkSettings.scalingMultiplier),

                // twinkle
                uTwinkleRemapOriginMin: new THREE.Uniform(this._fireworkSettings.twinkleRemapOriginMin),
                uTwinkleRemapOriginMax: new THREE.Uniform(this._fireworkSettings.twinkleRemapOriginMax),
                uTwinkleRemapDestinationMin: new THREE.Uniform(this._fireworkSettings.twinkleRemapDestinationMin),
                uTwinkleRemapDestinationMax: new THREE.Uniform(this._fireworkSettings.twinkleRemapDestinationMax),
                uTwinkleClampMin: new THREE.Uniform(this._fireworkSettings.twinkleClampMin),
                uTwinkleClampMax: new THREE.Uniform(this._fireworkSettings.twinkleClampMax),
                uTwinkleFrequency: new THREE.Uniform(this._fireworkSettings.twinkleFrequency),
            },
        });

        const firework = new THREE.Points(geometry, material);
        firework.position.copy(position);
        this._scene.add(firework);

        const destroy = () => {
            this._scene.remove(firework);
            geometry.dispose();
            material.dispose();
            console.log("Destroy");
        };

        const duration = this._fireworkSettings.duration as number;
        gsap.to(material.uniforms.uProgress, {
            value: 1,
            duration: duration,
            ease: "linear",
            onComplete: destroy,
        });
    }

    private _createRandomFirework = () => {
        let color: THREE.Color;

        const count = Math.round(400 + Math.random() * 1000);
        const position = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            Math.random() * 2,
            (Math.random() - 0.5) * 10,
        )
        const size = 0.1 + Math.random() * 0.1;
        const radius = 0.5 + Math.random()

        if ( this._fireworkSettings.randomParticlesColor )
            color = new THREE.Color(Math.random(),Math.random(),Math.random())
        else
            color = new THREE.Color(this._fireworkSettings.particlesColor as string)

        this._createFirework(count, position, size, radius, color);
    }

    private _createMouseFirework = () => {
        let color: THREE.Color;

        const count = Math.round(400 + Math.random() * 1000);
        const raycaster = new THREE.Raycaster(); 
        raycaster.setFromCamera(this._mouseCoord, this._camera);
        const distance = 50; // Get an arbitrary point on the ray at a specific distance from the camera
        const arbitraryPoint = raycaster.ray.at(Math.random() * distance, new THREE.Vector3());
        const size = 0.1 + Math.random() * 0.1;
        const radius = 0.5 + Math.random()
        
        if ( this._fireworkSettings.randomParticlesColor )
            color = new THREE.Color(Math.random(),Math.random(),Math.random())
        else
            color = new THREE.Color(this._fireworkSettings.particlesColor as string)

        this._createFirework(count, arbitraryPoint, size, radius, color);
    }

    private _createArbitraryFirework = (position: THREE.Vector3) => {
        const count = Math.round(400 + Math.random() * 1000);
        const size = 0.1 + Math.random() * 0.1;
        const radius = 0.5 + Math.random()
        const color = new THREE.Color()
        color.setHSL(Math.random(), 1, 0.7);

        this._createFirework(count, position, size, radius, color);
    }









    /***********************************|
    |               API                 |
    |__________________________________*/
    public turnOn = (): void => 
    {
        super.turnOn();   

        this._gui.open();
    }

    public turnOff = (): void => 
    {
        super.turnOn();

        this._gui.close();
    }

    public changeMode = (mode: FireworkMode): void => 
    {
        super.changeMode(mode);
    };

    public trigger = (pos?: THREE.Vector3) => 
    {
        if (pos) 
        { 
            this._createArbitraryFirework(pos) 
            return 
        }

        if ( this._mode === FireworkMode.RANDOM ) this._createRandomFirework()
        if ( this._mode === FireworkMode.MOUSE ) this._createMouseFirework()
    }
}

export default PointFireworkStrategy
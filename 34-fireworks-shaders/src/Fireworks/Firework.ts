import * as THREE from "three";
import IFireworkStrategy from './interfaces/IFireworkStrategy';
import IFirework from "./interfaces/IFirework";
import { FireworkMode } from './types.ts';
import ParticlesFireworkStrategy from './strategies/ParticlesFireworkStrategy.ts';
import GUI from "lil-gui";




class Firework implements IFirework {
    private _strategy: IFireworkStrategy;
    public defaultStrategy: IFireworkStrategy;
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public gui: GUI;

    

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, gui?: GUI) 
    {
        this.scene = scene
        this.camera = camera
        this.gui = gui || new GUI({ width: 340 })

        this.defaultStrategy = new ParticlesFireworkStrategy(this);
        this._strategy = this.defaultStrategy;
        this._strategy.turnOn();
    }



    public changeStrategy(strategy: IFireworkStrategy) 
    {
        this._strategy.turnOff()
        this._strategy = strategy;
        this._strategy.turnOn()
    }

    public changeMode = (mode: FireworkMode) => 
    {
        this._strategy.changeMode( mode );
    }

    public trigger = () => 
    {
        this._strategy.trigger();
    }
}

export default Firework;

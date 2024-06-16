import * as THREE from "three";
import type Firework from "../Firework";
import IFireworkStrategy from "../interfaces/IFireworkStrategy";
import { FireworkMode } from "../types.ts";



abstract class AbstractFireworkStrategy implements IFireworkStrategy {
    protected context: Firework;
    protected scene: THREE.Scene;
    protected mode: number;
    protected textureLoader: THREE.TextureLoader;



    constructor(context: Firework) 
    {
        this.context = context;
        this.scene = context.world.scene;
        this.mode = FireworkMode.RANDOM;
        this.textureLoader = new THREE.TextureLoader();
    }

    abstract turnOn(): void;
    abstract turnOff(): void;
    abstract changeMode(mode: number): void;
    abstract trigger(): void
}

export default AbstractFireworkStrategy
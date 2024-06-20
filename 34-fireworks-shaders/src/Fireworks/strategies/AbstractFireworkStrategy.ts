import * as THREE from "three";
import type Firework from "../Firework";
import IFireworkStrategy from "../interfaces/IFireworkStrategy";
import { FireworkMode } from "../types.ts";
import GUI from "lil-gui";



abstract class AbstractFireworkStrategy implements IFireworkStrategy {
    protected context: Firework;
    protected scene: THREE.Scene;
    protected camera: THREE.PerspectiveCamera;
    protected GUI: GUI;
    protected mode: number;



    constructor(context: Firework) 
    {
        this.context = context;
        this.scene = context.scene;
        this.camera = context.camera;
        this.GUI = context.gui;
        this.mode = FireworkMode.RANDOM;
    }



    abstract turnOn(): void;
    abstract turnOff(): void;
    abstract changeMode(mode: number): void;
    abstract trigger(): void
}

export default AbstractFireworkStrategy
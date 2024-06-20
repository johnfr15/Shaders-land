import * as THREE from "three";
import IFireworkStrategy from './IFireworkStrategy';
import { FireworkMode } from '../types.ts';
import GUI from "lil-gui";

interface IFirework {
    defaultStrategy: IFireworkStrategy;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    gui: GUI;


    changeStrategy(strategy: IFireworkStrategy): void;
    changeMode(mode: FireworkMode): void;
    trigger(): void;
}

export default IFirework
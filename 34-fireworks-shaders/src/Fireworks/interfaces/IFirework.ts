import IFireworkStrategy from './IFireworkStrategy';
import GUI from "lil-gui";
import { World, FireworkMode } from '../types.ts';

interface IFirework {
    defaultStrategy: IFireworkStrategy;
    world: World
    gui: GUI

    changeStrategy(strategy: IFireworkStrategy): void;
    changeMode(mode: FireworkMode): void;
    trigger(): void;
}

export default IFirework
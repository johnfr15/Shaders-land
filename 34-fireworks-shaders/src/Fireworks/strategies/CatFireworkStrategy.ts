import { IFireworkStrategy } from '../interfaces/IFireworkStrategy';
import { FireworkMode } from '../interfaces/IFireworkStrategy';
import type Firework from '../Firework';

export class CatFireworkStrategy implements IFireworkStrategy {
    private firework: Firework;

    constructor(firework: Firework) {
        this.firework = firework;
    }

    public changeMode = (mode: FireworkMode): void =>{

    }
    public trigger = (): void => {}
    public update = (): void => {}
}

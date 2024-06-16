import IFireworkStrategy from './interfaces/IFireworkStrategy';
import IFirework from "./interfaces/IFirework";
import { World, FireworkMode } from './types.ts';
import { DefaultFireworkStrategy } from './strategies/DefaultFireworkStrategy';
import GUI from "lil-gui";


class Firework implements IFirework {
    private _strategy: IFireworkStrategy;
    public defaultStrategy: IFireworkStrategy;
    public world: World
    public gui: GUI
    

    
    constructor(world: World, gui?: GUI) 
    {
        this.world = world
        this.gui = gui || new GUI({ width: 340 })

        this.defaultStrategy = new DefaultFireworkStrategy(this);
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

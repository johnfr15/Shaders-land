import * as THREE from "three";
import type Firework from "../Firework";
import IFireworkStrategy from "../interfaces/IFireworkStrategy";
import { FireworkMode, Window } from "../types.ts";
import GUI from "lil-gui";



abstract class AbstractFireworkStrategy implements IFireworkStrategy {
    protected _context: Firework;
    protected _scene: THREE.Scene;
    protected _camera: THREE.PerspectiveCamera;
    protected _GUI: GUI;
    protected _mode: number;
    protected _mouseCoord: THREE.Vector2
    protected _window!: Window;





    /***********************************|
    |            CONSTRUCTOR            |
    |__________________________________*/
    constructor(context: Firework) 
    {
        this._context = context;
        this._scene = context.scene;
        this._camera = context.camera;
        this._GUI = context.gui;
        this._mode = FireworkMode.RANDOM;
        this._mouseCoord = new THREE.Vector2(0, 0);

        this._initWindow()
    }

    private _initWindow = (): void => 
    {
        const _window: Window = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(window.devicePixelRatio, 2),
            resolution: new THREE.Vector2()
        }
        _window.resolution.set(
            _window.width * _window.pixelRatio, 
            _window.height * _window.pixelRatio
        )

        this._window = _window
    }










    /***********************************|
    |              EVENTS               |
    |__________________________________*/
    private _onMouseClick(e: MouseEvent)
    {
        // Define the position of the mouse on our screen (0, 0) being the middle 
        const x = (e.clientX / window.innerWidth) * 2 - 1; // A value between -1 and 1
        const y = - (e.clientY / window.innerHeight) * 2 + 1; // A value between -1 and 1

        this._mouseCoord = new THREE.Vector2(x, y);
    };

    private _onWindowResize() 
    {
        this._window.width = window.innerWidth;
        this._window.height = window.innerHeight;
        this._window.pixelRatio = Math.min(window.devicePixelRatio, 2);
        this._window.resolution.set(
            this._window.width * this._window.pixelRatio, 
            this._window.height * this._window.pixelRatio
        );
        console.log("resized");
    };










    /***********************************|
    |               API                 |
    |__________________________________*/
    public turnOn(): void 
    {
        window.addEventListener('click', this._onMouseClick, { capture: true }); // With capture set to true it make sure this event is trigger before any other on "click" events
        window.addEventListener('resize', this._onWindowResize);
    }

    public turnOff(): void 
    {
        window.removeEventListener('click', this._onMouseClick);
        window.removeEventListener('resize', this._onWindowResize);
    }

    public changeMode(mode: FireworkMode): void
    {
        this._mode = mode;
        console.log("mode", mode);
    };

    public trigger(): void 
    {
        console.log("BOOM!");
    }
}

export default AbstractFireworkStrategy
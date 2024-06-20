import * as THREE from 'three';

export type Options = {
    name?: string,
    textures?: THREE.Texture[]
}

export type Window = {
    width: number
    height: number
    pixelRatio: number
    resolution: THREE.Vector2
}

export type World = {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
} & { [key: string]: any }

export enum FireworkMode {
    RANDOM,
    MOUSE,
}
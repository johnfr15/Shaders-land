import THREE from "three"

interface IFireworkStrategy {
    turnOn(): void
    turnOff(): void
    changeMode(mode: number): void;
    trigger(pos?: THREE.Vector3): void;
}

export default IFireworkStrategy
interface IFireworkStrategy {
    turnOn(): void
    turnOff(): void
    changeMode(mode: number): void;
    trigger(): void;
}

export default IFireworkStrategy
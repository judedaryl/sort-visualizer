export class CancellationToken {
    private _cancelRequested: boolean = false
    private _pause: boolean = false;

    get cancelRequested(): boolean {
        return this._cancelRequested;
    }

    get paused(): boolean {
        return this._pause;
    }
    stop() {
        this._cancelRequested = true;
    }

    pause(pause: boolean) {
        this._pause = pause;
    }
}

export class DelayToken {
    private _delay: number = 0;
    get delay(): number {
        return this._delay;
    }
    set(delay: number) {
        this._delay = delay;
    }
}
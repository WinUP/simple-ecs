import { ComponentSystem } from '../component-system';
import { ArrayExtension } from '@simple-ecs/runtime-extension';

interface ICoroutineInformation {
    id: number;
    iterator: CoroutineSystem.Coroutine;
    behaviour: number;
    paused?: boolean;
}

/**
 * Manage relation between coroutines and components and also execute each active coroutine per frame
 */
export class CoroutineSystem extends ComponentSystem {
    private static _nextId: number = 0;

    private static isIterator(value: any): value is IterableIterator<any> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return value != null && 'next' in value && typeof value.next === 'function';
    }

    private readonly _adding: ICoroutineInformation[] = [];
    private readonly _running: ICoroutineInformation[] = [];
    private readonly _releasing: number[] = [];
    private readonly _pausing: number[] = [];
    private readonly _resuming: number[] = [];
    private readonly _relations: Map<number, ICoroutineInformation[]> = new Map();

    /**
     * Push given coroutine to adding stack and link it to specific behaviour
     * @param component ID of the component
     * @param iterator Coroutine content
     */
    public startCoroutine(component: number, iterator: CoroutineSystem.Coroutine): number {
        let existed = this._adding.find(e => e.iterator === iterator);
        !existed && (existed = this._running.find(e => e.iterator === iterator));
        if (existed) return existed.id;
        const id = CoroutineSystem._nextId;
        ++CoroutineSystem._nextId;
        this._adding.push({ id, iterator, behaviour: component });
        return id;
    }

    /**
     * Stop and remove all coroutines from coroutine system
     */
    public stopAllCoroutines(): void {
        this._releasing.push(...this._adding.concat(this._running).map(e => e.id));
    }

    /**
     * Stop and remove coroutines that linked to given behaviour
     * @param component ID of the component
     */
    public stopComponentCoroutines(component: number): void {
        this._releasing.push(
            ...this._adding
                .filter(e => e.behaviour === component && !this._releasing.includes(e.id))
                .concat(this._running.filter(e => e.behaviour === component && !this._releasing.includes(e.id)))
                .map(e => e.id)
        );
    }

    /**
     * Stop coroutine by given ID
     * @param id ID of the coroutine
     */
    public stopCoroutine(id: number): void {
        if (this._releasing.includes(id)) return;
        let existed = this._adding.find(e => e.id === id);
        !existed && (existed = this._running.find(e => e.id === id));
        if (!existed) return;
        this._releasing.push(id);
    }

    /**
     * Pause all coroutines from coroutine system
     */
    public pauseAllCoroutines(): void {
        this._adding.forEach(e => (e.paused = true));
        this._running.forEach(e => (e.paused = true));
    }

    /**
     * Pause coroutines that linked to given behaviour
     * @param component ID of the component
     */
    public pauseComponentCoroutines(component: number): void {
        this._adding.forEach(e => e.behaviour === component && this._pausing.push(e.id));
        this._running.forEach(e => e.behaviour === component && this._pausing.push(e.id));
    }

    /**
     * Pause coroutine by given ID
     * @param id ID of the coroutine
     */
    public pauseCoroutine(id: number): void {
        this._pausing.push(id);
    }

    /**
     * Resume all coroutines from coroutine system
     */
    public resumeAllCoroutines(): void {
        this._adding.forEach(e => (e.paused = false));
        this._running.forEach(e => (e.paused = false));
    }

    /**
     * Resume coroutines that linked to given behaviour
     * @param component ID of the component
     */
    public resumeComponentCoroutines(component: number): void {
        this._adding.forEach(e => e.behaviour === component && this._resuming.push(e.id));
        this._running.forEach(e => e.behaviour === component && this._resuming.push(e.id));
    }

    /**
     * Pause coroutine by given ID
     * @param id ID of the coroutine
     */
    public resumeCoroutine(id: number): void {
        this._resuming.push(id);
    }

    protected shouldLinkComponent(): boolean {
        return true;
    }

    protected update(): void {
        if (this._adding.length > 0) {
            this._running.push(...this._adding);
            ArrayExtension.removeAll(this._adding);
        }
        if (this._releasing.length > 0) {
            ArrayExtension.removeAll(this._running, e => this._releasing.includes(e.id));
            if (this._relations.size > 0) {
                for (let i = -1, length = this._releasing.length, id = this._releasing[0]; ++i < length; id = this._releasing[i + 1]) {
                    if (this._relations.has(id)) {
                        this._relations.delete(id);
                    }
                }
                for (const pair of this._relations) {
                    ArrayExtension.removeAll(pair[1], e => this._releasing.includes(e.id));
                    if (pair[1].length < 1) {
                        this._releasing.push(pair[0]);
                        ++length;
                    }
                }
            }
            ArrayExtension.removeAll(this._releasing);
        }
        if (this._pausing.length > 0) {
            const processed: number[] = [];
            for (let i = -1, length = this._pausing.length, id = this._pausing[0]; ++i < length; id = this._pausing[i + 1]) {
                if (processed.includes(id)) continue;
                const running = this.findRelatedRunningId(id, processed);
                running != null && (running.paused = true);
            }
            ArrayExtension.removeAll(this._pausing);
        }
        if (this._resuming.length > 0) {
            const processed: number[] = [];
            for (let i = -1, length = this._resuming.length, id = this._resuming[0]; ++i < length; id = this._resuming[i + 1]) {
                if (processed.includes(id)) continue;
                const running = this.findRelatedRunningId(id, processed);
                running != null && (running.paused = false);
            }
            ArrayExtension.removeAll(this._resuming);
        }
        // * Sub-coroutine will start on next cycle
        // * Related coroutines for sub-coroutine will start on same cycle when sub-coroutine finished
        // * Finished coroutine will remove before start next cycle
        for (let i = -1, length = this._running.length, coroutine = this._running[0]; ++i < length; coroutine = this._running[i + 1]) {
            if (coroutine.paused) continue;
            const result = coroutine.iterator.next();
            if (CoroutineSystem.isIterator(result.value)) {
                const newId = this.startCoroutine(coroutine.behaviour, result.value);
                if (this._relations.has(newId)) {
                    this._relations.get(newId)?.push(coroutine);
                } else {
                    this._relations.set(newId, [coroutine]);
                }
                ArrayExtension.removeAt(this._running, i);
                --length;
                --i;
            } else {
                if (result.done) {
                    this.stopCoroutine(coroutine.id);
                    this._adding.forEach(e => e.iterator.onCoroutineFinished?.(coroutine.iterator));
                    this._running.forEach(e => e.iterator.onCoroutineFinished?.(coroutine.iterator));
                    if (this._relations.has(coroutine.id)) {
                        const relations = this._relations.get(coroutine.id);
                        this._relations.delete(coroutine.id);
                        if (relations) {
                            this._running.push(...relations);
                            length += relations.length;
                        }
                    }
                }
            }
        }
    }

    private findRelatedRunningId(id: number, processed: number[]): ICoroutineInformation | undefined {
        processed.push(id);
        const existed = this._running.find(e => e.id === id);
        if (existed) return existed;
        if (this._relations.size < 1) return undefined;
        for (const pair of this._relations.entries()) {
            if (pair[1].some(e => e.id === id)) {
                return this.findRelatedRunningId(pair[0], processed);
            } else {
                return undefined;
            }
        }
        return undefined;
    }
}

export namespace CoroutineSystem {
    /**
     * Special kind of generator that act as coroutine and runs by component system
     */
    export type Coroutine = IterableIterator<void | Coroutine> & { onCoroutineFinished?(coroutine: Coroutine): void };

    class NextFrameIterator implements Coroutine {
        private static readonly result: IteratorResult<void> = { value: undefined, done: true };

        public [Symbol.iterator](): Coroutine {
            return this;
        }

        public next(): IteratorResult<void> {
            return NextFrameIterator.result;
        }
    }
    const nextFrameIterator = new NextFrameIterator();

    class WaitIterator implements Coroutine {
        private readonly destination: number;
        private readonly result: IteratorResult<void> = { value: undefined, done: false };

        public constructor(time: number) {
            this.destination = Date.now() + time;
        }

        public [Symbol.iterator](): Coroutine {
            return this;
        }

        public next(): IteratorResult<void> {
            if (Date.now() >= this.destination) {
                this.result.done = true;
            }
            return this.result;
        }
    }

    class WaitFrameIterator implements Coroutine {
        private count: number = 0;
        private readonly destination: number;
        private readonly result: IteratorResult<void> = { value: undefined, done: false };

        public constructor(destination: number) {
            this.destination = destination;
        }

        public [Symbol.iterator](): Coroutine {
            return this;
        }

        public next(): IteratorResult<void> {
            ++this.count;
            if (this.count >= this.destination) {
                this.result.done = true;
            }
            return this.result;
        }
    }

    class WaitPromiseIterator implements Coroutine {
        private readonly result: IteratorResult<void> = { value: undefined, done: false };

        public constructor(awaiter: Promise<any>) {
            awaiter.then(() => (this.result.done = true));
        }

        public [Symbol.iterator](): Coroutine {
            return this;
        }

        public next(): IteratorResult<void> {
            return this.result;
        }
    }

    class WaitAllIterator implements Coroutine {
        private readonly targets: Coroutine[];
        private readonly result: IteratorResult<void> = { value: undefined, done: false };

        public constructor(...targets: Coroutine[]) {
            this.targets = targets;
        }

        public [Symbol.iterator](): Coroutine {
            return this;
        }

        public next(): IteratorResult<void> {
            return this.result;
        }

        public onCoroutineFinished(coroutine: Coroutine): void {
            ArrayExtension.remove(this.targets, coroutine);
            this.targets.length < 1 && (this.result.done = true);
        }
    }

    class WaitAnyIterator implements Coroutine {
        private readonly targets: Coroutine[];
        private readonly result: IteratorResult<void> = { value: undefined, done: false };

        public constructor(...targets: Coroutine[]) {
            this.targets = targets;
        }

        public [Symbol.iterator](): Coroutine {
            return this;
        }

        public next(): IteratorResult<void> {
            return this.result;
        }

        public onCoroutineFinished(coroutine: Coroutine): void {
            if (this.targets.includes(coroutine)) {
                this.result.done = true;
                ArrayExtension.clear(this.targets);
            }
        }
    }

    /**
     * Create a coroutine that will finish in next frame
     */
    export function nextFrame(): Coroutine {
        return nextFrameIterator;
    }

    /**
     * Create a coroutine that will finish after given milliseconds
     * @param time Total milliseconds
     */
    export function wait(time: number): Coroutine {
        return new WaitIterator(time);
    }

    /**
     * Create a coroutine that will finish after given frames
     * @param count Frame count
     */
    export function frame(count: number): Coroutine {
        return new WaitFrameIterator(count);
    }

    /**
     * Create a coroutine that will finish when given awaiter finished without error
     * @param awaiter Promise object
     */
    export function fromPromise(awaiter: Promise<any>): Coroutine {
        return new WaitPromiseIterator(awaiter);
    }

    /**
     * Create a coroutine that will finish when all given coroutines finished
     * @param coroutines Coroutines that should wait
     */
    export function all(...coroutines: Coroutine[]): Coroutine {
        return new WaitAllIterator(...coroutines);
    }

    /**
     * Create a coroutine that will finish when any of given coroutines finished
     * @param coroutines Coroutines that should wait
     */
    export function any(...coroutines: Coroutine[]): Coroutine {
        return new WaitAnyIterator(...coroutines);
    }
}

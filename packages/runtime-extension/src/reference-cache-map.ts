import type { Entries } from './runtime.model';

/**
 * Map that hold and clean data by reference count
 */
export class ReferenceCacheMap<K, V> extends Map<K, V> {
    /**
     * Cache entry maximum capacity (change this value will cause one time garbage collection)
     */
    public get capacity(): number {
        return this._capacity;
    }
    public set capacity(value: number) {
        this._capacity = value;
        this.clean();
    }

    /**
     * Cache entry maximum live time in milliseconds (change this value will cause one time garbage collection)
     */
    public get liveTime(): number | undefined {
        return this._liveTime;
    }
    public set liveTime(value: number | undefined) {
        this._liveTime = value;
        this.clean();
    }

    private readonly caches: Map<K, { references: number; touchTime: number }> = new Map();
    private _capacity: number;
    private _liveTime?: number;

    /**
     * Create new `ReferenceCache` with given size
     * @param capacity Cache entry maximum capacity
     * @param liveTime Cache entry maximum live time in milliseconds, noticed that only set/free will trigger garbage collector
     * @param entries Initial entries
     */
    public constructor(capacity: number, liveTime?: number, entries?: Entries<K, V> | null) {
        super();
        this._capacity = capacity;
        this._liveTime = liveTime;
        entries?.forEach(e => this.set(e[0], e[1]));
    }

    /**
     * Push item to cache map
     * @param key Key of the item
     * @param value Content of the item
     */
    public set(key: K, value: V): this {
        if (this.has(key)) throw new ReferenceError(`Unable to add cache: key ${key} conflict`);
        super.set(key, value);
        this.caches.set(key, { references: 1, touchTime: Date.now() });
        this.clean();
        return this;
    }

    /**
     * Read item from cache map, plus reference count of that item by 1 and also update the touch time.
     * @param key Key of the item
     */
    public get(key: K): V | undefined {
        const cache = this.caches.get(key);
        if (cache == null) return undefined;
        ++cache.references;
        cache.touchTime = Date.now();
        return super.get(key);
    }

    /**
     * Reduce reference count of data by 1, call remove when reduced to 0.
     * @param key Data key
     */
    public free(key: K): void {
        const cache = this.caches.get(key);
        if (cache == null) return;
        --cache.references;
        this.clean();
    }

    /**
     * Force delete items from the cache map
     * @param key Key of the item
     */
    public delete(key: K): boolean {
        const cache = this.caches.get(key);
        if (cache == null) return false;
        this.caches.delete(key);
        return super.delete(key);
    }

    /**
     * Remove everything form the cache map
     */
    public clear(): void {
        this.caches.clear();
        super.clear();
    }

    /**
     * Remove inactive items from cache
     * @param skipIfNotFull Only clean if cache is full (default `true`)
     */
    public clean(skipIfNotFull: boolean = true): void {
        const now = Date.now();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            if (skipIfNotFull && this.caches.size < this._capacity) return;
            let target: { references: number; touchTime: number } | undefined;
            let targetKey: K | undefined;
            for (const [key, item] of this.caches.entries()) {
                if (
                    (item.references < 1 || (this._liveTime != null && now - item.touchTime > this._liveTime)) &&
                    (!target || target.touchTime > item.touchTime)
                ) {
                    target = item;
                    targetKey = key;
                }
            }
            if (!target) break;
            targetKey != null && this.delete(targetKey);
        }
    }
}

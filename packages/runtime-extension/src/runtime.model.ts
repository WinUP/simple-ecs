/**
 * Mark instance as disposable
 */
export interface IDisposable {
    /**
     * Release resources using by this instance
     */
    dispose(): void;
}

/**
 * Mark instance as initializable
 */
export interface IInitializable {
    /**
     * Initialize resources of this instance
     */
    initialize(): void;
}

/**
 * Mark instance as freezable
 */
export interface IFreezable {
    /**
     * Indicate if instance is freezing
     */
    readonly isFrozen: boolean;

    /**
     * Freeze this instance. Once froze, only instance itself can cancel this state.
     */
    freeze(): void;
}

/**
 * Structure that presents 2D point
 */
export interface IPoint2D {
    /**
     * X coordinate
     */
    x: number;

    /**
     * Y coordinate
     */
    y: number;
}

/**
 * Structure that presents 3D point
 */
export interface IPoint3D {
    /**
     * X coordinate
     */
    x: number;

    /**
     * Y coordinate
     */
    y: number;

    /**
     * Z coordinate
     */
    z: number;
}

export type Entries<K, V> = readonly (readonly [K, V])[];
export type ExcludeKeys<T, U> = { [P in Exclude<keyof T, U>]: T[P] };

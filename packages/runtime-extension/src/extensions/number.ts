export namespace NumberExtension {
    /**
     * Indicate if number is in given range (bigger or equal to min and lesser than max)
     * @param source Target source value
     * @param min Min bound
     * @param max Max bound
     */
    export function inRange(source: number, min: number, max: number): boolean {
        return source >= min && source < max;
    }

    /**
     * Returns a number whose value is limited to the given range based on current value
     * @param source Target source value
     * @param min The lower boundary
     * @param max The upper boundary
     */
    export function clamp(source: number, min: number, max: number): number {
        return source < min ? min : source > max ? max : source;
    }

    /**
     * Return mod result of given data, make sure result is always between 0 and base number,
     * use circulate value if out of range.
     * @param source Target source value
     * @param base Target base value
     */
    export function circulateMod(source: number, base: number): number {
        return ((source % base) + base) % base;
    }
}

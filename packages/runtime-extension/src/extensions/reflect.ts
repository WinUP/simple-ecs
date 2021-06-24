export namespace ReflectExtension {
    /**
     * Judge if source is function type
     * @param source Target source value
     */
    export function isFunction(source: any): source is Function {
        const value = Object.prototype.toString.call(source);
        return (
            source != null &&
            (typeof source === 'object' || typeof source === 'function') &&
            (value === '[object Function]' ||
                value === '[object AsyncFunction]' ||
                value === '[object GeneratorFunction]' ||
                value === '[object Proxy]')
        );
    }

    const objectProto = Object.getPrototypeOf(Object) as Object;

    /**
     * Judge if source is inherit from base
     * @param source Instance or constructor of source object
     * @param base Instance or constructor of base object
     * @returns
     */
    export function isInherit(source: Object, base: Object): boolean {
        base = isFunction(base) ? base : base.constructor;
        source = isFunction(source) ? source : source.constructor;
        do {
            if (source === base) return true;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source = Object.getPrototypeOf(source);
        } while (source !== Object.prototype && source !== objectProto);
        return false;
    }

    /**
     * Call handler on target
     * @param target Target object
     * @param handler Handler function
     */
    export function wrap<T>(target: T, handler?: (target: T) => void): T {
        handler?.call(target, target);
        return target;
    }
}

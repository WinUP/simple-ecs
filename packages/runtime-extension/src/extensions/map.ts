import type { Entries } from '../runtime.model';

export namespace MapExtension {
    /**
     * Put a group of entries to map
     * @param source Target source value
     * @param entries Entries
     */
    export function setGroup<K, V>(source: Map<K, V>, entries: Entries<K, V>): Map<K, V> {
        entries.forEach(e => source.set(e[0], e[1]));
        return source;
    }

    /**
     * Return recorded value if key is stored, or create new record with given key and value then return the value
     * @param source Target source value
     * @param key Key of the record
     * @param value Value of the record
     */
    export function ensure<K, V>(source: Map<K, V>, key: K, value: V): V {
        if (source.has(key)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return source.get(key)!;
        } else {
            source.set(key, value);
            return value;
        }
    }

    /**
     * Run function on given key, use value that returns by function as new value of that key
     * @param source Target source value
     * @param key Entry's key
     * @param modifier Function that accepts old value and returns new value
     */
    export function modify<K, V>(source: Map<K, V>, key: K, modifier: (value: V) => V): void {
        if (!source.has(key)) return;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        source.set(key, modifier.call(source, source.get(key)!));
    }
}

export namespace ArrayExtension {
    /**
     * Direct return if input is array, otherwise create a new array that contains input
     * @param element Input element
     */
    export function asArray<T>(element?: T | T[]): T[] {
        return element != null ? (Array.isArray(element) ? element : [element]) : [];
    }

    /**
     * Appends new elements to an array if not contains in current array, and returns the new length of the array.
     * @param source Target source value
     * @param elements New elements of the Array.
     */
    export function pushIfNotContains<T>(source: T[], ...elements: T[]): number {
        elements.forEach(e => !source.includes(e) && source.push(e));
        return source.length;
    }

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param source Target source value
     * @param predicate findOrCreate calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, findOrCreate
     * immediately returns that element value. Otherwise, push newValue to the end of array and return.
     * @param newValue Item for create if not found
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    export function findOrCreate<T, S extends T>(
        source: T[],
        predicate: (this: void, value: T, index: number, obj: T[]) => value is S,
        newValue: S,
        thisArg?: any
    ): S | undefined;
    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param source Target source value
     * @param predicate findOrCreate calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, findOrCreate
     * immediately returns that element value. Otherwise, push newValue to the end of array and return.
     * @param newValue Item for create if not found
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    export function findOrCreate<T>(
        source: T[],
        predicate: (value: T, index: number, obj: T[]) => boolean,
        newValue: T,
        thisArg?: any
    ): T | undefined;
    export function findOrCreate<T>(
        source: T[],
        predicate: (value: T, index: number, obj: T[]) => boolean,
        newValue: T,
        thisArg?: any
    ): any {
        const target = source.find(predicate, thisArg);
        if (target === undefined) {
            source.push(newValue);
            return newValue;
        } else {
            return target;
        }
    }

    /**
     * Performs the specified action for each element in reversed sequence in an array.
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function forEachReverse<T>(source: T[], callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
    /**
     * Performs the specified action for each element in reversed sequence in an array.
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function forEachReverse<T>(
        source: readonly T[],
        callbackfn: (value: T, index: number, array: readonly T[]) => void,
        thisArg?: any
    ): void;
    export function forEachReverse<T>(
        source: T[] | readonly T[],
        callbackfn: (value: T, index: number, array: T[]) => void,
        thisArg?: any
    ): void {
        for (let i = source.length; --i > -1; ) {
            callbackfn.call(thisArg, source[i], i, source as any[]);
        }
    }

    /**
     * Returns the value of the last element in the array where predicate is true, and undefined
     * otherwise.
     * @param source Target source value
     * @param predicate findLast calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, findLast
     * immediately returns that element value. Otherwise, findLast returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    export function findLast<T, S extends T>(
        source: T[],
        predicate: (this: void, value: T, index: number, obj: T[]) => value is S,
        thisArg?: any
    ): S | undefined;
    /**
     * Returns the value of the last element in the array where predicate is true, and undefined
     * otherwise.
     * @param source Target source value
     * @param predicate findLast calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, findLast
     * immediately returns that element value. Otherwise, findLast returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    export function findLast<T, S extends T>(
        source: readonly T[],
        predicate: (this: void, value: T, index: number, obj: readonly T[]) => value is S,
        thisArg?: any
    ): S | undefined;
    /**
     * Returns the value of the last element in the array where predicate is true, and undefined
     * otherwise.
     * @param source Target source value
     * @param predicate findLast calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, findLast
     * immediately returns that element value. Otherwise, findLast returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    export function findLast<T>(source: T[], predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined;
    /**
     * Returns the value of the last element in the array where predicate is true, and undefined
     * otherwise.
     * @param source Target source value
     * @param predicate findLast calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, findLast
     * immediately returns that element value. Otherwise, findLast returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    export function findLast<T>(
        source: readonly T[],
        predicate: (value: T, index: number, obj: readonly T[]) => boolean,
        thisArg?: any
    ): T | undefined;
    export function findLast<T>(
        source: T[] | readonly T[],
        predicate: (value: T, index: number, obj: T[]) => boolean,
        thisArg?: any
    ): T | undefined {
        for (let i = source.length; --i > -1; ) {
            if (predicate.call(thisArg, source[i], i, source as any[])) {
                return source[i];
            }
        }
        return undefined;
    }

    /**
     * Returns the index of the last element in the array where predicate is true, and -1
     * otherwise.
     * @param source Target source value
     * @param predicate findLastIndex calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    export function findLastIndex<T>(source: T[], predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): number;
    /**
     * Returns the index of the last element in the array where predicate is true, and -1
     * otherwise.
     * @param source Target source value
     * @param predicate findLastIndex calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    export function findLastIndex<T>(
        source: readonly T[],
        predicate: (value: T, index: number, obj: readonly T[]) => boolean,
        thisArg?: any
    ): number;
    export function findLastIndex<T>(
        source: T[] | readonly T[],
        predicate: (value: T, index: number, obj: T[]) => boolean,
        thisArg?: any
    ): number {
        for (let i = source.length; --i > -1; ) {
            if (predicate.call(thisArg, source[i], i, source as any[])) return i;
        }
        return -1;
    }

    /**
     * Returns the elements of an array and its child arrays that meet the condition specified in a callback function recursively.
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function filterDeep<T, S extends T>(
        source: T[],
        callbackfn: (value: T, index: number, array: T[]) => value is S,
        thisArg?: any
    ): S[];
    /**
     * Returns the elements of an array and its child arrays that meet the condition specified in a callback function recursively.
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function filterDeep<T, S extends T>(
        source: readonly T[],
        callbackfn: (value: T, index: number, array: readonly T[]) => value is S,
        thisArg?: any
    ): S[];
    /**
     * Returns the elements of an array and its child arrays that meet the condition specified in a callback function recursively.
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function filterDeep<T>(source: T[], callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[];
    /**
     * Returns the elements of an array and its child arrays that meet the condition specified in a callback function recursively.
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function filterDeep<T>(
        source: readonly T[],
        callbackfn: (value: T, index: number, array: readonly T[]) => boolean,
        thisArg?: any
    ): T[];
    export function filterDeep<T>(
        source: T[] | readonly T[],
        callbackfn: (value: T, index: number, array: T[]) => boolean,
        thisArg?: any
    ): T[] {
        let result: T[] = [];
        for (let i = -1, length = source.length; ++i < length; ) {
            const item = source[i];
            if (Array.isArray(item)) {
                const subCollection = filterDeep(item, callbackfn, thisArg);
                subCollection.length > 0 && (result = result.concat(subCollection));
            } else {
                callbackfn.call(thisArg, item, i, source as any[]) && result.push(item);
            }
        }
        return result;
    }

    /**
     * Performs the specified action for each element in an array and its child arrays recursively.
     * @param source Target source value
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function forEachDeep<T>(source: T[], callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
    /**
     * Performs the specified action for each element in an array and its child arrays recursively.
     * @param source Target source value
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function forEachDeep<T>(
        source: readonly T[],
        callbackfn: (value: T, index: number, array: readonly T[]) => void,
        thisArg?: any
    ): void;
    export function forEachDeep<T>(
        source: T[] | readonly T[],
        callbackfn: (value: T, index: number, array: T[]) => void,
        thisArg?: any
    ): void {
        for (let i = -1, length = source.length; ++i < length; ) {
            const item = source[i];
            if (Array.isArray(item)) {
                forEachDeep(item, callbackfn, thisArg);
            } else {
                callbackfn.call(thisArg, item, i, source as any[]);
            }
        }
    }

    /**
     * Insert new elements to given position of array
     * @param source Target source value
     * @param index Index that new elements should insert to
     * @param values Elements that need to insert
     */
    export function insert<T>(source: T[], index: number, ...values: T[]): void {
        source.splice(index, 0, ...values);
    }

    /**
     * Insert new elements to position of array that first matches prediction
     * @param source Target source value
     * @param predicate insertWhen calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found.
     * @param value Element that need to insert
     */
    export function insertWhen<T>(source: T[], predicate: (value: T, index: number, obj: T[]) => boolean, value: T): void {
        const index = source.findIndex(predicate);
        if (index < 0) {
            source.push(value);
        } else {
            insert(source, index, value);
            ++length;
        }
    }

    /**
     * Remove element from array
     * @param source Target source value
     * @param value Element that should be removed
     */
    export function remove<T>(source: T[], value: T): T {
        const index = source.indexOf(value);
        index > -1 && source.splice(index, 1);
        return value;
    }

    /**
     * Remove element at given index from array
     * @param source Target source value
     * @param index Element index that should be removed
     */
    export function removeAt<T>(source: T[], index: number): T | undefined {
        let result: T | undefined = undefined;
        if (index > -1 && index < source.length) {
            result = source[index];
            source.splice(index, 1);
            return result;
        }
        return result;
    }

    /**
     * Remove first elements that matches prediction in array
     * @param source Target source value
     * @param predicate removeWhen calls predicate once for each element of the array, in ascending
     * order, until mapped one item. If predicate returns true, mapping item will be removed.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    export function removeWhen<T>(source: T[], predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined {
        for (let i = -1, length = source.length; ++i < length; ) {
            if (predicate.call(thisArg, source[i], i, source)) return source.splice(i, 1)[0];
        }
    }

    /**
     * Remove all elements in array
     * @param source Target source value
     * @param predicate removeAll calls predicate once for each element of the array, in ascending
     * order, until mapped every items. If predicate returns true, mapping item will be removed.
     * Notice that remove applies after map, so that index is always the correct index of item.
     * If predicate not given, all items will be removed.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    export function removeAll<T>(source: T[], predicate?: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T[] {
        if (predicate) {
            const targets: number[] = [];
            const result: T[] = [];
            for (let i = -1, length = source.length; ++i < length; ) {
                if (predicate.call(thisArg, source[i], i, source)) {
                    targets.push(i);
                    result.push(source[i]);
                }
            }
            for (let i = -1, length = targets.length; ++i < length; ) source.splice(targets[i] - i, 1);
            return result;
        } else {
            return source.splice(0, source.length);
        }
    }

    /**
     * Add all elements missing in this current from destination array, remove all elements that not existed in given array from current array
     * @param source Target source value
     * @param destination Array that contains destination elements
     */
    export function update<T>(source: T[], destination: T[]): T[] {
        const cache = new Set(source);
        destination.forEach(e => (cache.has(e) ? cache.delete(e) : source.push(e)));
        cache.forEach(handler => remove(source, handler));
        return source;
    }

    /**
     * Clear current array then add all elements from data array to current array
     * @param source Target source value
     * @param data Array that contains new elements
     */
    export function use<T>(source: T[], data: T[]): number {
        clear(source);
        source.push(...data);
        return source.length;
    }

    /**
     * Remove all elements in array (shortcut of no parameter call of `removeAll`)
     * @param source Target source value
     */
    export function clear<T>(source: T[]): T[] {
        return removeAll(source);
    }

    /**
     * Calls a defined callback function on each element of an array, and returns the sum number of all results
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function sum<T>(source: T[], callbackfn?: (value: T, index: number, array: T[]) => number, thisArg?: any): number;
    /**
     * Calls a defined callback function on each element of an array, and returns the sum number of all results
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function sum<T>(
        source: readonly T[],
        callbackfn?: (value: T, index: number, array: readonly T[]) => number,
        thisArg?: any
    ): number;
    export function sum<T>(
        source: T[] | readonly T[],
        callbackfn?: (value: T, index: number, array: T[]) => number,
        thisArg?: any
    ): number {
        return callbackfn
            ? (source as T[]).map(callbackfn, thisArg).reduce((p, c) => +p + +c, 0)
            : (source as T[]).reduce((p, c) => +p + +c, 0);
    }

    /**
     * Calls a defined callback function on each element of an array, and returns the minimum number of all results
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function min<T>(source: T[], callbackfn?: (value: T, index: number, array: T[]) => number, thisArg?: any): number;
    /**
     * Calls a defined callback function on each element of an array, and returns the minimum number of all results
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function min<T>(
        source: readonly T[],
        callbackfn?: (value: T, index: number, array: readonly T[]) => number,
        thisArg?: any
    ): number;
    export function min<T>(
        source: T[] | readonly T[],
        callbackfn?: (value: T, index: number, array: T[]) => number,
        thisArg?: any
    ): number {
        return callbackfn ? Math.min(...(source as T[]).map(callbackfn, thisArg)) : Math.min(...(source as any[]));
    }

    /**
     * Calls a defined callback function on each element of an array, and returns the maximum number of all results
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function max<T>(source: T[], callbackfn?: (value: T, index: number, array: T[]) => number, thisArg?: any): number;
    /**
     * Calls a defined callback function on each element of an array, and returns the maximum number of all results
     * @param source Target source value
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    export function max<T>(
        source: readonly T[],
        callbackfn?: (value: T, index: number, array: readonly T[]) => number,
        thisArg?: any
    ): number;
    export function max<T>(
        source: T[] | readonly T[],
        callbackfn?: (value: T, index: number, array: T[]) => number,
        thisArg?: any
    ): number {
        return callbackfn ? Math.max(...(source as T[]).map(callbackfn, thisArg)) : Math.max(...(source as any[]));
    }

    /**
     * Get the last element of array
     * @param source Target source value
     */
    export function last<T>(source: T[]): T | undefined {
        return source.length > 0 ? source[source.length - 1] : undefined;
    }

    /**
     * Get the first element of array
     * @param source Target source value
     */
    export function first<T>(source: T[]): T | undefined {
        return source[0];
    }

    /**
     * Makes a shallow copy of the array
     * @param source Target source value
     */
    export function clone<T>(source: T[]): T[];
    /**
     * Makes a shallow copy of the array
     * @param source Target source value
     */
    export function clone<T>(source: readonly T[]): readonly T[];
    export function clone<T>(source: T[] | readonly T[]): T[] {
        return source.slice(0);
    }

    /**
     * Checks whether the two arrays contains same element recursively
     * @param source Target source value
     * @param array Target array
     */
    export function equals<T>(source: T[] | readonly T[], array?: T[] | readonly T[]): boolean {
        if (array == null || source.length !== array.length) return false;
        for (let i = -1, length = source.length; ++i < length; ) {
            const item = source[i];
            const target = array[i];
            if (Array.isArray(item) && Array.isArray(target)) {
                if (!equals(item, target)) return false;
            } else if (item !== target) {
                return false;
            }
        }
        return true;
    }
}

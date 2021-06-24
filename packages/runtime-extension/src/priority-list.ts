import { ArrayExtension } from './extensions';

/**
 * Queue that sorted elements in ascending order based on comparator function
 */
export class PriorityList<T, U = number> implements Iterable<[T, U]> {
    /**
     * Gets or sets the length of the queue. This is a number one higher than the highest element defined in an queue.
     */
    public get length(): number {
        return this._values.length;
    }

    /**
     * Get the list of priorities
     */
    public get priorities(): readonly U[] {
        return this._priorities;
    }

    /**
     * Get the list of values
     */
    public get values(): readonly T[] {
        return this._values;
    }

    private readonly _priorities: U[] = [];
    private readonly _values: T[] = [];
    private readonly comparator: (a: U, b: U) => number;

    /**
     * Create new priority queue
     * @param comparator Priority comparator, default use numeric comparator.
     */
    public constructor(comparator: (a: U, b: U) => number = (a, b) => +a - +b) {
        this.comparator = comparator;
    }

    public [Symbol.iterator](): IterableIterator<[T, U]> {
        return this.createIterator();
    }

    /**
     * Get the item with priority in given index
     * @param index Item's index
     */
    public get(index: number): [T, U] | undefined {
        return index < 0 || index >= this.length ? undefined : [this._values[index], this._priorities[index]];
    }

    /**
     * Returns a string representation of the queue
     */
    public toString(): string {
        return this.join();
    }

    /**
     * Returns an array that contains values and priorities in separate arrays
     */
    public toArrayCompact(): [T[], U[]] {
        return [ArrayExtension.clone(this._values), ArrayExtension.clone(this._priorities)];
    }

    /**
     * Returns an array that contains values and priorities in pairs
     */
    public toArray(): [T, U][] {
        return Array.from(this);
    }

    /**
     * Use give priority to predict the position of any item with given priority
     * @param priority Target priority
     * @param allowUnknownValue Has no effect if given priority is inside queue
     * Otherwise, return `-1` if value is `false`, or return the index that the priority should be at.
     */
    public predictIndex(priority: U, allowUnknownValue: boolean = true): number {
        if (this._priorities.length < 1) return 0;
        if (this._priorities.length === 1) return this.comparator(priority, this._priorities[0]) < 0 ? 0 : 1;
        let start: number = 0;
        let end: number = this._priorities.length - 1;
        if (this.comparator(priority, this._priorities[start]) < 0) return start;
        if (this.comparator(priority, this._priorities[end]) >= 0) return end + 1;
        while (start < end && this._priorities[start] === this._priorities[start + 1]) {
            ++start;
        }
        while (start < end) {
            if (this.comparator(priority, this._priorities[start]) === 0) return start;
            if (this.comparator(priority, this._priorities[end]) === 0) return end;
            if (end - start < 2) return allowUnknownValue ? start : -1;
            let middle = ~~(start + (end - start) / 2);
            while (middle < end - 1 && this._priorities[middle] === this._priorities[middle + 1]) {
                ++middle;
            }
            if (this.comparator(priority, this._priorities[middle]) === 0) return middle;
            if (this.comparator(priority, this._priorities[middle]) < 0) end = middle;
            else if (this.comparator(priority, this._priorities[middle]) > 0) start = middle;
        }
        return -1;
    }

    /**
     * Removes the last element from the queue and returns it with the priority
     */
    public pop(): [T, U] | undefined {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.length > 0 ? [this._values.pop()!, this._priorities.pop()!] : undefined;
    }

    /**
     * Appends new element to the queue, and returns the new length of the queue.
     * @param item New element
     * @param priority Element's priority
     */
    public push(item: T, priority: U): number {
        const index = this.predictIndex(priority);
        ArrayExtension.insert(this._values, index, item);
        ArrayExtension.insert(this._priorities, index, priority);
        return this.length;
    }

    /**
     * Appends new element to the queue, and returns the new length of the queue.
     * @param item New element and its priority
     */
    public pushEntry(item: [T, U]): number {
        return this.push(item[0], item[1]);
    }

    /**
     * Combines two priority queues and return the result as new priority queue
     * @param items Target queue
     */
    public concat(items: PriorityList<T, U>): PriorityList<T, U>;
    /**
     * Create a copy of current priority queue then push elements to it and return it as result
     * @param items New elements
     * @param priorityGenerator Function to generate priority for new elements
     * @param thisArg An object to which the this keyword can refer in the priorityGenerator function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    public concat(items: T[], priorityGenerator: (item: T, index: number) => U, thisArg?: any): PriorityList<T, U>;
    public concat(items: PriorityList<T, U> | T[], priorityGenerator?: (item: T, index: number) => U, thisArg?: any): PriorityList<T, U> {
        const result: PriorityList<T, U> = this.clone();
        if ('_values' in items && '_priorities' in items) {
            for (let i = -1, length = items._values.length; ++i < length; ) {
                result.push(items._values[i], items._priorities[i]);
            }
        } else {
            if (priorityGenerator == null)
                throw new ReferenceError(`Priority generator must be provided when push raw item to PriorityList`);
            for (let i = -1, length = items.length; ++i < length; ) {
                result.push(items[i], priorityGenerator.call(thisArg, items[i], i));
            }
        }
        return result;
    }

    /**
     * Makes a shallow copy of the queue
     */
    public clone(): PriorityList<T, U> {
        const result: PriorityList<T, U> = new PriorityList();
        for (let i = -1, length = this.length; ++i < length; ) {
            result._priorities[i] = this._priorities[i];
            result._values[i] = this._values[i];
        }
        return result;
    }

    /**
     * Adds all the elements of the queue separated by the specified separator string
     * @param separator A string used to separate one element of the queue from the next in the resulting String.
     * If omitted, the array elements are separated with a comma.
     */
    public join(separator: string = ','): string {
        return this._values.map((e, i) => `{${this._priorities[i]}, ${e}}`).join(separator);
    }

    /**
     * Removes the first element from the queue and returns it as value-priority pair
     */
    public shift(): [T, U] | undefined {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.length > 0 ? [this._values.shift()!, this._priorities.shift()!] : undefined;
    }

    /**
     * Returns a section of the queue
     * @param start The beginning of the specified portion of the queue
     * @param end The end of the specified portion of the queue. This is exclusive of the element at the index 'end'.
     */
    public slice(start?: number, end?: number): PriorityList<T, U> {
        start = start == null || start < 0 ? 0 : start;
        end = end == null || end > this.length ? this.length : end;
        const result: PriorityList<T, U> = new PriorityList();
        for (let i = start - 1; ++i < end; ) {
            result._priorities[i] = this._priorities[i];
            result._values[i] = this._values[i];
        }
        return result;
    }

    /**
     * Removes elements from the queue and, if necessary, inserts new elements, returning the deleted elements.
     * @param start The zero-based location in the queue from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items Elements to insert into the queue, positions will be decided by priorities.
     */
    public splice(start: number, deleteCount: number, ...items: [T, U][]): [T, U][] {
        const values = this._values.splice(start, deleteCount);
        const priorities = this._priorities.splice(start, deleteCount);
        if (items.length > 0) {
            items.forEach(e => this.pushEntry(e));
        }
        return priorities.map((e, i) => [values[i], e]);
    }

    /**
     * Returns the index of the first occurrence of a value in the queue
     * @param searchElement The value to locate in the queue
     * @param fromIndex The queue index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
     */
    public indexOf(searchElement: T, fromIndex?: number): number {
        return this._values.indexOf(searchElement, fromIndex);
    }

    /**
     * Returns the index of the last occurrence of a specified value in the queue
     * @param searchElement The value to locate in the queue
     * @param fromIndex The queue index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the queue.
     */
    public lastIndexOf(searchElement: T, fromIndex?: number): number {
        return this._values.lastIndexOf(searchElement, fromIndex);
    }

    /**
     * Determines whether all the members of the queue satisfy the specified test
     * @param callbackfn A function that accepts up to three arguments. The every method calls
     * the callbackfn function for each element in the queue with its priority until the callbackfn returns a value
     * which is coercible to the Boolean value false, or until the end of the queue.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    public every(callbackfn: (value: T, priority: U, index: number) => unknown, thisArg?: any): boolean {
        for (let i = -1, length = this.length; ++i < length; ) {
            if (!Boolean(callbackfn.call(thisArg, this._values[i], this._priorities[i], i))) return false;
        }
        return true;
    }

    /**
     * Determines whether the specified callback function returns true for any element of the queue
     * @param callbackfn A function that accepts up to three arguments. The some method calls
     * the callbackfn function for each element in the queue until the callbackfn returns a value
     * which is coercible to the Boolean value true, or until the end of the queue.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    public some(callbackfn: (value: T, priority: U, index: number) => unknown, thisArg?: any): boolean {
        for (let i = -1, length = this.length; ++i < length; ) {
            if (Boolean(callbackfn.call(thisArg, this._values[i], this._priorities[i], i))) return true;
        }
        return false;
    }

    /**
     * Performs the specified action for each element in the queue
     * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the queue.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    public forEach(callbackfn: (value: T, priority: U, index: number) => void, thisArg?: any): void {
        for (let i = -1, length = this.length; ++i < length; ) {
            callbackfn.call(thisArg, this._values[i], this._priorities[i], i);
        }
    }

    /**
     * Performs the specified action for each element in reversed sequence in the queue
     * @param callbackfn A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the queue.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    public forEachReverse(callbackfn: (value: T, priority: U, index: number) => void, thisArg?: any): void {
        for (let i = this.length; --i > -1; ) {
            callbackfn.call(thisArg, this._values[i], this._priorities[i], i);
        }
    }

    /**
     * Calls a defined callback function on each element of the queue, and returns a new priority queue that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the queue.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    public map<V = U>(callbackfn: (value: T, priority: U, index: number) => V | [V, U], thisArg?: any): PriorityList<V, U> {
        const result: PriorityList<V, U> = new PriorityList();
        for (let i = -1, length = this.length; ++i < length; ) {
            const item: V | [V, U] = callbackfn.call(thisArg, this._values[i], this._priorities[i], i);
            if (Array.isArray(item)) {
                result.push(item[0], item[1]);
            } else {
                result.push(item, this._priorities[i]);
            }
        }
        return result;
    }

    /**
     * Returns a new priority queue that contains the elements of current queue that meet the condition specified in a callback function.
     * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the queue.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    public filter<S extends T>(callbackfn: (value: T, priority: U, index: number) => value is S, thisArg?: any): PriorityList<S, U>;
    /**
     * Returns a new priority queue that contains the elements of current queue that meet the condition specified in a callback function.
     * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the queue.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    public filter(callbackfn: (value: T, priority: U, index: number) => boolean, thisArg?: any): PriorityList<T, U>;
    public filter(callbackfn: (value: T, priority: U, index: number) => boolean, thisArg?: any): PriorityList<T, U> {
        const result: PriorityList<T, U> = new PriorityList();
        for (let i = -1, length = this.length; ++i < length; ) {
            if (callbackfn.call(thisArg, this._values[i], this._priorities[i], i)) {
                result.push(this._values[i], this._priorities[i]);
            }
        }
        return result;
    }

    /**
     * Calls the specified callback function for all the elements in the queue.
     * The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the queue.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation.
     * The first call to the callbackfn function provides this value as an argument instead of the undefined value.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    public reduce(callbackfn: (previousValue: T | undefined, currentValue: [T, U], index: number) => T, initialValue?: T, thisArg?: any): T;
    /**
     * Calls the specified callback function for all the elements in the queue.
     * The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the queue.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation.
     * The first call to the callbackfn function provides this value as an argument instead of the undefined value.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    public reduce<V>(
        callbackfn: (previousValue: V | undefined, currentValue: [T, U], index: number) => V,
        initialValue: V,
        thisArg?: any
    ): V;
    public reduce<V>(
        callbackfn: (previousValue: V | undefined, currentValue: [T, U], index: number) => V,
        initialValue?: V,
        thisArg?: any
    ): any {
        let result: T | V | undefined = initialValue;
        for (let i = -1, length = this.length; ++i < length; ) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            result = callbackfn.call(thisArg, result as any, this.get(i)!, i);
        }
        return result;
    }

    /**
     * Calls the specified callback function for all the elements in the queue, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the queue.
     * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation.
     * The first call to the callbackfn function provides this value as an argument instead of the undefined value.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    public reduceRight(
        callbackfn: (previousValue: T | undefined, currentValue: [T, U], index: number) => T,
        initialValue?: T,
        thisArg?: any
    ): T;
    public reduceRight<V>(
        callbackfn: (previousValue: V | undefined, currentValue: [T, U], index: number) => V,
        initialValue: V,
        thisArg?: any
    ): V;
    public reduceRight<V>(
        callbackfn: (previousValue: V | undefined, currentValue: [T, U], index: number) => V,
        initialValue?: V,
        thisArg?: any
    ): any {
        let result: T | V | undefined = initialValue;
        for (let i = this.length; --i > -1; ) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            result = callbackfn.call(thisArg, result as any, this.get(i)!, i);
        }
        return result;
    }

    /**
     * Returns the value of the first element in the queue where predicate is true, and undefined otherwise.
     * @param predicate find calls predicate once for each element of the queue, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    public find<S extends T>(predicate: (value: T, priority: U, index: number) => value is S, thisArg?: any): S | undefined;
    /**
     * Returns the value of the first element in the queue where predicate is true, and undefined otherwise.
     * @param predicate find calls predicate once for each element of the queue, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    public find(predicate: (value: T, priority: U, index: number) => boolean, thisArg?: any): T | undefined;
    public find(predicate: (value: T, priority: U, index: number) => boolean, thisArg?: any): T | undefined {
        const index = this.findIndex(predicate, thisArg);
        return index > -1 ? this._values[index] : undefined;
    }

    /**
     * Returns the index of the first element in the queue where predicate is true, and -1 otherwise.
     * @param predicate find calls predicate once for each element of the queue, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    public findIndex(predicate: (value: T, priority: U, index: number) => boolean, thisArg?: any): number {
        for (let i = -1, length = this.length; ++i < length; ) {
            if (predicate.call(thisArg, this._values[i], this._priorities[i], i)) return i;
        }
        return -1;
    }

    /**
     * Determines whether the queue includes a certain element, returning true or false as appropriate.
     * @param searchElement The element to search for
     * @param fromIndex The position in the queue at which to begin searching for searchElement
     */
    public includes(searchElement: T, fromIndex?: number): boolean {
        return this._values.includes(searchElement, fromIndex);
    }

    /**
     * Returns the value of the first element in the queue where predicate is true, and undefined otherwise.
     * @param predicate findOrCreate calls predicate once for each element of the queue, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, findOrCreate
     * immediately returns that element value. Otherwise, push newValue to the queue and return.
     * @param newValue Item and its priority for create if not found
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    public findOrCreate<S extends T>(predicate: (value: T, priority: U, index: number) => value is S, newValue: S, thisArg?: any): S;
    /**
     * Returns the value of the first element in the queue where predicate is true, and undefined otherwise.
     * @param predicate findOrCreate calls predicate once for each element of the queue, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, findOrCreate
     * immediately returns that element value. Otherwise, push newValue to the queue and return.
     * @param newValue Item and its priority for create if not found
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    public findOrCreate(predicate: (value: T, priority: U, index: number) => boolean, newValue: [T, U], thisArg?: any): T;
    public findOrCreate(predicate: (value: T, priority: U, index: number) => boolean, newValue: [T, U], thisArg?: any): T {
        const result = this.find(predicate, thisArg);
        if (result != null) return result;
        this.pushEntry(newValue);
        return newValue[0];
    }

    /**
     * Returns the value of the last element in the queue where predicate is true, and undefined otherwise.
     * @param predicate findLast calls predicate once for each element of the queue, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, findLast
     * immediately returns that element value. Otherwise, findLast returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    public findLast<S extends T>(predicate: (value: T, priority: U, index: number) => value is S, thisArg?: any): S | undefined;
    /**
     * Returns the value of the last element in the queue where predicate is true, and undefined otherwise.
     * @param predicate findLast calls predicate once for each element of the queue, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, findLast
     * immediately returns that element value. Otherwise, findLast returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    public findLast(predicate: (value: T, priority: U, index: number) => boolean, thisArg?: any): T | undefined;
    public findLast(predicate: (value: T, priority: U, index: number) => boolean, thisArg?: any): T | undefined {
        const index = this.findLastIndex(predicate, thisArg);
        return index > -1 ? this._values[index] : undefined;
    }

    /**
     * Returns the index of the last element in the queue where predicate is true, and -1 otherwise.
     * @param predicate findLastIndex calls predicate once for each element of the queue, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    public findLastIndex(predicate: (value: T, priority: U, index: number) => boolean, thisArg?: any): number {
        for (let i = this.length; --i > -1; ) {
            if (predicate.call(thisArg, this._values[i], this._priorities[i], i)) return i;
        }
        return -1;
    }

    /**
     * Remove element from the queue
     * @param value Element that should be removed
     */
    public remove(value: T): [T, U] | undefined {
        const index = this._values.indexOf(value);
        return this.removeAt(index);
    }

    /**
     * Remove element at given index from the queue
     * @param index Element index that should be removed
     */
    public removeAt(index: number): [T, U] | undefined {
        if (index < 0 || index >= this.length) return undefined;
        return [this._values.splice(index, 1)[0], this._priorities.splice(index, 1)[0]];
    }

    /**
     * Remove first elements that matches prediction in the queue
     * @param predicate removeWhen calls predicate once for each element of the queue, in ascending
     * order, until mapped one item. If predicate returns true, mapping item will be removed.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    public removeWhen(predicate: (value: T, priority: U, index: number) => boolean, thisArg?: any): [T, U] | undefined {
        for (let i = -1, length = this.length; ++i < length; ) {
            if (predicate.call(thisArg, this._values[i], this._priorities[i], i)) return this.removeAt(i);
        }
        return undefined;
    }

    /**
     * Remove all elements in the queue
     * @param predicate removeAll calls predicate once for each element of the queue, in ascending
     * order, until mapped every items. If predicate returns true, mapping item will be removed.
     * Notice that remove applies after map, so that index is always the correct index of item.
     * If predicate not given, all items will be removed.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    public removeAll(predicate?: (value: T, priority: U, index: number) => boolean, thisArg?: any): [T, U][] {
        if (predicate) {
            const targets: number[] = [];
            const result: [T, U][] = [];
            for (let i = -1, length = this.length; ++i < length; ) {
                const item: [T, U] = [this._values[i], this._priorities[i]];
                if (predicate.call(thisArg, item[0], item[1], i)) {
                    targets.push(i);
                    result.push(item);
                }
            }
            for (let i = targets.length; --i > -1; ) this.removeAt(targets[i]);
            return result;
        } else {
            return this.splice(0, this.length);
        }
    }

    /**
     * Remove all elements in the queue (shortcut of no parameter call of `removeAll`)
     */
    public clear(): [T, U][] {
        return this.removeAll();
    }

    /**
     * Get the last element of the queue with its priority
     */
    public last(): [T, U] | undefined {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.length > 0 ? [ArrayExtension.last(this._values)!, ArrayExtension.last(this._priorities)!] : undefined;
    }

    /**
     * Get the first element of the queue with its priority
     */
    public first(): [T, U] | undefined {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.length > 0 ? [ArrayExtension.first(this._values)!, ArrayExtension.first(this._priorities)!] : undefined;
    }

    /**
     * Checks whether the two priority queues contains same element and priority recursively
     * @param array Target array
     */
    public equals(target: PriorityList<T, U>): boolean {
        return ArrayExtension.equals(this._values, target._values) && ArrayExtension.equals(this._priorities, target._priorities);
    }

    private *createIterator(): Generator<[T, U]> {
        for (let i = -1, length = this.length; ++i < length; ) {
            const item = this.get(i);
            if (item == null) return;
            yield item;
        }
    }
}

import { PriorityList } from './priority-list';

/**
 * Queue that sorted elements in ascending order based on comparator function, but handle all side effects
 * that can change queue itself until call apply function.
 */
export class LazyPriorityQueue<T, U = number> extends PriorityList<T, U> {
    private readonly adding: [T, U][] = [];
    private readonly removing: number[] = [];

    /**
     * Removes the last element from the queue and returns it with the priority
     */
    public pop(): [T, U] | undefined {
        this.removing.push(this.length - 1);
        return this.last();
    }

    /**
     * Appends new element to the queue, and returns the new length of the queue.
     * @param item New element
     * @param priority Element's priority
     */
    public push(item: T, priority: U): number {
        this.adding.push([item, priority]);
        return this.length;
    }

    /**
     * Removes the first element from the queue and returns it as value-priority pair
     */
    public shift(): [T, U] | undefined {
        this.removing.push(0);
        return this.first();
    }

    /**
     * Removes elements from the queue and, if necessary, inserts new elements, returning the deleted elements.
     * @param start The zero-based location in the queue from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items Elements to insert into the queue, positions will be decided by priorities.
     */
    public splice(start: number, deleteCount: number, ...items: [T, U][]): [T, U][] {
        this.removing.push(...new Array<number>(deleteCount || 0).fill(start).map((e, i) => e + i));
        this.adding.push(...items);
        if (deleteCount < 1) {
            return this.toArray();
        } else {
            return this.slice(start, start + deleteCount).toArray();
        }
    }

    /**
     * Remove element at given index from the queue
     * @param index Element index that should be removed
     */
    public removeAt(index: number): [T, U] | undefined {
        if (index < 0 || index >= this.length) return undefined;
        this.removing.push(index);
        return this.get(index);
    }

    /**
     * Apply adding and removing actions to the real queue
     */
    public applyActions(): void {
        if (this.removing.length > 0) {
            const removing = this.removing.sort((a, b) => a - b);
            for (let i = removing.length; --i > -1; ) {
                super.removeAt(removing[i]);
            }
        }
        this.adding.length > 0 && this.adding.forEach(e => this.pushEntry(e));
    }
}

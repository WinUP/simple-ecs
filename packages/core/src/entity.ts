import type { IDisposable } from '@simple-ecs/runtime-extension';
import type { Class } from 'type-fest';

import { ArrayExtension, ReflectExtension } from '@simple-ecs/runtime-extension';
import { Component } from './component';

export class Entity implements IDisposable {
    private readonly components: Map<Function & { prototype: Component }, Component> = new Map();
    private readonly componentList: Component[] = [];

    /**
     * Release all resources that using by current component
     */
    public dispose(): void {
        this.components.forEach(e => e.dispose());
        this.components.clear();
        ArrayExtension.clear(this.componentList);
    }

    /**
     * Construct component and link to current entity if not existed, otherwise return linked component
     * @param component Component constructor
     */
    public addComponent<T extends Component>(component: Class<T>): T {
        if (this.components.has(component)) return this.components.get(component) as T;
        const instance = new component(this);
        this.components.set(component, instance);
        this.componentList.push(instance);
        instance.initialize();
        return instance;
    }

    /**
     * Find linked component by given type
     * @param component Component constructor
     * @param useInherit Allow to return component that inherits given type
     */
    public getComponent<T extends Component>(component: Function & { prototype: T }, useInherit: boolean = false): T | undefined {
        if (useInherit) {
            return this.componentList.find(e => ReflectExtension.isInherit(e, component)) as T | undefined;
        } else {
            return this.components.has(component) ? (this.components.get(component) as T) : undefined;
        }
    }

    /**
     * Find components that match given predicate function
     * @param predicate Predicate will be called once for each component in ascending order, until
     * mapped every items.
     * @returns
     */
    public queryComponent(predicate: (value: Component, index: number, obj: Component[]) => boolean): Component[] {
        return this.componentList.filter(predicate);
    }

    /**
     * Indicate if entity has given type of component linked
     * @param component Component constructor
     * @param useInherit Allow to return component that inherits given type
     */
    public hasComponent<V extends Component>(component: Function & { prototype: V }, useInherit: boolean = false): boolean {
        if (useInherit) {
            return this.componentList.some(e => ReflectExtension.isInherit(e, component));
        } else {
            return this.components.has(component);
        }
    }

    /**
     * Remove and dispose component by type
     * @param component Component constructor
     */
    public deleteComponent(component: Class<Component>): void {
        if (!this.components.has(component)) return;
        const target = this.components.get(component);
        target != null && (target.dispose(), this.components.delete(component), ArrayExtension.remove(this.componentList, target));
    }
}

import type { IInitializable, IDisposable } from '@simple-ecs/runtime-extension';
import type { Class, Mutable } from 'type-fest';
import type { Template } from './template';
import type { Entity } from './entity';

import { PropertyDeclaration } from './property-declaration';
import { PropertyValueSource } from './property.model';
import { ComponentSystem } from './component-system';
import { CoroutineSystem } from './component-systems';
import { Property } from './property';
import { Require } from './require';

/**
 * Component is the basic structure that handles property and act with component system
 */
export abstract class Component implements IInitializable, IDisposable {
    /**
     * Property for disabled
     */
    @PropertyDeclaration(false)
    public static readonly disabledProperty: Property<boolean>;

    private static _nextId: number = 0;
    private static readonly _components: Map<number, Component> = new Map();

    /**
     * Find component by unique ID
     * @param id Component's unique ID
     */
    public static find<T extends Component = Component>(id: number): T | undefined {
        return Component._components.has(id) ? (Component._components.get(id) as T) : undefined;
    }

    /**
     * Get a new iterator for component list
     */
    public static [Symbol.iterator](): IterableIterator<Component> {
        return Component._components.values();
    }

    /**
     * Find all component that matches given predictor
     * @param predictor Custom predictor function
     */
    public static findAll<T extends Component = Component>(predictor: (component: Component) => boolean): T[] {
        const result: T[] = [];
        for (const current of Component) {
            predictor(current) && result.push(current as T);
        }
        return result;
    }

    /**
     * Find all component that is instance of given type
     * @param type Component type (constructor)
     */
    public static findByType<T extends Component>(type: Class<T>): T[] {
        return Component.findAll(component => component.constructor === type);
    }

    /**
     * Dispose component that matches given unique ID
     * @param id Component's unique ID
     */
    public static dispose(id: number): void {
        Component.find(id)?.dispose();
    }

    /**
     * Template of component
     */
    public get template(): Template | undefined {
        return this._template;
    }
    public set template(value: Template | undefined) {
        if (this._template === value) return;
        const original = this._template;
        this._template = value;
        if (original == null) {
            Object.keys(this.constructor).forEach(e => {
                const record: unknown = this.constructor[e];
                record instanceof Property && record.resetValue(this, PropertyValueSource.Template);
            });
        } else {
            Property.switchTemplate(this, original);
        }
    }

    /**
     * Disabled state of component
     */
    public get disabled(): boolean {
        return this.getValue(Component.disabledProperty);
    }
    public set disabled(value: boolean) {
        this.setValue(Component.disabledProperty, value);
    }

    /**
     * Get component's unique ID
     */
    public readonly id: number;

    /**
     * Get component's linked entity
     */
    public readonly entity: Entity;

    private _template: Template | undefined;

    /**
     * Create a new component
     */
    public constructor(entity: Entity) {
        this.entity = entity;
        Require.applyRequire(this);
        this.id = Component._nextId;
        ++Component._nextId;
    }

    /**
     * Initialize current component
     */
    public initialize(): void {
        Component._components.set(this.id, this);
        ComponentSystem.linkComponent(this);
    }

    /**
     * Release all resources that using by current component
     */
    public dispose(): void {
        ComponentSystem.releaseComponent(this);
        Property.releaseComponent(this);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        (this.entity as any).components.delete(this.constructor);
        (this as Mutable<Partial<this>>).entity = undefined;
        Component._components.delete(this.id);
    }

    /**
     * Reset given property's value to use template or default (fallback) value for current component
     * @param property Target property
     * @param to Destination value source
     */
    public resetValue(property: Property<any>, to: PropertyValueSource = PropertyValueSource.Template): void {
        property.resetValue(this, to);
    }

    /**
     * Get given property's value for current component
     * @param property Target property
     */
    public getValue<U>(property: Property<U>): U {
        return property.getValue(this);
    }

    /**
     * Set given property's value for current component
     * @param property Target property
     * @param value Value of the property. There are differences when component using `undefined` or `null`, `null` will be considered as a real value
     * but `undefined` means reset value to template value (if have) or default value (as fallback).
     * @param ignoreCallback Skip calling value changed callback
     */
    public setValue<U>(property: Property<U>, value: U, ignoreCallback: boolean = false): void {
        property.setValue(this, value, ignoreCallback);
    }

    /**
     * Push given coroutines to adding stack and link it to current component
     * @param iterators Coroutine content
     */
    public startCoroutine(...iterators: CoroutineSystem.Coroutine[]): void {
        const system = ComponentSystem.get(CoroutineSystem);
        if (!system) return;
        iterators.forEach(e => system.startCoroutine(this.id, e));
    }

    /**
     * Stop coroutines by given ID (does not affect sub-coroutines)
     * @param ids ID of the coroutines
     */
    public stopCoroutine(...ids: number[]): void {
        const system = ComponentSystem.get(CoroutineSystem);
        if (!system) return;
        ids.forEach(e => system.stopCoroutine(e));
    }

    /**
     * Stop and remove all coroutines that linked to current component
     */
    public stopAllCoroutines(): void {
        ComponentSystem.get(CoroutineSystem)?.stopComponentCoroutines(this.id);
    }

    /**
     * Pause coroutines by given ID
     * @param ids ID of the coroutines
     */
    public pauseCoroutine(...ids: number[]): void {
        const system = ComponentSystem.get(CoroutineSystem);
        if (!system) return;
        ids.forEach(e => system.pauseCoroutine(e));
    }

    /**
     * Pause coroutines that linked to current behaviour
     */
    public pauseAllCoroutines(): void {
        ComponentSystem.get(CoroutineSystem)?.pauseComponentCoroutines(this.id);
    }

    /**
     * Resume coroutines by given ID
     * @param ids ID of the coroutines
     */
    public resumeCoroutine(...ids: number[]): void {
        const system = ComponentSystem.get(CoroutineSystem);
        if (!system) return;
        ids.forEach(e => system.resumeCoroutine(e));
    }

    /**
     * Resume coroutines that linked to current behaviour
     */
    public resumeAllCoroutines(): void {
        ComponentSystem.get(CoroutineSystem)?.resumeComponentCoroutines(this.id);
    }
}

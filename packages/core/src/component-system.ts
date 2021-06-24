import type { IInitializable, IDisposable } from '@simple-ecs/runtime-extension';
import type { Class } from 'type-fest';

import { Logger, ArrayExtension } from '@simple-ecs/runtime-extension';
import { Component } from './component';

/**
 * Component system handles update for a group of components per frame
 */
export abstract class ComponentSystem<T extends Component = Component> implements IInitializable, IDisposable {
    private static readonly systems: ComponentSystem[] = [];
    private static readonly systemTypes: Map<Class<ComponentSystem>, ComponentSystem> = new Map();
    private static readonly logger: Logger = new Logger('ComponentSystem');
    private static systemLength: number = 0;
    private static lastUpdateTime?: number;

    /**
     * Create and register a new component system based on given type, or return existed if already registered.
     * @param type Constructor of component system
     */
    public static create<T extends ComponentSystem>(type: Class<T>): T {
        const existed = ComponentSystem.systemTypes.get(type) as T | undefined;
        if (existed) {
            ComponentSystem.logger.warn(`Skip construct ${type.name}: System with same type already existed`);
            return existed;
        }
        const result: T = new type();
        ComponentSystem.systems.push(result);
        ComponentSystem.systemTypes.set(type, result);
        ++this.systemLength;
        for (const component of Component) result.shouldLinkComponent(component) && result._components.push(component);
        result.initialize();
        return result;
    }

    /**
     * Get component system by given type
     * @param type Type of component system (constructor)
     */
    public static get<T extends ComponentSystem>(type: Class<T>): T | undefined {
        return ComponentSystem.systemTypes.get(type) as T | undefined;
    }

    /**
     * Link given component to all registered component system
     * @param component Component that needs to link
     */
    public static linkComponent(component: Component): void {
        for (let i = -1, system = ComponentSystem.systems[0]; ++i < ComponentSystem.systemLength; system = ComponentSystem.systems[i + 1]) {
            !system._components.includes(component) &&
                !system.linkingComponents.includes(component) &&
                system.shouldLinkComponent(component) &&
                system.linkingComponents.push(component);
            system.beforeLinkComponent(component);
        }
    }

    /**
     * Release given component from all registered component system
     * @param component Component that needs to release
     */
    public static releaseComponent(component: Component): void {
        for (let i = -1, system = ComponentSystem.systems[0]; ++i < ComponentSystem.systemLength; system = ComponentSystem.systems[i + 1]) {
            if (!system._components.includes(component) || system.releasingComponents.includes(component)) return;
            system.releasingComponents.push(component);
            system.beforeReleaseComponent(component);
        }
    }

    /**
     * Update all registered component systems once
     */
    public static updateSystems(): void {
        const now = Date.now();
        const delta = this.lastUpdateTime == null ? 0 : now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        for (let i = -1; ++i < ComponentSystem.systemLength; ) {
            ComponentSystem.systems[i].updateSystem(delta);
        }
    }

    /**
     * Get all linked components of current component system
     */
    public get components(): readonly T[] {
        return this._components;
    }

    private readonly _components: T[] = [];
    private readonly linkingComponents: T[] = [];
    private readonly releasingComponents: T[] = [];

    public initialize(): void {
        // Nothing
    }

    public dispose(): void {
        ArrayExtension.clear(this._components);
        if (ComponentSystem.systems.includes(this)) {
            ArrayExtension.remove(ComponentSystem.systems, this);
            ComponentSystem.systemTypes.delete(this.constructor as Class<this>);
            --ComponentSystem.systemLength;
        }
    }

    /**
     * Apply component link and release, then call `update()` to update component system
     * @param delta Time passed from last update in milliseconds
     */
    public updateSystem(delta: number): void {
        if (this.linkingComponents.length > 0) {
            this.linkingComponents.forEach(e => {
                this._components.push(e);
                this.afterLinkComponent(e);
            });
            ArrayExtension.removeAll(this.linkingComponents);
        }
        if (this.releasingComponents.length > 0) {
            this.releasingComponents.forEach(e => {
                ArrayExtension.remove(this._components, e);
                this.afterReleaseComponent(e);
            });
            ArrayExtension.removeAll(this.releasingComponents);
        }
        this.update(delta);
    }

    /**
     * Hook when prepare to link component
     * @param component Component that will be linked
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected beforeLinkComponent(component: T): void {
        // Nothing
    }

    /**
     * Hook when component linked to system
     * @param component Component that linked
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected afterLinkComponent(component: T): void {
        // Nothing
    }

    /**
     * Hook when prepare to release component
     * @param component Component that will be released
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected beforeReleaseComponent(component: T): void {
        // Nothing
    }

    /**
     * Hook when component released from system
     * @param component Component that released
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected afterReleaseComponent(component: T): void {
        // Nothing
    }

    /**
     * Parse given component and returns component(s) that need to link to current component (or `undefined` for skip linking)
     * @param component Target component
     */
    protected abstract shouldLinkComponent(component: Component): boolean;

    /**
     * Update current component system
     * @param delta Time passed from last update in milliseconds
     */
    protected abstract update(delta: number): void;
}

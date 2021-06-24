import type { Component } from './component';
import type { Class } from 'type-fest';

import { ReflectExtension } from '@simple-ecs/runtime-extension';
import { ComponentSystem } from './component-system';

interface IRequireMetadata {
    systems?: Class<ComponentSystem>[];
    components?: Class<Component>[];
}

/**
 * Create component system or component if no activating target matches given type
 * @param type Constructor of component or component system
 */
export function Require(type: Class<ComponentSystem | Component>): (constructor: Class<Component>) => void {
    return function (constructor: Class<Component>): void {
        const metadata = (constructor[Require.requireTag] ??= {}) as IRequireMetadata;
        if (ReflectExtension.isInherit(type, ComponentSystem)) {
            metadata.systems ??= [];
            !metadata.systems.includes(type as Class<ComponentSystem>) && metadata.systems.push(type as Class<ComponentSystem>);
        } else {
            metadata.components ??= [];
            !metadata.components.includes(type as Class<Component>) && metadata.components.push(type as Class<Component>);
        }
    };
}

export namespace Require {
    export const requireTag = Symbol('requireTag');

    export function applyRequire(component: Component): void {
        const metadata = component.constructor[requireTag] as IRequireMetadata | undefined;
        if (metadata == null) return;
        metadata.components?.forEach(e => component.entity.addComponent(e));
        metadata.systems?.forEach(e => ComponentSystem.get(e) == null && ComponentSystem.create(e));
    }
}

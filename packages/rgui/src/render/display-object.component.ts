import type { DisplayObject as PixiDisplayObject, Container } from 'pixi.js';
import type { Entity } from '@simple-ecs/core';
import type { Class } from 'type-fest';

import { Component } from '@simple-ecs/core';

export abstract class DisplayObject<T extends PixiDisplayObject = PixiDisplayObject> extends Component {
    public displayObject: DisplayObject.LinkedDisplayObject<T>;

    public get parent(): PixiDisplayObject {
        return this.displayObject.parent;
    }
    public set parent(value: PixiDisplayObject | DisplayObject) {
        const target = 'createPixiDisplayObject' in value ? value.displayObject : value;
        'addChild' in target ? (target as Container).addChild(this.displayObject) : (this.displayObject.parent = target);
    }

    public constructor(entity: Entity) {
        super(entity);
        this.displayObject = this.createPixiDisplayObject() as T & { linkedComponent: DisplayObject<T> };
        this.displayObject.linkedComponent = this;
    }

    /**
     * Release all resources that using by current component
     */
    public dispose(): void {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.displayObject.linkedComponent = undefined as any;
        this.disposePixiDisplayObject();
        super.dispose();
    }

    /**
     * Dispose pixi.js display object
     */
    protected disposePixiDisplayObject(): void {
        this.displayObject.destroy();
    }

    /**
     * Create pixi.js display object
     */
    protected abstract createPixiDisplayObject(): T;
}

export namespace DisplayObject {
    export type LinkedDisplayObject<T extends PixiDisplayObject = PixiDisplayObject> = T & { linkedComponent: DisplayObject<T> };

    const createdTypes: Map<Class<PixiDisplayObject>, Class<DisplayObject>> = new Map();

    /**
     * Create component constructor that inherit DisplayObject, or return existed if given type already created.
     * @param target Target pixi object that component handles
     */
    export function from<T extends PixiDisplayObject>(target: Class<T>): Class<DisplayObject<T>> {
        let result = createdTypes.get(target);
        if (result == null) {
            result = class extends DisplayObject<T> {
                protected createPixiDisplayObject(): T {
                    return new target();
                }
            };
            createdTypes.set(target, result);
        }
        return result as Class<DisplayObject<T>>;
    }
}

import type { Handler } from './dispatcher';

import { Component, Property, PropertyDeclaration, Require } from '@simple-ecs/core';
import { InteractiveSystem } from './interactive.system';

/**
 * Parse input events from interactive system to registered subscription
 */
@Require(InteractiveSystem)
export class Interactive extends Component {
    /**
     * Interactive component that receives keyboard event
     */
    public static keyboardTarget?: Interactive;

    /**
     * Set keyboard target automatically when user clicked or touched any entity with interactive component
     */
    public static autoFocus: boolean = true;

    @PropertyDeclaration(undefined)
    public static handlerProperty: Property<Handler | undefined>;

    @PropertyDeclaration(undefined)
    public static parentProperty: Property<Interactive | undefined>;

    @PropertyDeclaration(false)
    public static useDisplayHierarchyProperty: Property<boolean>;

    /**
     * Event handler of the component
     */
    public get handler(): Handler | undefined {
        return this.getValue(Interactive.handlerProperty);
    }
    public set handler(value: Handler | undefined) {
        this.setValue(Interactive.handlerProperty, value);
    }

    /**
     * Each event will be popped up to the parent, however any disabled parent in the list will also
     * prevent all its children to process event.
     */
    public get parent(): Interactive | undefined {
        return this.getValue(Interactive.parentProperty);
    }
    public set parent(value: Interactive | undefined) {
        this.setValue(Interactive.parentProperty, value);
    }

    /**
     * Force interactive system to search the tree of DisplayObject to find interactive parent.
     * Enable this property will ignore the value of parent property and may have extra performance
     * costs.
     */
    public get useDisplayHierarchy(): boolean {
        return this.getValue(Interactive.useDisplayHierarchyProperty);
    }
    public set useDisplayHierarchy(value: boolean) {
        this.setValue(Interactive.useDisplayHierarchyProperty, value);
    }

    public dispose(): void {
        Interactive.keyboardTarget === this && (Interactive.keyboardTarget = undefined);
        super.dispose();
    }
}

import type { ValueValidator, ValueChangedCallback } from './property.model';
import type { IDisposable } from '@simple-ecs/runtime-extension';
import type { Component } from './component';
import type { Template } from './template';

import { PropertyValueSource } from './property.model';

/**
 * Property is special field that handles changes callback and values that optimized for memory storage
 */
export class Property<T> implements IDisposable {
    /**
     * Get the list of all registered properties
     */
    public static get properties(): ReadonlyMap<string, Property<any>> {
        return this._properties;
    }

    private static readonly _properties: Map<string, Property<any>> = new Map();

    /**
     * Delete all data that recorded in any property of given component
     * @param target Target component
     */
    public static releaseComponent(target: Component): void {
        this._properties.forEach(e => e.releaseComponent(target));
    }

    /**
     * Update value when component switched to another template
     * @param component Target component
     * @param formerTemplate Former template used by component
     */
    public static switchTemplate<T extends Component>(component: T, formerTemplate?: Template): void {
        this._properties.forEach(e => e.switchTemplate(component, formerTemplate));
    }

    private static validate(property: Property<any>, value: any, component?: Component): void {
        property.validators.forEach(e => {
            if (!e.call(component, value, component, property))
                throw new TypeError(`Unable to set property ${property.name}: value "${value}" validation failed`);
        });
    }

    private static onValueChanged(property: Property<any>, value: any, component: Component): void {
        property.callbacks.forEach(e => e.call(component, value, component, property));
    }

    /**
     * Property's name, must be unique in entire application.
     */
    public readonly name: string;

    /**
     * Default value is the initial value of the property
     */
    public get defaultValue(): T {
        return this._defaultValue;
    }
    public set defaultValue(value: T) {
        Property.validate(this, value);
        this._defaultValue = value;
    }

    /**
     * Callback function when value changed
     */
    public readonly callbacks: Set<ValueChangedCallback<T, Component>> = new Set();

    /**
     * Validate function that check if new value is able to assign to property
     */
    public readonly validators: Set<ValueValidator<T, Component>> = new Set();

    private _defaultValue!: T;
    private readonly valueEntries: Map<Component, T> = new Map();
    private readonly valueSources: Map<Component, PropertyValueSource> = new Map();
    private readonly componentUsingTemplate: Map<Template, Set<Component>> = new Map();

    /**
     * Create new property with given name
     * @param name Property's name. Names are not forced to be unique but unique name could be helpful on debug.
     * @param defaultValue Default value is the initial value of the property
     */
    public constructor(name: string, defaultValue: T) {
        if (Property._properties.has(name)) throw new TypeError(`Unable to declare property ${name}: name already existed`);
        this.name = name;
        this.defaultValue = defaultValue;
        Property._properties.set(name, this);
    }

    public dispose(): void {
        this.valueEntries.clear();
        this.valueSources.clear();
        for (const template of this.componentUsingTemplate.keys()) template.unlinkProperty(this);
        this.componentUsingTemplate.clear();
        Property._properties.delete(this.name);
    }

    /**
     * Get value source of given component, which presents the source of the value that the component using
     * @param component Target component
     */
    public getValueSource(component: Component): PropertyValueSource {
        return this.valueSources.get(component) ?? PropertyValueSource.Default;
    }

    /**
     * Get active value of given component, will fallback to use template value if current source is `Independent`,
     * then fallback to default if still cannot find any value.
     * @param component Target component
     */
    public getValue(component: Component): T {
        const source = this.getValueSource(component);
        //~ 使用默认值的情况最多，预先处理一次，大多数组件都能直接在这里得到值
        if (source === PropertyValueSource.Default) return this.defaultValue;
        if (source === PropertyValueSource.Independent) {
            const value = this.valueEntries.get(component);
            if (value !== undefined) return value;
        }
        if (component.template != null) {
            const value = component.template.get(this.name) as T | undefined;
            if (value !== undefined) return value;
        }
        return this.defaultValue;
    }

    /**
     * Set active value of given component and turn that component's value source to `Independent`.
     * Same value will be ignored when component's value source is `Independent`.
     * @param component Target component
     * @param value Value of the property. Known that `undefined` and `null` are different.
     * `null` will be considered as a real value however `undefined` means reset value to
     * template value (if have) or default value (as fallback).
     * @param ignoreCallback Skip calling value changed callback
     * @example
     * property.setValue(component, 0); // Set value to 0
     * property.setValue(component, null); //Set value to null
     * property.setValue(component, undefined); // Remove independent value then set value source to "Template"
     */
    public setValue(component: Component, value: T, ignoreCallback: boolean = false): void {
        if (value === undefined) {
            this.resetValue(component, PropertyValueSource.Template);
            return;
        }
        const source = this.getValueSource(component);
        //~ 如果组件有自己的属性值且与新值相等则跳过处理
        //~ 如果组件没有自己的属性值，那么不论新值为何，都应进行处理并发送回调，因为值的来源改变了
        if (source === PropertyValueSource.Independent && value === this.getValue(component)) return;
        Property.validate(this, value, component);
        source === PropertyValueSource.Template && this.deleteTemplateRelation(component);
        this.valueEntries.set(component, value);
        this.valueSources.set(component, PropertyValueSource.Independent);
        !ignoreCallback && Property.onValueChanged(this, value, component);
    }

    /**
     * Reset component's value to given source
     *
     * * Reset to `Default`: value source -> `Default`, value -> default
     * * Reset to `Template`:
     *      * No template / not found: value source -> `Default`, value -> default
     *      * Template without value: value source -> `Template`, value -> default
     *      * Template with value: value source -> `Template`, value -> template
     * * Reset to `Independent`:
     *      * Has independent value: do nothing
     *      * No independent value: same as reset to `Template`
     * @param component Target component
     * @param source Value's source
     */
    public resetValue(component: Component, source: PropertyValueSource): void {
        switch (source) {
            case PropertyValueSource.Independent:
                if (this.getValueSource(component) === PropertyValueSource.Independent) break;
            case PropertyValueSource.Template:
                if (this.getValueSource(component) === PropertyValueSource.Template) break;
                this.valueEntries.delete(component);
                if (component.template != null) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const value = component.template.get(this.name as keyof Component);
                    value !== undefined && Property.validate(this, value, component);
                    this.valueSources.set(component, PropertyValueSource.Template);
                    this.cacheTemplateRelation(component);
                    Property.onValueChanged(this, value !== undefined ? value : this.defaultValue, component);
                    break;
                }
            case PropertyValueSource.Default:
                if (this.getValueSource(component) === PropertyValueSource.Default) break;
                this.deleteTemplateRelation(component);
                this.valueEntries.delete(component);
                this.valueSources.set(component, PropertyValueSource.Default);
                Property.onValueChanged(this, this.defaultValue, component);
                break;
        }
    }

    /**
     * Delete independent value of given component then roll component's active value back to default value.
     * @param component Target component
     */
    public useDefaultValue(component: Component): void {
        this.resetValue(component, PropertyValueSource.Default);
    }

    /**
     * Delete independent value of given component then roll component's active value back to
     * template value (if available) or default value (as fallback).
     * @param component Target component
     */
    public useTemplateValue(component: Component): void {
        this.resetValue(component, PropertyValueSource.Template);
    }

    /**
     * For all components that using value from given template, re-calculate the value then run callback
     * forced. Usually this function will be called automatically by template when value changed.
     * @param template Target template
     */
    public updateTemplateValue(template: Template): void {
        this.componentUsingTemplate.get(template)?.forEach(e => {
            this.valueSources.set(e, PropertyValueSource.Independent);
            this.resetValue(e, PropertyValueSource.Template);
        });
    }

    /**
     * Update value when component switched to another template
     * @param component Target component
     * @param formerTemplate Former template used by component
     */
    public switchTemplate<T extends Component>(component: T, formerTemplate?: Template): void {
        const source = this.getValueSource(component);
        //~ 除了保证只有组件原本使用模板时才执行切换之外，当组件从未在属性中存储过值时，也可以经由此判断跳过处理
        if (source !== PropertyValueSource.Template) return;
        this.deleteTemplateRelation(component, formerTemplate);
        if (component.template == null) {
            this.resetValue(component, PropertyValueSource.Default);
        } else {
            const value = component.template.get(this.name as any);
            value !== undefined && Property.validate(this, value, component);
            this.valueSources.set(component, PropertyValueSource.Template);
            this.cacheTemplateRelation(component);
            Property.onValueChanged(this, value !== undefined ? value : this.defaultValue, component);
        }
    }

    /**
     * Delete all data that recorded in this property of given component
     * @param component Target component
     */
    public releaseComponent(component: Component): void {
        this.valueEntries.delete(component);
        this.valueSources.delete(component);
        this.componentUsingTemplate.forEach(e => e.delete(component));
    }

    /**
     * Run value changed callback with current value
     * @param component Target component
     */
    public rerunCallback(component: Component): void {
        Property.onValueChanged(this, this.getValue(component), component);
    }

    private deleteTemplateRelation(component: Component, template?: Template): void {
        const target = template ?? component.template;
        if (target == null) return;
        const list = this.componentUsingTemplate.get(target);
        list && list.size > 0 && list.delete(component);
        if (list == null || list.size < 1) {
            target.unlinkProperty(this);
            this.componentUsingTemplate.delete(target);
        }
    }

    private cacheTemplateRelation(component: Component, template?: Template): void {
        const target = template ?? component.template;
        if (target == null) return;
        let list = this.componentUsingTemplate.get(target);
        if (list == null) {
            list = new Set();
            this.componentUsingTemplate.set(target, list);
        }
        target.linkProperty(this);
        list.add(component);
    }
}

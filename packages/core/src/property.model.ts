import type { Component } from './component';
import type { Property } from './property';

/**
 * Function that calls when value of property changed
 */
export type ValueChangedCallback<T, U extends Component> = (value: T, component: U, property: Property<T>) => void;

/**
 * Function that validate property's value
 */
export type ValueValidator<T, U extends Component> = (value: T, component: U | undefined, property: Property<T>) => boolean;

/**
 * Present the source of property's value for single component
 */
export enum PropertyValueSource {
    /**
     * The component uses property's default value
     */
    Default,

    /**
     * The component uses property's value from template
     */
    Template,

    /**
     * The component has independent value for the property
     */
    Independent
}

import type { Component } from './component';

/**
 * Find properties from component
 */
export type ComponentProperty<T> = T extends Component ? keyof T : T extends string ? T : never;

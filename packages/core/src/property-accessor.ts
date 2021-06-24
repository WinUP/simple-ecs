import type { Component } from './component';
import type { Property } from './property';

/**
 * Create getter and setter for given property, requires that name of the property must equals
 * to field's name.
 * @param property Target property
 * @description This decorator will re-define decorated field with getter and setter
 */
export function PropertyAccessor(property: Property<any>): (target: Component, key: string) => void {
    return function (target: Component, key: string): void {
        if (property.name !== key)
            throw new TypeError(`Unable to declare property accessor ${key}: field name not equals to property name`);
        Object.defineProperty(target, key, {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            get: () => target.getValue(property),
            set: (value: any) => target.setValue(property, value),
            enumerable: true,
            configurable: true
        });
    };
}

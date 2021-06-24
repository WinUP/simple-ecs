import type { ValueChangedCallback, ValueValidator } from './property.model';

import { StringExtension } from '@simple-ecs/runtime-extension';
import { Property } from './property';

/**
 * Use readonly property to replace decorated field on given object with value assigned as new instance of `Property<T>`.
 * This is the shortcut to define property on object.
 * @param name Property's name. Names are not forced to be unique but unique name could be helpful on debug.
 * @param defaultValue Default value is the initial value of the property
 * @param onChange Callback function's name on given target when value changed (default `on${name.toPascalCase()}Changed`)
 * @param onValidate Validate function's name on given target that check if new value is able to assign to property (default `on${name.toPascalCase()}Validate`)
 */
export function PropertyDeclaration<T = any>(
    defaultValue: T,
    name?: string,
    onChange?: string | ValueChangedCallback<T, any>,
    onValidate?: string | ValueValidator<T, any>
): (target: Object, key: string) => void {
    return function (target: Object, key: string): void {
        name = name ?? (key.endsWith('Property') ? key.substring(0, key.lastIndexOf('Property')) : key);
        const changeCallback =
            onChange == null || typeof onChange === 'string' ? `on${StringExtension.toPascalCase(name)}Changed` : onChange;
        const validateCallback =
            onValidate == null || typeof onValidate === 'string' ? `on${StringExtension.toPascalCase(name)}Validate` : onValidate;
        const property = new Property<T>(name, defaultValue);
        property.callbacks.add(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            typeof changeCallback === 'string' ? (value, component) => component[changeCallback]?.(value) : changeCallback
        );
        property.validators.add(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            typeof validateCallback === 'string' ? (value, component) => component?.[validateCallback]?.(value) ?? true : validateCallback
        );
        Object.defineProperty(target, key, {
            get: () => property,
            enumerable: true,
            configurable: true
        });
    };
}

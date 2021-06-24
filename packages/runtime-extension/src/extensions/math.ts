import type { IPoint2D } from '../runtime.model';

import { NumberExtension } from './number';

export namespace MathExtension {
    /**
     * Create random integer number from 0 to max
     * @param max Max value of the number
     */
    export function randomInt(max: number): number {
        return Math.floor(max * Math.random());
    }

    /**
     * Returns a number whose value is limited to the given range
     * @param value Target number
     * @param min The lower boundary
     * @param max The upper boundary
     */
    export function clamp(value: number, min: number, max: number): number {
        return value < min ? min : value > max ? max : value;
    }

    /**
     * Return the lerp result of two numbers
     * @param from Lerp from
     * @param to Lerp to
     * @param progress Lerp progress
     */
    export function lerp(from: number, to: number, progress: number): number {
        return (1 - progress) * from + progress * to;
    }

    /**
     * Returns the dot result of 2D vectors
     * @param source First vector
     * @param target Second vector
     */
    export function dot(source: IPoint2D, target: IPoint2D): number {
        return source.x * target.x + source.y * target.y;
    }

    /**
     * Get the length of 2D vector
     * @param source Target vector
     */
    export function mod(source: IPoint2D): number {
        return Math.sqrt(mod2(source));
    }

    /**
     * Get the square value of the length of 2D vector
     * @parma source Target vector
     */
    export function mod2(source: IPoint2D): number {
        return source.x ** 2 + source.y ** 2;
    }

    /**
     * Normalize the given vector
     * @param target Target vector
     */
    export function normalized(target: IPoint2D): IPoint2D {
        const modValue = mod(target);
        return { x: target.x / modValue, y: target.y / modValue };
    }

    /**
     * Lerp source vector to target vector by given scale process
     * @param source Source vector
     * @param target Target vector
     * @param scale Scale process
     */
    export function lerpTo(source: IPoint2D, target: IPoint2D, scale: number): IPoint2D {
        scale = NumberExtension.clamp(scale, 0, 1);
        return { x: source.x + (target.x - source.x) * scale, y: source.y + (target.y - source.y) * scale };
    }

    /**
     * Get the reflect vector of given vector based on normal vector
     * @param source Source vector
     * @param normal Normal vector
     */
    export function reflectBy(source: IPoint2D, normal: IPoint2D): IPoint2D {
        const scale = -2 * dot(source, normal);
        return { x: normal.x * scale + source.x, y: normal.y * scale + source.y };
    }

    /**
     * Get the angle between 2D vectors
     * @param source First vector
     * @param target Second vector
     */
    export function angleBetween(source: IPoint2D, target: IPoint2D): number {
        return (Math.acos(NumberExtension.clamp(dot(normalized(source), normalized(target)), -1, 1)) * 180) / Math.PI;
    }

    /**
     * Get the result that projects source vector to normal vector
     * @param source Source vector
     * @param normal Normal vector
     */
    export function projectTo(source: IPoint2D, normal: IPoint2D): IPoint2D {
        const value = dot(source, normal) / dot(normal, normal);
        return { x: normal.x * value, y: normal.y * value };
    }
}

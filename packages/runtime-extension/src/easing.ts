/**
 * Easing namespace contains various easing functions that can apply to number
 */
export namespace Easing {
    export type EasingFunction<T = number> = (input: T) => T;

    export enum EasingType {
        Linear,
        Spring,
        QuadIn,
        QuadOut,
        QuadInOut,
        CubicIn,
        CubicOut,
        CubicInOut,
        QuartIn,
        QuartOut,
        QuartInOut,
        QuintIn,
        QuintOut,
        QuintInOut,
        SineIn,
        SineOut,
        SineInOut,
        ExponentIn,
        ExponentOut,
        ExponentInOut,
        CircleIn,
        CircleOut,
        CircleInOut,
        BounceIn,
        BounceOut,
        BounceInOut,
        BackIn,
        BackOut,
        BackInOut,
        ElasticIn,
        ElasticOut,
        ElasticInOut
    }

    /**
     * Get easing function by given type
     * @param type Easing type
     */
    export function get(type: EasingType): EasingFunction {
        switch (type) {
            case EasingType.Linear:
                return linear;
            case EasingType.Spring:
                return spring;
            case EasingType.QuadIn:
                return quadIn;
            case EasingType.QuadOut:
                return quadInOut;
            case EasingType.QuadInOut:
                return quadInOut;
            case EasingType.CubicIn:
                return cubicIn;
            case EasingType.CubicOut:
                return cubicInOut;
            case EasingType.CubicInOut:
                return cubicInOut;
            case EasingType.QuartIn:
                return quartIn;
            case EasingType.QuartOut:
                return quartOut;
            case EasingType.QuartInOut:
                return quartInOut;
            case EasingType.QuintIn:
                return quintIn;
            case EasingType.QuintOut:
                return quintOut;
            case EasingType.QuintInOut:
                return quintInOut;
            case EasingType.SineIn:
                return sineIn;
            case EasingType.SineOut:
                return sineOut;
            case EasingType.SineInOut:
                return sineInOut;
            case EasingType.ExponentIn:
                return exponentIn;
            case EasingType.ExponentOut:
                return exponentOut;
            case EasingType.ExponentInOut:
                return exponentInOut;
            case EasingType.CircleIn:
                return circleIn;
            case EasingType.CircleOut:
                return circleOut;
            case EasingType.CircleInOut:
                return circleInOut;
            case EasingType.BounceIn:
                return bounceIn;
            case EasingType.BounceOut:
                return bounceOut;
            case EasingType.BounceInOut:
                return bounceInOut;
            case EasingType.BackIn:
                return backIn;
            case EasingType.BackOut:
                return backOut;
            case EasingType.BackInOut:
                return backInOut;
            case EasingType.ElasticIn:
                return elasticIn;
            case EasingType.ElasticOut:
                return elasticOut;
            case EasingType.ElasticInOut:
                return elasticInOut;
            default:
                throw new ReferenceError(`Unable to create easing function: unknown type ${type}`);
        }
    }

    /**
     * Reverse easing function
     * @param type Easing type
     */
    export function reverse(type: EasingType): EasingFunction {
        const target = get(type);
        return value => 1 - target(value);
    }

    /**
     * Use `y = x` as easing function
     * @param value Original value
     */
    export function linear(value: number): number {
        return value;
    }

    /**
     * Use `y = (sin(πx(2.5x^3 + 0.2)) * (1 - x)^2.2 + x) * (2.2 - 1.2x)` as easing function
     * @param value Original value
     */
    export function spring(value: number): number {
        return (Math.sin(value * Math.PI * (0.2 + 2.5 * Math.pow(value, 3))) * Math.pow(1 - value, 2.2) + value) * (2.2 - 1.2 * value);
    }

    /**
     * Use `y = x^2` as easing function
     * @param value Original value
     */
    export function quadIn(value: number): number {
        return Math.pow(value, 2);
    }

    /**
     * Use `y = -x^2 + 2x` as easing function
     * @param value Original value
     * @description Actually use `y = x(2-x)`
     */
    export function quadOut(value: number): number {
        return value * (2 - value);
    }

    /**
     * Use `y = {2x^2}[0, 0.5) + {-2x^2 + 4x - 1}[0.5, 1]` as easing function
     * @param value Original value
     * @description Actually use `y = {2x^2}[0, 0.5) + {(1 - (2x-1)(2x-3)) / 2}[0.5, 1]`
     */
    export function quadInOut(value: number): number {
        if (value < 0.5) return 2 * Math.pow(value, 2);
        value *= 2;
        return (1 - (value - 1) * (value - 3)) / 2;
    }

    /**
     * Use `y = x^3` as easing function
     * @param value Original value
     */
    export function cubicIn(value: number): number {
        return Math.pow(value, 3);
    }

    /**
     * Use `y = (x-1)^3 + 1` as easing function
     * @param value Original value
     */
    export function cubicOut(value: number): number {
        return Math.pow(value - 1, 3) + 1;
    }

    /**
     * Use `y = {4x^3}[0, 0.5) + {4x^3 - 12x^2 + 12x - 3}[0.5, 1]` as easing function
     * @param value Original value
     * @description Actually use `y = {4x^3}[0, 0.5) + {(2x - 2)^3 / 2 + 1}[0.5, 1]`
     */
    export function cubicInOut(value: number): number {
        return value < 0.5 ? 4 * Math.pow(value, 3) : Math.pow(2 * value - 2, 3) / 2 + 1;
    }

    /**
     * Use `y = x^4` as easing function
     * @param value Original value
     */
    export function quartIn(value: number): number {
        return Math.pow(value, 4);
    }

    /**
     * Use `y = 1 - (x-1)^4` as easing function
     * @param value Original value
     */
    export function quartOut(value: number): number {
        return 1 - Math.pow(value - 1, 4);
    }

    /**
     * Use `y = {8x^4}[0, 0.5) + {-8x^4 + 32x^3 - 48x^2 + 32x - 7}[0.5, 1]` as easing function
     * @param value Original value
     * @description Actually use `y = {8x^4}[0, 0.5) + {1 - 8(x - 1)^4}[0.5, 1]`
     */
    export function quartInOut(value: number): number {
        return value < 0.5 ? 8 * Math.pow(value, 4) : 1 - 8 * Math.pow(value - 1, 4);
    }

    /**
     * Use `y = x^5` as easing function
     * @param value Original value
     */
    export function quintIn(value: number): number {
        return Math.pow(value, 5);
    }

    /**
     * Use `y = (x - 1)^5 + 1` as easing function
     * @param value Original value
     */
    export function quintOut(value: number): number {
        return Math.pow(value - 1, 5) + 1;
    }

    /**
     * Use `y = {16x^5}[0, 0.5) + {16x^5 - 80x^4 + 160x^3 - 160x^2 + 80x - 15}[0.5, 1]` as easing function
     * @param value Original value
     * @description Actually use `y = {16x^5}[0, 0.5) + {16(x - 1)^5 + 1}[0.5, 1]`
     */
    export function quintInOut(value: number): number {
        return value < 0.5 ? 16 * Math.pow(value, 5) : 16 * Math.pow(value - 1, 5) + 1;
    }

    /**
     * Use `y = 1 - cos(π/2 * x)` as easing function
     * @param value Original value
     */
    export function sineIn(value: number): number {
        return 1 - Math.cos((Math.PI / 2) * value);
    }

    /**
     * Use `y = sin(π/2 * x)` as easing function
     * @param value Original value
     */
    export function sineOut(value: number): number {
        return Math.sin((Math.PI / 2) * value);
    }

    /**
     * Use `y = (cos(πx) - 1) / -2` as easing function
     * @param value Original value
     */
    export function sineInOut(value: number): number {
        return (Math.cos(Math.PI * value) - 1) / -2;
    }

    /**
     * Use `y = 2^(10(x-1))` as easing function
     * @param value Original value
     */
    export function exponentIn(value: number): number {
        return Math.pow(2, 10 * (value - 1));
    }

    /**
     * Use `y = 1 - 2^(-10x)` as easing function
     * @param value Original value
     */
    export function exponentOut(value: number): number {
        return 1 - Math.pow(2, -10 * value);
    }

    /**
     * Use `y = {2^(20x - 11)}[0, 0.5) + {1 - 2^(9 - 20x)}[0.5, 1]` as easing function
     * @param value Original value
     */
    export function exponentInOut(value: number): number {
        return value < 0.5 ? Math.pow(2, 20 * value - 11) : 1 - Math.pow(2, 9 - 20 * value);
    }

    /**
     * Use `y = 1 - √(1 - x^2)` as easing function
     * @param value Original value
     */
    export function circleIn(value: number): number {
        return 1 - Math.sqrt(1 - Math.pow(value, 2));
    }

    /**
     * Use `y = √(1 - (x - 1)^2)` as easing function
     * @param value Original value
     */
    export function circleOut(value: number): number {
        return Math.sqrt(1 - Math.pow(value - 1, 2));
    }

    /**
     * Use `y = {(√(1 - 4x^2) - 1) / 2}[0, 0.5) + {(√(1 - (2x - 2)^2) + 1) / 2}[0.5, 1]` as easing function
     * @param value Original value
     */
    export function circleInOut(value: number): number {
        return value < 0.5 ? (Math.sqrt(1 - 4 * Math.pow(value, 2)) - 1) / 2 : (Math.sqrt(1 - Math.pow(2 * value - 2, 2)) + 1) / 2;
    }

    /**
     * Use `y = 1 - bounceOut(1 - x)` as easing function
     * @param value Original value
     */
    export function bounceIn(value: number): number {
        return 1 - bounceOut(1 - value);
    }

    /**
     * Use `y = {7.5625 * x^2}[0, 0.363636) + {7.5625 * (x - 0.545454)^2 + 0.75}[0.363636, 0.727272) +
            {7.5625 * (x - 0.818182)^2 + 0.9375}[0.727272, 0.909091) + {7.5625 * (x - 0.954545)^2 + 0.984375}[0.909091, 1]` as easing function
     * @param value Original value
     */
    export function bounceOut(value: number): number {
        if (value < 0.363636) return 7.5625 * Math.pow(value, 2);
        if (value < 0.727273) return 7.5625 * Math.pow(value - 0.545454, 2) + 0.75;
        if (value < 0.909091) return 7.5625 * Math.pow(value - 0.818182, 2) + 0.9375;
        return 7.5625 * Math.pow(value - 0.954545, 2) + 0.984375;
    }

    /**
     * Use `y = {bounceIn(2x) / 2}[0, 0.5) + {bounceOut(2x - 1) / 2 + 0.5}[0.5, 1]` as easing function
     * @param value Original value
     */
    export function bounceInOut(value: number): number {
        return value < 0.5 ? bounceIn(value * 2) / 2 : bounceOut(value * 2 - 1) / 2 + 0.5;
    }

    /**
     * Use `y = x^2 * (2.70158x - 1.70158)` as easing function
     * @param value Original value
     */
    export function backIn(value: number): number {
        return Math.pow(value, 2) * (2.70158 * value - 1.70158);
    }

    /**
     * Use `y = (x - 1)^2 * (2.70158x - 1) + 1` as easing function
     * @param value Original value
     */
    export function backOut(value: number): number {
        return Math.pow(value - 1, 2) * (2.70158 * value - 1) + 1;
    }

    /**
     * Use `y = {2x^2 * (7.189819x - 2.5949095)}[0, 0.5) + {2(x - 1)^2 * (7.189819x - 4.5949095) + 1}[0.5, 1]` as easing function
     * @param value Original value
     */
    export function backInOut(value: number): number {
        return value < 0.5
            ? 2 * Math.pow(value, 2) * (7.189819 * value - 2.5949095)
            : 2 * (Math.pow(value - 1, 2) * (7.189819 * value - 4.5949095) + 2);
    }

    /**
     * Use `y = x^4 * sin(4.5πx)` as easing function
     * @param value Original value
     */
    export function elasticIn(value: number): number {
        return Math.pow(value, 4) * Math.sin(value * Math.PI * 4);
    }

    /**
     * Use `y = 1 - (x - 1)^4 * cos(4.5πx)` as easing function
     * @param value Original value
     */
    export function elasticOut(value: number): number {
        return 1 - Math.pow(value - 1, 4) * Math.cos(value * Math.PI * 4.5);
    }

    /**
     * Use `y = {8x^4 * sin(9πx)}[0, 0.45) + {0.5 + 0.75sin(4πx)}[0.45, 0.55) + {1 - 8(x - 1)^4 * sin(9πx)}[0.55, 1]` as easing function
     * @param value Original value
     */
    export function elasticInOut(value: number): number {
        if (value < 0.45) return 8 * Math.pow(value, 4) * Math.sin(value * Math.PI * 9);
        if (value < 0.55) return 0.5 + 0.75 * Math.sin(value * Math.PI * 4);
        return 1 - 8 * Math.pow(value - 1, 4) * Math.sin(value * Math.PI * 9);
    }
}

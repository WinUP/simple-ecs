import { ArrayExtension } from './extensions';

/**
 * Powerful logger than default `console`
 */
export class Logger {
    /**
     * Default color sheet of all loggers
     */
    public static readonly colorSheet: string[] = [
        '#F44336',
        '#E91E63',
        '#9C27B0',
        '#673AB7',
        '#3F51B5',
        '#2196F3',
        '#03A9F4',
        '#00BCD4',
        '#009688',
        '#4CAF50',
        '#8BC34A',
        '#CDDC39',
        '#FFEB3B',
        '#FFC107',
        '#FF9800',
        '#FF5722',
        '#795548',
        '#9E9E9E',
        '#607D8B'
    ];

    public static default: Logger = new Logger('Default');

    /**
     * Name of the logger
     */
    public name: string;

    /**
     * Parent of the logger
     */
    public parent?: Logger;

    /**
     * Get or set color of this logger
     */
    public color: string;

    /**
     * Create a new logger
     * @param name Logger name
     * @param parent Parent logger
     * @param color Logger color (or `undefined` to random pick one from color sheet)
     */
    public constructor(name: string, parent?: Logger, color?: string) {
        this.name = name;
        this.parent = parent;
        this.color = color ?? Logger.colorSheet[~~(Math.random() * Logger.colorSheet.length)];
    }

    /**
     * Create a new logger that using current logger as parent
     * @param name Logger name
     * @param color Logger color (or `undefined` to random pick one from color sheet)
     */
    public child(name: string, color?: string): Logger {
        return new Logger(name, this, color);
    }

    /**
     * Prints to `stderr` with newline.
     */
    public error(message: string): void {
        console.error(...this.format(message));
    }

    /**
     * Prints to `stderr` with newline.
     */
    public warn(message: string): void {
        console.warn(...this.format(message));
    }

    /**
     * Prints to `stdout` with newline.
     */
    public info(message: string): void {
        console.info(...this.format(message));
    }

    /**
     * Prints to `stdout` with newline.
     */
    public debug(message: string): void {
        console.debug(...this.format(message));
    }

    /**
     * Prints to `stderr` the string 'Trace :', followed by the {@link util.format()} formatted message and stack trace to the current position in the code.
     */
    public trace(message: string): void {
        console.trace(...this.format(message));
    }

    private format(message: string): string[] {
        const result = [''];
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let parent: Logger | undefined = this;
        while (parent != null) {
            result[0] = `%c[${parent.name}]%c${result[0]}`;
            ArrayExtension.insert(result, 1, `color: ${parent.color}`, 'color: inherit');
            parent = parent.parent;
        }
        result[0] += ` ${message}`;
        return result;
    }
}

export namespace StringExtension {
    /**
     * Returns the position of the first occurrence of a substring (with escape recognize)
     * @param source Target source value
     * @param searchString The substring to search for in the string
     * @param position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
     */
    export function indexOfWithoutEscape(source: string, searchString: string, position?: number): number {
        let index = source.indexOf(searchString, position);
        while (index > -1 && source.charAt[index - 1] === '\\') {
            index = source.indexOf(searchString, index + 1);
        }
        return index;
    }

    /**
     * Return a new string that presents camel case style of current string
     * @param source Target source value
     */
    export function toCamelCase(source: string): string {
        return source
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (item, index) => (index > 0 ? item.toUpperCase() : item.toLowerCase()))
            .replace(/\s+/g, '');
    }

    /**
     * Return a new string that presents pascal case style of current string
     * @param source Target source value
     */
    export function toPascalCase(source: string): string {
        return source.replace(/(?:^\w|\b\w)/g, item => item.toUpperCase()).replace(/\s+/g, '');
    }

    /**
     * Return a new string that presents snake case style of current string
     * @param source Target source value
     */
    export function toSnakeCase(source: string): string {
        return source
            .replace(/(?:^\w|[A-Z]|\b\w|\b\d)/g, (item, index) => (index > 0 ? `_${item.toLowerCase()}` : item.toLowerCase()))
            .replace(/(?:[A-Za-z]\d)/g, item => `${item[0]}_${item[1]}`)
            .replace(/\s+/g, '');
    }
}

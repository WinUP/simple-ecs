import type { Property } from './property';

/**
 * Template means a part of the collection of component's properties
 */
export class Template {
    /**
     * Get the value count of the template
     */
    public get size(): number {
        return this.fields.size;
    }

    private readonly fields: Map<string, any> = new Map();
    private readonly linkedProperties: Map<string, Property<any>> = new Map();

    /**
     * Set or update value for given name
     * @param name Name of the property
     * @param value Value of the property
     */
    public set(name: string, value: unknown): void {
        if (value === undefined) {
            this.delete(name);
            return;
        }
        this.fields.set(name, value);
        this.linkedProperties.get(name)?.updateTemplateValue(this);
    }

    /**
     * Get the value of given name
     * @param name Name of the property
     * @returns
     */
    public get(name: string): unknown {
        return this.fields.get(name);
    }

    /**
     * Delete the value for given name
     * @param name Name of the property
     */
    public delete(name: string): void {
        this.fields.delete(name);
        this.linkedProperties.get(name)?.updateTemplateValue(this);
    }

    /**
     * Get the collection of names inside the template
     */
    public keys(): IterableIterator<string> {
        return this.fields.keys();
    }

    /**
     * Remove all data from the template
     */
    public clear(): void {
        this.fields.clear();
        for (const e of this.linkedProperties.values()) e.updateTemplateValue(this);
        this.linkedProperties.clear();
    }

    /**
     * Indicate if the template includes given name
     * @param name Name of the property
     */
    public has(name: string): boolean {
        return this.fields.has(name);
    }

    /**
     * Link property with the template, which will update the property when value changed.
     * The listen target is based on property's name
     * @param property Target property
     */
    public linkProperty(property: Property<any>): void {
        this.linkedProperties.set(property.name, property);
    }

    /**
     * Unlink property with the template
     * @param property  Target property
     */
    public unlinkProperty(property: Property<any>): void {
        this.linkedProperties.delete(property.name);
    }
}

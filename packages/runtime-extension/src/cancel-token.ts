/**
 * Structure that contains one field called `isCancelled` to indicate if operation(s) were cancelled
 */
export class CancelToken {
    /**
     * Indicate if operation(s) were cancelled
     */
    public get isCancelled(): boolean {
        return this._isCancelled;
    }

    private _isCancelled: boolean = false;

    /**
     * Cancel related operation(s)
     */
    public cancel(): void {
        this._isCancelled = true;
    }
}

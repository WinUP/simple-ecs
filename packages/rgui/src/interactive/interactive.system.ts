import type { IInputEvent, IPointerInputEvent, IKeyInputEvent, IPointerPressInputEvent, IPointerScrollInputEvent } from './dispatcher';
import type * as PIXI from 'pixi.js';

import { Keys, EventTypes, KeyStatus, DeviceTypes, DefaultKeyGroups, DeviceTable, StateMap } from './dispatcher';
import { Component, ComponentSystem } from '@simple-ecs/core';
import { ArrayExtension } from '@simple-ecs/runtime-extension';
import { DisplayObject } from '../render/display-object.component';
import { Interactive } from './interactive.component';

export class InteractiveSystem extends ComponentSystem<Interactive> {
    private readonly hoveredComponents: Map<number, Interactive> = new Map();
    private readonly hoveredDevices: number[] = [0];

    /**
     * Broadcast an input event to view hierarchy
     * @param event Target event
     */
    public broadcastInput(event: IInputEvent): void {
        if (InteractiveSystem.isKeyEvent(event)) {
            if (Interactive.keyboardTarget == null) return;
            this.testHierarchy(Interactive.keyboardTarget)?.forEach(e => e.handler?.(event, e));
        } else if (InteractiveSystem.isPointerEvent(event)) {
            const result = this.findPointerTarget(event);
            const id = InteractiveSystem.getDeviceId(InteractiveSystem.createId(event));
            if (event.type === EventTypes.PressStart) {
                ArrayExtension.pushIfNotContains(this.hoveredDevices, id);
            } else if (event.type === EventTypes.PressCancel || event.type === EventTypes.PressEnd) {
                ArrayExtension.remove(this.hoveredDevices, id);
            }
            if (result && result.length > 0) {
                const pointedComponent = result[0];
                Interactive.autoFocus && (Interactive.keyboardTarget = pointedComponent);
                result.forEach(e => e.handler?.(event, e));
            } else {
                Interactive.autoFocus && (Interactive.keyboardTarget = undefined);
            }
        }
    }

    protected shouldLinkComponent(component: Component): boolean {
        return component instanceof Interactive;
    }

    protected beforeReleaseComponent(component: Interactive): void {
        for (const [id, target] of this.hoveredComponents.entries()) {
            if (target === component) {
                this.hoveredComponents.delete(id);
                break;
            }
        }
    }

    protected update(): void {
        this.updateHover(0);
        this.hoveredDevices.forEach(id => this.updateHover(id));
        if (InteractiveSystem.pendingEvents.length < 1) return;
        if (!InteractiveSystem.useEventParser) {
            ArrayExtension.clear(InteractiveSystem.pendingEvents);
            return;
        }
        let i = -1;
        while (++i < InteractiveSystem.pendingEvents.length) this.broadcastInput(InteractiveSystem.pendingEvents[i]);
        ArrayExtension.clear(InteractiveSystem.pendingEvents);
    }

    private findPointerTarget(pointer: PIXI.IPointData): Interactive[] | undefined {
        let result: Interactive[] | undefined;
        let pointedComponent: Interactive | undefined = undefined;
        let pointedZIndex: number = 0;
        this.components.forEach(component => {
            if (component.disabled) return;
            const displayObject = component.entity.getComponent<DisplayObject>(DisplayObject, true)?.displayObject;
            if (displayObject == null) return;
            const componentZIndex = displayObject.zIndex;
            if (pointedComponent && componentZIndex < pointedZIndex) return;
            if (!this.testHover(displayObject, pointer)) return;
            const list = this.testHierarchy(component);
            if (list == null) return;
            pointedComponent = component;
            pointedZIndex = componentZIndex;
            result = list;
        });
        return result;
    }

    private updateHover(id: number): void {
        const position = InteractiveSystem.states.getPosition(id);
        const hovered = this.hoveredComponents.get(id);
        const displayObject = hovered?.disabled
            ? undefined
            : hovered?.entity.getComponent<DisplayObject>(DisplayObject, true)?.displayObject;
        if (position == null) return;
        const list = this.findPointerTarget(position);
        if (list == null || list.length < 1 || (hovered && list.indexOf(hovered) < 0)) {
            if (hovered != null && displayObject != null) {
                hovered.handler?.(
                    {
                        source: id === 0 ? DeviceTypes.Mouse : DeviceTypes.Touch,
                        type: EventTypes.PointerLeave,
                        x: position.x,
                        y: position.y,
                        key: Keys.PointerIdle,
                        //~ 在 Dispatcher 中，鼠标的 ID 是 -1，触控的 ID 从 0 开始
                        //~ 在统一事件中，鼠标的 ID 是 0，触控的 ID 从 0x01开始
                        //~ 后者减去 1 刚好是前者
                        deviceId: id - 0x01
                    } as IPointerInputEvent,
                    hovered
                );
                this.hoveredComponents.delete(id);
            }
            if (list == null || list.length < 1) return;
        }
        const event: IPointerInputEvent = {
            source: id === 0 ? DeviceTypes.Mouse : DeviceTypes.Touch,
            type: EventTypes.PointerHover,
            x: position.x,
            y: position.y,
            key: Keys.PointerIdle,
            deviceId: id - 0x01
        };
        id !== 0 && Interactive.autoFocus && (Interactive.keyboardTarget = list[0]);
        for (let i = -1, length = list.length; ++i < length; ) {
            const target = list[i];
            if (target === hovered) break;
            target.handler?.(event, target);
        }
        this.hoveredComponents.set(id, list[0]);
    }

    private testHierarchy(source: Interactive): Interactive[] | undefined {
        let current: Interactive = source;
        const result: Interactive[] = [current];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            if (current.disabled) return;
            if (current.useDisplayHierarchy) {
                const parent = this.findInteractiveFromParent(
                    current.entity.getComponent<DisplayObject>(DisplayObject, true)?.displayObject
                );
                if (parent == null) return result;
                if (parent.disabled) return;
                result.push(parent);
                current = parent;
            } else {
                const parent = current.parent;
                if (parent == null) return result;
                if (parent.disabled) return;
                result.push(parent);
                current = parent;
            }
        }
    }

    private testHover(displayObject: PIXI.DisplayObject, data: PIXI.IPointData): boolean {
        if (displayObject.hitArea != null) {
            const point = displayObject.worldTransform.applyInverse(data);
            if (!displayObject.hitArea.contains(point.x, point.y)) return false;
            return true;
        }
        if (displayObject.mask != null) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const mask = displayObject.mask;
            if ('containsPoint' in mask) {
                if (!(mask as { containsPoint(point: PIXI.IPointData): boolean }).containsPoint(data)) return false;
                return true;
            }
        }
        if ('width' in displayObject && 'height' in displayObject) {
            const width = (displayObject as PIXI.Container).width / displayObject.scale.x;
            const height = (displayObject as PIXI.Container).height / displayObject.scale.y;
            const point = displayObject.worldTransform.applyInverse(data);
            if ('anchor' in displayObject) {
                const anchor = (displayObject as PIXI.Sprite).anchor;
                if (
                    point.x < -width * anchor.x ||
                    point.x > width * (1 - anchor.x) ||
                    point.y < -height * anchor.y ||
                    point.y > height * (1 - anchor.y)
                )
                    return false;
            } else {
                if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) return false;
            }
            return true;
        }
        return false;
    }

    private findInteractiveFromParent(root?: PIXI.DisplayObject | DisplayObject.LinkedDisplayObject): Interactive | undefined {
        let interactive: Interactive | undefined;
        let current: PIXI.DisplayObject | DisplayObject.LinkedDisplayObject | undefined = root;
        while (interactive == null) {
            if (current == null) return;
            'linkedComponent' in current && (interactive = current.linkedComponent.entity.getComponent(Interactive));
            if (interactive != null) break;
            current = current.parent;
        }
        return interactive;
    }
}

export namespace InteractiveSystem {
    const keyGroups: Map<string, Keys[]> = new Map();
    const pressingDevices: Set<number> = new Set();
    const changingDevices: Set<number> = new Set();

    /**
     * Events that will process in next frame
     */
    export const pendingEvents: IInputEvent[] = [];

    /**
     * Current state of each key in each device
     */
    export const states: StateMap = new StateMap();

    /**
     * Relation between device ID and device type
     */
    export const devices: DeviceTable = new DeviceTable();

    /**
     * Convert input data to events and broadcast to all interactive components, disable this
     * will also disable the feature that calls handlers on components, however input data will still
     * be stored in state map and can be used manually.
     */
    // eslint-disable-next-line prefer-const
    export let useEventParser: boolean = true;

    /**
     * Input event detectors
     */
    export const detectors: ((state: number, id: number, event: IInputEvent) => void)[] = [
        updateDevices,
        detectDeviceStatus,
        detectKeyEvent,
        detectKeyPress,
        detectPointerPress,
        detectPointerEvent,
        updateUniqueState
    ];

    function updateDevices(_state: number, id: number, event: IInputEvent): void {
        devices.set(id, event.source);
    }

    function detectKeyEvent(state: number, id: number, event: IInputEvent): void {
        if (!isKeyEvent(event)) return;
        const deviceId = getDeviceId(id);
        switch (event.type) {
            case EventTypes.KeyDown:
                if ((state & KeyStatus.Active) !== 0) {
                    // If keydown event send when button is active, which means same key pressed with different pressure
                    states.appendKeyStatus(id, KeyStatus.Changed);
                    changingDevices.add(deviceId);
                } else {
                    states.appendKeyStatus(id, KeyStatus.Active);
                    pressingDevices.add(deviceId);
                }
                states.setExtraData(id, event.pressure * 65535);
                break;
            case EventTypes.KeyUp:
                states.subtractKeyStatus(id, KeyStatus.Active);
                states.subtractKeyStatus(id, KeyStatus.Changed);
                states.setExtraData(id, 0);
                pressingDevices.delete(deviceId);
                changingDevices.delete(deviceId);
                break;
            case EventTypes.Press:
                break;
        }
        states.setEventType(id, event.type);
        states.setKey(id, event.key);
    }

    function detectKeyPress(state: number, id: number, event: IInputEvent): void {
        if (!isKeyEvent(event) || !checkState(state, [KeyStatus.Active], [KeyStatus.Changed]) || event.type !== EventTypes.KeyUp) return;
        const pressEvent: IKeyInputEvent = {
            source: event.source,
            type: EventTypes.Press,
            deviceId: event.deviceId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            rawEvent: event.rawEvent,
            key: event.key,
            pressure: 0
        };
        states.setEventType(id, EventTypes.Press);
        useEventParser && pendingEvents.push(pressEvent);
    }

    function detectDeviceStatus(_state: number, id: number, event: IInputEvent): void {
        if (event.type === EventTypes.Connected) {
            states.appendKeyStatus(id, KeyStatus.Connected);
        } else if (event.type === EventTypes.Disconnected) {
            states.subtractKeyStatus(id, KeyStatus.Connected);
        }
        states.setEventType(id, event.type);
        useEventParser && pendingEvents.push(event);
    }

    function detectPointerEvent(_state: number, id: number, event: IInputEvent): void {
        if (!isPointerEvent(event)) return;
        const deviceId = getDeviceId(id);
        switch (event.type) {
            case EventTypes.PressStart:
                states.appendKeyStatus(id, KeyStatus.Active);
                pressingDevices.add(deviceId);
                states.setPosition(deviceId, event);
                break;
            case EventTypes.PressMove:
                states.appendKeyStatus(id, KeyStatus.Changed);
                changingDevices.add(deviceId);
                states.setPosition(deviceId, event);
                break;
            case EventTypes.PressCancel:
            case EventTypes.PressEnd:
                states.subtractKeyStatus(id, KeyStatus.Active);
                states.subtractKeyStatus(id, KeyStatus.Changed);
                pressingDevices.delete(deviceId);
                changingDevices.delete(deviceId);
                //~ 保留最后一个指针位置，这样还能允许其他代码取历史数据以实现特定功能，比如 Hover 检查
                // states.resetPosition(deviceId);
                break;
            case EventTypes.Scroll:
            case EventTypes.Press:
            case EventTypes.PointerHover:
            case EventTypes.PointerLeave:
                break;
        }
        states.setEventType(id, event.type);
        states.setKey(id, event.key);
    }

    function detectPointerPress(state: number, id: number, event: IInputEvent): void {
        if (
            event.type !== EventTypes.PressEnd ||
            !isPointerPressEvent(event) ||
            !checkState(state, [KeyStatus.Active], [KeyStatus.Changed])
        )
            return;
        const pressEvent: IPointerPressInputEvent = {
            source: event.source,
            type: EventTypes.Press,
            deviceId: event.deviceId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            rawEvent: event.rawEvent,
            key: event.key,
            x: event.x,
            y: event.y,
            deltaTime: event.deltaTime
        };
        states.setEventType(id, EventTypes.Press);
        useEventParser && pendingEvents.push(pressEvent);
    }

    function updateUniqueState(_state: number, id: number, event: IInputEvent): void {
        const normalizedId = createId(
            event.source === DeviceTypes.Keyboard || event.source === DeviceTypes.Gamepad
                ? DeviceTypes.AnyKeyDevices
                : DeviceTypes.AnyPointerDevices,
            getButtonId(id)
        );
        if (pressingDevices.size > 0) {
            states.appendKeyStatus(normalizedId, KeyStatus.Active);
        } else {
            states.subtractKeyStatus(normalizedId, KeyStatus.Active);
        }
        if (changingDevices.size > 0) {
            states.appendKeyStatus(normalizedId, KeyStatus.Changed);
        } else {
            states.subtractKeyStatus(normalizedId, KeyStatus.Changed);
        }
        if (event.type === EventTypes.Connected) {
            states.appendKeyStatus(normalizedId, KeyStatus.Connected);
        } else if (event.type === EventTypes.Disconnected) {
            states.subtractKeyStatus(normalizedId, KeyStatus.Connected);
        }
        states.setEventType(normalizedId, event.type);
        if (isKeyEvent(event) || isPointerEvent(event)) {
            states.setKey(normalizedId, event.key);
        }
        states.setExtraData(normalizedId, pressingDevices.size);
    }

    /**
     * Check if given state can confident conditions
     * @param state Target state
     * @param includes Sub-states that given state should includes
     * @param excludes Sub-states that given state should not includes
     */
    export function checkState(state: number, includes?: number[], excludes?: number[]): boolean {
        let result: boolean = true;
        includes && includes.length > 0 && (result = includes.every(e => (state & e) !== 0));
        excludes && excludes.length > 0 && (result = result && excludes.every(e => (state & e) === 0));
        return result;
    }

    /**
     * Check if given event can fit any of given event types
     * @param target Target event
     * @param types Event types that event should at least fits one
     */
    export function isEventType(target: IInputEvent, ...types: EventTypes[]): boolean {
        return types.some(e => target.type === e);
    }

    /**
     * Indicate if given event is `IKeyInputEvent`
     * @param target Target event
     */
    export function isKeyEvent(target: IInputEvent): target is IKeyInputEvent {
        return 'pressure' in target && 'key' in target;
    }

    /**
     * Indicate if given event is `IPointerInputEvent`
     * @param target Target event
     */
    export function isPointerEvent(target: IInputEvent): target is IPointerInputEvent {
        return 'x' in target && 'y' in target;
    }

    /**
     * Indicate if given event is `IPointerPressInputEvent`
     * @param target Target event
     */
    export function isPointerPressEvent(target: IInputEvent): target is IPointerPressInputEvent {
        return (
            isPointerEvent(target) &&
            (target.type === EventTypes.PressStart ||
                target.type === EventTypes.PressMove ||
                target.type === EventTypes.PressEnd ||
                target.type === EventTypes.PressCancel ||
                target.type === EventTypes.Press)
        );
    }

    /**
     * Indicate if given event is `IPointerScrollInputEvent`
     * @param target Target event
     */
    export function isPointerScrollEvent(target: IInputEvent): target is IPointerScrollInputEvent {
        return isPointerEvent(target) && 'deltaX' in target && 'deltaY' in target;
    }

    /**
     * Calculate state ID
     * @param device Device type
     * @param key Key ID
     */
    export function createId(
        device: DeviceTypes.Keyboard | DeviceTypes.Mouse | DeviceTypes.AnyKeyDevices | DeviceTypes.AnyPointerDevices,
        key: Keys
    ): number;
    /**
     * Calculate state ID
     * @param device Device type
     * @param id Raw device ID
     * @param key Key ID
     */
    export function createId(device: DeviceTypes.Gamepad, id: number, key: Keys): number;
    /**
     * Calculate state ID
     * @param device Device type
     * @param id Raw device ID
     */
    export function createId(device: DeviceTypes.Touch, id: number): number;
    // tslint:disable-next-line: unified-signatures
    /**
     * Calculate state ID
     * @param event Input event
     */
    export function createId(event: IInputEvent): number;
    export function createId(target: IInputEvent | DeviceTypes, p2?: number, p3?: Keys): number {
        let deviceId: number = 0;
        let buttonId: number = 0;
        switch (target) {
            case DeviceTypes.Keyboard:
                deviceId = 0x80;
                buttonId = p2 ? p2 + 0x15 : 0xffffff;
                break;
            case DeviceTypes.Mouse:
                deviceId = 0x00;
                buttonId = p2 ?? 0xffffff;
                break;
            case DeviceTypes.Gamepad:
                deviceId = p2 ? p2 + 0x81 : 0xff;
                buttonId = p3 ? p3 + 0x15 : 0xffffff;
                break;
            case DeviceTypes.Touch:
                deviceId = p2 ? p2 + 0x01 : 0xff;
                buttonId = 0x01;
                break;
            case DeviceTypes.AnyKeyDevices:
            case DeviceTypes.AnyPointerDevices:
            case DeviceTypes.Unknown:
                deviceId = target === DeviceTypes.AnyKeyDevices ? 0x7f : target === DeviceTypes.AnyPointerDevices ? 0xfe : 0xff;
                buttonId = p2 ? p2 + 0x15 : 0xffffff;
                break;
            default:
                deviceId =
                    target.source === DeviceTypes.Keyboard
                        ? 0x80
                        : target.source === DeviceTypes.Mouse
                        ? 0x00
                        : target.source === DeviceTypes.Gamepad
                        ? target.deviceId + 0x81
                        : target.source === DeviceTypes.Touch
                        ? target.deviceId + 0x01
                        : 0xff;
                buttonId = isPointerEvent(target) ? target.key : isKeyEvent(target) ? target.key + 0x15 : 0xffffff;
                break;
        }
        return deviceId + (buttonId << 8);
    }

    /**
     * Split state ID to device ID and button ID
     * @param id Status ID
     */
    export function splitStateId(id: number): { device: number; button: number } {
        return {
            device: getDeviceId(id),
            button: getButtonId(id)
        };
    }

    /**
     * Get device ID from state ID
     * @param id Status ID
     */
    export function getDeviceId(id: number): number {
        return id & 0xff;
    }

    /**
     * Get button ID from state ID
     * @param id Status ID
     */
    export function getButtonId(id: number): number {
        return id >>> 8;
    }

    /**
     * Update input status
     * @param event Input event
     */
    export function update(event: IInputEvent): void {
        const id = createId(event);
        for (let i = -1, length = detectors.length; ++i < length; ) {
            const state = states.get(id);
            detectors[i](state, id, event);
        }
    }

    /**
     * Indicate if given key or any key of given key group is pressing
     * @param key Key ID or name of key group
     * @param event Only search this event but not all devices if given
     */
    export function isKeyPressing(key: Keys | string, event?: IInputEvent): boolean {
        const keys = typeof key === 'number' ? [key] : keyGroups.get(key);
        if (keys == null) return false;
        if (event) {
            return isKeyEvent(event) || isPointerEvent(event) ? keys.some(e => e === event.key) : false;
        } else {
            return keys.some(e => states.getExtraData(createId(DeviceTypes.AnyKeyDevices, e)) > 0);
        }
    }

    /**
     * Indicate if given button is pressing
     * @param key Button ID
     */
    export function isPointerPressing(key: Keys): boolean {
        return states.getExtraData(createId(DeviceTypes.AnyPointerDevices, key)) > 0;
    }

    /**
     * Create new alias of key or multiple keys
     * @param name Alias' name
     * @param keys Target keys
     */
    export function createKeyGroup(name: string, ...keys: Keys[]): void {
        keyGroups.set(name, keys);
    }

    createKeyGroup(
        DefaultKeyGroups.Direction,
        Keys.ArrowUp,
        Keys.ArrowDown,
        Keys.ArrowLeft,
        Keys.ArrowRight,
        Keys.GamepadUp,
        Keys.GamepadDown,
        Keys.GamepadLeft,
        Keys.GamepadRight
    );
    createKeyGroup(DefaultKeyGroups.Confirm, Keys.Enter, Keys.Space, Keys.KeyZ, Keys.GamepadA);
    createKeyGroup(DefaultKeyGroups.Cancel, Keys.KeyX, Keys.Escape, Keys.GamepadB);
    createKeyGroup(DefaultKeyGroups.GamepadLeftAxes, Keys.GamepadAxesLeftX, Keys.GamepadAxesLeftY);
    createKeyGroup(DefaultKeyGroups.GamepadRightAxes, Keys.GamepadAxesRightX, Keys.GamepadAxesRightY);
}

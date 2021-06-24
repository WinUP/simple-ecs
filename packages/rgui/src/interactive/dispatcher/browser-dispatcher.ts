import type {
    AnyKeyEvent,
    IKeyInputEvent,
    IPointerInputEvent,
    IPointerScrollInputEvent,
    IPointerPressInputEvent,
    IInputEvent
} from './input.model';

import { DeviceTypes, EventTypes, Keys } from './input.model';
import { InteractiveSystem } from '../interactive.system';

export namespace BrowserDispatcher {
    let running: boolean = false;
    let mouseStatus: number = 0;
    let windowListened: boolean = false;
    const touchStartTime: (number | undefined)[] = [];
    const GamepadDetectionThreshold: number = 0.05;
    const gamepadStatus: { [key: number]: { buttons: { pressed: boolean; value: number }[]; axes: number[] } } = {};

    function createKeyEvent(raw: KeyboardEvent, type: AnyKeyEvent): IKeyInputEvent {
        return {
            source: DeviceTypes.Keyboard,
            deviceId: -1,
            rawEvent: raw,
            type: type,
            key: Keys.parse(raw.code),
            pressure: 1
        };
    }

    function createGamepadEvent(index: number, key: Keys, pressure: number, type: AnyKeyEvent): IKeyInputEvent {
        return {
            source: DeviceTypes.Gamepad,
            deviceId: index,
            rawEvent: undefined,
            type: type,
            key: key,
            pressure: pressure
        };
    }

    function onKeyDown(raw: KeyboardEvent): void {
        InteractiveSystem.update(createKeyEvent(raw, EventTypes.KeyDown));
    }

    function onKeyUp(raw: KeyboardEvent): void {
        InteractiveSystem.update(createKeyEvent(raw, EventTypes.KeyUp));
    }

    function onWheel(raw: WheelEvent): void {
        const event: IPointerScrollInputEvent = {
            source: DeviceTypes.Mouse,
            deviceId: -1,
            rawEvent: raw,
            key: Keys.PointerIdle,
            type: EventTypes.Scroll,
            x: raw.offsetX,
            y: raw.offsetY,
            deltaX: raw.deltaX,
            deltaY: raw.deltaY
        };
        InteractiveSystem.update(event);
    }

    function onMouseDown(raw: MouseEvent): void {
        const event: IPointerInputEvent = {
            source: DeviceTypes.Mouse,
            deviceId: -1,
            rawEvent: raw,
            key: raw.buttons & ~mouseStatus,
            type: EventTypes.PressStart,
            x: raw.offsetX,
            y: raw.offsetY
        };
        touchStartTime[event.deviceId] = Date.now();
        mouseStatus = raw.buttons;
        InteractiveSystem.update(event);
    }

    function onMouseUp(raw: MouseEvent): void {
        const event: IPointerPressInputEvent = {
            source: DeviceTypes.Mouse,
            deviceId: -1,
            rawEvent: raw,
            key: mouseStatus & ~raw.buttons,
            type: EventTypes.PressEnd,
            x: raw.offsetX,
            y: raw.offsetY,
            deltaTime: Date.now() - (touchStartTime[-1] ?? 0)
        };
        touchStartTime[event.deviceId] = undefined;
        mouseStatus = raw.buttons;
        InteractiveSystem.update(event);
    }

    function onMouseMove(raw: MouseEvent): void {
        const event: IPointerInputEvent = {
            source: DeviceTypes.Mouse,
            deviceId: -1,
            rawEvent: raw,
            key: Keys.PointerIdle,
            type: EventTypes.PressMove,
            x: raw.offsetX,
            y: raw.offsetY
        };
        InteractiveSystem.update(event);
    }

    function onTouchStart(raw: TouchEvent): void {
        const rect = (raw.currentTarget as HTMLElement).getBoundingClientRect();
        for (
            let i = -1, length = raw.changedTouches.length, item = raw.changedTouches.item(0);
            ++i < length;
            item = raw.changedTouches.item(i + 1)
        ) {
            if (item == null) continue;
            const event: IPointerPressInputEvent = {
                source: DeviceTypes.Touch,
                deviceId: item.identifier,
                rawEvent: raw,
                key: Keys.PointerPrimaryButton,
                type: EventTypes.PressStart,
                x: item.clientX - rect.left,
                y: item.clientY - rect.top,
                deltaTime: 0
            };
            touchStartTime[event.deviceId] = Date.now();
            InteractiveSystem.update(event);
        }
    }

    function onTouchEnd(raw: TouchEvent): void {
        const rect = (raw.currentTarget as HTMLElement).getBoundingClientRect();
        for (
            let i = -1, length = raw.changedTouches.length, item = raw.changedTouches.item(0);
            ++i < length;
            item = raw.changedTouches.item(i + 1)
        ) {
            if (item == null) continue;
            const event: IPointerPressInputEvent = {
                source: DeviceTypes.Touch,
                deviceId: item.identifier,
                rawEvent: raw,
                key: Keys.PointerPrimaryButton,
                type: EventTypes.PressEnd,
                x: item.clientX - rect.left,
                y: item.clientY - rect.top,
                deltaTime: Date.now() - (touchStartTime[item.identifier] ?? 0)
            };
            touchStartTime[event.deviceId] = undefined;
            InteractiveSystem.update(event);
        }
    }

    function onTouchMove(raw: TouchEvent): void {
        const rect = (raw.currentTarget as HTMLElement).getBoundingClientRect();
        for (
            let i = -1, length = raw.changedTouches.length, item = raw.changedTouches.item(0);
            ++i < length;
            item = raw.changedTouches.item(i + 1)
        ) {
            if (item == null) continue;
            const event: IPointerInputEvent = {
                source: DeviceTypes.Touch,
                deviceId: item.identifier,
                rawEvent: raw,
                key: Keys.PointerPrimaryButton,
                type: EventTypes.PressMove,
                x: item.clientX - rect.left,
                y: item.clientY - rect.top
            };
            InteractiveSystem.update(event);
        }
    }

    function onTouchCancel(raw: TouchEvent): void {
        const rect = (raw.currentTarget as HTMLElement).getBoundingClientRect();
        for (
            let i = -1, length = raw.changedTouches.length, item = raw.changedTouches.item(0);
            ++i < length;
            item = raw.changedTouches.item(i + 1)
        ) {
            if (item == null) continue;
            const event: IPointerPressInputEvent = {
                source: DeviceTypes.Touch,
                deviceId: item.identifier,
                rawEvent: raw,
                key: Keys.PointerPrimaryButton,
                type: EventTypes.PressCancel,
                x: item.clientX - rect.left,
                y: item.clientY - rect.top,
                deltaTime: Date.now() - (touchStartTime[item.identifier] ?? 0)
            };
            touchStartTime[event.deviceId] = undefined;
            InteractiveSystem.update(event);
        }
    }

    function onGamepadConnected(raw: GamepadEvent): void {
        const event: IInputEvent = {
            source: DeviceTypes.Gamepad,
            type: EventTypes.Connected,
            deviceId: raw.gamepad.index,
            rawEvent: raw
        };
        InteractiveSystem.update(event);
    }

    function onGamepadDisconnected(raw: GamepadEvent): void {
        const event: IInputEvent = {
            source: DeviceTypes.Gamepad,
            type: EventTypes.Disconnected,
            deviceId: raw.gamepad.index,
            rawEvent: raw
        };
        InteractiveSystem.update(event);
    }

    function updateGamepad(): void {
        const gamepads = navigator.getGamepads();
        if (gamepads.length < 1) return;
        for (let i = -1, length = gamepads.length; ++i < length; ) {
            const gamepad = gamepads[i];
            if (!gamepad || !gamepad.connected || (gamepad.buttons.length < 1 && gamepad.axes.length < 1)) continue;
            const status = gamepadStatus[gamepad.index];
            for (let j = -1, axesLength = gamepad.axes.length; ++j < axesLength; ) {
                if (Math.abs(status.axes[j]) > GamepadDetectionThreshold && Math.abs(gamepad.axes[j]) < GamepadDetectionThreshold) {
                    status.axes[j] = 0;
                    InteractiveSystem.update(createGamepadEvent(gamepad.index, j - 18, 0, EventTypes.KeyUp));
                } else if (Math.abs(gamepad.axes[j] - +status.axes[j]) >= GamepadDetectionThreshold) {
                    status.axes[j] = gamepad.axes[j];
                    InteractiveSystem.update(createGamepadEvent(gamepad.index, j - 18, status.axes[j], EventTypes.KeyDown));
                }
            }
            for (let j = -1, buttonsLength = gamepad.buttons.length; ++j < buttonsLength; ) {
                const button = gamepad.buttons[j];
                const buttonStatus = status.buttons[j];
                if (button.pressed !== buttonStatus.pressed || Math.abs(button.value - buttonStatus.value) > GamepadDetectionThreshold) {
                    buttonStatus.pressed = button.pressed;
                    buttonStatus.value = button.value;
                    if (buttonStatus.pressed) {
                        InteractiveSystem.update(createGamepadEvent(gamepad.index, j - 1, buttonStatus.value, EventTypes.KeyDown));
                    } else {
                        InteractiveSystem.update(createGamepadEvent(gamepad.index, j - 1, 0, EventTypes.KeyUp));
                    }
                }
            }
        }
        running && requestAnimationFrame(updateGamepad);
    }

    /**
     * Start listen keyboard/mouse/pointer/touch/gamepad events
     * @param element Element that generates raw event data
     */
    export function listen(element: HTMLElement): void {
        if (running) return;
        if (!windowListened) {
            window.addEventListener('gamepadconnected', onGamepadConnected);
            window.addEventListener('gamepaddisconnected', onGamepadDisconnected);
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
            windowListened = true;
        }
        element.addEventListener('wheel', onWheel);
        element.addEventListener('mousedown', onMouseDown);
        element.addEventListener('mouseup', onMouseUp);
        element.addEventListener('mousemove', onMouseMove);
        element.addEventListener('touchstart', onTouchStart);
        element.addEventListener('touchmove', onTouchMove);
        element.addEventListener('touchcancel', onTouchCancel);
        element.addEventListener('touchend', onTouchEnd);
        running = true;
        requestAnimationFrame(updateGamepad);
    }

    /**
     * Stop listen keyboard/mouse/pointer/touch/gamepad events
     * @param element Element that generates raw event data
     */
    export function release(element: HTMLElement): void {
        if (!running) return;
        if (windowListened) {
            window.removeEventListener('gamepadconnected', onGamepadConnected);
            window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            windowListened = false;
        }
        element.removeEventListener('wheel', onWheel);
        element.removeEventListener('mousedown', onMouseDown);
        element.removeEventListener('mouseup', onMouseUp);
        element.removeEventListener('mousemove', onMouseMove);
        element.removeEventListener('touchstart', onTouchStart);
        element.removeEventListener('touchmove', onTouchMove);
        element.removeEventListener('touchcancel', onTouchCancel);
        element.removeEventListener('touchend', onTouchEnd);
        running = false;
    }
}

/* eslint-disable @typescript-eslint/no-unnecessary-qualifier */
import type { Interactive } from '../interactive.component';

export enum DeviceTypes {
    Keyboard,
    Gamepad,
    Mouse,
    Touch,
    AnyKeyDevices,
    AnyPointerDevices,
    Unknown
}

export enum KeyStatus {
    Active = 1,
    Changed = 1 << 1,
    Connected = 1 << 2
}

export enum EventTypes {
    KeyDown,
    KeyUp,
    PressStart,
    PressMove,
    PressEnd,
    PressCancel,
    Scroll,
    Connected,
    Disconnected,
    Press,
    PointerHover,
    PointerLeave,
    LostFocus,
    Focused
}

/**
 * All available keys, see https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/key/Key_Values for the entire list.
 */
export enum Keys {
    Unidentified = 0xffffff,
    GamepadA = -1,
    GamepadB = -2,
    GamepadX = -3,
    GamepadY = -4,
    GamePadLB = -5,
    GamepadRB = -6,
    GamepadLT = -7,
    GamepadRT = -8,
    GamepadBack = -9,
    GamepadStart = -10,
    GamepadLeftStick = -11,
    GamepadRightStick = -12,
    GamepadUp = -13,
    GamepadDown = -14,
    GamepadLeft = -15,
    GamepadRight = -16,
    GamepadGuide = -17,
    GamepadAxesLeftX = -18,
    GamepadAxesLeftY = -19,
    GamepadAxesRightX = -20,
    GamepadAxesRightY = -21,

    PointerIdle = 0,
    PointerPrimaryButton = 1,
    PointerSecondaryButton = 2,
    PointerAuxilaryButton = 4,
    Escape,
    Digit0,
    Digit1,
    Digit2,
    Digit3,
    Digit4,
    Digit5,
    Digit6,
    Digit7,
    Digit8,
    Digit9,
    Minus,
    Equal,
    Backspace,
    Tab,
    KeyQ,
    KeyW,
    KeyE,
    KeyR,
    KeyT,
    KeyY,
    KeyU,
    KeyI,
    KeyO,
    KeyP,
    BracketLeft,
    BracketRight,
    Enter,
    ControlLeft,
    KeyA,
    KeyS,
    KeyD,
    KeyF,
    KeyG,
    KeyH,
    KeyJ,
    KeyK,
    KeyL,
    Semicolon,
    Quote,
    Backquote,
    ShiftLeft,
    Backslash,
    KeyZ,
    KeyX,
    KeyC,
    KeyV,
    KeyB,
    KeyN,
    KeyM,
    Comma,
    Period,
    Slash,
    ShiftRight,
    NumpadMultiply,
    AltLeft,
    Space,
    CapsLock,
    F1,
    F2,
    F3,
    F4,
    F5,
    F6,
    F7,
    F8,
    F9,
    F10,
    Pause,
    ScrollLock,
    Numpad7,
    Numpad8,
    Numpad9,
    NumpadSubtract,
    Numpad4,
    Numpad5,
    Numpad6,
    NumpadAdd,
    Numpad1,
    Numpad2,
    Numpad3,
    Numpad0,
    NumpadDecimal,
    PrintScreen,
    IntlBackslash,
    F11,
    F12,
    NumpadEqual,
    Convert,
    NonConvert,
    IntlYen,
    NumpadComma,
    MediaTrackPrevious,
    MediaTrackNext,
    NumpadEnter,
    ControlRight,
    AudioVolumeMute,
    MediaPlayPause,
    MediaStop,
    AudioVolumeDown,
    AudioVolumeUp,
    BrowserHome,
    NumpadDivide,
    AltRight,
    NumLock,
    Home,
    ArrowUp,
    PageUp,
    ArrowLeft,
    ArrowRight,
    End,
    ArrowDown,
    PageDown,
    Insert,
    Delete,
    MetaLeft,
    MetaRight,
    ContextMenu,
    Power,
    BrowserSearch,
    BrowserFavorites,
    BrowserRefresh,
    BrowserStop,
    BrowserForward,
    BrowserBack
}

export namespace Keys {
    export function parse(source: string): Keys {
        switch (source) {
            case 'Escape':
                return Keys.Escape;
            case 'Digit0':
                return Keys.Digit0;
            case 'Digit1':
                return Keys.Digit1;
            case 'Digit2':
                return Keys.Digit2;
            case 'Digit3':
                return Keys.Digit3;
            case 'Digit4':
                return Keys.Digit4;
            case 'Digit5':
                return Keys.Digit5;
            case 'Digit6':
                return Keys.Digit6;
            case 'Digit7':
                return Keys.Digit7;
            case 'Digit8':
                return Keys.Digit8;
            case 'Digit9':
                return Keys.Digit9;
            case 'Minus':
                return Keys.Minus;
            case 'Equal':
                return Keys.Equal;
            case 'Backspace':
                return Keys.Backspace;
            case 'Tab':
                return Keys.Tab;
            case 'KeyQ':
                return Keys.KeyQ;
            case 'KeyW':
                return Keys.KeyW;
            case 'KeyE':
                return Keys.KeyE;
            case 'KeyR':
                return Keys.KeyR;
            case 'KeyT':
                return Keys.KeyT;
            case 'KeyY':
                return Keys.KeyY;
            case 'KeyU':
                return Keys.KeyU;
            case 'KeyI':
                return Keys.KeyI;
            case 'KeyO':
                return Keys.KeyO;
            case 'KeyP':
                return Keys.KeyP;
            case 'BracketLeft':
                return Keys.BracketLeft;
            case 'BracketRight':
                return Keys.BracketRight;
            case 'Enter':
                return Keys.Enter;
            case 'ControlLeft':
                return Keys.ControlLeft;
            case 'KeyA':
                return Keys.KeyA;
            case 'KeyS':
                return Keys.KeyS;
            case 'KeyD':
                return Keys.KeyD;
            case 'KeyF':
                return Keys.KeyF;
            case 'KeyG':
                return Keys.KeyG;
            case 'KeyH':
                return Keys.KeyH;
            case 'KeyJ':
                return Keys.KeyJ;
            case 'KeyK':
                return Keys.KeyK;
            case 'KeyL':
                return Keys.KeyL;
            case 'Semicolon':
                return Keys.Semicolon;
            case 'Quote':
                return Keys.Quote;
            case 'Backquote':
                return Keys.Backquote;
            case 'ShiftLeft':
                return Keys.ShiftLeft;
            case 'Backslash':
                return Keys.Backslash;
            case 'KeyZ':
                return Keys.KeyZ;
            case 'KeyX':
                return Keys.KeyX;
            case 'KeyC':
                return Keys.KeyC;
            case 'KeyV':
                return Keys.KeyV;
            case 'KeyB':
                return Keys.KeyB;
            case 'KeyN':
                return Keys.KeyN;
            case 'KeyM':
                return Keys.KeyM;
            case 'Comma':
                return Keys.Comma;
            case 'Period':
                return Keys.Period;
            case 'Slash':
                return Keys.Slash;
            case 'ShiftRight':
                return Keys.ShiftRight;
            case 'NumpadMultiply':
                return Keys.NumpadMultiply;
            case 'AltLeft':
                return Keys.AltLeft;
            case 'Space':
                return Keys.Space;
            case 'CapsLock':
                return Keys.CapsLock;
            case 'F1':
                return Keys.F1;
            case 'F2':
                return Keys.F2;
            case 'F3':
                return Keys.F3;
            case 'F4':
                return Keys.F4;
            case 'F5':
                return Keys.F5;
            case 'F6':
                return Keys.F6;
            case 'F7':
                return Keys.F7;
            case 'F8':
                return Keys.F8;
            case 'F9':
                return Keys.F9;
            case 'F10':
                return Keys.F10;
            case 'Pause':
                return Keys.Pause;
            case 'ScrollLock':
                return Keys.ScrollLock;
            case 'Numpad7':
                return Keys.Numpad7;
            case 'Numpad8':
                return Keys.Numpad8;
            case 'Numpad9':
                return Keys.Numpad9;
            case 'NumpadSubtract':
                return Keys.NumpadSubtract;
            case 'Numpad4':
                return Keys.Numpad4;
            case 'Numpad5':
                return Keys.Numpad5;
            case 'Numpad6':
                return Keys.Numpad6;
            case 'NumpadAdd':
                return Keys.NumpadAdd;
            case 'Numpad1':
                return Keys.Numpad1;
            case 'Numpad2':
                return Keys.Numpad2;
            case 'Numpad3':
                return Keys.Numpad3;
            case 'Numpad0':
                return Keys.Numpad0;
            case 'NumpadDecimal':
                return Keys.NumpadDecimal;
            case 'PrintScreen':
                return Keys.PrintScreen;
            case 'IntlBackslash':
                return Keys.IntlBackslash;
            case 'F11':
                return Keys.F11;
            case 'F12':
                return Keys.F12;
            case 'NumpadEqual':
                return Keys.NumpadEqual;
            case 'Convert':
                return Keys.Convert;
            case 'NonConvert':
                return Keys.NonConvert;
            case 'IntlYen':
                return Keys.IntlYen;
            case 'NumpadComma':
                return Keys.NumpadComma;
            case 'MediaTrackPrevious':
                return Keys.MediaTrackPrevious;
            case 'MediaTrackNext':
                return Keys.MediaTrackNext;
            case 'NumpadEnter':
                return Keys.NumpadEnter;
            case 'ControlRight':
                return Keys.ControlRight;
            case 'AudioVolumeMute':
            case 'VolumeMute':
                return Keys.AudioVolumeMute;
            case 'MediaPlayPause':
                return Keys.MediaPlayPause;
            case 'MediaStop':
                return Keys.MediaStop;
            case 'AudioVolumeDown':
            case 'VolumeDown':
                return Keys.AudioVolumeDown;
            case 'AudioVolumeUp':
            case 'VolumeUp':
                return Keys.AudioVolumeUp;
            case 'BrowserHome':
                return Keys.BrowserHome;
            case 'NumpadDivide':
                return Keys.NumpadDivide;
            case 'AltRight':
                return Keys.AltRight;
            case 'Home':
                return Keys.Home;
            case 'ArrowUp':
                return Keys.ArrowUp;
            case 'PageUp':
                return Keys.PageUp;
            case 'ArrowLeft':
                return Keys.ArrowLeft;
            case 'ArrowRight':
                return Keys.ArrowRight;
            case 'End':
                return Keys.End;
            case 'ArrowDown':
                return Keys.ArrowDown;
            case 'PageDown':
                return Keys.PageDown;
            case 'Insert':
                return Keys.Insert;
            case 'Delete':
                return Keys.Delete;
            case 'MetaLeft':
            case 'OSLeft':
                return Keys.MetaLeft;
            case 'MetaRight':
            case 'OSRight':
                return Keys.MetaRight;
            case 'ContextMenu':
                return Keys.ContextMenu;
            case 'Power':
                return Keys.Power;
            case 'BrowserSearch':
                return Keys.BrowserSearch;
            case 'BrowserFavorites':
                return Keys.BrowserFavorites;
            case 'BrowserRefresh':
                return Keys.BrowserRefresh;
            case 'BrowserStop':
            case 'Cancel':
                return Keys.BrowserStop;
            case 'BrowserForward':
                return Keys.BrowserForward;
            case 'BrowserBack':
                return Keys.BrowserBack;
            default:
                return Keys.Unidentified;
        }
    }
}

/**
 * Pre-defined key groups
 */
export enum DefaultKeyGroups {
    /**
     * Direction keys, include arrow keys from keyboard and gamepad
     */
    Direction = 'Direction',

    /**
     * Confirm keys, include `Enter`, `Space`, `Z` and `GamepadA`
     */
    Confirm = 'Confirm',

    /**
     * Cancel keys, include `X`, `Escape` and `GamepadB`
     */
    Cancel = 'Cancel',

    /**
     * Left X/Y axes of gamepad
     */
    GamepadLeftAxes = 'GamepadLeftAxes',

    /**
     * Right X/Y axes of gamepad
     */
    GamepadRightAxes = 'GamepadRightAxes'
}

export type Handler = (event: IInputEvent, sender: Interactive) => void;

export interface IInputEvent {
    source: DeviceTypes;
    type: EventTypes;
    /**
     * Device's ID that triggered this event
     *
     *  - `>=0` Normal ID
     *  - `-1` Mouse/Keyboard
     */
    deviceId: number;
    rawEvent?: any;
    stopPropagation?: boolean;
}

export interface IKeyInputEvent extends IInputEvent {
    source: DeviceTypes.Keyboard | DeviceTypes.Gamepad;
    type: AnyKeyEvent;
    key: Keys;
    pressure: number;
}

export interface IPointerInputEvent extends IInputEvent {
    source: DeviceTypes.Mouse | DeviceTypes.Touch;
    type: AnyPointerEvent;
    x: number;
    y: number;
    key: Keys;
}

export interface IPointerPressInputEvent extends IPointerInputEvent {
    type: EventTypes.PressStart | EventTypes.PressMove | EventTypes.PressEnd | EventTypes.PressCancel | EventTypes.Press;
    deltaTime: number;
}

export interface IPointerScrollInputEvent extends IPointerInputEvent {
    type: EventTypes.Scroll;
    deviceId: -1;
    deltaX: number;
    deltaY: number;
}

export type AnyKeyEvent = EventTypes.KeyDown | EventTypes.Press | EventTypes.KeyUp;

export type AnyPointerEvent =
    | EventTypes.PressStart
    | EventTypes.PressMove
    | EventTypes.PressEnd
    | EventTypes.Press
    | EventTypes.PressCancel
    | EventTypes.PointerHover
    | EventTypes.PointerLeave
    | EventTypes.Scroll;

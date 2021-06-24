# @simple-ecs/rgui

PIXI integration of simple-ecs framework.

## DisplayObject

Component `DisplayObject` handles any class that extends PIXI.DisplayObject, provides a handler to let the ecs framework to communicate with PIXI objects.

```typescript
const entity = new Entity();
const component = entity.addComponent(DisplayObject.from(PIXI.Sprite));
```

## Interactive

Interactive and InteractiveSystem provides united input support for HTMLCanvasElement, which supports mouse, touch, keyboard and game pad at the same time.

Here is an example that creates a texture always follows mouse cursor (and tap of fingers).

```typescript
const view = document.getElementById('GameCanvas');
const renderer = PIXI.autoDetectRenderer({ view, backgroundColor: 0xa0a0a0 });
const stage = new PIXI.Container();

// Create white texture as pointer
function createPointer() {
    const pointer = new Entity();
    const display = pointer.addComponent(DisplayObject.from(PIXI.Sprite)).displayObject;
    display.texture = PIXI.Texture.WHITE;
    // Set hit area to everywhere
    display.hitArea = { contains: () => true };
    stage.addChild(display);
    pointer.addComponent(Interactive).handler = e => {
        // When event is the movement of any pointer device, set the x/y to it.
        if (e.type === EventTypes.PressMove) {
            display.x = e.x;
            display.y = e.y;
        }
    };
    return pointer;
}
createPointer();

// Listen dom events on canvas
BrowserDispatcher.listen(view);

// Update component system in each frame
function animate() {
    ComponentSystem.updateSystems();
    renderer.render(stage);
    requestAnimationFrame(animate);
}
animate();
```

### Read data of devices directly

InteractiveSystem also stores the status of each device and can access directly with ot without interactive system, sometimes it could be useful when just want to know where is the mouse, or what key is pressed in global logic.

```typescript
// Status of primary button on mouse
const id = InteractiveSystem.createId(DeviceTypes.Mouse, Keys.PointerPrimaryButton);
const status = InteractiveSystem.states.get(id);

// Check if left control key is pressing
const id = InteractiveSystem.createId(DeviceTypes.Keyboard, Keys.ControlLeft);
const isPressing = (InteractiveSystem.states.getKeyStatus(id) & KeyStatus.Active) !== 0;

// Check the pressure of LT button on first game pad
const id = InteractiveSystem.createId(DeviceTypes.Gamepad, 0, Keys.GamepadLT);
// The raw value is between 0 - 65535, we can normalize it to 0 - 1
const pressure = InteractiveSystem.states.getExtraData(id) / 65535;
```

For the meaning of each section of different type of devices, please view the documents of StateMap.

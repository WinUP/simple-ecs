# @simple-ecs/core

Core structures of simple-ecs framework.

## What is simple-ecs

A framework that provides basic entity component system structures to any application that runs on any environment.

**Entity** act as container that handles multiple components, carry the relation between them. Usually component must work with entity to have its feature.

**Component** provides a sort of data that used by component system, each component should contains enough data that drives at least one component system.

**Component system** runs logic to update component or entity (or other stuffs) use the data provides by each component, it can have filter to let the framework know what kind of components should be sent to the component system.

**Property** means single data inside component, which means one component usually contains multiple property. Property's value can share between different type of component and component system (like dependency property in WPF).

**Template** stores a collection of value of properties, sometimes component may want to use it to set a great amount of properties automatically.

## How to use

1. Create entity

```typescript
const target = new Entity();
```

2. Write component

```typescript
class MessageComponent extends Component {
    @PropertyDeclaration('') // Here is the default value of property
    public static messageProperty: Property<string>;

    public get message(): string {
        return this.getValue(MessageComponent.messageProperty);
    }
    public set message(value: string) {
        this.setValue(MessageComponent.messageProperty, value);
    }
}
```

3. Link component and entity

```typescript
const component = target.addComponent(MessageComponent);
```

4. Write component system

```typescript
class PrintMessageSystem extends ComponentSystem<MessageComponent> {
    protected shouldLinkComponent(component: Component): boolean {
        return component instanceof MessageComponent;
    }

    protected update(delta: number): void {
        this.components.forEach(e => console.log(e.message));
    }
}
```

5. Active component system

```typescript
ComponentSystem.create(PrintMessageSystem);
```

6. Run systems

```typescript
// Run once
ComponentSystem.updateSystems();

// Run by frames
function run(): void {
    ComponentSystem.updateSystems();
    requestAnimationFrame(run);
}
run();
```

## Example: Coroutine system

Framework has built-in support for coroutines. Each component has a sort of functions to act with the coroutine system. Create the system to start using coroutines:

```typescript
ComponentSystem.create(CoroutineSystem);
```

Then it could be easy to write generator functions as coroutines.

```typescript
function* coroutine1(): CoroutineSystem.Coroutine {
    console.log(1);
    yield coroutine2();
    console.log(4);
}

function* coroutine2(): CoroutineSystem.Coroutine {
    console.log(2);
    yield;
    console.log(3);
}

// Will output 1, then 2, then 3, last 4.
component.startCoroutine(coroutine1());
```

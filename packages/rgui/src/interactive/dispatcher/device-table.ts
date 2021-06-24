import { InteractiveSystem } from '../interactive.system';
import { ArrayExtension } from '@simple-ecs/runtime-extension';
import { DeviceTypes } from './input.model';

export class DeviceTable {
    private readonly devices: Map<number, DeviceTypes> = new Map();
    private readonly ids: Map<DeviceTypes, number[]> = new Map();

    public set(id: number, type: DeviceTypes): void {
        id = InteractiveSystem.getDeviceId(id);
        this.devices.set(id, type);
        if (this.ids.has(type)) {
            this.ids.get(type)?.push(id);
        } else {
            this.ids.set(type, [id]);
        }
    }

    public delete(id: number): void {
        id = InteractiveSystem.getDeviceId(id);
        if (this.devices.has(id)) {
            const type = this.devices.get(id);
            if (type == null) return;
            this.devices.delete(id);
            const list = this.ids.get(type);
            list && ArrayExtension.remove(list, id);
        }
    }

    public typeOf(id: number): DeviceTypes | undefined {
        return this.devices.has(id) ? this.devices.get(id) : undefined;
    }

    public all(type: DeviceTypes): readonly number[] {
        return this.ids.get(type) ?? [];
    }
}

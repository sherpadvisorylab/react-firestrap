import React from "react";
import InputModels from "../models/InputModels";
import ViewModels from "../models/ViewModels";
import BlockModels from "../models/BlockModels";
import SectionModels from "../models/SectionModel";
import WidgetModels from "../models/WidgetModels";

export interface FieldDefinition<TDefaults> {
    defaults: (key: string) => TDefaults;
    form: (key: string) => React.ReactNode;
}
export type FieldFactory<TDefaults = {}> = (defaults?: TDefaults) => FieldDefinition<TDefaults>;

interface ComponentProps {
    dataStoragePath?: string;
    [key: string]: any;
}

const Models = {
    input: InputModels,
    ui: ViewModels,
    block: BlockModels,
    section: SectionModels,
    widget: WidgetModels,
}


export abstract class ComponentBlock {
    abstract model: { [key: string]: FieldDefinition<any> | React.ReactNode };
    abstract html(props: ComponentProps): React.ReactNode;
    abstract form(props: ComponentProps): React.ReactNode;

    protected verifyRequiredMethods(): void {
        if (!this.model || typeof this.model !== 'object') {
            throw new Error(`[ComponentBlock] Missing property: "model"`);
        }
        for (const method of ['html', 'form'] as const) {
            if (typeof this[method] !== 'function') {
                throw new Error(`[ComponentBlock] Missing method: "${method}()"`);
            }
        }
    }

    static default(this: new () => ComponentBlock): React.FC<ComponentProps> {
        const instance = new this();
        instance.verifyRequiredMethods();

        return (props) => instance.form(props);
    }
}

export default Models;

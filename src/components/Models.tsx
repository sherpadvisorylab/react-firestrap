import React from "react";
import InputModels from "../models/InputModels";
import ViewModels from "../models/ViewModels";
import BlockModels from "../models/BlockModels";
import SectionModels from "../models/SectionModel";
import WidgetModels from "../models/WidgetModels";
import Form from "./widgets/Form";

type Primitive = string | number | boolean | undefined;

interface FieldDefinition {
    defaults: (key: string) => Record<string, Primitive>;
    form: (key: string) => React.ReactNode;
}

export type FieldFactory<TProps = {}> = (props?: TProps) => FieldDefinition;

interface ComponentProps {
    [key: string]: any;
}

type Defaults = {
    [key: string]: Primitive | Primitive[];
};
export type ModelProps = {
    [key: string]: FieldDefinition | React.ReactNode | ModelProps;
};

export type FieldsMap = {
    [key: string]: React.ReactNode | FieldsMap;
};

//todo: da ristrutturare i nomi: input, ui o block, widget => component. quindi solo 3 elementi di base poi si aggiunge section layout
const Models = {
    input: InputModels,
    ui: ViewModels,
    block: BlockModels,
    section: SectionModels,
    widget: WidgetModels,
}


export abstract class ComponentBlock {
    abstract model: ModelProps;
    abstract html(props?: ComponentProps): React.ReactNode;
    abstract form(props?: ComponentProps): React.ReactNode;

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

    static default(this: new () => ComponentBlock, options?: { dataStoragePath?: string }): React.FC {
        const instance = new this();
        instance.verifyRequiredMethods();
        return () => (
            <Form model={instance.model} dataStoragePath={options?.dataStoragePath}>
                {(fields) => instance.form(fields)}
            </Form>
        );
    }
}

function isFieldDefinition(obj: any): obj is FieldDefinition {
    return typeof obj?.form === 'function' && typeof obj?.defaults === 'function';
}

function isComponentBlockClass(obj: any): obj is new () => ComponentBlock {
    return typeof obj === 'function' && obj.prototype instanceof ComponentBlock;
}
function isModelProps(obj: any): obj is ModelProps {
    return (
        obj &&
        typeof obj === 'object' &&
        !React.isValidElement(obj)
    );
}

export function modelToFormFields(
    model: ModelProps
): [ FieldsMap, Defaults ] {
    const fields: FieldsMap = {};
    const defaults: Defaults = {};

    function setDefaults(obj: Defaults) {
        for (const [k, v] of Object.entries(obj)) {
            if (Array.isArray(v)) {
                defaults[k] = v.filter((item) => item !== undefined);
            } else if(v && typeof v === 'object') {
                 setDefaults(v);
            } else if (v !== undefined) {
                defaults[k] = v;
            }
        }
    }

    for (const [key, value] of Object.entries(model)) {
        if (isFieldDefinition(value)) {
            fields[key] = value.form(key);
            setDefaults(value.defaults(key));
        } else if (isComponentBlockClass(value)) {
            const instance = new value();
            const [subFields, subDefaults] = modelToFormFields(instance.model);

            fields[key] = instance.form(subFields);
            setDefaults(subDefaults);
        } else if (Array.isArray(value)) { // todo: da sistemare
            fields[key] = value.map(v => {
                const [subFields, subDefaults] = modelToFormFields(v);
                setDefaults(subDefaults);
                return subFields;
            }).join();
        } else if (isModelProps(value)) {
            const [nestedFields, nestedDefaults] = modelToFormFields(value);
            fields[key] = nestedFields;
            setDefaults(nestedDefaults);
        } else {
            fields[key] = value;
        }
    }

    return [ fields, defaults ];
}

export default Models;

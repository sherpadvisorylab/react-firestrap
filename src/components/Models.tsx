import React from "react";
import InputModels from "../models/InputModels";
import ViewModels from "../models/ViewModels";
import BlockModels from "../models/BlockModels";
import SectionModels from "../models/SectionModel";
import WidgetModels from "../models/WidgetModels";
import Form from "./widgets/Form";

type Primitive = string | number | boolean | undefined;

interface FieldAdapter {
    getDefaults: (key: string) => Record<string, Primitive>;
    renderForm: (key: string) => React.ReactNode;
}


export type FieldFactory<TProps = {}> = (props?: TProps) => FieldAdapter;

interface ComponentProps {
    [key: string]: any;
}

type Defaults = {
    [key: string]: Primitive | Primitive[];
};
export type ModelProps = {
    [key: string]: FieldAdapter | React.ReactNode | ModelProps;
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

function isFieldAdapter(obj: any): obj is FieldAdapter {
    return typeof obj?.renderForm === 'function' && typeof obj?.getDefaults === 'function';
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

export function buildFormFields(
    model: ModelProps
): [ FieldsMap, Defaults ] {
    const fields: FieldsMap = {};
    const defaults: Defaults = {};

    function setDefaults(obj: Defaults) {
        for (const [k, v] of Object.entries(obj)) {
            defaults[k] = v;
        }
    }

    for (const [key, value] of Object.entries(model)) {
        if (isFieldAdapter(value)) {
            fields[key] = value.renderForm(key);
            setDefaults(value.getDefaults(key));
        } else if (isComponentBlockClass(value)) {
            const instance = new value();
            const [subFields, subDefaults] = buildFormFields(instance.model);

            fields[key] = instance.form(subFields);
            setDefaults(subDefaults);
        } else if (Array.isArray(value)) {
            console.warn(
                `[buildFormFields] ⚠️ The field "${key}" is defined as an array. ` +
                `It has been automatically converted into an object with generated keys (e.g., "${key}_0"). ` +
                `Consider refactoring your model to use an explicit object instead of an array.`
            );
            const syntheticModel: ModelProps = {};

            value.forEach((item, i) => {
                const itemKey = `${key}_${i}`;
                syntheticModel[itemKey] = item;
            });

            const [subFields, subDefaults] = buildFormFields(syntheticModel);
            setDefaults(subDefaults);

            fields[key] = subFields
            // Merge flat dei subFields nel fields principale
            //Object.assign(fields, subFields); // ✅ FLAT
            console.log(fields);
        } else if (isModelProps(value)) {
            const [nestedFields, nestedDefaults] = buildFormFields(value);
            fields[key] = nestedFields;
            setDefaults(nestedDefaults);
        } else {
            fields[key] = value;
        }
    }

    return [ fields, defaults ];
}

export default Models;

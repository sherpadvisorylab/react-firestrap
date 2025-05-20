import React from "react";
import modelFormFields from "../models/modelFormFields";
import modelUIComponents from "../models/modelUIComponents";
import Form from "./widgets/Form";

type Primitive = string | number | boolean | undefined;

interface FieldAdapter<TProps = any> {
    getDefaults: (key: string) => Record<string, Primitive>;
    renderForm: (key: string) => React.ReactNode;
    __props: TProps;
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

export type FormTree = {
    [key: string]: React.ReactNode | FormTree;
};

export const Model = {
    input: modelFormFields,
    ui: modelUIComponents,
};


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

function isComponentBlock(obj: any): obj is new () => ComponentBlock {
    return typeof obj === 'function' && obj.prototype instanceof ComponentBlock;
}
function isNestedModel(obj: any): obj is ModelProps {
    return (
        obj &&
        typeof obj === 'object' &&
        !Array.isArray(obj) &&
        !React.isValidElement(obj) &&
        !isFieldAdapter(obj)
    );
}


export function buildFormFields(
    model: ModelProps
): [ FormTree, Defaults ] {
    const fields: FormTree = {};
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
        } else if (isComponentBlock(value)) {
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
        } else if (isNestedModel(value)) {
            const [nestedFields, nestedDefaults] = buildFormFields(value);
            fields[key] = nestedFields;
            setDefaults(nestedDefaults);
        } else {
            fields[key] = value;
        }
    }

    return [ fields, defaults ];
}

import db from "../libs/database";
import {renderToStaticMarkup} from "react-dom/server";


export function ComponentBlockSave(blockClass: new () => ComponentBlock, dbStoragePath: string) {
    const instance = new blockClass();

    // Modifica i field per usare {key} come valore nei props
    function injectVariableProps(tree: any, prefix = ''): any {
        const output: any = {};
        for (const [key, node] of Object.entries(tree)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;

            if (React.isValidElement(node)) {
                output[key] = injectProps(node, fullKey);
            } else if (typeof node === 'object') {
                output[key] = injectVariableProps(node, fullKey);
            } else {
                output[key] = `{${fullKey}}`;
            }
        }
        return output;
    }

    // Sostituisce le props dinamiche dei form con {key} stringati
    function injectProps(node: React.ReactElement, key: string): React.ReactElement {
        const newProps: Record<string, any> = { ...node.props };

        if ('value' in newProps) newProps.value = `{${key}}`;
        if ('checked' in newProps) newProps.checked = `{${key}}`;
        if ('src' in newProps) newProps.src = `{${key}}`;
        if ('alt' in newProps) newProps.alt = `{${key}}`;
        if ('defaultValue' in newProps) newProps.defaultValue = `{${key}}`;

        return React.cloneElement(node, newProps);
    }

    function detectFieldType(adapter: FieldAdapter): string {
        for (const [typeName, factory] of Object.entries(modelFormFields)) {
            const testAdapter = factory();
            if (testAdapter.renderForm.toString() === adapter.renderForm.toString()) {
                return typeName;
            }
        }
        return "unknown";
    }

    function serializeModel(model: ModelProps): any {
        const out: any = {};
        for (const [key, value] of Object.entries(model)) {
            if (value && typeof value === 'object') {
                if (isFieldAdapter(value)) {
                    out[key] = {
                        type: detectFieldType(value),
                        props: value.__props
                    };
                } else if (isComponentBlock(value)) {
                    out[key] = {
                        type: 'ComponentBlockRef',
                        ref: `/components/${value.name}`
                    };
                } else if (Array.isArray(value)) {
                    out[key] = value.map((item) =>
                        isNestedModel(item)
                            ? serializeModel(item as ModelProps)
                            : '[JSX]'
                    );
                } else if (React.isValidElement(value)) {
                    out[key] = '[JSX]';
                } else if (isNestedModel(value)) {
                    out[key] = serializeModel(value);
                } else {
                    out[key] = '[JSX]';
                }
            } else {
                out[key] = null;
            }
        }
        return out;
    }

    function buildTemplate(): any {
        const [fields] = buildFormFields(instance.model);
        const injectedFields = injectVariableProps(fields);

        const renderedForm = instance.form(injectedFields);
        const renderedHtml = instance.html(injectedFields);

        return {
            ref: dbStoragePath,
            model: serializeModel(instance.model),
            form: renderToStaticMarkup(renderedForm),
            html: renderToStaticMarkup(renderedHtml)
        };
    }

    return db.set(dbStoragePath, buildTemplate());
}



function ComponentBlockSave2(blockClass: new () => ComponentBlock, dbStoragePath: string) {
    const instance = new blockClass();

    function generatePlaceholders(model: ModelProps): FormTree {
        const out: FormTree = {};
        for (const [key, value] of Object.entries(model)) {
            if (isNestedModel(value)) {
                out[key] = generatePlaceholders(value);
            } else {
                out[key] = `{${key}}`;
            }
        }
        return out;
    }

    function detectFieldType(adapter: FieldAdapter): string {
        for (const [typeName, factory] of Object.entries(modelFormFields)) {
            const testAdapter = factory();
            if (testAdapter.renderForm.toString() === adapter.renderForm.toString()) {
                return typeName;
            }
        }
        return "unknown";
    }

    function serializeModel(model: ModelProps): any {
        const out: any = {};
        for (const [key, value] of Object.entries(model)) {
            if (value && typeof value === 'object') {
                if (isFieldAdapter(value)) {
                    out[key] = {
                        type: detectFieldType(value),
                        props: value.__props
                    };
                } else if (isComponentBlock(value)) {
                    out[key] = {
                        type: 'ComponentBlockRef',
                        ref: `/components/${value.name}`
                    };
                } else if (Array.isArray(value)) {
                    out[key] = value.map((item) =>
                        isNestedModel(item)
                            ? serializeModel(item as ModelProps)
                            : '[JSX]'
                    );
                } else if (React.isValidElement(value)) {
                    out[key] = '[JSX]';
                } else if (isNestedModel(value)) {
                    out[key] = serializeModel(value);
                } else {
                    out[key] = '[JSX]';
                }
            } else {
                out[key] = null;
            }
        }
        return out;
    }

    function buildTemplate(): any {
        const placeholders = generatePlaceholders(instance.model);
        const renderedForm = instance.form(placeholders);
        const renderedHtml = instance.html(placeholders);

        return {
            ref: dbStoragePath,
            model: serializeModel(instance.model),
            form: renderToStaticMarkup(renderedForm),
            html: renderToStaticMarkup(renderedHtml)
        };
    }

    return db.set(dbStoragePath, buildTemplate());
}


export class ComponentTemplate {
    private template?: any;

    constructor(path: string) {
        this.loadTemplate(path);
    }

    async loadTemplate(path: string): Promise<void> {
        this.template = await db.read(path);
        if (!this.template) throw new Error("Template not found at " + path);
    }

    async render(dataPath: string): Promise<{ html: () => React.ReactNode; form: () => React.ReactNode }> {
        const data = await db.read(dataPath);
        return {
            html: () => this.renderTemplate(this.template.html, data),
            form: () => this.renderTemplate(this.template.form, data)
        };
    }



    private renderTemplate(html: string, slots: Record<string, Primitive>): React.ReactNode[] {
        const parts = html.split(/({[^}]+})/g); // divide in: testo, {variabile}, testo, ecc.

        return parts.map((part, i) => {
            const match = part.match(/^{(.+)}$/); // trova {chiave}
            if (match) {
                const key = match[1].trim();
                return <React.Fragment key={i}>{slots[key] != null ? String(slots[key]) : ''}</React.Fragment>;
            } else {
                return <React.Fragment key={i}>{part}</React.Fragment>;
            }
        });
    }

    private parseTemplate(template: string, slots: Record<string, Primitive>): React.ReactNode {
        const div = document.createElement("div");
        div.innerHTML = template;

        function walk(node: ChildNode): React.ReactNode {
            switch (node.nodeType) {
                case Node.TEXT_NODE: {
                    const text = node.textContent || '';
                    const parts = text.split(/({[^}]+})/g);

                    return parts.map((part, i) => {
                        const match = part.match(/^{(.+)}$/);
                        if (match) {
                            const key = match[1].trim();
                            return <React.Fragment key={i}>{slots[key] != null ? String(slots[key]) : ''}</React.Fragment>;
                        } else {
                            return <React.Fragment key={i}>{part}</React.Fragment>;
                        }
                    });
                }

                case Node.ELEMENT_NODE: {
                    const el = node as HTMLElement;
                    const tag = el.tagName.toLowerCase();
                    const props: Record<string, any> = {};

                    for (const attr of Array.from(el.attributes)) {
                        props[attr.name === 'class' ? 'className' : attr.name] = attr.value.replace(
                            /({[^}]+})/g,
                            (_, expr) => String(slots[expr.trim()] ?? '')
                        );
                    }

                    const children = Array.from(el.childNodes).map((child, i) => (
                        <React.Fragment key={i}>{walk(child)}</React.Fragment>
                    ));

                    return React.createElement(tag, props, ...children);
                }

                default:
                    return null;
            }
        }

        return (
            <>
                {Array.from(div.childNodes).map((node, i) => (
                    <React.Fragment key={i}>{walk(node)}</React.Fragment>
                ))}
            </>
        );
    }

}



export default Model;

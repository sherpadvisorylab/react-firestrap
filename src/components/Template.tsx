import React, {useEffect, useMemo, useState} from 'react';
import componentLayout , {ComponentLayoutMap} from '../models/componentLayout';
import componentFormFields , {ComponentFormFieldsMap} from '../models/componentFormFields';
import { FormDatabase } from './widgets/Form';
import db from "../libs/database";


type ComponentSpec = {
    tag: keyof ComponentFormFieldsMap;
    props?: Record<string, any>;
};
type FormFieldsMap = Record<string, ComponentSpec>;
type FieldBucketsMap = Record<string, FormFieldsMap>;


// Cache
const templateCache = new Map<string, React.ReactElement>();
const fieldCache    = new Map<string, {
    formFields      : Record<string, React.ReactNode>;
    defaultValues   : Record<string, any>;
}>();

class Template {
    htmlString      : string;
    formFields      : Record<string, React.ReactNode> = {};
    defaultValues   : Record<string, any> = {};

    public static async loadFromDatabase(path: string, bucket?: string): Promise<Template> {
        const result = await db.read(path);
        const html: string = typeof result.html === 'string' ? result.html : '';
        const fieldBuckets: FieldBucketsMap = typeof result.fields === 'object' && result.fields !== null
            ? result.fields
            : {};

        if (!result.html) {
            console.warn(`[Template] Attempted to load 'html' from database at path "${path}", but it was not found.`);
        }
        if (!result.fields) {
            console.warn(`[Template] Attempted to load 'fields' from database at path "${path}", but they were not found.`);
        }

        return new Template(html, fieldBuckets).use(bucket);
    }

    constructor(htmlString: string = "", fieldBuckets?: FieldBucketsMap) {
        this.htmlString         = htmlString;

        if (fieldBuckets) {
            Object.entries(fieldBuckets).forEach(([bucketKey, fields]) => {
                this.setFields(fields, bucketKey);
            });
        }
    }

    public setHtml(html: string): this {
        this.htmlString = html;
        return this;
    }
    public use(bucket?: string): this {
        if (bucket && !this.useFields(bucket)) {
            console.warn(`[Template] Bucket Fields "${bucket}" not found`);
        }

        return this;
    }
    private useFields(bucket: string): boolean {
        if (fieldCache.has(bucket)) {
            const { formFields, defaultValues } = fieldCache.get(bucket)!;
            this.formFields     = formFields;
            this.defaultValues  = defaultValues;
            return true;
        } else {
            this.formFields     = {};
            this.defaultValues  = {};
            return false;
        }
    }

    private buildFormField(tag: keyof ComponentFormFieldsMap, props: any = {}) {
        const factory = componentFormFields[tag];
        return factory ? factory(props) : null;
    }
    public setFields(fields: FormFieldsMap, bucket: string, reset: boolean = false): Template {
        if (reset || !this.useFields(bucket)) {
            for (const [name, {tag, props = {}}] of Object.entries(fields)) {
                const field = this.buildFormField(tag, props);
                if (!field) {
                    console.warn(`[Template] Tipo di input non riconosciuto: "${tag}" per la variabile "${name}"`);
                    continue;
                }
                this.formFields[name] = field.render({name});
                Object.assign(this.defaultValues, field.getDefaults(name));
            }

            fieldCache.set(bucket, {
                formFields: this.formFields,
                defaultValues: this.defaultValues
            });
        }
        return this
    }

    public toJSX(): React.ReactElement {
        if (!templateCache.has(this.htmlString)) {
            templateCache.set(this.htmlString, this.parseXmlToReactTree());
        }

        return templateCache.get(this.htmlString)!;
    }

    public getDefaultValues() {
        return this.defaultValues;
    }

    public getFields() {
        return this.formFields;
    }

    private convertJsxAttrsToXml(input: string): string {
        return input.replace(/(\w+)\s*=\s*{([^}]+)}/g, (_, key, value) => {
            return `${key}="${value.trim()}"`;
        });
    }

    private parseTextToFragments(text: string): React.ReactNode[] {
        const fragments: React.ReactNode[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        const regex = /{([^}]+)}/g;

        while ((match = regex.exec(text))) {
            const index = match.index;
            const varName = match[1];

            // Push static text before match
            if (index > lastIndex) {
                fragments.push(text.substring(lastIndex, index));
            }
            lastIndex = index + match[0].length;

            const component = this.formFields[varName];
            if (component !== undefined) {
                fragments.push(component);
            } else {
                // opzionale: salta o aggiungi come stringa raw
                console.warn(`[parseTextToFragments] component "${varName}" not found`);
            }
        }

        if (lastIndex < text.length) {
            fragments.push(text.substring(lastIndex));
        }

        return fragments;
    }

    private walk(node: ChildNode): React.ReactNode[] {
        switch (node.nodeType) {
            case Node.TEXT_NODE: {
                const text = node.textContent;
                return text && text.trim() ? this.parseTextToFragments(text) : [];
            }

            case Node.ELEMENT_NODE: {
                const el = node as Element;
                const tag = el.tagName.toLowerCase();

                const component: React.ElementType = componentLayout[tag as keyof ComponentLayoutMap] ?? tag;

                const props = Object.fromEntries(
                    Array.from(el.attributes, attr => [attr.name, attr.value] as const)
                );

                const children = Array.from(el.childNodes).flatMap(child => this.walk(child));

                return [React.createElement(component, props, ...children)];
            }

            default:
                return [];
        }
    }
    private parseXmlToReactTree(): React.ReactElement {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.convertJsxAttrsToXml(this.htmlString), 'text/xml');

        const nodes = Array.from(doc.childNodes).flatMap(node => this.walk(node));
        console.log("nodes", nodes);
        return React.createElement(React.Fragment, null, ...nodes);
    }
}


export function FormTemplate({
                                 htmlString,
                                 components,
                                 dataStoragePath
                             }: {
    htmlString: string;
    components: FormFieldsMap;
    dataStoragePath: string;
}) {
    const Compiled = useMemo(() => {
        const template = new Template(htmlString).setFields(components, "default");

        return {
            RenderComponent: template.toJSX(),
            defaultValues: template.getDefaultValues()
        };
    }, [htmlString, components]);

    return (
        <FormDatabase dataStoragePath={dataStoragePath} defaultValues={Compiled.defaultValues}>
            {Compiled.RenderComponent}
        </FormDatabase>
    );
}


export function FormTemplate2({
                                  template,
                                  fieldBucketKey,
                                  dataSource,
                              }: {
    template: string;
    fieldBucketKey: string;
    dataSource?: string;
}) {
    const [form, setForm] = useState<{
        children: React.ReactElement;
        defaultValues: Record<string, any>;
    } | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        Template.loadFromDatabase(template, fieldBucketKey).then((template) => {
            if (!controller.signal.aborted) {
                setForm({
                    children: template.toJSX(),
                    defaultValues: template.getDefaultValues(),
                });
            }
        });

        return () => {
            controller.abort();
        };
    }, [template]);

    if (!form) {
        return <p className={"p-4"}><i className={"spinner-border spinner-border-sm"}></i> Caricamento in corso...</p>;
    }

    return (
        <FormDatabase dataStoragePath={dataSource} defaultValues={form.defaultValues}>
            {form.children}
        </FormDatabase>
    );
}


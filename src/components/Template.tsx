import React, {useEffect, useMemo, useState} from 'react';
import componentLayout , {ComponentLayoutMap} from '../models/componentLayout';
import componentFormFields , {ComponentFormFieldsMap} from '../models/componentFormFields';
import { FormDatabase } from './widgets/Form';
import db from "../libs/database";


type ComponentSpec = {
    tag: keyof ComponentFormFieldsMap;
    props?: Record<string, any>;
};

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
    cacheFieldsKey  : string = "";

    public static async loadFromDatabase(path: string) {
        const { html, ...buckets } =  await db.read(path);
        const entries = Object.entries(buckets ?? {}) as [string, Record<string, ComponentSpec>][];
        if (entries.length === 0) {
            throw new Error(`[Template] No valid field buckets found in "${path}"`);
        }

        const [firstBucketKey, firstFields] = entries[0];
        const template = new Template(html).setFields(firstFields, firstBucketKey);

        for (let i = 1; i < entries.length; i++) {
            const [bucketKey, fields] = entries[i];
            template.setFields(fields, bucketKey);
        }

        return template;
    }

    constructor(htmlString: string = "", bucket?: string) {
        this.htmlString         = htmlString;
        if(bucket && fieldCache.has(bucket)) {
            const { formFields, defaultValues } = fieldCache.get(bucket)!;
            this.formFields     = formFields;
            this.defaultValues  = defaultValues;
        }
    }

    public setHtml(html: string): this {
        this.htmlString = html;
        return this;
    }

    public setFields(fields: Record<string, ComponentSpec>, bucket?: string): Template {
        this.cacheFieldsKey = bucket ?? this.getCacheKey(fields);

        if (fieldCache.has(this.cacheFieldsKey)) {
            const { formFields, defaultValues } = fieldCache.get(this.cacheFieldsKey)!;
            this.formFields     = formFields;
            this.defaultValues  = defaultValues;
            return this;
        }

        const buildFormField = (tag: keyof ComponentFormFieldsMap, props: any = {}) => {
            const factory = componentFormFields[tag];
            return factory ? factory(props) : null;
        };

        for (const [key, {tag, props = {}}] of Object.entries(fields)) {
            const field = buildFormField(tag, props);
            if (!field) {
                console.warn(`[Template] Tipo di input non riconosciuto: "${tag}" per la variabile "${key}"`);
                continue;
            }
            this.formFields[key] = field.renderForm(key);
            Object.assign(this.defaultValues, field.getDefaults(key));
        }

        fieldCache.set(this.cacheFieldsKey, {
            formFields: this.formFields,
            defaultValues: this.defaultValues
        });

        return this
    }
    public toJSX(): React.ReactElement {
        if (!templateCache.has(this.htmlString)) {
            templateCache.set(this.htmlString, this.parseXmlToReactTree());
        }

        return templateCache.get(this.htmlString)!;
    }

    public getDefaults() {
        return this.defaultValues;
    }

    public getFields() {
        return this.formFields;
    }

    private getCacheKey(fields: Record<string, ComponentSpec>): string {
        let key = '';
        for (const fieldKey in fields) {
            const def = fields[fieldKey];
            key += fieldKey + ':' + def.tag + ':';
            if (def.props) {
                for (const propKey in def.props) {
                    key += propKey + '=' + String(def.props[propKey]) + ',';
                }
            }
            key += '|';
        }
        return key;
    }

    private convertJsxAttrsToXml(input: string): string {
        return input.replace(/(\w+)\s*=\s*{([^}]+)}/g, (_, key, value) => {
            return `${key}="${value.trim()}"`;
        });
    }

    private parseTextToFragments(
        text: string,
        formFields: Record<string, React.ReactNode>
    ): React.ReactNode[] {
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

            const component = formFields[varName];
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
                return text && text.trim() ? this.parseTextToFragments(text, this.formFields) : [];
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
    components: Record<string, ComponentSpec>;
    dataStoragePath: string;
}) {
    const Compiled = useMemo(() => {
        const template = new Template(htmlString).setFields(components);

        return {
            RenderComponent: template.toJSX(),
            defaults: template.getDefaults()
        };
    }, [htmlString, components]);

    return (
        <FormDatabase dataStoragePath={dataStoragePath} dataObject={Compiled.defaults}>
            {Compiled.RenderComponent}
        </FormDatabase>
    );
}


export function FormTemplate2({
                                  tplStoragePath,
                                  dataStoragePath,
                              }: {
    tplStoragePath: string;
    dataStoragePath: string;
}) {
    const [compiled, setCompiled] = useState<{
        RenderComponent: React.ReactElement;
        defaults: Record<string, any>;
    } | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        Template.loadFromDatabase(tplStoragePath).then((template) => {
            if (!controller.signal.aborted) {
                setCompiled({
                    RenderComponent: template.toJSX(),
                    defaults: template.getDefaults(),
                });
            }
        });

        return () => {
            controller.abort(); // disattiva effetto in corso
        };
    }, [tplStoragePath]);

    if (!compiled) return null;

    return (
        <FormDatabase dataStoragePath={dataStoragePath} dataObject={compiled.defaults}>
            {compiled.RenderComponent}
        </FormDatabase>
    );
}


import React, { useMemo } from 'react';
import modelUIComponents, {uiComponentsModels} from '../models/modelUIComponents';
import modelFormFields , {formFieldsModels} from '../models/modelFormFields';
import { FormDatabase } from './widgets/Form';

// Cache
const templateCache = new Map<string, CompiledTemplate>();

function convertJsxAttrsToXml(input: string): string {
    return input.replace(/(\w+)\s*=\s*{([^}]+)}/g, (_, key, value) => {
        return `${key}="${value.trim()}"`;
    });
}

function parseTextToFragments(
    text: string,
    formFields: Record<string, React.ReactNode>
): React.ReactNode[] {
    const fragments: React.ReactNode[] = [];
    const regex = /{([^}]+)}/g;
    let lastIndex = 0;

    for (const match of text.matchAll(regex)) {
        const index = match.index!;
        const varName = match[1];

        if (index > lastIndex) {
            fragments.push(text.slice(lastIndex, index));
        }
        lastIndex = index + match[0].length;

        if (!formFields[varName]) {
            console.warn(`[parseTextToFragments] component "${varName}" not found`);
            continue;
        }

        fragments.push(formFields[varName]);
    }

    if (lastIndex < text.length) {
        fragments.push(text.slice(lastIndex));
    }

    return fragments;
}


function parseXmlToReactTree(xml: string, formFields: Record<string, React.ReactNode>): React.ReactElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    function walk(node: ChildNode): React.ReactNode {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (!text) return null;
            return parseTextToFragments(text, formFields);
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            const tag = el.tagName.toLowerCase();
            const component: React.ElementType = modelUIComponents[tag as keyof uiComponentsModels] || tag;

            const props: Record<string, any> = {};
            for (const attr of Array.from(el.attributes)) {
                props[attr.name] = attr.value;
            }

            const children = Array.from(el.childNodes)
                .map(walk)
                .flat()
                .filter(Boolean);

            return React.createElement(component, props, ...children);
        }

        return null;
    }

    const nodes = Array.from(doc.childNodes)
        .map(walk)
        .filter(Boolean);
    console.log("nodes", nodes);
    return React.createElement(React.Fragment, null, ...nodes);
}

function compile(htmlString: string, formFields: Record<string, React.ReactNode>): React.ReactElement {
    const normalized = convertJsxAttrsToXml(htmlString);
    return parseXmlToReactTree(normalized, formFields);
}


type ComponentDefinition = {
    tag: keyof formFieldsModels;
    props?: Record<string, any>;
};
type CompiledTemplate = {
    RenderComponent: React.ReactElement
    defaults: Record<string, any>;
};



// Main Component
export function FormTemplate({
                                 htmlString,
                                 components,
                                 dataStoragePath
                             }: {
    htmlString: string;
    components: Record<string, ComponentDefinition>;
    dataStoragePath: string;
}) {
    const Compiled = useMemo<CompiledTemplate>(() => {
        // Cache lookup
        if (templateCache.has(htmlString)) {
            return templateCache.get(htmlString)!;
        }

        const formFields: Record<string, React.ReactNode> = {};
        const defaults: Record<string, any> = {};

        // Helper: costruisce il campo da tag + props
        const buildFormField = (tag: keyof formFieldsModels, props: any = {}) => {
            const factory = modelFormFields[tag];
            if (!factory) return null;
            return factory(props);
        };

        // Costruzione dei campi e defaults
        for (const [key, { tag, props = {} }] of Object.entries(components)) {
            const field = buildFormField(tag, props);
            if (!field) {
                console.warn(`[FormTemplate] Tipo di input non riconosciuto: "${tag}" per la variabile "${key}"`);
                continue;
            }
            formFields[key] = field.renderForm(key);
            Object.assign(defaults, field.getDefaults(key));
        }

        // Compilazione del componente
        const RenderComponent = compile(htmlString, formFields);
        const compiledTemplate: CompiledTemplate = { RenderComponent, defaults };

        // Cache result
        templateCache.set(htmlString, compiledTemplate);
        return compiledTemplate;
    }, [htmlString, components]);

    return (
        <FormDatabase dataStoragePath={dataStoragePath} dataObject={Compiled.defaults}>
            {Compiled.RenderComponent}
        </FormDatabase>
    );
}

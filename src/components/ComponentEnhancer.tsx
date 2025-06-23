import React from 'react';
import {RecordProps} from "../integrations/google/firedatabase";

interface ComponentEnhancerProps {
    components: React.ReactNode | React.ReactNode[];
    record?: RecordProps;
    handleChange?: (event: React.ChangeEvent<any>) => void;
    parentName?: string;
}

type ApplyOnChangeParams = {
    children: React.ReactNode;
    record?: RecordProps;
    handleChange?: (event: React.ChangeEvent<any>) => void;
    onEnhance?: (child: React.ReactElement) => void;
    parentName?: string;
};



const applyOnChangeRecursive = ({
                                    children,
                                    record,
                                    handleChange,
                                    parentName = undefined
                                }: ApplyOnChangeParams): React.ReactNode => {
    return React.Children.map(children, (child) => {
        console.log("SIAMO TUTTI", child);

        if (!React.isValidElement(child)) return child;

        const {type, props} = child;
        const name = props.name;
        const onChange = handleChange && ((event: React.ChangeEvent<any>) => {
            console.log("ONCHANGE", event, record);
            props.onChange?.(event);
            handleChange?.(event);
        });
        
        if ((child.type as any)?.enhance) {
            console.log("ENHANCE", child);
            return React.cloneElement(child as any, {
                wrapClass: `mb-3${props.wrapClass ? ' ' + props.wrapClass : ''}`,
                value: record?.[name] ?? props.value ?? undefined,
                onChange,
            });
        }

        if (props.children) {
            return React.cloneElement(child as any, {
                children: applyOnChangeRecursive({
                    children: props.children,
                    record,
                    handleChange,
                }),
            });
        }

        if (name && record?.[name] === undefined) {
            console.warn(`The property "${name}" is not present in the record`, child);
        }
        if (name) {
            console.log("CE IL NAMEEEE", props);
        } else {
            console.log("non ce il nNANAANANN", props);
        }
        return React.cloneElement(child as any, props.onChange || name
            ? {
                wrapClass: `mb-3${props.wrapClass ? ' ' + props.wrapClass : ''}`,
                name: parentName ? `${parentName}.${name}` : name,
                value: record?.[name] ?? props.value ?? undefined,
                onChange,
            }
            : {
                className: `mb-3${props.className ? ' ' + props.className : ''}`,
            });
    });
};

const ComponentEnhancer = ({
                               components,
                               record,
                               handleChange,
                               parentName = undefined
}: ComponentEnhancerProps ) => {
    const children = Array.isArray(components) ? components : [components];
    return (
        <>
            {applyOnChangeRecursive({children, record, handleChange, parentName})}
        </>
    );
}

export function extractComponentProps<T>(
    components: React.ReactNode | React.ReactNode[],
    onEnhance: (child: React.ReactElement) => T
): T[] {
    const children = Array.isArray(components) ? components : [components];
    const result: T[] = [];

    applyOnChangeRecursive({
        children,
        onEnhance: (child) => {
            result.push(onEnhance(child));
        }
    });

    return result;
}

export default ComponentEnhancer;

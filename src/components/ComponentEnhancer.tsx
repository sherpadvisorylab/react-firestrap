import React from 'react';
import {RecordProps} from "../integrations/google/firedatabase";

interface ComponentEnhancerProps {
    components: React.ReactNode | React.ReactNode[];
    record?: RecordProps;
    handleChange?: (event: React.ChangeEvent<any>) => void;
}

type ApplyOnChangeParams = {
    children: React.ReactNode;
    record?: RecordProps;
    handleChange?: (event: React.ChangeEvent<any>) => void;
    onEnhance?: (child: React.ReactElement) => void;
};



const applyOnChangeRecursive = ({
                                    children,
                                    record,
                                    handleChange,
                                    onEnhance,
                                }: ApplyOnChangeParams): React.ReactNode => {
    return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const {type, props} = child;
        const isFragment = type === React.Fragment;
        const isCustomComponent = typeof type !== 'string';
        const name = props.name;
        const onChange = handleChange && ((event: React.ChangeEvent<any>) => {
            props.onChange?.(event);
            handleChange?.(event);
        });

        if (isFragment) {
            return applyOnChangeRecursive({
                children: props.children,
                record,
                handleChange,
                onEnhance,
            });
        }

        if (isCustomComponent && (type as any).enhance) {
            return React.cloneElement(child as any, {
                value: record?.[name] ?? '',
                onChange,
            });
        }

        if (props.children) {
            return React.cloneElement(child as any, {
                children: applyOnChangeRecursive({
                    children: props.children,
                    record,
                    handleChange,
                    onEnhance,
                }),
            });
        }

        if (onEnhance && isCustomComponent && name) {
            onEnhance(child);
            return child;
        }

        if (isCustomComponent && record?.[name] === undefined) {
            console.warn(`The property "${name}" is not present in the record`, child);
        }

        return React.cloneElement(child as any, isCustomComponent
            ? {
                wrapClass: `mb-3${props.wrapClass ? ' ' + props.wrapClass : ''}`,
                value: record?.[name] ?? props.value ?? '',
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
                               handleChange
}: ComponentEnhancerProps ) => {
    const children = Array.isArray(components) ? components : [components];
    return (
        <>
            {applyOnChangeRecursive({children, record, handleChange})}
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

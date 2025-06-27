import React from 'react';
import {RecordProps} from "../integrations/google/firedatabase";

type FormProps = {
    name?: string;
    value?: any;
    onChange?: (e: React.ChangeEvent<any>) => void;
    dataStoragePath?: string;
};

interface FormEnhancerProps {
    components: React.ReactNode | React.ReactNode[];
    record?: RecordProps;
    handleChange?: (event: React.ChangeEvent<any>) => void;
    parentName?: string;
    dataStoragePath?: string;
}

type ApplyOnChangeParams = {
    children: React.ReactNode;
    record?: RecordProps;
    handleChange?: (event: React.ChangeEvent<any>) => void;
    onEnhance?: (child: React.ReactElement) => void;
    parentName?: string;
    dataStoragePath?: string;
};

const applyOnChangeRecursive = ({
                                    children,
                                    record,
                                    handleChange,
                                    parentName = undefined,
                                    dataStoragePath = undefined
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
        
        if ((type as any)?.__form) {
            console.log("ENHANCE", child, record, (name ? record?.[name] : record) ?? props.value ?? undefined);
            return React.cloneElement(child as any, {
                wrapClass: `mb-3${props.wrapClass ? ' ' + props.wrapClass : ''}`,
                value: record?.[name] ?? record ?? props.value ?? undefined,
                dataStoragePath: props.dataStoragePath ?? dataStoragePath ?? undefined,
                onChange,
            });
        }

        if (props.children) {
            return React.cloneElement(child as any, {
                children: applyOnChangeRecursive({
                    children: props.children,
                    record,
                    handleChange,
                    dataStoragePath,
                }),
            });
        }

        if (name && record?.[name] === undefined) {
            console.warn(`The property "${name}" is not present in the record`, child);
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

const FormEnhancer = ({
                               components,
                               record,
                               handleChange,
                               parentName = undefined,
                               dataStoragePath = undefined
}: FormEnhancerProps ) => {
    const children = Array.isArray(components) ? components : [components];
    return (
        <>
            {applyOnChangeRecursive({children, record, handleChange, parentName, dataStoragePath})}
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


  
  export function asForm<P extends FormProps>(
    Component: React.ComponentType<P>
  ): React.ComponentType<P> {
    (Component as any).__form = true;
    return Component;
  }


export default FormEnhancer;

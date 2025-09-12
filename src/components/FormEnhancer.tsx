import React from 'react';
import {RecordProps} from "../integrations/google/firedatabase";
import { FormRef, ChangeHandler } from './widgets/Form';
import { getRecordValue } from '../libs/utils';

type FormProps = {
    name?: string;
    value?: any;
    onChange?: (event: ChangeHandler) => void;
    dataStoragePath?: string;
};

interface EnhancerProps {
    record?: RecordProps;
    handleChange?: (event: ChangeHandler) => void;
    parentName?: string;
    dataStoragePath?: string;
    formRef?: React.Ref<FormRef>;
    wrapClass?: string;
}
interface FormEnhancerProps extends EnhancerProps {
    components: React.ReactNode;
}

interface ApplyOnChangeProps extends EnhancerProps {
    children: React.ReactNode;
};

const checkForwardRef = (type: any) =>
    typeof type === "object" && type !== null && type.$$typeof === Symbol.for("react.forward_ref");

const applyRef = (child: React.ReactNode, formRef: React.Ref<FormRef>): React.ReactNode => {
    if (!React.isValidElement(child)) return child;

    const {type, props} = child;
    const isForwardRef = checkForwardRef(type);

    if (isForwardRef) {
        console.log("APPLY REF", child, formRef);
        return React.cloneElement(child as any, { ref: formRef });
    }
    if (props.children) {
        return React.cloneElement(child as any, {
            children: applyRef(props.children, formRef)
        });
    }

    return child;
}




const applyOnChangeRecursive = ({
                                    children,
                                    record,
                                    handleChange,
                                    parentName = undefined,
                                    dataStoragePath = undefined,
                                    formRef = undefined,
                                    wrapClass = undefined
                                }: ApplyOnChangeProps): React.ReactNode => {
    return React.Children.map(children, (child) => {    
        console.log("SIAMO TUTTI", child);

        if (!React.isValidElement(child)) return child;

        const {type, props} = child;
        const name = props.name;
        const onChange = handleChange && ((event: ChangeHandler) => {
            console.log("ONCHANGE", parentName, name, event, record);
            props.onChange?.(event);
            handleChange?.(event);
        });
        
        if ((type as any)?.__form) {
            console.log("ENHANCE", child, record, parentName, name, (name ? record?.[name] : record) ?? props.value ?? undefined);

            return React.cloneElement(child as any, {
                wrapClass: `${wrapClass}${props.wrapClass ? ' ' + props.wrapClass : ''}`,
                name: parentName ? `${parentName}.${name}` : name,
                value: record?.[name] ?? record ?? props.value ?? undefined,
                dataStoragePath: props.dataStoragePath ?? dataStoragePath ?? undefined,
                onChange,
                ...(checkForwardRef(type) ? {ref: formRef} : {}),
            });
        }

        if (props.children) {
            return React.cloneElement(child as any, {
                children: applyOnChangeRecursive({
                    children: props.children,
                    record,
                    handleChange,
                    parentName,
                    dataStoragePath,
                    formRef,
                    wrapClass
                }),
            });
        }

        const value = getRecordValue(record, name);
        if (name && value === undefined) {
            console.warn(`The property "${name}" is not present in the record`, child);
        }
        if(name) {
            console.log("CLONE ELEMENT", child, parentName, name, record, record?.[name]);
        }
        return React.cloneElement(child as any, props.onChange || name
            ? {
                wrapClass: `${wrapClass}${props.wrapClass ? ' ' + props.wrapClass : ''}`,
                name: parentName ? `${parentName}.${name}` : name,
                value: value ?? props.value ?? undefined,
                onChange
            }
            : {
                className: `${wrapClass}${props.className ? ' ' + props.className : ''}`,
            });
    });
};

const FormEnhancer = ({
                               components,
                               record,
                               handleChange,
                               parentName = undefined,
                               dataStoragePath = undefined,
                               formRef = undefined,
                               wrapClass = 'mb-3'
}: FormEnhancerProps ) => {
    const children = Array.isArray(components) ? components : [components];

    return (
        <>
            {applyOnChangeRecursive({children, record, handleChange, parentName, dataStoragePath, formRef, wrapClass})}
        </>
    );
}

export function extractComponentProps<T>(
    components: React.ReactNode | React.ReactNode[],
    onEnhance: (props: {[key: string]: any}) => T
): T[] {    
    const children = Array.isArray(components) ? components : [components];
    const result: T[] = [];

    const extractRecursive = (nodes: React.ReactNode) => {
        React.Children.forEach(nodes, (child) => {
            if (!React.isValidElement(child)) return;

            const {props} = child;
            if (props.name) {
                result.push(onEnhance(props));
            } else if (props.children) {
                extractRecursive(props.children);
            }
        });
    };

    extractRecursive(children);
    return result;
}


export function asForm<P extends FormProps>(
    Component: React.ComponentType<P>
  ): React.ComponentType<P> {
    (Component as any).__form = true;
    return Component;
  }


export default FormEnhancer;

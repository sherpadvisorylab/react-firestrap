import React from 'react';

type ApplyOnChangeParams = {
    children: React.ReactNode;
    record?: Record<string, any>;
    handleChange?: (event: React.ChangeEvent<any>) => void;
    onEnhance?: (child: React.ReactElement) => void;
};

interface ComponentEnhancerProps {
    components: React.ReactNode | React.ReactNode[];
    record?: Record<string, any>;
    handleChange?: (event: React.ChangeEvent<any>) => void;
}

const applyOnChangeRecursive = ({
                                    children,
                                    record          = undefined,
                                    handleChange    = undefined,
                                    onEnhance       = undefined
} : ApplyOnChangeParams): React.ReactNode => {
    return React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const onChange = handleChange && ((event: React.ChangeEvent<any>) => {
                child.props.onChange?.(event);
                handleChange && handleChange(event);
            });

            if (typeof child.type !== 'string' && (child.type as any).enhance) {
                return React.cloneElement(child as any, {
                    value: record?.[child.props.name] || null,
                    onChange: onChange
                });
            }

            if (child.props.children) {
                return React.cloneElement(child as any, {
                    children: applyOnChangeRecursive({children: child.props.children, record, handleChange, onEnhance})
                });
            } else if(onEnhance) {
                if(typeof child.type !== 'string' && child.props.name) {
                    onEnhance(child);
                }
                return child;
            } else {
                if (typeof child.type !== 'string' && record?.[child.props.name] === undefined) {
                    console.warn(`The property ${child.props.name} is not present in the record`, child);
                }

                return (typeof child.type === 'string'
                    ? React.cloneElement(child as any, {
                        className: "mb-3" + (child.props?.className ? ' ' + child.props.className : '')
                    })
                    : React.cloneElement(child as any, {
                        wrapClass: "mb-3" + (child.props?.wrapClass ? ' ' + child.props.wrapClass : ''),
                        value: record?.[child.props.name] || '',
                        onChange: onChange
                    }));
            }
        }

        return child;
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

export const extractComponentProps = (
    components: React.ReactNode | React.ReactNode[],
    onEnhance?: (child: React.ReactElement) => any
) : any[] | { [key: string]: string } => {
    const children = Array.isArray(components) ? components : [components];
    const props = onEnhance ? [] : {};

    applyOnChangeRecursive({
        children,
        onEnhance: (child) => {
            if (onEnhance) {
                (props as any[]).push(onEnhance(child));
            } else {
                (props as { [key: string]: string })[child.props.name] = "";
            }
        }
    });

    return props;
}

export default ComponentEnhancer;

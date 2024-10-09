import React from 'react';

const applyOnChangeRecursive = ({children, record = null, handleChange = null, onEnhance = null}) => {
    return React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const onChange = handleChange && ((event) => {
                child.props.onChange?.(event);
                handleChange && handleChange(event);
            });

            if(child.type?.enhance) {
                return React.cloneElement(child, {
                    value: record?.[child.props.name] || null,
                    onChange: onChange
                });
            }

            if (child.props.children) {
                return React.cloneElement(child, {
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
                    ? React.cloneElement(child, {
                        className: "mb-3" + (child.props?.className ? ' ' + child.props.className : '')
                    })
                    : React.cloneElement(child, {
                        wrapClass: "mb-3" + (child.props?.wrapClass ? ' ' + child.props.wrapClass : ''),
                        value: record?.[child.props.name] || '',
                        onChange: onChange
                    }));
            }
        }

        return child;
    });
};

const ComponentEnhancer = ({components, record, handleChange}) => {
    const children = Array.isArray(components) ? components : [components];
    return (
        <>
            {applyOnChangeRecursive({children, record, handleChange})}
        </>
    );
}

export const extractComponentProps = (components, onEnhance = null) => {
    const children = Array.isArray(components) ? components : [components];
    const props = onEnhance ? [] : {};

    applyOnChangeRecursive({
        children,
        onEnhance: (child) => {
            if (onEnhance) {
                props.push(onEnhance(child));
            } else {
                props[child.props.name] = "";
            }
        }
    });

    return props;
}

export default ComponentEnhancer;

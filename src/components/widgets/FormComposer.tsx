import React from "react";
import {FormDatabase, FormProps} from "./Form";
import {FieldDefinition} from "../Models";

type FieldMap = { [key: string]: React.ReactNode };

interface FormComposerProps extends Omit<FormProps, 'children'> {
    model: { [key: string]: FieldDefinition<any> };
    layout?: (fields: FieldMap) => React.ReactNode;
}

function normalizeValue(value: any): any {
    if (Array.isArray(value)) {
        return value.map(normalizeValue);
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([k, v]) => [k, normalizeValue(v)])
        );
    }
    return value === undefined ? null : value;
}

export function FormComposer({
                                 model,
                                 layout = (fields) => <>{Object.values(fields)}</>,
                                 ...formProps
                             }: FormComposerProps
) {
    const [children, values] = React.useMemo(() => {
        if (!model || !layout) return [null, {}];

        let defaults: any = {};

        const fields = Object.entries(model).reduce((acc: FieldMap, [key, fieldModel]) => {
            acc[key] = fieldModel.editor(key);
            defaults = { ...defaults, ...fieldModel.defaults(key) };
            return acc;
        }, {} as FieldMap);

        return [layout(fields), normalizeValue(defaults)];
    }, [model, layout]);

    return <FormDatabase dataObject={values} {...formProps}>{children}</FormDatabase>;
}


export default FormComposer;
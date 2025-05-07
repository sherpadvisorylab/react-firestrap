import React from "react";
import {FormDatabase, FormProps} from "./Form";
import {FieldDefinition} from "../Models";

type FieldMap = { [key: string]: React.ReactNode };

interface FormComposerProps extends Omit<FormProps, 'children'> {
    model: { [key: string]: FieldDefinition<any> };
    layout?: (fields: FieldMap) => React.ReactNode;
}

export function FormComposer({
                                 model,
                                 layout = (fields) => <>{Object.values(fields)}</>,
                                 ...formProps
                             }: FormComposerProps
) {
    let values = {};
    const children = React.useMemo(() => {
        if (!model || !layout) return null;

        return layout(Object.entries(model).reduce((acc: FieldMap, [key, fieldModel]) => {
            acc[key] = fieldModel.editor(key);
            values = {...values, ...fieldModel.defaults(key) };
            return acc;
        }, {} as FieldMap));
    }, [model, layout]);

    return <FormDatabase dataObject={values} {...formProps}>{children}</FormDatabase>;
}


export default FormComposer;
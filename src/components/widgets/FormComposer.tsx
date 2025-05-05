import React from "react";
import Form, {FormProps} from "./Form";
import {String, Number, Email, TextArea, Date, Time, DateTime, Checkbox} from "../ui/fields/Input";

type FieldMap = { [key: string]: React.ReactNode };

interface FormComposerProps extends Omit<FormProps, 'children'> {
    model: { [key: string]: any };
    layout?: (fields: FieldMap) => React.ReactNode;
}

type FieldType =
    | 'image'
    | 'string'
    | 'email'
    | 'number'
    | 'textarea'
    | 'date'
    | 'time'
    | 'datetime'
    | 'checkbox';

type FieldEntry = {
    type: FieldType;
    [key: string]: any;
};

const renderField = ({
                         key,
                         entry,
                     }: {
    key: string;
    entry: FieldEntry;
}): React.ReactNode => {
    const wrap = (suffix: string) => `${key}:${suffix}`;

    const components: Record<FieldType, React.ReactNode> = {
        image: (
            <>
                <String name={wrap("src")} label="Image source" />
                <String name={wrap("alt")} label="Alt text" />
                <Number name={wrap("width")} label="Width" value={entry.width} />
                <Number name={wrap("height")} label="Height" value={entry.height} />
            </>
        ),
        string: <String name={key} label={key} />,
        email: <Email name={key} label={key} />,
        number: <Number name={key} label={key} />,
        textarea: <TextArea name={key} label={key} />,
        date: <Date name={key} label={key} />,
        time: <Time name={key} label={key} />,
        datetime: <DateTime name={key} label={key} />,
        checkbox: <Checkbox name={key} label={key} />,
    };

    return components[entry.type] ?? <></>;
};


export function FormComposer({
                                 model,
                                 layout = (fields) => <>{Object.values(fields)}</>, // default layout
                                 ...formProps
                             }: FormComposerProps
) {
    const children = React.useMemo(() => {
        if (!model || !layout) return null;

        return layout(Object.entries(model).reduce((acc: FieldMap, [key, entry]) => {
            acc[key] = renderField({ key, entry });
            return acc;
        }, {} as FieldMap));
    }, [model, layout]);

    return <Form {...formProps}>{children}</Form>;
}


export default FormComposer;
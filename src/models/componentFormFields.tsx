import React from "react";
import { FieldFactory } from "../components/Component";
import {
    InputProps,
    Checkbox,
    Date,
    DateTime,
    Email,
    Number,
    String,
    Switch,
    TextArea,
    Time, TextAreaProps, CheckboxProps,
    Password,
    Color,
    Week,
    Month
} from "../components/ui/fields/Input";
import {Autocomplete, Checklist, Select, SelectProps} from "../components/ui/fields/Select";
import { getContextMenu } from "../App";
import {Col, Row} from "../components";
import {UploadDocument, UploadDocumentProps, UploadImage, UploadImageProps} from "../components/ui/fields/Upload";

export interface ComponentFormFieldsMap {
//    label: FieldFactory<Omit<LabelProps, 'name' | 'onChange'>>;
    string: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;
    number: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;
    email: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;
    password: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;
    color: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;
    date: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;         
    time: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;          
    datetime: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;  
    week: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;  
    month: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;  
    textarea: FieldFactory<Omit<TextAreaProps, 'name' | 'onChange'>>;
    checkbox: FieldFactory<Omit<CheckboxProps, 'name' | 'onChange'>>;
    switch: FieldFactory<Omit<CheckboxProps, 'name' | 'onChange'>>;      
//    listgroup: FieldFactory<Omit<ListGroupProps, 'name' | 'onChange'>>;
    select: FieldFactory<Omit<SelectProps, 'name' | 'onChange'>>;
    autocomplete: FieldFactory<Omit<SelectProps, 'name' | 'onChange'>>;
    checklist: FieldFactory<Omit<SelectProps, 'name' | 'onChange'>>;
    uploadImage: FieldFactory<Omit<UploadImageProps, 'name' | 'onChange'>>;
    uploadDocument: FieldFactory<Omit<UploadDocumentProps, 'name' | 'onChange'>>;

    image: FieldFactory<{
        src?: string;
        alt?: string;
        width?: number;
        height?: number;
    }>;
    menu: FieldFactory<{ context?: string }>;
}

const componentFormFields: ComponentFormFieldsMap = {
    string: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <String name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    number: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Number name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    email: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Email name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    password: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Password name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    color: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Color name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    date: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Date name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    time: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Time name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    datetime: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({ [key]: value }),
            render: (key, value, onChange) => <DateTime name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    week: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({ [key]: value }),
            render: (key, value, onChange) => <Week name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    month: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({ [key]: value }),
            render: (key, value, onChange) => <Month name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    textarea: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <TextArea name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    checkbox: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Checkbox name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    switch: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Switch name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    select: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Select name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    autocomplete: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Autocomplete name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    checklist: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <Checklist name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    uploadImage: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <UploadImage name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    uploadDocument: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            render: (key, value, onChange) => <UploadDocument name={key} label={label ?? key} {...rest} value={value} onChange={onChange} />
        }
    },
    image: (props = {}) => {
        const { src, alt, width,  height} = props;
        return {
            __props: props,
            getDefaults: (key) => ({
                [`${key}:src`]: src,
                [`${key}:alt`]: alt,
                [`${key}:width`]: width,
                [`${key}:height`]: height
            }),
            render: (key) => <>
                <String name={`${key}:src`} label="Image source" />
                <String name={`${key}:alt`} label="Alt text" />
                <Row>
                    <Col><Number name={`${key}:width`} label="Width" value={width} /></Col>
                    <Col><Number name={`${key}:height`} label="Height" value={height} /></Col>
                </Row>
            </>
        }
    },
    menu: (props = {}) => {
        const {context} = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: context}),
            render: (key) => <Select name={key} label={key} value={context} options={getContextMenu()}/>
        }
    }
};

export default componentFormFields;
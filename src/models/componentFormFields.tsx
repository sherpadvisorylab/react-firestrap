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
            renderForm: (key) => <String name={key} label={label ?? key} {...rest} />
        }
    },
    number: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Number name={key} label={label ?? key} {...rest} />
        }
    },
    email: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Email name={key} label={label ?? key} {...rest} />
        }
    },
    password: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Password name={key} label={label ?? key} {...rest} />
        }
    },
    color: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Color name={key} label={label ?? key} {...rest} />
        }
    },
    date: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Date name={key} label={label ?? key} {...rest} />
        }
    },
    time: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Time name={key} label={label ?? key} {...rest} />
        }
    },
    datetime: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({ [key]: value }),
            renderForm: (key) => <DateTime name={key} label={label ?? key} {...rest} />
        }
    },
    week: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({ [key]: value }),
            renderForm: (key) => <Week name={key} label={label ?? key} {...rest} />
        }
    },
    month: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({ [key]: value }),
            renderForm: (key) => <Month name={key} label={label ?? key} {...rest} />
        }
    },
    textarea: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <TextArea name={key} label={label ?? key} {...rest} />
        }
    },
    checkbox: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Checkbox name={key} label={label ?? key} {...rest} />
        }
    },
    switch: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Switch name={key} label={label ?? key} {...rest} />
        }
    },
    select: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Select name={key} label={label ?? key} {...rest} />
        }
    },
    autocomplete: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Autocomplete name={key} label={label ?? key} {...rest} />
        }
    },
    checklist: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Checklist name={key} label={label ?? key} {...rest} />
        }
    },
    uploadImage: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <UploadImage name={key} label={label ?? key} {...rest} />
        }
    },
    uploadDocument: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <UploadDocument name={key} label={label ?? key} {...rest} />
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
            renderForm: (key) => <>
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
            renderForm: (key) => <Select name={key} label={key} value={context} options={getContextMenu()}/>
        }
    }
};

export default componentFormFields;
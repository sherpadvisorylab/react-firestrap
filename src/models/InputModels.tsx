import React from "react";
import { FieldFactory } from "../components/Models";
import {
    InputProps,
    Checkbox,
    Date,
    DateInput,
    DateTime,
    Email,
    Number,
    String,
    SwitchInput,
    TextArea,
    Time, TextAreaProps, DateInputProps, CheckboxProps, SwitchInputProps
} from "../components/ui/fields/Input";
import {Autocomplete, Checklist, Select, SelectProps} from "../components/ui/fields/Select";
import { getContextMenu } from "../App";
import {Col, Row} from "../components";
import Upload, {UploadProps} from "../components/ui/fields/Upload";

export interface InputModelsMap {
//    label: FieldFactory<Omit<LabelProps, 'name' | 'onChange'>>;
    string: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;
    email: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;
    number: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;
    date: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;          //da mettere filter: contrast(0.5) vedere su tema chiaro
    time: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;          //da mettere filter: contrast(0.5) vedere su tema chiaro
    datetime: FieldFactory<Omit<InputProps, 'name' | 'onChange'>>;      //da mettere filter: contrast(0.5) vedere su tema chiaro
    textarea: FieldFactory<Omit<TextAreaProps, 'name' | 'onChange'>>;
    dateinput: FieldFactory<Omit<DateInputProps, 'name' | 'onChange'>>;     //da togliere
    checkbox: FieldFactory<Omit<CheckboxProps, 'name' | 'onChange'>>;
    switch: FieldFactory<Omit<SwitchInputProps, 'name' | 'onChange'>>;      //da fondere con checkbox
//    listgroup: FieldFactory<Omit<ListGroupProps, 'name' | 'onChange'>>;
    select: FieldFactory<Omit<SelectProps, 'name' | 'onChange'>>;
    autocomplete: FieldFactory<Omit<SelectProps, 'name' | 'onChange'>>;
    checklist: FieldFactory<Omit<SelectProps, 'name' | 'onChange'>>;
    upload: FieldFactory<Omit<UploadProps, 'name' | 'onChange'>>;

    image: FieldFactory<{
        src?: string;
        alt?: string;
        width?: number;
        height?: number;
    }>;
    menu: FieldFactory<{ context?: string }>;
}

const InputModels: InputModelsMap = {
    string: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <String name={key} label={label ?? key} {...rest} />
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
    number: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Number name={key} label={label ?? key} {...rest} />
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
    textarea: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <TextArea name={key} label={label ?? key} {...rest} />
        }
    },
    dateinput: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <DateInput name={key} label={label ?? key} {...rest} />
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
            renderForm: (key) => <SwitchInput name={key} label={label ?? key} {...rest} />
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
    upload: (props = {}) => {
        const { value, label, ...rest } = props;
        return {
            __props: props,
            getDefaults: (key) => ({[key]: value}),
            renderForm: (key) => <Upload name={key} label={label ?? key} {...rest} />
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

export default InputModels;
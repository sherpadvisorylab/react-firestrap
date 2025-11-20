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
import {ImageUrl, ImageUrlProps} from "../components/ui/fields/ImageUrl";
import {UploadDocument, UploadDocumentProps, UploadImage, UploadImageProps} from "../components/ui/fields/Upload";
import { Prompt, PromptProps } from "../components/ui/fields/Prompt";

export interface ComponentFormFieldsMap {
//    label: FieldFactory<Partial<InputProps>>;
    string: FieldFactory<Partial<InputProps>>;
    number: FieldFactory<Partial<InputProps>>;
    email: FieldFactory<Partial<InputProps>>;
    password: FieldFactory<Partial<InputProps>>;
    color: FieldFactory<Partial<InputProps>>;
    date: FieldFactory<Partial<InputProps>>;         
    time: FieldFactory<Partial<InputProps>>;          
    datetime: FieldFactory<Partial<InputProps>>;  
    week: FieldFactory<Partial<InputProps>>;  
    month: FieldFactory<Partial<InputProps>>;  
    textarea: FieldFactory<Partial<TextAreaProps>>;
    checkbox: FieldFactory<Partial<CheckboxProps>>;
    switch: FieldFactory<Partial<CheckboxProps>>;      
//    listgroup: FieldFactory<Partial<ListGroupProps>>;
    select: FieldFactory<Partial<SelectProps>>;
    autocomplete: FieldFactory<Partial<SelectProps>>;
    checklist: FieldFactory<Partial<SelectProps>>;
    uploadImage: FieldFactory<Partial<UploadImageProps>>;
    uploadDocument: FieldFactory<Partial<UploadDocumentProps>>;
    prompt: FieldFactory<Partial<PromptProps>>;
    imageUrl: FieldFactory<Partial<ImageUrlProps>>;
    menu: FieldFactory<{ defaultValue?: string }>;
}

const componentFormFields: ComponentFormFieldsMap = {
    string: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <String key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    number: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Number key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    email: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Email key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    password: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Password key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    color: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Color key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    date: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Date key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    time: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Time key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    datetime: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({ [name]: props.defaultValue }),
        render: ({name, label, ...rest} = {}) => <DateTime key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    week: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({ [name]: props.defaultValue }),
        render: ({name, label, ...rest} = {}) => <Week key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    month: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({ [name]: props.defaultValue }),
        render: ({name, label, ...rest} = {}) => <Month key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    textarea: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <TextArea key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    checkbox: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Checkbox key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    switch: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Switch key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    select: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Select key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    autocomplete: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Autocomplete key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    checklist: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Checklist key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    uploadImage: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <UploadImage key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    uploadDocument: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <UploadDocument key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    prompt: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Prompt key={name ?? props.name} name={name ?? props.name} label={label ?? props.label ?? name} {...props} {...rest} />
    }),
    imageUrl: (props = {}) => {
        return {
            __props: props,
            getDefaults: (name) => ({[name]: props.defaultValue}),
            render: ({name, label, ...rest} = {}) => <ImageUrl name={name} label={label ?? name} {...props} {...rest} />
        }
    },
    menu: (props = {}) => ({
        __props: props,
        getDefaults: (name) => ({[name]: props.defaultValue}),
        render: ({name, label, ...rest} = {}) => <Select key={name} name={name} label={label ?? name} {...props} {...rest} />
    })
};

export default componentFormFields;
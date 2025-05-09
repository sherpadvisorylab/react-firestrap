import React from "react";
import { FieldFactory } from "../components/Models";
import { Checkbox, Date, DateInput, DateTime, Email, Number, String, SwitchInput, TextArea, Time } from "../components/ui/fields/Input";
import { Select } from "../components/ui/fields/Select";
import { getContextMenu } from "../App";
import { Menu } from "../components/ui/fields/Menu";

export interface InputModelsMap {
    string: FieldFactory<{ value?: string }>;
    email: FieldFactory<{ value?: string }>;
    number: FieldFactory<{ value?: number }>;
    textarea: FieldFactory<{ value?: string }>;
    date: FieldFactory<{ value?: string }>;
    time: FieldFactory<{ value?: string }>;
    datetime: FieldFactory<{ value?: string }>;
    dateinput: FieldFactory<{ value?: string }>;
    checkbox: FieldFactory<{ value?: string | boolean }>;
    switch: FieldFactory<{ value?: boolean }>;
    image: FieldFactory<{
        src?: string;
        alt?: string;
        width?: number;
        height?: number;
    }>;
    menu: FieldFactory<{ context?: string }>;   //todo: da togliere da qui
}

const InputModels: InputModelsMap = {
    string: ({ value } = {}) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <String name={key} label={key} />
    }),
    email: ({ value } = {}) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <Email name={key} label={key} />
    }),
    number: ({ value } = {}) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <Number name={key} label={key} />
    }),
    textarea: ({ value } = {}) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <TextArea name={key} label={key} />
    }),
    date: ({ value } = {}) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <Date name={key} label={key} />
    }),
    time: ({ value } = {}) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <Time name={key} label={key} />
    }),
    datetime: ({ value } = {}) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <DateTime name={key} label={key} />
    }),
    dateinput: ({ value } = {}) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <DateInput name={key} value={value} />
    }),
    checkbox: ({ value } = {}) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <Checkbox name={key} label={key} />
    }),
    switch: ({ value } = {}) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <SwitchInput name={key} label={key} />
    }),
    image: ({ src, alt, width, height } = {}) => ({
        defaults: (key) => ({
            [`${key}:src`]: src,
            [`${key}:alt`]: alt,
            [`${key}:width`]: width,
            [`${key}:height`]: height
        }),
        editor: (key) => <>
            <String name={`${key}:src`} label="Image source" />
            <String name={`${key}:alt`} label="Alt text" />
            <Number name={`${key}:width`} label="Width" value={width} />
            <Number name={`${key}:height`} label="Height" value={height} />
        </>
    }),
    menu: ({ context } = {}) => ({
        defaults: (key) => ({ [key]: context }),
        editor: (key) => <Select name="context" value={context} options={getContextMenu()} />
    })
};

export default InputModels;
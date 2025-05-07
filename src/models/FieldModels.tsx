import React from "react";
import {FieldFactory} from "../components/Models";
import { Number, String } from "../components/ui/fields/Input";

export interface FieldModelsMap {
    string: FieldFactory<{ value?: string }>;
    email: FieldFactory<{ value?: string }>;
    number: FieldFactory<{ value?: number }>;
    textarea: FieldFactory<{ value?: string }>;
    date: FieldFactory<{ value?: string }>;
    time: FieldFactory<{ value?: string }>;
    datetime: FieldFactory<{ value?: string }>;
    checkbox: FieldFactory<{ value?: string | boolean }>;
    image: FieldFactory<{
        src?: string;
        alt?: string;
        width?: number;
        height?: number;
    }>;
    menu: FieldFactory<{ staticMenu?: string; db?: any; options?: any; sort?: any }>;   //todo: da togliere da qui
}

const FieldModels: FieldModelsMap = {
    string: ({ value }) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <String name={key} label={key} />
    }),
    email: ({ value }) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <String name={key} label={key} />
    }),
    number: ({ value }) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <Number name={key} label={key} />
    }),
    textarea: ({ value }) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <String name={key} label={key} />
    }),
    date: ({ value }) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <String name={key} label={key} />
    }),
    time: ({ value }) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <String name={key} label={key} />
    }),
    datetime: ({ value }) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <String name={key} label={key} />
    }),
    checkbox: ({ value }) => ({
        defaults: (key) => ({ [key]: value }),
        editor: (key) => <String name={key} label={key} />
    }),
    image: ({ src, alt, width, height }: {
        src?: string;
        alt?: string;
        width?: number;
        height?: number;
    }) => ({
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
    menu: ({ staticMenu, db, options, sort }) => ({  //todo: da togliere da qui
        defaults: (key) => ({
            [`${key}:static`]: staticMenu,
            [`${key}:db`]: db,
            [`${key}:options`]: options,
            [`${key}:sort`]: sort
        }),
        editor: (key) => <>{key} Menu statico Preview! </>
    }),
};

export default FieldModels;
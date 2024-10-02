import React, {useEffect, useMemo, useState} from 'react';
import database from "../libs/database.js";
import {Label} from "./Input.js";
import {Wrapper} from "./GridSystem.js"
import {useTheme} from "../Theme.js";
import {arrayUnique} from "../libs/utils.js";

let ids= 0;

function genKey() {
    return ids++;
}



export const Select = ({
                              name,
                              value = null,
                              onChange = () => {},
                              required = false,
                              updatable = true,
                              disabled = false,
                              optionEmpty = {
                                  label: "Select...",
                                  value: ""
                              },
                              label = null,
                              title = null,
                              pre = null,
                              post = null,
                              feedback = null,
                              options = [],
                              db = null,
                              order = null,
                              wrapClass = null,
                              className = null,
                          } : {
    name: string,
    value?: string,
    onChange?: (e : {target: {name: string, value: string[]}}, options: any[]) => void,
    required?: boolean,
    updatable?: boolean,
    disabled?: boolean,
    optionEmpty?: boolean | {label: string, value: string},
    label?: string,
    title?: string,
    pre?: string,
    post?: string,
    feedback?: string,
    options?: any[],
    db ?: {
        srcPath: string,
        fieldMap: string | {label: string, value: string},
        where?: {[key]: string, op?: string},
        onLoad?: (data: any[]) => any[]
    },
    order ?: {
        field: "label" | "value",
        dir: "asc" | "desc"
    },
    wrapClass?: string,
    className?: string,
}) => {
    const theme = useTheme();

    const [selectedValue, setSelectedValue] = useState(value);
    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    const [lookup, setLookup] = useState([]);
    database.useListener(db?.srcPath, setLookup, {fieldMap : db?.fieldMap, where: db?.where, onLoad:db?.onLoad});

    const opts = useMemo(() => {
        const combinedOptions = [
            ...options.map(option =>
                typeof option === "string" || typeof option === "number"
                    ? { label: option + "", value: option + "" }
                    : option
            ),
            ...lookup
        ].sort((a, b) => order?.dir === "desc"
            ? b[order?.field || "label"].localeCompare(a[order?.field || "label"])
            : a[order?.field || "label"].localeCompare(b[order?.field || "label"])
        );

        // Add the value to the options if it is not already present
        if (selectedValue && !combinedOptions.length) {
            combinedOptions.push({label: "🔄 Caricamento...", value: selectedValue});
        }

        return arrayUnique(combinedOptions, 'value');
    }, [options, lookup]);

    console.log("SELECT", selectedValue, opts);

    if (!selectedValue && !optionEmpty && opts.length > 0) {
        onChange({target: {name: name, value: opts[0].value}}, opts);
    }

    return (
        <Wrapper className={wrapClass || theme.Select.wrapClass}>
            {label && <Label label={label} required={required}/>}
            <Wrapper className={pre || post ? "input-group": ""}>
                {pre && <span className="input-group-text">{pre}</span>}
                <select
                    name={name}
                    className={`form-select ${className || theme.Select.className}`}
                    defaultValue={selectedValue}
                    required={required}
                    disabled={disabled || (!updatable && selectedValue)}
                    onChange={onChange}
                    title={title}
                >
                    {optionEmpty && <option value={optionEmpty.value}>{optionEmpty.label}</option>}
                    {opts.map((op) => {
                        return (
                            <option value={op.value} key={op.value}>
                                {op.label}
                            </option>
                        );
                    })}
                </select>
                {post && <span className="input-group-text p-0">{post}</span>}
            </Wrapper>
            {feedback && <div className="feedback">{feedback}</div>}
        </Wrapper>
    );
};

export const Autocomplete = ({
                                name,
                                value = null,
                                min = null,
                                max =  null,
                                onChange = () => {},
                                required = false,
                                updatable = true,
                                disabled = false,
                                label = null,
                                placeholder = null,
                                pre = null,
                                post = null,
                                feedback = null,
                                options = [],
                                db = null,
                                order = null,
                                wrapClass = null,
                                className = null,
                             } : {
    name: string,
    value?: string,
    min?: number,
    max?: number,
    onChange?: (e : {target: {name: string, value: string[]}}, options: any[]) => void,
    required?: boolean,
    updatable?: boolean,
    disabled?: boolean,
    label?: string,
    placeholder?: string,
    pre?: string,
    post?: string,
    feedback?: string,
    options?: any[],
    db ?: {
        srcPath: string,
        fieldMap?: string | {label: string, value: string},
        where?: {[key]: string, op?: string},
        onLoad?: (data: any[]) => any[]
    },
    order ?: {
        field: "label" | "value",
        dir: "asc" | "desc"
    },
    wrapClass?: string,
    className?: string,
}) => {
    const theme = useTheme();

    const [selectedItems, setSelectedItems] = useState(
        typeof value === 'string' || typeof value === "number"
            ? value ? value.split(',') : []
            : value || []
    );
    useEffect(() => {
        setSelectedItems(
            typeof value === 'string' || typeof value === "number"
                ? value ? value.split(',') : []
                : value || []
        );
    }, [value]);

    const [lookup, setLookup] = useState([]);
    database.useListener(db?.srcPath, setLookup, {fieldMap : db?.fieldMap, where: db?.where, onLoad:db?.onLoad});

    const opts = useMemo(() => {
        const combinedOptions = [
            ...options.map(option =>
                typeof option === "string" || typeof option === "number"
                    ? { label: option + "", value: option + "" }
                    : option
            ),
            ...lookup
        ].sort((a, b) => order?.dir === "desc"
            ? b[order?.field || "label"].localeCompare(a[order?.field || "label"])
            : a[order?.field || "label"].localeCompare(b[order?.field || "label"])
        );

        return arrayUnique(combinedOptions, 'value');
    }, [options, lookup]);

console.log("AUTOCOMPLETE", selectedItems, opts);

    const handleChange = (e) => {
        const currentValue = e.target.value;

        if (opts.filter(op => op.value === currentValue).length === 0) {
            return;
        }

        if (selectedItems.includes(currentValue) || (max && selectedItems.length >= max)) {
            e.target.value = '';
            return;
        }

        setSelectedItems(prevState => {
            const updatedItems = [...prevState, currentValue];
            setTimeout(() => {
                onChange({target: {name: name, value: updatedItems}}, opts);
            }, 0);

            return updatedItems;
        });

        e.target.value = '';
    };

    const removeItem = (currentValue) => {
        setSelectedItems(prevState => {
            const updatedItems = prevState.filter(item => item !== currentValue);
            setTimeout(() => {
                onChange({target: {name: name, value: updatedItems}});
            }, 0);

            return updatedItems;
        });
    };

    const selectedItemsClass = selectedItems.length > 0 ? " p-0" : "";
    return (
        <Wrapper className={wrapClass || theme.Autocomplete.wrapClass}>
            {label && <Label label={label} required={required}/>}
            <Wrapper className={pre || post ? "input-group" : ""}>
                {pre && <span className="input-group-text">{pre}</span>}
                <div className={`d-flex flex-wrap form-control${selectedItemsClass}`}>
                    {selectedItems.map(item => (
                        <span className="bg-secondary p-1 ms-2 my-2" key={item}>
                            <small>{item}</small>
                            <button className={"btn p-1"} onClick={() => removeItem(item)}>x</button>
                        </span>
                    ))}
                    {(!max || selectedItems.length < max) && <input
                        type={"text"}
                        className={`border-0 p-0 bg-transparent ${className || theme.Autocomplete.className}`}
                        required={required && selectedItems.length < min}
                        disabled={disabled || (!updatable && value)}
                        placeholder={placeholder}
                        list={name}
                        onChange={handleChange}
                    />}
                </div>
                <datalist id={name}>
                    {opts.map((op) => {
                        return (
                            <option value={op.value} key={genKey()}>
                                {op.label}
                            </option>
                        );
                    })}
                </datalist>
                {post && <span className="input-group-text">{post}</span>}
            </Wrapper>
            {feedback && <div className="feedback">{feedback}</div>}
        </Wrapper>
    );
};

export const Checklist = ({
                                name,
                                value = [],
                                onChange = () => {},
                                required = false,
                                updatable = true,
                                disabled = false,
                                label = null,
                                title = null,
                                pre = null,
                                post = null,
                                feedback = null,
                                options = [],
                                db = null,
                                order = null,
                                wrapClass = null,
                                checkClass = null,
                             } : {
    name: string,
    value?: string,
    onChange?: (e : {target: {name: string, value: string[]}}, options: any[]) => void,
    required?: boolean,
    updatable?: boolean,
    disabled?: boolean,
    label?: string,
    title?: string,
    pre?: string,
    post?: string,
    feedback?: string,
    options?: any[],
    db ?: {
        srcPath: string,
        fieldMap: string | {label: string, value: string},
        where?: {[key]: string, op?: string},
        onLoad?: (data: any[]) => any[]
    },
    order ?: {
        field: "label" | "value",
        dir: "asc" | "desc"
    },
    wrapClass?: string,
    checkClass?: string,
}) => {

    const [selectedItems, setSelectedItems] = useState(
        typeof value === 'string' || typeof value === "number"
        ? value ? value.split(',') : []
        : value || []
    );
    useEffect(() => {
        setSelectedItems(
            typeof value === 'string' || typeof value === "number"
                ? value ? value.split(',') : []
                : value || []
        );
    }, [value]);

    const [lookup, setLookup] = useState([]);
    database.useListener(db?.srcPath, setLookup, {fieldMap : db?.fieldMap, where: db?.where, onLoad:db?.onLoad});

    const opts = useMemo(() => {
        const combinedOptions = [
            ...options.map(option =>
                typeof option === "string" || typeof option === "number"
                    ? { label: option + "", value: option + "" }
                    : option
            ),
            ...lookup
        ].sort((a, b) => order?.dir === "desc"
            ? b[order?.field || "label"].localeCompare(a[order?.field || "label"])
            : a[order?.field || "label"].localeCompare(b[order?.field || "label"])
        );

        return arrayUnique(combinedOptions, 'value');
    }, [options, lookup]);

    console.log("CHECKLIST", selectedItems, opts);

    const removeItem = (currentValue) => {
        setSelectedItems(prevState => {
            const updatedItems = prevState.filter(item => item !== currentValue);
            setTimeout(() => {
                onChange({target: {name: name, value: updatedItems}}, opts);
            }, 0);
            console.log("CHECKLIST REMOVE", updatedItems);

            return updatedItems;
        });
    };

    const handleChange = (e) => {
        const currentValue = e.target.value;

        if(!e.target.checked) {
            removeItem(currentValue);
            return;
        }

        if (opts.filter(op => op.value === currentValue).length === 0) {
            return;
        }

        if (selectedItems.includes(currentValue)) {
            return;
        }

        setSelectedItems(prevState => {
            const updatedItems = [...prevState, currentValue];
            setTimeout(() => {
                onChange({target: {name: name, value: updatedItems}});
            }, 0);

            console.log("CHECKLIST CHANGE", updatedItems);
            return updatedItems;
        });
    };

    return (
        <Wrapper className={wrapClass}>
            {label && <><Label label={label} className={"form-check-label"} required={required}/><hr className={"mt-0"} /></>}
            <Wrapper className={pre || post ? "input-group" : ""}>
                {pre && <span className="input-group-text">{pre}</span>}
                {opts.map((op) => {
                    const key = genKey();
                    return (
                        <div key={op.value} className={checkClass}>
                            <input
                                className={"form-check-input"}
                                type={"checkbox"}
                                id={key}
                                defaultValue={op.value}
                                onChange={handleChange}
                                defaultChecked={selectedItems.includes(op.value)}
                            />
                            <label htmlFor={key} className={"ms-1"}>{op.label}</label>
                        </div>
                    );
                })}
                {post && <span className="input-group-text">{post}</span>}
            </Wrapper>
            {feedback && <div className="feedback">{feedback}</div>}
        </Wrapper>
    );
};
import React, {useEffect, useMemo, useState} from 'react';
import database from "../libs/database";
import {Label} from "./Input";
import {Wrapper} from "./GridSystem"
import {useTheme} from "../Theme";
import {arraysEqual, arrayUnique, isEmpty, sanitizeKey} from "../libs/utils";
import {DatabaseOptions, RecordProps} from "../integrations/google/firedatabase";

interface Option extends RecordProps {
    label: string;
    value: string;
}

interface DBConfig<T extends RecordProps = RecordProps> extends DatabaseOptions<T> {
    srcPath: string;
}

interface OrderConfig {
    field: 'label' | 'value';
    dir: 'asc' | 'desc';
}

interface BaseProps {
    name: string;
    value?: string | number | any[];
    onChange?: (e: { target: { name: string; value: any } }, options?: Option[]) => void;
    required?: boolean;
    updatable?: boolean;
    disabled?: boolean;
    label?: string;
    title?: string;
    pre?: string;
    post?: string;
    feedback?: string;
    options?: Option[] | string[] | number[];
    db?: DBConfig<Option>;
    order?: OrderConfig;
    wrapClass?: string;
    className?: string;
}

export interface SelectProps extends BaseProps {
    optionEmpty?: Option;
    value?: string | number;
}

export interface AutocompleteProps extends BaseProps {
    min?: number;
    max?: number;
    placeholder?: string;
}

export interface ChecklistProps extends BaseProps {
    checkClass?: string;
}

let ids= 0;
const genKey = () => (ids++).toString();

const valueToArray = (value: string | number | any[] | undefined): any[] => {
    if(!value) return []

    return typeof value === 'string' || typeof value === "number"
        ? value.toString().split(',')
        : value;
}

const normalizeOption = (
    fieldMap: Record<string, any> | string | number | undefined
): Option => {
    if (!fieldMap) {
        return { label: '', value: '' };
    }

    if (typeof fieldMap !== 'object') {
        return { label: fieldMap.toString(), value: fieldMap.toString() };
    }

    return {
        label: fieldMap?.label.toString() || '',
        value: fieldMap?.value.toString() || ''
    };
};

function getOptionsDB(
    db?: DBConfig<Option>
): DatabaseOptions<Option> {
    return {
        fieldMap: normalizeOption(db?.fieldMap),
        where: db?.where,
        onLoad: db?.onLoad,
    };
}


const getOptions = (
    options: Array<string | number | Option>,
    lookup: Option[],
    order?: OrderConfig
) : Option[] => {
    return [
        ...options.map(normalizeOption),
        ...lookup
    ].sort((a, b) => order?.dir === "desc"
        ? b[order?.field || "label"].localeCompare(a[order?.field || "label"])
        : a[order?.field || "label"].localeCompare(b[order?.field || "label"])
    );
}

export const Select = ({
                              name,
                              value         = undefined,
                              onChange      = undefined,
                              required      = false,
                              updatable     = true,
                              disabled      = false,
                              optionEmpty   = {
                                              label: "Select...",
                                              value: ""
                                            },
                              label         = undefined,
                              title         = undefined,
                              pre           = undefined,
                              post          = undefined,
                              feedback      = undefined,
                              options       = [],
                              db            = undefined,
                              order         = undefined,
                              wrapClass     = undefined,
                              className     = undefined,
} : SelectProps) => {
    const theme = useTheme("select");

    const [selectedValue, setSelectedValue] = useState(value);
    useEffect(() => {
        if (value !== selectedValue) {
            setSelectedValue(value);
        }
    }, [value]);

    const dbOptions = useMemo(() => getOptionsDB(db), [db?.fieldMap, db?.where, db?.onLoad]);
    const [lookup, setLookup] = useState<Option[]>([]);
    database.useListener(db?.srcPath, setLookup, dbOptions);

    const opts = useMemo(() => {
        const combinedOptions = getOptions(options, lookup, order);

        return arrayUnique(
            selectedValue && !combinedOptions.length
                ? [...combinedOptions, {label: "🔄 Caricamento...", value: selectedValue.toString()}]
                : combinedOptions,
            'value'
        );

    }, [options, lookup, selectedValue, order]);

    console.log("SELECT", selectedValue, opts);

    if (!selectedValue && !optionEmpty && opts.length > 0) {
        onChange?.({target: {name: name, value: opts[0].value}}, opts);
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
                    disabled={disabled || (!updatable && !isEmpty(selectedValue))}
                    onChange={onChange}
                    title={title}
                >
                    {optionEmpty && <option value={optionEmpty.value}>{optionEmpty.label}</option>}
                    {opts.map((op) => {
                        const key = sanitizeKey(`sl-${name}-${op.value}`);
                        return (
                            <option value={op.value} key={key}>
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
                                value           = undefined,
                                min             = undefined,
                                max             = undefined,
                                onChange        = undefined,
                                required        = undefined,
                                updatable       = undefined,
                                disabled        = undefined,
                                label           = undefined,
                                placeholder     = undefined,
                                pre             = undefined,
                                post            = undefined,
                                feedback        = undefined,
                                options         = [],
                                db              = undefined,
                                order           = undefined,
                                wrapClass       = undefined,
                                className       = undefined,
} : AutocompleteProps) => {
    const theme = useTheme("select");

    const valueArray = useMemo(() => valueToArray(value), [value]);
    const [selectedItems, setSelectedItems] = useState(() => valueArray);
    useEffect(() => {
        if (!arraysEqual(valueArray, selectedItems)) {
            setSelectedItems(valueArray);
        }
    }, [valueArray]);

    const dbOptions = useMemo(() => getOptionsDB(db), [db?.fieldMap, db?.where, db?.onLoad]);
    const [lookup, setLookup] = useState<Option[]>([]);
    database.useListener(db?.srcPath, setLookup, dbOptions);

    const opts = useMemo(() => {
        const combinedOptions = getOptions(options, lookup, order);
        return arrayUnique(combinedOptions, 'value');
    }, [options, lookup]);

console.log("AUTOCOMPLETE", selectedItems, opts);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                onChange?.({target: {name: name, value: updatedItems}}, opts);
            }, 0);

            return updatedItems;
        });

        e.target.value = '';
    };

    const removeItem = (currentValue: string) => {
        setSelectedItems(prevState => {
            const updatedItems = prevState.filter(item => item !== currentValue);
            setTimeout(() => {
                onChange?.({target: {name: name, value: updatedItems}}, opts);
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
                        required={required && selectedItems.length < (min || 0)}
                        disabled={disabled || (!updatable && !isEmpty(value))}
                        placeholder={placeholder}
                        list={name}
                        onChange={handleChange}
                    />}
                </div>
                <datalist id={name}>
                    {opts.map((op) => {
                        const key = sanitizeKey(`dl-${name}-${op.value}`);
                        return (
                            <option value={op.value} key={key}>
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
                                value       = [],
                                onChange    = undefined,
                                required    = false,
                                updatable   = true,
                                disabled    = false,
                                label       = undefined,
                                title       = undefined,
                                pre         = undefined,
                                post        = undefined,
                                feedback    = undefined,
                                options     = [],
                                db          = undefined,
                                order       = undefined,
                                wrapClass   = undefined,
                                checkClass  = undefined,
} : ChecklistProps) => {
    const valueArray = useMemo(() => valueToArray(value), [value]);
    const [selectedItems, setSelectedItems] = useState(() => valueArray);
    useEffect(() => {
        if (!arraysEqual(valueArray, selectedItems)) {
            setSelectedItems(valueArray);
        }
    }, [valueArray]);

    const dbOptions = useMemo(() => getOptionsDB(db), [db?.fieldMap, db?.where, db?.onLoad]);
    const [lookup, setLookup] = useState<Option[]>([]);
    database.useListener(db?.srcPath, setLookup, dbOptions);

    const opts = useMemo(() => {
        const combinedOptions = getOptions(options, lookup, order);
        return arrayUnique(combinedOptions, 'value');
    }, [options, lookup]);

    console.log("CHECKLIST", selectedItems, opts);

    const removeItem = (currentValue: string) => {
        setSelectedItems(prevState => {
            const updatedItems = prevState.filter(item => item !== currentValue);
            setTimeout(() => {
                onChange?.({target: {name: name, value: updatedItems}}, opts);
            }, 0);
            console.log("CHECKLIST REMOVE", updatedItems);

            return updatedItems;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                onChange?.({target: {name: name, value: updatedItems}}, opts);
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
                    const key = sanitizeKey(`cl-${name}-${op.value}`);
                    return (
                        <div key={key} className={checkClass}>
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
import React, {useEffect, useId, useMemo, useState} from 'react';
import database from "../../../libs/database";
import {Label} from "./Input";
import {Col, Row, Wrapper} from "../GridSystem"
import {useTheme} from "../../../Theme";
import {arraysEqual, arrayUnique, isEmpty, sanitizeKey} from "../../../libs/utils";
import {DatabaseOptions, RecordProps} from "../../../integrations/google/firedatabase";

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
    ].sort((a, b) => {
        const field = order?.field || "label";
        const aVal = (a[field] ?? "").toString();
        const bVal = (b[field] ?? "").toString();
        return order?.dir === "desc"
        ? bVal.localeCompare(aVal)
        : aVal.localeCompare(bVal)
    });
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

    if (!selectedValue && !optionEmpty && opts.length > 0) {
        onChange?.({target: {name: name, value: opts[0].value}}, opts);
    }

    const id = useId();
    return (
        <Wrapper className={wrapClass || theme.Select.wrapClass}>
            {label && <Label label={label} required={required} htmlFor={id}/>}
            <Wrapper className={pre || post ? "input-group": ""}>
                {pre && <span className="input-group-text">{pre}</span>}
                <select
                    id={id}
                    name={name}
                    className={`form-select ${className || theme.Select.className}`}
                    value={selectedValue}
                    required={required}
                    disabled={disabled || (!updatable && !isEmpty(selectedValue))}
                    onChange={onChange}
                    title={title}
                >
                    {optionEmpty && <option value={optionEmpty.value}>{optionEmpty.label}</option>}
                    {opts.map((op, index) => <option value={op.value} key={`${id}-${index}`}>{op.label}</option>)}
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
                                required        = false,
                                updatable       = true,
                                disabled        = false,
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

    const id = useId();
    return (
        <Wrapper className={wrapClass || theme.Autocomplete.wrapClass}>
            {label && <Label label={label} required={required} htmlFor={id}/>}
            <Wrapper className={pre || post ? "input-group" : ""}>
                {pre && <span className="input-group-text">{pre}</span>}
                <Row className={`align-items-center border rounded me-1`}>
                    {selectedItems.map(item => (
                        <Col xs="auto" className="ms-1 bg-secondary" key={item}>
                            {item}<button className={"btn p-0"} onClick={() => removeItem(item)}>x</button>
                        </Col>
                    ))}
                    {(!max || selectedItems.length < max) && <Col><input
                        id={id}
                        type={"text"}
                        className={`border-0 form-control w-100 ${className || theme.Autocomplete.className}`}
                        required={required && selectedItems.length < (min || 0)}
                        disabled={disabled || (!updatable && !isEmpty(value))}
                        placeholder={placeholder}
                        list={name}
                        onChange={handleChange}
                    /></Col>}
                </Row>
                <datalist id={name}>
                    {opts.map((op, index) => <option value={op.value} key={`${id}-${index}`}>{op.label}</option>)}
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

    const removeItem = (currentValue: string) => {
        setSelectedItems(prevState => {
            const updatedItems = prevState.filter(item => item !== currentValue);
            setTimeout(() => {
                onChange?.({target: {name: name, value: updatedItems}}, opts);
            }, 0);

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
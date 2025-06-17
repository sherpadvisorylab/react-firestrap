import React, {ChangeEvent, useId, useState} from 'react';
import {isEmpty, isInteractiveElement} from "../../../libs/utils";
import {Wrapper} from "../GridSystem";
import { ActionButton, UIProps } from '../../..';

interface BaseInputProps extends UIProps{
    name: string;
    value?: string | number;
    placeholder?: string;
    label?: string;
    type?: string;
    required?: boolean;
    updatable?: boolean;
    disabled?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    feedback?: string;
    min?: number;
    max?: number;
}

export type InputProps = Omit<BaseInputProps, 'type'>;

export interface CheckboxProps extends UIProps {
    name: string;
    value?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    title?: string;
    required?: boolean;
    valueChecked?: string;
}

interface LabelProps {
    label: string;
    required?: boolean;
    htmlFor?: string;
    className?: string;
}

export interface TextAreaProps extends UIProps {
    name: string;
    value?: string;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    updatable?: boolean;
    disabled?: boolean;
    rows?: number;
    feedback?: string;
    useRef?: any; //da verificare se serve
}

export interface ListGroupProps extends UIProps {
    children: React.ReactNode[];
    onClick?: (event: React.MouseEvent<HTMLDivElement>, index: number) => void;
    label?: string;
    actives?: number[];
    disables?: number[];
    loaders?: number[];
    itemClass?: string;
}

export const Input = ({
    name,
    value = undefined,
    onChange = undefined,
    placeholder = undefined,
    label = undefined,
    type = "text",
    required = false,
    updatable = true,
    disabled = false,
    pre = undefined,
    post = undefined,
    feedback = undefined,
    min = undefined,
    max = undefined,
    wrapClass = undefined,
    className = undefined
}: BaseInputProps) => {
    const id = useId();
    return (
        <Wrapper className={wrapClass}>
            {label && <Label label={label} required={required} htmlFor={id} />}
            <Wrapper className={pre || post ? "input-group": ""}>
                {pre && <span className="input-group-text">{pre}</span>}
                <input
                    id={id}
                    type={type}
                    name={name}
                    className={`form-control${className ? " " + className : ""}`}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled || (!updatable && !isEmpty(value))}
                    defaultValue={value}
                    onChange={onChange}
                    min={min}
                    max={max}
                />
                {post && <span className="input-group-text">{post}</span>}
            </Wrapper>
            {feedback && <div className="feedback">{feedback}</div>}
        </Wrapper>
    );
};

export const String = (props: InputProps) => (
    <Input {...props} type="text" />
);

export const Number = (props: InputProps) => (
    <Input {...props} type="number" />
);

export const Email = (props: InputProps) => (
    <Input {...props} type="email" />
);

export const Password = (props: InputProps) => {
    const [visible, setVisible] = useState(false);

    return <Input {...props} type={visible ? "text": "password"} post={
        <ActionButton 
            icon={visible ? "eye" : "eye-slash"} 
            onClick={() => setVisible(!visible)}
        />} 
    />
};

export const Color = (props: InputProps) => (
    <Input {...props} type="color" />
);

export const Date = (props: InputProps) => (
    <Input {...props} type="date" />
);

export const Time = (props: InputProps) => (
    <Input {...props} type="time" />
);

export const DateTime = (props: InputProps) => (
    <Input {...props} type="datetime-local" />
);

export const Week = (props: InputProps) => (
    <Input {...props} type="week" />
);

export const Month = (props: InputProps) => (
    <Input {...props} type="month" />
);

export const Checkbox = ({
    name,
    value = false,
    onChange = undefined,
    label = undefined,
    title = undefined,
    required = false,
    valueChecked = "on",
    pre = undefined,
    post = undefined,
    wrapClass = undefined,
    className = undefined
}: CheckboxProps) => {
    const id = useId();
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.target.value = event.target.checked ? valueChecked : ""

        onChange?.(event);
    };
    if (!wrapClass && label) {
        wrapClass = "checkbox"
    }
    return (
        <Wrapper className={wrapClass}>
            {pre}
            <input
                type="checkbox"
                id={id}
                name={name}
                title={title}
                className={`form-check-input${className ? " " + className : ""}`}
                defaultChecked={value}
                onChange={handleCheckboxChange}
            />
            {label && <label className="form-check-label ps-1" htmlFor={id}>
                {label}
                {required && <span className="text-danger">&nbsp;*</span>}
            </label>}
            {post}
        </Wrapper>
    );
};

export const Switch = (props: CheckboxProps) => (
    <Wrapper className={props?.wrapClass}>
        <Checkbox {...props} wrapClass='form-check form-switch' />
    </Wrapper>
);

export const Label = ({
    label,
    required    = false,
    htmlFor     = undefined,
    className   = undefined
}: LabelProps) => {
    return (
        <label htmlFor={htmlFor} className={`form-label${className ? " " + className : ""}`}>
            {label} {required && <span className="text-danger">*</span>}
        </label>
    );
};

export const TextArea = ({
    name,
    value = undefined,
    onChange = undefined,
    placeholder = undefined,
    label = undefined,
    required = false,
    updatable = true,
    disabled = false,
    rows = undefined,
    useRef = {},
    pre = undefined,
    post = undefined,
    feedback = undefined,
    className = undefined,
    wrapClass = undefined
}: TextAreaProps) => {
    const handleDrop = React.useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        
        const target = e.target as HTMLTextAreaElement;
        const raw = e.dataTransfer.getData('text/plain').replace(/{{|}}/g, '');
        const text = ` {${raw}} `;
        
        target.focus();
        
        // Get caret position using modern or fallback API
        const caretPosition = (() => {
            const position = document.caretPositionFromPoint?.(e.clientX, e.clientY) 
                ?? (document as any).caretRangeFromPoint?.(e.clientX, e.clientY);
            return position && 'offset' in position ? position.offset : target.value.length;
        })();
        
        // Create new value with inserted text
        const newValue = (value ?? '').slice(0, caretPosition) + text + (value ?? '').slice(caretPosition);
        
        // Trigger onChange if provided
        onChange?.({ 
            target: { 
                value: newValue, 
                name 
            } 
        } as ChangeEvent<HTMLTextAreaElement>);
        
        // Set cursor position after inserted text
        requestAnimationFrame(() => {
            const newPosition = caretPosition + text.length;
            target.setSelectionRange(newPosition, newPosition);
        });
    }, [name, value, onChange]);

    return (
        <Wrapper className={wrapClass}>
            {label && <Label required={required} label={label} />}
            <Wrapper className={pre || post ? "input-group" : ""}>
                {pre && <span className="input-group-text">{pre}</span>}
                <textarea
                    name={name}
                    className={`form-control${className ? " " + className : ""}`}
                    ref={(el) => (useRef = el)}
                    rows={rows}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled || (!updatable && !isEmpty(value))}
                    value={value}
                    onChange={onChange}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                />
                {post && <span className="input-group-text">{post}</span>}
            </Wrapper>
            {feedback && <div className="feedback">{feedback}</div>}
        </Wrapper>
    );
};

export const ListGroup = ({
    children,
    onClick         = undefined,
    label           = undefined,
    actives         = undefined,
    disables        = undefined,
    loaders         = undefined,
    pre             = undefined,
    post            = undefined,
    wrapClass       = undefined,
    className       = undefined,
    itemClass       = undefined
}: ListGroupProps) => {
    const fullClassName = `list-group${className ? ' ' + className : ''}`;

    return <Wrapper className={wrapClass}>
        {pre}
        {label && <div>{label}</div>}
        <div className={fullClassName}>
            {children.map((child, index) => {
                const isActive = actives?.includes(index);
                const isDisable = disables?.includes(index);
                const isLoading = loaders?.includes(index);
                const fullItemClass = `list-group-item${
                    itemClass ? ' ' + itemClass : ''
                }${
                    onClick ? ' list-group-item-action' : ''
                }${
                    isActive ? ' active' : ''
                }${
                    isDisable ? ' disabled' : ''
                }${isLoading ? ' loading' : ''}`;   

                return <>
                    {onClick && <div
                        key={index}
                        onClick={(e) => {
                            if (!isLoading && !isInteractiveElement(e)) {
                                onClick(e, index);
                            }
                        }}
                        className={fullItemClass}
                        style={{cursor: "pointer"}}
                    >
                        {child}
                    </div>}
                    {!onClick && <span key={index} className={fullItemClass}>{child}</span>}
                </>;
            })}
        </div>
        {post}
    </Wrapper>
};

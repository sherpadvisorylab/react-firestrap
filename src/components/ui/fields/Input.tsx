import React, { useId, useState} from 'react';
import {isEmpty, isInteractiveElement} from "../../../libs/utils";
import {Wrapper} from "../GridSystem";
import { ActionButton, Icon, UIProps } from '../../..';
import {FormFieldProps, InputType, useFormContext, useHandleDrop } from '../../widgets/Form';

interface BaseInputProps extends FormFieldProps{
    placeholder?: string;
    type?: InputType;
    updatable?: boolean;
    disabled?: boolean;
    feedback?: string;
    min?: number;
    max?: number;
    step?: number;
}

interface LabelProps {
    label: string;
    required?: boolean;
    htmlFor?: string;
    className?: string;
}

export type InputProps = Omit<BaseInputProps, 'type'>;

export interface CheckboxProps extends FormFieldProps { 
    title?: string;
    valueChecked?: string;
}

export interface TextAreaProps extends FormFieldProps    {
    placeholder?: string;
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
    draggable?: boolean;
    onDrop?: (text: string) => string;
    actives?: number[];
    disables?: number[];
    loaders?: number[];
    itemClass?: string;
}





export const Input = ({
    name,
    //value = undefined,
    onChange = undefined,
    defaultValue = undefined,
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
    step = undefined,
    wrapClass = undefined,
    className = undefined
}: BaseInputProps) => {
    const { value, handleChange, formWrapClass } = useFormContext({name, onChange, wrapClass, inputType: type, defaultValue});
    const id = useId();
    const handleDrop = useHandleDrop({ name, value, handleChange });

    return (
        <Wrapper className={formWrapClass}>
            {label && <Label label={label} required={required} htmlFor={id} />}
            <Wrapper className={pre || post ? "input-group" : ""}>
                {pre && <span className="input-group-text">{pre}</span>}
                <input
                    id={id}
                    type={type}
                    name={name}
                    className={`form-control${className ? " " + className : ""}`}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled || (!updatable && !isEmpty(value))}
                    value={value}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    step={step}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
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

export const Range = (props: InputProps) => (
    <Input {...props} type="range" />
);

export const Checkbox = ({
    name,
    //value = false,
    onChange = undefined,
    defaultValue = undefined,   //todo: da capire come gestirlo
    label = undefined,
    title = undefined,
    required = false,
    valueChecked = "on",
    pre = undefined,
    post = undefined,
    wrapClass = undefined,
    className = undefined
}: CheckboxProps) => {
    const { value, handleChange, formWrapClass } = useFormContext({name, onChange, wrapClass, defaultValue});

    const id = useId();
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.target.value = event.target.checked ? valueChecked : ""

        handleChange?.(event);
    };
    if (!wrapClass && label) {
        wrapClass = "checkbox"
    }
    console.log("Checkbox", name, value, defaultValue);
    return (
        <Wrapper className={formWrapClass}>
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
    //value = undefined,
    onChange    = undefined,
    defaultValue = undefined,   
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
    const { value, handleChange, formWrapClass } = useFormContext({name, onChange, wrapClass, defaultValue});

    const id = useId();
    const handleDrop = useHandleDrop({ name, value, handleChange });

    return (
        <Wrapper className={formWrapClass}>
            {label && <Label required={required} label={label} htmlFor={id} />}
            <Wrapper className={pre || post ? "input-group" : ""}>
                {pre && <span className="input-group-text">{pre}</span>}
                <textarea
                    id={id}
                    name={name}
                    className={`form-control${className ? " " + className : ""}`}
                    ref={(el) => (useRef = el)}
                    rows={rows}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled || (!updatable && !isEmpty(value))}
                    value={value}
                    onChange={handleChange}
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
    draggable       = undefined,
    onDrop          = undefined,
    disables        = undefined,
    loaders         = undefined,
    pre             = undefined,
    post            = undefined,
    wrapClass       = undefined,
    className       = undefined,
    itemClass       = undefined
}: ListGroupProps) => {
    const fullClassName = `list-group${className ? ' ' + className : ''}`;

    const extractText = (node: React.ReactNode): string => {
        const walk = (n: React.ReactNode): string => {
          if (n == null || typeof n === "boolean") return "";
          if (typeof n === "string" || typeof n === "number") return `${n}`;
          if (Array.isArray(n)) return n.map(walk).join(" ");
          if (React.isValidElement(n)) return walk(n.props.children);
          return "";
        };
      
        return walk(node).replace(/\s+/g, " ").trim();
    };

    const handleDragStart = (e: React.DragEvent<HTMLSpanElement>, text: string) => {
        e.dataTransfer.setData('text/plain', onDrop?.(text) ?? text)
    }

    return <Wrapper className={wrapClass}>
        {pre}
        {label && <div>{label}</div>}
        <div className={fullClassName}>
            {children.map((child, index) => {
                const isActive = actives?.includes(index);
                const isDisable = disables?.includes(index);
                const isLoading = loaders?.includes(index);
                const fullItemClass = `list-group-item ps-1 ${itemClass ? ' ' + itemClass : ''
                    }${onClick ? ' list-group-item-action' : ''
                    }${isActive ? ' active' : ''
                    }${isDisable ? ' disabled' : ''
                    }${isLoading ? ' loading' : ''}`;

                return onClick
                    ? <div
                        key={index}
                        onClick={(e) => {
                            if (!isLoading && !isInteractiveElement(e)) {
                                onClick(e, index);
                            }
                        }}
                        className={fullItemClass}
                        style={{ cursor: "pointer" }}
                    >
                        {child}
                    </div>

                    :
                    <span
                        key={index}
                        className={fullItemClass}
                        draggable={draggable}
                        onDragStart={draggable ? (e) => handleDragStart(e, extractText(child)) : undefined}
                        style={{ cursor: draggable ? 'grab' : 'default' }}
                    >
                        {draggable && <Icon icon='grip-vertical'/>}
                        {child}
                    </span>
            })}
        </div>
        {post}
    </Wrapper>
};

import React, {ChangeEvent} from 'react';
import {generateUniqueId, isEmpty} from "../../../libs/utils";
import {Wrapper} from "../GridSystem";

interface BaseInputProps {
    name: string;
    value?: string | number;
    placeholder?: string;
    label?: string;
    type?: string;
    required?: boolean;
    updatable?: boolean;
    disabled?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    pre?: React.ReactNode;
    post?: React.ReactNode;
    feedback?: string;
    min?: number;
    max?: number;
    wrapClass?: string;
    inputClass?: string;
}

export type InputProps = Omit<BaseInputProps, 'type'>;

export interface CheckboxProps {
    name: string;
    value?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    title?: string;
    required?: boolean;
    valueChecked?: string;
    checkboxClass?: string;
    wrapClass?: string;
}

interface LabelProps {
    label: string;
    required?: boolean;
    htmlFor?: string;
    className?: string;
}

export interface TextAreaProps {
    name: string;
    value?: string;
    placeholder?: string;
    label?: string;
    required?: boolean;
    updatable?: boolean;
    disabled?: boolean;
    rows?: number;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    pre?: React.ReactNode;
    post?: React.ReactNode;
    feedback?: string;
    className?: string;
    wrapClass?: string;
    useRef?: any; //da verificare se serve
}

export const Input = ({
                                                name,
                                                value       = undefined,
                                                placeholder = undefined,
                                                label       = undefined,
                                                type        = "text",
                                                required    = false,
                                                updatable   = true,
                                                disabled    = false,
                                                onChange    = undefined,
                                                pre         = undefined,
                                                post        = undefined,
                                                feedback    = undefined,
                                                min         = undefined,
                                                max         = undefined,
                                                wrapClass   = undefined,
                                                inputClass  = undefined
}: BaseInputProps) => {
    return (
        <Wrapper className={wrapClass}>
            {label && <Label label={label} required={required} />}
            <Wrapper className={pre || post ? "input-group": ""}>
                {pre && <span className="input-group-text">{pre}</span>}
                <input
                    type={type}
                    name={name}
                    className={`form-control${inputClass ? " " + inputClass : ""}`}
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

export const Number = (props: InputProps) => (
    <Input {...props} type="number" />
);

export const String = (props: InputProps) => (
    <Input {...props} type="text" />
);

export const Email = (props: InputProps) => (
    <Input {...props} type="email" />
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

export const Checkbox = ({
                                                      name,
                                                      value         = false,
                                                      onChange      = undefined,
                                                      label         = undefined,
                                                      title         = undefined,
                                                      required      = false,
                                                      valueChecked  = "on",
                                                      checkboxClass = undefined,
                                                      wrapClass     = undefined
}: CheckboxProps) => {
    const key = name || label;
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.target.value = event.target.checked ? valueChecked : ""

        onChange?.(event);
    };
    if (!wrapClass && label) {
       wrapClass = "checkbox"
    }
    return (
        <Wrapper className={wrapClass}>
            <input
                type="checkbox"
                id={key}
                name={name}
                title={title}
                className={`form-check-input${checkboxClass ? " " + checkboxClass : ""}`}
                defaultChecked={value}
                onChange={handleCheckboxChange}
            />
            {label && <label className="form-check-label ps-1" htmlFor={key}>
                {label}
                {required && <span className="text-danger">&nbsp;*</span>}
            </label>}
        </Wrapper>
    );
};

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
                                                      value         = undefined,
                                                      placeholder   = undefined,
                                                      label         = undefined,
                                                      required      = false,
                                                      updatable     = true,
                                                      disabled      = false,
                                                      rows          = undefined,
                                                      onChange      = undefined,
                                                      useRef        = {},
                                                      pre           = undefined,
                                                      post          = undefined,
                                                      feedback      = undefined,
                                                      className     = undefined,
                                                      wrapClass     = undefined
}: TextAreaProps) => {
  return (
      <Wrapper className={wrapClass}>
          {label && <Label required={required} label={label}/>}
          <Wrapper className={pre || post ? "input-group": ""}>
              {pre && <span className="input-group-text">{pre}</span>}
              <textarea
                  name={name}
                  className={`form-control${className ? " " + className : ""}`}
                  ref={(button) => (useRef = button)}
                  rows={rows}
                  placeholder={placeholder}
                  required={required}
                  disabled={disabled || (!updatable && !isEmpty(value))}
                  defaultValue={value}
                  onChange={onChange}
              />
              {post && <span className="input-group-text">{post}</span>}
          </Wrapper>
          {feedback && <div className="feedback">{feedback}</div>}
      </Wrapper>
  );
};

export interface DateInputProps {
    name: string;
    value?: string;
    placeholder?: string;
    label?: string;
    required?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export const DateInput = ({
                                                            name,
                                                            value           = undefined,
                                                            placeholder     = undefined,
                                                            label           = undefined,
                                                            required        = false,
                                                            onChange        = undefined,
                                                            className       = undefined
}: DateInputProps) => {
    const fullClassName = `form-control${className ? ' ' + className : ''}`;
    return (<>
        {label && <Label required={required} label={label}/>}
        <div className="input-group w-50">
            <input
                name={name}
                type="text"
                className={fullClassName}
                placeholder={placeholder}
                defaultValue={value}
                onChange={onChange}
            />
            <label className="input-group-text" htmlFor={name}>
                <i className="fa fa-calendar"></i>
            </label>
        </div>
    </>);
};

export interface SwitchInputProps {
    name: string;
    value?: string | number;
    label?: string;
    status?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export const SwitchInput = ({
                                                            name,
                                                            value       = undefined,
                                                            label       = undefined,
                                                            status      = false,
                                                            onChange    = undefined,
                                                            className   = undefined
}: SwitchInputProps) => {
    const fullClassName = `form-check form-switch${className ? ' ' + className : ''}`;
    return (
        <div className={fullClassName}>
            <input
                name={name}
                type="checkbox"
                className="form-check-input"
                checked={status}
                value={value}
                onChange={onChange}
            />
            
            <label className="form-check-label" htmlFor={name}>
                {label}
            </label>
        </div>
    );
};

export interface ListGroupProps {
    items: React.ReactNode[];
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>, index: number) => void;
    active?: number;
    className?: string;
    indexLoading?: number | string;
}
export const ListGroup = ({
                                                        items,
                                                        onClick         = undefined,
                                                        active          = undefined,
                                                        className       = undefined,
                                                        indexLoading    = undefined
}: ListGroupProps) => {
    const fullClassName = `list-group${className ? ' ' + className : ''}`;
    const iLoader = parseInt((indexLoading ?? '-1') as string , 10);

    return (
        <div className={fullClassName}>
            {items.map((item, index) => {
                const isActive = index === active;
                const isLoading = index === iLoader;
                const itemClass = `list-group-item list-group-item-action p-0${
                    isActive ? ' bg-white bg-opacity-15' : ''
                }${isLoading ? ' loading' : ''}`;

                return (
                    <a
                        key={generateUniqueId()}
                        onClick={(e) => {
                            if (e.currentTarget.tagName.toLowerCase() !== 'a' && !isLoading) {
                                onClick?.(e, index);
                            }
                        }}
                        className={itemClass}
                    >
                        {item}
                    </a>
                );
            })}
        </div>
    );
};

import React, {ChangeEvent} from 'react';
import {generateUniqueId} from "../libs/utils";
import {Wrapper} from "./GridSystem";

interface InputProps {
    name: string;
    value?: string | number | null;
    placeholder?: string | null;
    label?: string | null;
    type?: string;
    required?: boolean;
    updatable?: boolean;
    disabled?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    pre?: React.ReactNode;
    post?: React.ReactNode;
    feedback?: string | null;
    min?: number | null;
    max?: number | null;
    wrapClass?: string | null;
    inputClass?: string | null;
}

type TypedInputProps = Omit<InputProps, 'type'>;

interface CheckboxProps {
    name: string;
    value?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    label?: string;
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

interface TextAreaProps {
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
}

export const Input: React.FC<InputProps> = ({
                                                name,
                                                value = null,
                                                placeholder = null,
                                                label = null,
                                                type = "text",
                                                required = false,
                                                updatable = true,
                                                disabled = false,
                                                onChange = null,
                                                pre = null,
                                                post = null,
                                                feedback = null,
                                                min = null,
                                                max = null,
                                                wrapClass = null,
                                                inputClass = null
                                            }) => {
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
                    disabled={disabled || (!updatable && value !== null)}
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

export const Number: React.FC<TypedInputProps> = (props) => (
    <Input {...props} type="number" />
);

export const String: React.FC<TypedInputProps> = (props) => (
    <Input {...props} type="text" />
);

export const Email: React.FC<TypedInputProps> = (props) => (
    <Input {...props} type="email" />
);

export const Date: React.FC<TypedInputProps> = (props) => (
    <Input {...props} type="date" />
);

export const Time: React.FC<TypedInputProps> = (props) => (
    <Input {...props} type="time" />
);

export const DateTime: React.FC<TypedInputProps> = (props) => (
    <Input {...props} type="datetime-local" />
);

export const Checkbox: React.FC<CheckboxProps> = ({
                                                      name,
                                                      value = false,
                                                      onChange = null,
                                                      label = null,
                                                      required = false,
                                                      valueChecked = "on",
                                                      checkboxClass = null,
                                                      wrapClass = null
                                                  }) => {
    const key = name || label;
    const handleCheckboxChange = (event) => {
        event.target.value = event.target.checked ? valueChecked : ""

        onChange && onChange(event);
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

export const Label: React.FC<LabelProps> = ({
                                                label,
                                                required = false,
                                                htmlFor = null,
                                                className = null
}) => {
  return (
    <label htmlFor={htmlFor} className={`form-label${className ? " " + className : ""}`}>
      {label} {required && <span className="text-danger">*</span>}
    </label>
  );
};

export const TextArea: React.FC<TextAreaProps> = ({
                                                      name,
                                                      value = null,
                                                      placeholder = null,
                                                      label = null,
                                                      required = false,
                                                      updatable = true,
                                                      disabled = false,
                                                      rows = 4,
                                                      onChange = null,
                                                      useRef = {},
                                                      pre = null,
                                                      post = null,
                                                      feedback = null,
                                                      className = null,
                                                      wrapClass = null
                         }) => {
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
                  disabled={disabled || (!updatable && value)}
                  defaultValue={value}
                  onChange={onChange}
              />
              {post && <span className="input-group-text">{post}</span>}
          </Wrapper>
          {feedback && <div className="feedback">{feedback}</div>}
      </Wrapper>
  );
};

export const DateInput = ({value, onChange, pClass}) => {
  return (
    <div className="input-group w-50">
      <input
        type="text"
        className={`form-control${pClass ? " " + pClass : ""}`}
        id="datepicker-component"
        placeholder="Whitelist Start At"
        defaultValue={value}
        onChange={onChange}
      />
      <label className="input-group-text" htmlFor="datepicker-component">
        <i className="fa fa-calendar"></i>
      </label>
    </div>
  );
};

export const SwitchInput = ({ label, status, handleClick, pClass }) => {
  return (
    <>
    <input
        type="checkbox"
        className={`form-check-input${pClass ? " " + pClass : ""}`}
        id="mint-switch"
        checked={status}
        onChange={handleClick}
      />
      <label className="form-check-label" htmlFor="mint-switch">
        {label}
      </label>
    </>
  );
};

export const ListGroup = ({items, active, onClick, pClass = "", indexLoading}) => {
    const iLoder = parseInt(indexLoading || "-1");
    return (
        <div className={`list-group${pClass ? " " + pClass : ""}`}>
            {items.map((item, index) => (
                <a key={generateUniqueId()} onClick={(e) => e.target.tagName.toLowerCase() !== 'a' && iLoder !== index && onClick(e, index)} className={`list-group-item list-group-item-action p-0${index === active ? " bg-white bg-opacity-15" : ""}${iLoder === index ? " loading" : ""}`}>{item}</a>
            ))}
        </div>
    );
}

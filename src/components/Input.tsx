import React from 'react';
import {generateUniqueId} from "../libs/utils";
import {Wrapper} from "./GridSystem";

export const Input = ({
                          name,
                          value,
                          placeholder,
                          label,
                          type = "text",
                          required = false,
                          updatable = true,
                          disabled = false,
                          onChange,
                          pre,
                          post,
                          feedback,
                          min,
                          max,
                          wrapClass,
                          inputClass
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
                    disabled={disabled || (!updatable && value)}
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

export const Number = ({
                           name,
                           value,
                           placeholder,
                           label,
                           required,
                           updatable,
                           disabled,
                           onChange,
                           pre,
                           post,
                           feedback,
                           min,
                           max,
                           wrapClass,
                           inputClass
                       }) => {
    return (
            <Input
                name={name}
                value={value}
                placeholder={placeholder}
                label={label}
                required={required}
                updatable={updatable}
                disabled={disabled}
                onChange={onChange}
                pre={pre}
                post={post}
                feedback={feedback}
                type="number"
                min={min}
                max={max}
                inputClass={inputClass}
                wrapClass={wrapClass}
            />
    );
}

export const String = ({
                           name,
                           value,
                           placeholder,
                           label,
                           required,
                           updatable,
                           disabled,
                           onChange,
                           pre,
                           post,
                           feedback,
                           inputClass,
                           wrapClass
}) => {
    return (
        <Input
            name={name}
            value={value}
            placeholder={placeholder}
            label={label}
            required={required}
            updatable={updatable}
            disabled={disabled}
            onChange={onChange}
            pre={pre}
            post={post}
            feedback={feedback}
            inputClass={inputClass}
            wrapClass={wrapClass}
        />
    );
};

export const Email = ({
                          name,
                          value,
                          placeholder,
                          label,
                          required,
                          updatable,
                          disabled,
                          onChange,
                          pre,
                          post,
                          feedback,
                          wrapClass,
                          inputClass
                      }) => {
    return (
        <Input
            name={name}
            value={value}
            placeholder={placeholder}
            label={label}
            required={required}
            updatable={updatable}
            disabled={disabled}
            onChange={onChange}
            pre={pre}
            post={post}
            feedback={feedback}
            type={"email"}
            wrapClass={wrapClass}
            inputClass={inputClass}
        />
    );
};

export const Date = ({
                         name,
                         value,
                         placeholder,
                         label,
                         required,
                         updatable,
                         disabled,
                         onChange,
                         pre,
                         post,
                         feedback,
                         wrapClass,
                         inputClass
                     }) => {
    return (
        <Input
            name={name}
            value={value}
            placeholder={placeholder}
            label={label}
            required={required}
            updatable={updatable}
            disabled={disabled}
            onChange={onChange}
            pre={pre}
            post={post}
            feedback={feedback}
            type={"date"}
            wrapClass={wrapClass}
            inputClass={inputClass}
        />
    );
};

export const Time = ({
                         name,
                         value,
                         placeholder,
                         label,
                         required,
                         updatable,
                         disabled,
                         onChange,
                         pre,
                         post,
                         feedback,
                         wrapClass,
                         inputClass
                     }) => {
    return (
        <Input
            name={name}
            value={value}
            placeholder={placeholder}
            label={label}
            required={required}
            updatable={updatable}
            disabled={disabled}
            onChange={onChange}
            pre={pre}
            post={post}
            feedback={feedback}
            type={"time"}
            wrapClass={wrapClass}
            inputClass={inputClass}
        />
    );
};

export const DateTime = ({
                             name,
                             value,
                             placeholder,
                             label,
                             required,
                             updatable,
                             disabled,
                             onChange,
                             pre,
                             post,
                             feedback,
                             wrapClass,
                             inputClass
                         }) => {
    return (
        <Input
            name={name}
            value={value}
            placeholder={placeholder}
            label={label}
            required={required}
            updatable={updatable}
            disabled={disabled}
            onChange={onChange}
            pre={pre}
            post={post}
            feedback={feedback}
            type={"datetime-local"}
            wrapClass={wrapClass}
            inputClass={inputClass}
        />
    );
};
export const Checkbox = ({
                             name,
                             value = null,
                             onChange = () => {},
                             label = null,
                             required = null,
                             valueChecked="on",
                             checkboxClass = "",
                             wrapClass = ""
} : {
    name: string,
    value?: string,
    onChange?: any,
    label?: string,
    required?: boolean,
    valueChecked?: string,
    checkboxClass?: string,
    wrapClass?: string
}) => {
    const key = name || label;
    const handleCheckboxChange = (event) => {
        event.target.value = event.target.checked ? valueChecked : ""

        onChange(event);
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

export const Label = ({ htmlFor, label, required, pClass}) => {
  return (
    <label htmlFor={htmlFor} className={`form-label${pClass ? " " + pClass : ""}`}>
      {label} {required && <span className="text-danger">*</span>}
    </label>
  );
};

export const TextArea = ({
                             name,
                             value,
                             placeholder,
                             label,
                             required = false,
                             updatable = true,
                             disabled = false,
                             rows,
                             onChange,
                             pClass,
                             pre,
                             post,
                             feedback,
                             useRef = {},
                             wrapClass
                         }) => {
  return (
      <Wrapper className={wrapClass}>
          {label && <Label required={required} label={label}/>}
          <Wrapper className={pre || post ? "input-group": ""}>
              {pre && <span className="input-group-text">{pre}</span>}
              <textarea
                  name={name}
                  className={`form-control${pClass ? " " + pClass : ""}`}
                  ref={(button) => (useRef = button)}
                  rows={rows || 4}
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
    const iLoder = parseInt(indexLoading || -1);
    return (
        <div className={`list-group${pClass ? " " + pClass : ""}`}>
            {items.map((item, index) => (
                <a key={generateUniqueId()} onClick={(e) => e.target.tagName.toLowerCase() !== 'a' && iLoder !== index && onClick(e, index)} className={`list-group-item list-group-item-action p-0${index === active ? " bg-white bg-opacity-15" : ""}${iLoder === index ? " loading" : ""}`}>{item}</a>
            ))}
        </div>
    );
}

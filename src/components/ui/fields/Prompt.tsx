import React, { useState } from 'react';
import { FormFieldProps, Switch, String, TextArea, Wrapper } from '../..';
import {useTheme} from "../../../Theme";

export interface PromptProps extends FormFieldProps {
    rows?: number;
    defaultValue?: {
        value?: string;
        label?: string;
        enabled?: boolean;
    };
}


export const Prompt = ({
    name,
    label         = undefined,
    value         = undefined,
    required      = false,
    onChange      = undefined,
    defaultValue  = undefined,
    rows          = 10,
    pre           = undefined,
    post          = undefined,
    wrapClass     = undefined,
    className     = undefined
}: PromptProps) => {
    const theme = useTheme("prompt");
    const caption = (label || name).toUpperCase();

    return (
        <Wrapper className={wrapClass || theme.Prompt.wrapClass}>
            {pre}
            <Wrapper className={value?.prompt?.enabled && ("border-start border-4 ps-3 border-" + (value?.prompt?.auto ? "light": "secondary"))}>
            <div className={`position-relative`}>
                <div className="position-absolute top-0 end-0 d-flex gap-2">
                    {value?.prompt?.enabled && <Switch
                        name={name + ".prompt.auto"} 
                        label={"auto"} 
                        value={value?.prompt?.auto} 
                        onChange={onChange} />}
                    <Switch 
                        name={name + ".prompt.enabled"} 
                        label={"prompt"} 
                        value={value?.prompt?.enabled} 
                        defaultValue={defaultValue?.enabled}
                        onChange={onChange} />
                </div>
                <TextArea 
                    className={className || theme.Prompt.className}
                    name={name + ".value"} 
                    label={caption + ": " + (value?.prompt?.enabled ? "prompt": "text")}
                    value={value?.value} 
                    onChange={onChange} 
                    defaultValue={value?.prompt?.enabled && defaultValue?.value}
                    required={required} 
                    pre={pre} 
                    post={post} 
                    wrapClass={wrapClass} 
                    rows={rows} />
                
                {value?.prompt?.enabled && !value?.prompt?.auto && <String 
                    name={name + ".prompt.label"} 
                    label={caption + ": user label"} 
                    value={value?.prompt?.label} 
                    defaultValue={value?.prompt?.enabled && defaultValue?.label}
                    onChange={onChange} 
                />}
            </div>
            </Wrapper>
            {post}
        </Wrapper>
    )
}
import React, { useState } from 'react';
import { FormFieldProps, Switch, TextArea, Wrapper, LoadingButton } from '../..';
import {useTheme} from "../../../Theme";
import { AI } from '../../../integrations/ai';


export interface PromptProps extends FormFieldProps {
    mode?: "editor" | "runner";
    rows?: number;
    defaultValue?: {
        value?: string;
        enabled?: boolean;
    };
}

const promptLabel = "Prompt: ";
const promptClass = "position-relative border-start border-4 ps-2 border-secondary";
const promptActionClass = "position-absolute top-0 end-0 d-flex gap-2";

export const Prompt = ({
    mode = "editor",
    ...props
}: PromptProps) => {
    return mode === "editor" ? <PromptEditor {...props} /> : <PromptRunner {...props} />
}


export const PromptEditor = ({
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
}: Omit<PromptProps, "mode">) => {
    const theme = useTheme("prompt");
    const caption = label || name;

    return (
        <Wrapper className={wrapClass || theme.Prompt.wrapClass}>
            {pre}
            <div className={value?.prompt?.enabled ? promptClass : "position-relative"}>
                <div className={promptActionClass}>
                    <Switch 
                        name={name + ".prompt.enabled"} 
                        label={"prompt"} 
                        value={value?.prompt?.enabled} 
                        defaultValue={defaultValue?.enabled}
                        onChange={onChange} />
                </div>
                <TextArea 
                    className={className || theme.Prompt.className}
                    name={name + (value?.prompt?.enabled ? ".prompt.value" : ".value")} 
                    label={value?.prompt?.enabled ? promptLabel + caption : caption}
                    value={value?.prompt?.enabled ? value?.prompt?.value : value?.value} 
                    onChange={onChange} 
                    defaultValue={value?.prompt?.enabled && defaultValue?.value}
                    required={required} 
                    pre={pre} 
                    post={post} 
                    wrapClass={wrapClass} 
                    rows={rows} />
            </div>
            {post}
        </Wrapper>
    )
}

export const PromptRunner = ({
    name,
    label,
    value,
    required,
    onChange,
    defaultValue,
    rows = 10,
    pre,
    post,
    wrapClass,
    className
}: Omit<PromptProps, "mode">) => {
    const theme = useTheme("prompt");
    const caption = label || name;
    const [prompt, setPrompt] = useState(defaultValue?.enabled || false);
    return (
        <Wrapper className={wrapClass || theme.Prompt.wrapClass}>
            {pre}
            <div className={prompt ? promptClass : "position-relative"}>
                <div className={promptActionClass}>
                    <LoadingButton icon={prompt ? "terminal-fill" : "terminal"} onClick={() => {
                        setPrompt(!prompt);
                    }} />
                </div>
                <TextArea 
                    className={(className || theme.Prompt.className)}
                    name={name + ".prompt"} 
                    label={promptLabel + caption}
                    value={value?.prompt} 
                    onChange={onChange} 
                    defaultValue={defaultValue?.value}
                    required={true} 
                    wrapClass={wrapClass + (prompt ? "" : " d-none")} 
                    rows={rows} />
                <TextArea 
                    className={(className || theme.Prompt.className)}
                    name={name + ".value"} 
                    label={caption}
                    value={value?.value} 
                    onChange={onChange} 
                    required={required} 
                    post={<LoadingButton icon="stars" onClick={async () => {
                        onChange?.({
                            target: {
                                name: name + ".value",
                                value: await runPrompt(value?.prompt, value)
                            }
                        });
                    }} />} 
                    wrapClass={wrapClass + (prompt ? " d-none" : "")} 
                    rows={rows} />
            </div>
            {post}
        </Wrapper>
    )
}

//todo: recuperare i dati e fare la gestione della lingua voice e style e temperature e model. e i ruoli
const runPrompt = async (prompt: string, data: any) => {
    const ai = new AI();
    const response = await ai.fetch(prompt);
    console.log(response);
    return response;
}

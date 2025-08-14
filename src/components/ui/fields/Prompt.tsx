import React, { useState } from 'react';
import { FormFieldProps, Switch, TextArea, Wrapper, LoadingButton, Dropdown, DropdownItem, Select, Range } from '../..';
import {useTheme} from "../../../Theme";
import { AI, AIFetchConfig } from '../../../integrations/ai';
import { PromptVariables } from 'conf/Prompt';


export interface PromptProps extends FormFieldProps {
    mode?: "editor" | "runner";
    rows?: number;
    defaultValue?: {
        value?: string;
        enabled?: boolean;
        role?: string;
        language?: string;
        voice?: string;
        style?: string;
        model?: string;
        temperature?: number;
    };
}

const promptLabel = "Prompt: ";
const promptClass = "position-relative border-start border-4 ps-2 border-secondary";
const promptActionClass = "position-absolute top-0 end-0 d-flex gap-2";

export const Prompt = ({
    mode = "editor",
    ...props
}: PromptProps) => {
    return mode === "editor" 
        ? <PromptEditor {...props} /> 
        : props.value?.prompt?.enabled 
            ? <PromptRunner {...props} /> 
            : <PromptDisabled {...props} />
}


const PromptEditor = ({
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
                    defaultValue={value?.prompt?.enabled && defaultValue?.value}
                    onChange={onChange} 
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

const PromptRunner = ({
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
                    <LoadingButton icon={prompt ? "terminal-fill" : "terminal"} title={prompt ? "Mode: Prompt Editor" : "Mode: Run Prompt"} onClick={() => {
                        setPrompt(!prompt);
                    }} />

                </div>
                <TextArea 
                    className={(className || theme.Prompt.className)}
                    name={name + ".prompt.value"} 
                    label={promptLabel + caption}
                    value={value?.prompt?.value} 
                    defaultValue={defaultValue?.value}
                    onChange={onChange} 
                    required={true} 
                    post={<Dropdown 
                        position="end"
                        toggleButton={{
                            icon: "gear"
                        }}
                    >
                        <DropdownItem><Select name={name + ".prompt.role"} label="Role" 
                            value={value?.prompt?.role} 
                            defaultValue={defaultValue?.role} 
                            onChange={onChange}
                            options={AI.getRoles()} 
                        /></DropdownItem>
                        <DropdownItem><Select name={name + ".prompt.language"} label="Language" 
                            value={value?.prompt?.language} 
                            defaultValue={defaultValue?.language} 
                            onChange={onChange}
                            options={AI.getLangs()} 
                        /></DropdownItem>
                        <DropdownItem><Select name={name + ".prompt.voice"} label="Voice" 
                            value={value?.prompt?.voice} 
                            defaultValue={defaultValue?.voice} 
                            onChange={onChange}
                            options={AI.getVoices()} 
                        /></DropdownItem>
                        <DropdownItem><Select name={name + ".prompt.style"} label="Style" 
                            value={value?.prompt?.style} 
                            defaultValue={defaultValue?.style} 
                            onChange={onChange}
                            options={AI.getStyles()} 
                        /></DropdownItem>
                        <DropdownItem><Select name={name + ".prompt.model"} label="Model" 
                            value={value?.prompt?.model} 
                            defaultValue={defaultValue?.model} 
                            onChange={onChange}
                            options={AI.getModels()} 
                        /></DropdownItem>
                        <DropdownItem><Range name={name + ".prompt.temperature"} label="Temperature" 
                            value={value?.prompt?.temperature} 
                            defaultValue={defaultValue?.temperature} 
                            onChange={onChange}
                            min={0} 
                            max={1} 
                            step={0.1} 
                        /></DropdownItem>
                    </Dropdown>}
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
                                value: await runPrompt(value?.prompt)
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

const PromptDisabled = ({
    name,
    label,
    value,
    required,
    onChange,
    rows,
    pre,
    post,
    wrapClass,
    className
}: Omit<PromptProps, "mode">) => {
    const theme = useTheme("prompt");
    return (
        <Wrapper className={wrapClass || theme.Prompt.wrapClass}>
            {pre}
            <TextArea 
                className={(className || theme.Prompt.className)}
                name={name + ".value"} 
                label={label}
                value={value?.value} 
                onChange={onChange} 
                required={required} 
                wrapClass={wrapClass} 
                rows={rows} 
            />
            {post}
        </Wrapper>
    )
}

const runPrompt = async (config: AIFetchConfig, data?: PromptVariables) => {
    const response = await AI.fetch(config, data);

    console.log(response);
    return response;
}

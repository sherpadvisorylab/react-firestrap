import React, { useState } from 'react';
import { Switch, TextArea, Wrapper, LoadingButton, Dropdown, DropdownItem, Select, Range, ActionButton } from '../..';
import {useTheme} from "../../../Theme";
import { AI, AIFetchConfig } from '../../../integrations/ai';
import { PROMPT_CLEANUP, PROMPT_NO_REFERENCE, PromptVariables } from '../../../conf/Prompt';
import { FormFieldProps, useFormContext } from '../../widgets/Form';
import { RecordProps } from '../../../integrations/google/firedatabase';

type PromptOptions = AIFetchConfig & {
    value: string;
};

type OnRunPrompt = (prompt: string, config: AIFetchConfig, data?: PromptVariables) => Promise<string>;

export interface PromptProps extends FormFieldProps {
    mode?: "editor" | "runner";
    onRunPrompt?: OnRunPrompt;
    renderPromptDisabled?: (props: Omit<FormFieldProps, "defaultValue">) => React.ReactNode;
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

interface PromptEditorProps extends Omit<PromptProps, "mode" | "onRunPrompt" | "renderPromptDisabled"> {
    value?: RecordProps
}

interface PromptRunnerProps extends Omit<PromptProps, "mode" | "renderPromptDisabled"> {
    value?: RecordProps;
}

interface PromptDisabledProps extends Omit<PromptProps, "mode" | "onRunPrompt"> {
}

interface RunPromptProps {
    prompt: string;
    config: AIFetchConfig;
    data?: PromptVariables;
    onRunPrompt?: OnRunPrompt;
}

const promptLabel = "Prompt: ";
const promptClass = "position-relative border-start border-4 ps-2 border-secondary";
const promptActionClass = "position-absolute top-0 end-0 d-flex gap-2";

export const Prompt = ({
    mode = "editor",
    onRunPrompt,
    renderPromptDisabled,
    ...props
}: PromptProps) => {
    const { value } = useFormContext({name: props.name});
    return mode === "editor" 
        ? <PromptEditor {...props} value={value} /> 
        : value?.prompt?.enabled 
            ? <PromptRunner {...props} value={value} onRunPrompt={onRunPrompt} /> 
            : <PromptDisabled {...props} renderPromptDisabled={renderPromptDisabled} />
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
}: PromptEditorProps) => {
    const { handleChange } = useFormContext({ name });
    const theme = useTheme("prompt");
    const caption = label || name;
console.log("PromptEditorAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", name, value, defaultValue);

    return (
        <Wrapper className={wrapClass || theme.Prompt.wrapClass}>
            {pre}
            <div className={value?.prompt?.enabled ? promptClass : "position-relative"}>
                <div className={promptActionClass}>
                    <Switch 
                        name={name + ".prompt.enabled"} 
                        label={"prompt"} 
                        defaultValue={defaultValue?.enabled}
                        onChange={({event}) => {
                            handleChange({
                                target: {
                                    name: name + ".prompt.value",
                                    value: event.target.value && defaultValue?.value
                                }
                            });
                        }}
                    />
                </div>
                <TextArea 
                    className={className || theme.Prompt.className}
                    name={name + (value?.prompt?.enabled ? ".prompt.value" : ".value")} 
                    label={value?.prompt?.enabled ? promptLabel + caption : caption}
                    defaultValue={value?.prompt?.enabled && defaultValue?.value}
                    onChange={onChange} 
                    required={required} 
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
    className,
    onRunPrompt
}: PromptRunnerProps) => {
    const { handleChange, record } = useFormContext({name});

    const theme = useTheme("prompt");
    const caption = label || name;
    const [prompt, setPrompt] = useState(false);
    const defaultValues = AI.defaults();
    return (
        <Wrapper className={wrapClass || theme.Prompt.wrapClass}>
            {pre}
            <div className={prompt ? promptClass : "position-relative"}>
                <div className={promptActionClass}>
                    <ActionButton className={value?.prompt?.value ? "btn-outline-theme border-0" : "btn-outline-warning border-0"} 
                        icon={prompt ? "terminal-fill" : "terminal"} title={prompt ? "Mode: Prompt Editor" : "Mode: Run Prompt"} 
                        onClick={() => {
                        setPrompt(!prompt);
                    }} />

                </div>
                <TextArea 
                    className={(className || theme.Prompt.className)}
                    name={name + ".prompt.value"} 
                    label={promptLabel + caption}
                    defaultValue={defaultValue?.value}
                    onChange={onChange} 
                    required={true} 
                    post={<Dropdown 
                        position="end"
                        toggleButton={{
                            icon: "gear"
                        }}
                    >
                        <DropdownItem><Select name={name + ".prompt.role"} pre="Role" 
                            defaultValue={defaultValue?.role} 
                            options={AI.getRoles()} 
                            optionEmpty={{
                                label: "Default (" + defaultValues.role + ")",
                                value: ""
                            }}
                        /></DropdownItem>
                        <DropdownItem><Select name={name + ".prompt.language"} pre="Language" 
                            defaultValue={defaultValue?.language} 
                            options={AI.getLangs()} 
                            optionEmpty={{
                                label: "Default (" + defaultValues.language + ")",
                                value: ""
                            }}
                        /></DropdownItem>
                        <DropdownItem><Select name={name + ".prompt.voice"} pre="Voice" 
                            defaultValue={defaultValue?.voice} 
                            options={AI.getVoices()} 
                            optionEmpty={{
                                label: "Default (" + defaultValues.voice + ")",
                                value: ""
                            }}
                        /></DropdownItem>
                        <DropdownItem><Select name={name + ".prompt.style"} pre="Style" 
                            defaultValue={defaultValue?.style} 
                            options={AI.getStyles()} 
                            optionEmpty={{
                                label: "Default (" + defaultValues.style + ")",
                                value: ""
                            }}
                        /></DropdownItem>
                        <DropdownItem><Select name={name + ".prompt.model"} pre="Model" 
                            defaultValue={defaultValue?.model} 
                            options={AI.getModels()} 
                            optionEmpty={{
                                label: "Default (" + defaultValues.model + ")",
                                value: ""
                            }}
                        /></DropdownItem>
                        <DropdownItem><Range name={name + ".prompt.temperature"} label="Temperature" 
                            defaultValue={defaultValue?.temperature} 
                            min={0} 
                            max={1} 
                            step={0.1} 
                        /></DropdownItem>
                    </Dropdown>}
                    wrapClass={prompt ? "" : " d-none"} 
                    rows={rows} />
                <TextArea 
                    className={(className || theme.Prompt.className)}
                    name={name + ".value"} 
                    label={caption}
                    onChange={onChange} 
                    required={required} 
                    post={<LoadingButton icon="stars" onClick={async () => {
                        handleChange?.({
                            target: {
                                name: name + ".value",
                                value: await runPrompt(value?.prompt, record, onRunPrompt)
                            }
                        });
                    }} />} 
                    wrapClass={prompt ? " d-none" : ""} 
                    rows={rows} />
            </div>
            {post}
        </Wrapper>
    )
}

const PromptDisabled = ({
    name,
    label,
    required,
    onChange,
    rows,
    pre,
    post,
    wrapClass,
    className,
    renderPromptDisabled
}: PromptDisabledProps) => {
    const theme = useTheme("prompt");

    return (
        <Wrapper className={wrapClass || theme.Prompt.wrapClass}>
            {pre}
            {renderPromptDisabled?.({name, label, required, onChange}) ?? (
                <TextArea 
                    className={(className || theme.Prompt.className)}
                    name={name + ".value"} 
                    label={label}
                    onChange={onChange} 
                    required={required} 
                    rows={rows} 
                />
            )}
            {post}
        </Wrapper>
    )
}

export const runPrompt = async (options: PromptOptions, data?: PromptVariables, onRunPrompt?: OnRunPrompt): Promise<string> => {
    const { value: prompt, ...config } = options;
    const response = await AI.fetch(
        [PROMPT_CLEANUP, onRunPrompt?.(prompt, config, data) ?? prompt, PROMPT_NO_REFERENCE].join("\n"),
        config,
        data
    );

    console.log(response);
    return response;
}

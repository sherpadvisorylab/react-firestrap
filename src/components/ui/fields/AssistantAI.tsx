import React, { useEffect, useState } from 'react';
import { Label, ListGroup, TextArea } from './Input';
import { ActionButton, LoadingButton } from '../Buttons';
import { getPrompt, PROMPTS, setPrompt } from '../../../conf/Prompt';
import fetchAI from '../../../integrations/ai';
import FormEnhancer from '../../FormEnhancer';
import Loader from '../Loader';
import Carousel from '../../blocks/Carousel';
import Card from '../Card';
import { UIProps, Wrapper } from '../../index';

type PromptKey = keyof typeof PROMPTS;

interface OutlineItem {
    headline: string;
    subheadings: string[];
}

type ResponseItem =
    | { Title: string }
    | { Description: string }
    | { outline: OutlineItem[] };

interface AssistantAIProps extends UIProps {
    name: string;
    promptTopic: { prompt: string; label: string };
    configVariables: { lang: string; voice: string; style: string; limit: string };
    initialValue?: string;
    children?: React.ReactNode;
    onChange: (e: any) => void;
    viewMode?: 'list' | 'carousel';
    autoStart?: boolean;
    onReset?: () => void;
}

/* Pulisce e formatta il testo selezionato dalla risposta AI */
const cleanSelectedText = (selectedText: string): string => {
    return selectedText
        .replace(/^Outline \d+:\s*\n*/i, '')
        .replace(/([•\-]\s*[^\n]+)/g, '$1\n')
        .trim();
}

/* Restituisce il contenuto formattato per la visualizzazione in base alla viewMode */
const getResponseContent = (response: ResponseItem, viewMode: 'list' | 'carousel'): React.ReactNode => {
    if (viewMode === 'carousel') {
        if ('outline' in response && Array.isArray(response.outline)) {
            console.log(response)
            const formatted = response.outline.map(section => {
                const subs = section.subheadings.map(sub => `  - ${sub}`).join('\n');
                return `Heading: ${section.headline}\n${subs}`;
            }).join('\n\n');
            return formatted.split('\n').map((line, i) => <div key={i}>{line}</div>);
        } else if ('Title' in response) {
            return response.Title;
        } else if ('Description' in response) {
            return response.Description;
        }
        return '[Nessun valore]';
    } else {
        const firstValue = Object.values(response).find(value => typeof value === 'string');
        return (firstValue as string) ?? '[Nessun valore]';
    }
}

const AssistantAI = ({
    name,
    promptTopic,
    configVariables,
    initialValue,
    children,
    onChange            = () => { },
    viewMode            = 'list',
    autoStart           = false,
    onReset             = undefined,
    pre                 = undefined,
    post                = undefined,
    wrapClass           = undefined,
    className           = undefined
}: AssistantAIProps) => {
    /* const { prompt, label } = getPrompt(promptTopic); */
    const [userInput, setUserInput] = useState<string>(initialValue ?? '');
    const [responsesAI, setResponsesAI] = useState<ResponseItem[]>([]);
    const [selectedResponse, setSelectedResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = fetchAI();

    useEffect(() => {
        if (initialValue && autoStart) {
            handleInput();
        }
    }, [initialValue, autoStart])

    const handleInput = async () => {
        setResponsesAI([]);
        setSelectedResponse('');
        setIsLoading(true);
        setError(null);
        onReset?.();

        try {
            const finalPrompt = setPrompt(promptTopic.prompt, configVariables, userInput);
            const response = await fetch(finalPrompt, {
                model: 'gpt-4',
                temperature: 0.7
            });

            if (!response) {
                throw new Error('Failed to get response');
            }

            handleResponsesAI(response);

        } catch (err) {
            setError('Failed to generate content. Please try again.');
            console.error('AI Error:', err);
        } finally {
            setIsLoading(false);
        }
    }

    // gestione risposte AI
    const handleResponsesAI = (response: any) => {
        let outputArray: any[] = [];

        // single object
        if (!Array.isArray(response) && typeof response === 'object') {
            if (response.output) {
                outputArray = Array.isArray(response.output) ? response.output : [response.output];
            } else {
                setSelectedResponse(response);
                onChange(response);
                setIsLoading(false);
                return;
            }
        } else {
            // array
            outputArray = Array.isArray(response) ? response : [response];
        }

        setResponsesAI(outputArray);
    }

    // gestione selezione risposta
    const handleSelectedResponse = (e: React.MouseEvent, index?: number) => {
        const selectedText = e.currentTarget.textContent || '';
        const cleanedText = cleanSelectedText(selectedText);
        let selectedElement: string | {} = selectedText;
        if (index !== undefined) {
            const response = responsesAI[index];
            selectedElement = 'outline' in response ? response.outline : selectedText;
        }
        setSelectedResponse(cleanedText);
        onChange(selectedElement);
    }

    return (
        <Wrapper className={wrapClass}>
            {pre}
            <Card
                title={name}
                className={`my-3 ${className}`}
                header={
                    <div className='d-flex justify-content-end align-items-center gap-2'>
                        {isLoading && <Loader>Thinking...</Loader>}
                        {error && <span className='text-danger'>{error}</span>}
                        {(selectedResponse || responsesAI.length > 0 || error) && <ActionButton icon='arrow-clockwise' onClick={handleInput} />}
                    </div>
                }
            >

                {(!autoStart || !initialValue) && !selectedResponse && !error && <TextArea
                    name='inputUser'
                    label={promptTopic.label}
                    value={initialValue ?? userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    post={<LoadingButton
                        icon='robot'
                        onClick={handleInput}
                        disabled={userInput ? false : true}
                    />}
                    wrapClass='my-3'
                />}

                {responsesAI?.length > 0 && !selectedResponse && !error && (
                    viewMode === 'carousel' ? (
                        <Carousel>
                            {responsesAI.map((response, index) => {
                                const lines = getResponseContent(response, viewMode);
                                // lines deve essere un array di stringhe
                                return (
                                    <>
                                        Outline {index + 1}
                                        <ListGroup
                                            key={index}
                                            data-index={index}
                                            className="carousel-item-content"
                                            onClick={(event) => handleSelectedResponse(event, index)}
                                        >
                                            {Array.isArray(lines)
                                                ? lines.map((line, i) => (line))
                                                : [{ lines }]
                                            }
                                        </ListGroup>
                                    </>
                                );
                            })}
                        </Carousel>
                    ) : (
                        <ListGroup onClick={handleSelectedResponse}>
                            {responsesAI.map((response, index) => getResponseContent(response, viewMode))}
                        </ListGroup>
                    )
                )}
                {selectedResponse && !error &&
                    <FormEnhancer
                        components={children}
                        record={{ [name]: selectedResponse }}
                    />
                }
            </Card>
            {post}
        </Wrapper>
    )
}

export default AssistantAI;

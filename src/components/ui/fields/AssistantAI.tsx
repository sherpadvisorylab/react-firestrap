import React, { useEffect, useState } from 'react';
import { Label, ListGroup, TextArea } from './Input';
import { ActionButton, LoadingButton } from '../Buttons';
import { getPrompt, PROMPTS, setPrompt } from '../../../conf/Prompt';
import fetchAI from '../../../integrations/ai';
import ComponentEnhancer from '../../ComponentEnhancer';
import Loader from '../Loader';
import Carousel from '../../blocks/Carousel';
import Card from '../Card';

type PromptKey = keyof typeof PROMPTS;

interface OutlineItem {
    headline: string;
    subheadings: string[];
}

type ResponseItem =
    | { Title: string }
    | { Description: string }
    | { outline: OutlineItem[] };

interface AssistantAIProps {
    name: string;
    promptTopic: PromptKey;
    configVariables: { lang: string; voice: string; style: string; limit: string };
    initialValue?: string;
    onChange: (e: any) => void;
    children?: React.ReactNode;
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
            const formatted = response.outline.map(section => {
                const subs = section.subheadings.map(sub => `  - ${sub}`).join('\n');
                return `• ${section.headline}\n${subs}`;
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
    onChange,
    children,
    viewMode = 'list',
    autoStart = false,
    onReset,
}: AssistantAIProps) => {
    const { prompt, label } = getPrompt(promptTopic);
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
            const finalPrompt = setPrompt(prompt, configVariables, userInput);
            const response = await fetch(finalPrompt, promptTopic, {
                model: 'gpt-4',
                temperature: promptTopic === 'GENERATE_BLOG_POST_OUTLINE' ? 0.5 : 0.7
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
        <Card
            title={name}
            className='my-3'
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
                label={label}
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
                        {responsesAI.map((response, index) => (
                            <div
                                key={index}
                                data-index={index}
                                className="carousel-item-content"
                                style={{ whiteSpace: 'pre-line', textAlign: 'left', cursor: 'pointer' }}
                                onClick={(event) => handleSelectedResponse(event, index)}
                            >
                                {getResponseContent(response, viewMode)}
                            </div>
                        ))}
                    </Carousel>
                ) : (
                    <ListGroup onClick={handleSelectedResponse}>
                        {responsesAI.map((response, index) => getResponseContent(response, viewMode))}
                    </ListGroup>
                )
            )}
            {selectedResponse && !error &&
                <ComponentEnhancer
                    components={children}
                    record={{ [name]: selectedResponse }}
                />
            }
        </Card>
    )
}

export default AssistantAI;

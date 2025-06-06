import React, { useEffect, useState } from 'react';
import { Label, ListGroup, TextArea } from './Input';
import { ActionButton } from '../Buttons';
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

const AssistantAI = ({
    name,
    promptTopic,
    configVariables,
    initialValue,
    handleOutput,
    children,
    viewMode = 'list',
    autoStart = false,
    onReset,
}: {
    name: string;
    promptTopic: PromptKey;
    configVariables: { lang: string, voice: string, style: string, limit: string };
    initialValue?: string,
    handleOutput: (e: any) => void;
    children?: React.ReactNode;
    viewMode?: 'list' | 'carousel' | 'tab';
    autoStart?: boolean;
    onReset?: () => void;
}) => {
    const { prompt, label } = getPrompt(promptTopic);
    const [userInput, setUserInput] = useState<string>(initialValue ?? '');
    const [responses, setResponses] = useState<ResponseItem[]>([]);
    const [selectedResponse, setSelectedResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = fetchAI();

    useEffect(() => {
        if (initialValue && autoStart) {
            handleInput();
        }
    }, [initialValue])

    const handleInput = async () => {
        setResponses([]);
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

            let outputArray: any[] = [];

            // Handle single object response
            if (!Array.isArray(response) && typeof response === 'object') {
                if (response.output) {
                    outputArray = Array.isArray(response.output) ? response.output : [response.output];
                } else {
                    setSelectedResponse(response);
                    handleOutput(response);
                    setIsLoading(false);
                    return;
                }
            } else {
                // Handle array response
                outputArray = Array.isArray(response) ? response : [response];
            }

            setResponses(outputArray);
        } catch (err) {
            setError('Failed to generate content. Please try again.');
            console.error('AI Error:', err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleResponse = (e: React.MouseEvent, index?: number) => {
        const selectedText = e.currentTarget.textContent || '';
        const cleanedText = selectedText
            .replace(/^Outline \d+:\s*\n*/i, '')
            .replace(/([•\-]\s*[^\n]+)/g, '$1\n')
            .trim();
        let selectedElement: string | {} = selectedText;
        if (index !== undefined) {
            console.log('indice: ' + index);
            const response = responses[index];
            selectedElement = 'outline' in response ? response.outline : selectedText;
            console.log('elemento selezionato:');
            console.log(selectedElement);
        }
        console.log(cleanedText);
        console.log(selectedElement);
        setSelectedResponse(cleanedText);
        handleOutput(selectedElement);
    }

    return (
        <Card
            title={name}
            className='my-3'
            header={
                <div className='d-flex justify-content-end align-items-center gap-2'>
                    {isLoading && <Loader>Thinking...</Loader>}
                    {error && <span className='text-danger'>{error}</span>}
                    {(selectedResponse || responses.length > 0 || error) && <ActionButton icon='arrow-clockwise' onClick={handleInput} />}
                </div>
            }
        >

            {(!autoStart || !initialValue) && !selectedResponse && !error && <TextArea
                name='inputUser'
                label={label}
                value={initialValue ?? userInput}
                onChange={(e) => setUserInput(e.target.value)}
                post={<ActionButton
                    icon='robot'
                    onClick={handleInput}
                    disabled={userInput ? false : true}
                />}
                wrapClass='my-3'
            />}

            {responses?.length > 0 && !selectedResponse && !error && (
                viewMode === 'carousel' ?
                    <Carousel>
                        {responses.map((response, index) => {
                            let content: React.ReactNode = '[Nessun valore]';

                            if ('outline' in response && Array.isArray(response.outline)) {
                                const formatted = response.outline.map(section => {
                                    const subs = section.subheadings.map(sub => `  - ${sub}`).join('\n');
                                    return `• ${section.headline}\n${subs}`;
                                }).join('\n\n');

                                content = formatted.split('\n').map((line, i) => <div key={i}>{line}</div>);
                            } else if ('Title' in response) {
                                content = response.Title;
                            } else if ('Description' in response) {
                                content = response.Description;
                            }

                            return (
                                <div
                                    key={index}
                                    data-index={index}
                                    className="carousel-item-content"
                                    style={{ whiteSpace: 'pre-line', textAlign: 'left', cursor: 'pointer' }}
                                    onClick={(event) => handleResponse(event, index)}
                                >
                                    {content}
                                </div>
                            );
                        })}
                    </Carousel>
                    :
                    <ListGroup
                        items={responses.map((response, index) => {
                            const firstValue = Object.values(response).find(value => typeof value === 'string');
                            return firstValue ?? '[Nessun valore]';
                        })}
                        onClick={handleResponse}
                    />
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

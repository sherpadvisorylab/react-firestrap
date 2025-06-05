import React, { useEffect, useState } from 'react';
import { Label, ListGroup, TextArea } from './Input';
import { ActionButton } from '../Buttons';
import { getPrompt, PROMPTS, setPrompt } from '../../../conf/Prompt';
import fetchAI from '../../../integrations/ai';
import ComponentEnhancer from '../../ComponentEnhancer';
import Loader from '../Loader';
import Carousel from '../../blocks/Carousel';

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
    viewMode = 'list'
}: {
    name: string;
    promptTopic: PromptKey;
    configVariables: { lang: string, voice: string, style: string, limit: string };
    initialValue?: string,
    handleOutput: (e: any) => void;
    children?: React.ReactNode;
    viewMode?: 'list' | 'carousel' | 'tab';
}) => {
    const { prompt, label } = getPrompt(promptTopic);
    const [userInput, setUserInput] = useState<string>(initialValue ?? '');
    const [responses, setResponses] = useState<ResponseItem[]>([]);
    const [selectedResponse, setSelectedResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetch = fetchAI();

    useEffect(() => {
        initialValue && handleInput();
    }, [initialValue])

    // ritorna un array di oggetti con la struttura: { Outline: 'testo' }
    const handleInput = async () => {
        setResponses([]);
        setSelectedResponse('');
        setIsLoading(true)
        const finalPrompt = setPrompt(prompt, configVariables, userInput);
        const response = await fetch(finalPrompt, promptTopic, {
            model: 'gpt-4',
            temperature: promptTopic === 'GENERATE_BLOG_POST_OUTLINE' ? 0.5 : 0.7
        });
        setIsLoading(false)
        console.log(response)
        let outputArray = [];

        if (Array.isArray(response?.output)) {
            outputArray = response.output;
        } else if (response?.output && typeof response.output === 'object') {
            outputArray = [response.output];
        } else if (Array.isArray(response)) {
            outputArray = response;
        } else if (response && typeof response === 'object') {
            outputArray = [response];
            setSelectedResponse(response);
            handleOutput(response);
            return;
        }

        console.log(outputArray);
        setResponses(outputArray);
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
        <>

            {!initialValue && !selectedResponse && <TextArea
                name='inputUser'
                label={label}
                value={typeof selectedResponse === 'string' ? selectedResponse : userInput}
                onChange={(e) => setUserInput(e.target.value)}
                post={<ActionButton
                    icon='robot'
                    onClick={handleInput}
                    disabled={userInput ? false : true}
                />}
                wrapClass='my-3'
            />}
            {(selectedResponse || responses.length > 0) &&
                <div className='d-flex justify-content-end mt-3'>
                    <ActionButton icon='arrow-clockwise' onClick={handleInput} />
                </div>
            }
            {!selectedResponse && <Label label={name} />}
            {isLoading && <Loader>Thinking...</Loader>}
            {responses?.length > 0 && !selectedResponse && (
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
            {selectedResponse &&
                <ComponentEnhancer
                    components={children}
                    record={{ [name]: selectedResponse }}
                />
            }

        </>
    )
}

export default AssistantAI;

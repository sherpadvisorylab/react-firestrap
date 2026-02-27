import { getPromptStyle, getPromptVoice, Prompt, PROMPTS, PROMPTS_ROLE } from "../conf/Prompt";
import { fetchRest } from "../libs/fetch";
import { consoleLog } from "../constant";
import { AIConfig, Config, onConfigChange } from "../Config";
import { currentLang } from "../libs/locale";
import { PromptVariables } from "../conf/Prompt";

const OUTPUT = `Return ONLY a valid JSON array of objects.
Rules:
- No trailing commas
- No markdown
- No explanations
- No comments`;

const OUTPUT_ARRAY = `Return ONLY a valid JSON array of primitive values.
Rules:
- The array must contain ONLY primitive values (string, number, or boolean)
- Do NOT include objects or nested arrays
- No trailing commas
- No markdown
- No explanations
- No comments
- The response must be directly parseable by JSON.parse()
`;

const CHATGPT_URL = 'https://api.openai.com/v1/chat/completions';
const CHATGPT_COMPLETION_URL = 'https://api.openai.com/v1/completions';

const CHATGPT_TEMPERATURE = 0.5;
const CHATGPT_MODEL = 'gpt-5';
const CHATGPT_FRAMEWORK = "AIDA (Attention Interest Desire Action)";
const CHATGPT_FRAMEWORKS = [
    "AIDA (Attention Interest Desire Action)",
    "PAS (Problem Agitate Solution)",
    "BAB (Before After Bridge)",
    "FAB (Features Advantages Benefits)",
];

const GEMINI_COMPLETION_URL = 'https://api.gemini.com/v1/predict';
const GEMINI_MODEL = 'your-gemini-model-default'; // Replace with your actual model name

type PromptPlaceholders = {
    [key: string]: string | number | boolean | undefined;
};

type FetchAIOptions = {
    limit?: number;
    keywords?: string[];
    model?: string;
    framework?: string;
    temperature?: number;
    voice?: string;
    style?: string;
};

type Message = {
    role: 'user' | 'system' | 'assistant';
    content: string;
};

let config: AIConfig | undefined = undefined;
onConfigChange((newConfig: Config) => {
    config = newConfig.ai;
});

const promptAssign = (prompt: string, options: PromptPlaceholders): string => {
    Object.keys(options).forEach(key => {
        options[key] && (prompt = prompt.replaceAll(`{${key}}`, String(options[key])));
    });
    return prompt
        .replaceAll('{output}', OUTPUT)
        .replaceAll('{output_array}', OUTPUT_ARRAY)
        .replaceAll('{language}', currentLang())
        .replaceAll('{voice}', getPromptVoice())
        .replaceAll('{style}', getPromptStyle())
        .replace(/{[^{}]+}/g, '');
}

const parseContent = (str: string): any => {
    try {
        return (str.startsWith("{") || str.startsWith("[")
            ? JSON.parse(str)
            : str
        )
    } catch (error) {
        console.error('Errore di sintassi JSON');
        return;
    }
}

const apiLog = (aiType: string, response: any, strategy?: string) => {
    consoleLog(aiType + "->response::", strategy, response);
    return response;
}

const chatChatGPTContinue = async (
    content: string,
    prevMessages: any[],
    countRetry = 0
): Promise<any> => {
    if (!config?.openaiApiKey) {
        console.error(`
❌ OpenAI API Key not configured.

To use ChatGPT, you must configure a valid OpenAI API key.

🛠 How to get your API key:
1. Go to https://platform.openai.com/
2. Log in or create a free account
3. From your dashboard, click on your profile (top right) > "View API keys"
4. Click "Create new secret key"
5. Copy the key and store it securely

📌 Add it to your tenant configuration under:
  config.ai.chatGptApiKey = "<your-api-key>"

⚠️ Without this key, ChatGPT features will not work.
`);
        return;
    }

    countRetry++;
    if (countRetry > 3) {
        return;
    }

    const messages = [
        ...prevMessages,
        //{ role: 'user', content: 'Please continue from the previous response and include the complete content in the new response.'}
        { role: 'user', content: 'Please continue: ' + content }
    ];

    console.log("Retry: " + countRetry, '<------------------------------------------------------------------------------------');
    return fetchRest(CHATGPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.openaiApiKey
        },
        body: {
            engine: CHATGPT_MODEL,
            messages: messages,
            temperature: CHATGPT_TEMPERATURE
        }
    })
        .then(response => {
            if (!response?.choices) {
                console.log("<<<<<<<<impossible>>>>>>>>");
                return null;
            }

            const continueContent = content + response.choices[0].message.content;

            return parseContent(continueContent) || chatChatGPTContinue(continueContent, prevMessages, countRetry);
        });
}


const fetchOpenaiApi = async (
    prompt: string,
    options: {
        model?: string;
        temperature?: number;
    } = {},
    strategy?: keyof typeof PROMPTS | undefined
): Promise<any> => {
    /* if (!config?.chatGptApiKey) {
        console.error(`
            ❌ OpenAI API Key not configured.

            To use ChatGPT, you must configure a valid OpenAI API key.

            🛠 How to get your API key:
            1. Go to https://platform.openai.com/
            2. Log in or create a free account
            3. From your dashboard, click on your profile (top right) > "View API keys"
            4. Click "Create new secret key"
            5. Copy the key and store it securely

            📌 Add it to your tenant configuration under:
            config.ai.chatGptApiKey = "<your-api-key>"

            ⚠️ Without this key, ChatGPT features will not work.
        `);
        return;
    } */

        const prompts = strategy !== undefined ? PROMPTS_ROLE[strategy] ?? [] : [];

        const roles: Message[] = prompts.map((role: string) => ({
          role: 'system',
          content: role
        }));
        

    const body = {
        model: options.model || CHATGPT_MODEL,
        messages: [
            ...roles,
            { role: 'user', content: prompt }
        ],
        temperature: options.temperature || CHATGPT_TEMPERATURE
    };

    consoleLog(PROVIDER_OPENAI + "->request::", strategy, body);
    return fetchRest(CHATGPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config?.openaiApiKey
        },
        body: body
    })
        .then(response => { 
            console.log('Laaaaaaaaaaaa')
            console.log(response)
            return apiLog(PROVIDER_OPENAI, response, strategy)})
        .then(response => {
            if (!response?.choices) return null;
            return parseContent(response.choices[0].message.content)
                || chatChatGPTContinue(response.choices[0].message.content, roles);
        });
};


const fetchGeminiApi = async (
    search: string,
    {
        limit = 10,
        keywords = [],
        model = undefined,
        framework = undefined,
        temperature = undefined,
        voice = undefined,
        style = undefined,
    }: FetchAIOptions,
    strategy?: keyof typeof PROMPTS | undefined
): Promise<any> => {
    if (!config?.geminiApiKey) {
        console.error(`
❌ Gemini API Key not configured.

To use Google Gemini (formerly Bard), you must configure a valid API key.

🛠 How to get your Gemini API key:
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click on "Create API Key"
4. Copy the key provided

📌 Add it to your tenant configuration under:
  config.ai.geminiApiKey = "<your-api-key>"

⚠️ Without this key, Gemini-related features will not function.
`);
        return;
    }

    const promptOptions: PromptPlaceholders = {
        keywords: keywords.join(', '), // ✅ convertito per compatibilità
        search,
        limit,
        voice,
        style,
    };

    const promptRole = (question: string): string => {
        const role = 'Assistant'; //todo: da schematizzare estraendo da PROMPTS_ROLE[strategy]
        const specialization = 'Generalist'; //todo: da schematizzare estraendo da PROMPTS_ROLE[strategy]

        return `**Role:** ${role}\n**Specialization:** ${specialization}\n\nYour question: ${question}`;
    }

    const prompt = promptRole(
      promptAssign(
        strategy !== undefined ? PROMPTS[strategy] ?? "" : "",
        promptOptions
      )
    );
    const body = {
        instances: [{ content: prompt }]
    };

    consoleLog(PROVIDER_GEMINI + "->request::", strategy, body);
    return fetchRest(`${GEMINI_COMPLETION_URL}?model=${model || GEMINI_MODEL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.geminiApiKey
        },
        body: body
    })
        .then(response => apiLog(PROVIDER_GEMINI, response, strategy))
        .then(response => {
            if (response?.predictions) {
                return;
            }
            return parseContent(response.predictions[0].text)
        });
}

const fetchAnthropicApi = async (
    prompt: string,
    options: FetchAIOptions = {},
    strategy?: keyof typeof PROMPTS | undefined
): Promise<any> => {
    return fetchRest(PROVIDERS[PROVIDER_ANTHROPIC].url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config?.anthropicApiKey
        },
        body: {
            model: options.model || PROVIDERS[PROVIDER_ANTHROPIC].model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature || PROVIDERS[PROVIDER_ANTHROPIC].temperature
        }   
    })
        .then(response => apiLog(PROVIDER_ANTHROPIC, response, strategy))
        .then(response => {
            if (!response?.choices) return null;
            return parseContent(response.choices[0].message.content)
        });
}

const fetchMistralApi = async (
    prompt: string,
    options: FetchAIOptions = {},
    strategy?: keyof typeof PROMPTS | undefined
): Promise<any> => {
    return fetchRest(PROVIDERS[PROVIDER_MISTRAL].url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config?.mistralApiKey
        },
        body: {
            model: options.model || PROVIDERS[PROVIDER_MISTRAL].model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature || PROVIDERS[PROVIDER_MISTRAL].temperature
        }
    })
        .then(response => apiLog(PROVIDER_MISTRAL, response, strategy))
        .then(response => {
            if (!response?.choices) return null;
            return parseContent(response.choices[0].message.content)
        });
}

export default function fetchAI(provider = PROVIDER_DEFAULT) {
    return fetchOpenaiApi;
}

interface AIProvider {
    name: string;
    url: string;
    model: string;
    models: string[];
    framework?: string;
    frameworks?: string[];
    temperature: number;
    parseHeaders: () => Record<string, string>;
    parseBody: (prompt: string, role: string, options: AIOptions) => Record<string, any>;
    parseResponse: (response: any) => any;
}

interface AIOptions {
    language?: string;
    voice?: string;
    style?: string;
    role?: string;
    model?: string;
    temperature?: number;
}

export interface AIFetchConfig extends AIOptions {
    provider?: keyof typeof PROVIDERS;
}


const PROVIDER_OPENAI = "openai";
const PROVIDER_GEMINI = "gemini";
const PROVIDER_ANTHROPIC = "anthropic";
const PROVIDER_MISTRAL = "mistral";
const PROVIDER_DEFAULT = PROVIDER_OPENAI;

const PROVIDERS = {
    [PROVIDER_OPENAI]: {
        name: PROVIDER_OPENAI,
        url: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-5.2',
        models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano'],
        framework: 'AIDA (Attention Interest Desire Action)',
        frameworks: [
            'AIDA (Attention Interest Desire Action)',
            'PAS (Problem Agitate Solution)',
            'BAB (Before After Bridge)',
            'FAB (Features Advantages Benefits)',
        ],
        temperature: 0.7,
        parseHeaders: () => {
            return {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + config?.openaiApiKey
            }
        },
        parseBody: (prompt: string, role: string, options: AIOptions) => {
            return {
                model: options.model || PROVIDERS[PROVIDER_OPENAI].model,
                messages: [
                    ...(role ? [{ role: 'system', content: role }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature: options.temperature ?? PROVIDERS[PROVIDER_OPENAI].temperature
            }
        },
        parseResponse: (response: any) => {
            if (!response?.choices) return null;
            return response.choices[0].message.content
        }
    },
    [PROVIDER_GEMINI]: {
        name: PROVIDER_GEMINI,
        url: 'https://api.gemini.com/v1/predict',
        model: 'gemini-2.5-pro',
        models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-deep-think'],
        temperature: 0.7,
        parseHeaders: () => {
            return {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + config?.geminiApiKey
            }
        },
        parseBody: (prompt: string, role: string, options: AIOptions) => {
            return {
                model: options.model || PROVIDERS[PROVIDER_GEMINI].model,
                instances: [{ content: role ? role + "\n\n" + prompt : prompt }],
                temperature: options.temperature ?? PROVIDERS[PROVIDER_GEMINI].temperature
            }
        },
        parseResponse: (response: any) => {
            if (!response?.predictions) return null;
            return response.predictions[0].text
        }
    },
    [PROVIDER_ANTHROPIC]: {
        name: PROVIDER_ANTHROPIC,
        url: 'https://api.anthropic.com/v1/completions',
        model: 'claude-3.5',
        models: ['claude-3.5', 'claude-3.7-sonnet', 'claude-4', 'claude-opus-4.1'],
        temperature: 0.7,
        parseHeaders: () => {
            return {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + config?.anthropicApiKey
            }
        },
        parseBody: (prompt: string, role: string, options: AIOptions) => {
            return {
                model: options.model || PROVIDERS[PROVIDER_ANTHROPIC].model,
                messages: [
                    ...(role ? [{ role: 'system', content: role }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature: options.temperature ?? PROVIDERS[PROVIDER_ANTHROPIC].temperature
            }
        },
        parseResponse: (response: any) => {
            if (!response?.choices) return null;
            return response.choices[0].message.content
        }
    },
    [PROVIDER_MISTRAL]: {
        name: PROVIDER_MISTRAL,
        url: 'https://api.mistral.com/v1/completions',
        model: 'mistral-small-3.1',
        models: ['mistral-small-3.1', 'mistral-medium-3', 'magistral-small', 'magistral-medium', 'devstral-small', 'codestral-22B', 'mixtral-8x22B', 'mistral-large-2'],
        temperature: 0.7,
        parseHeaders: () => {
            return {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + config?.mistralApiKey
            }
        },
        parseBody: (prompt: string, role: string, options: AIOptions) => {
            return {
                model: options.model || PROVIDERS[PROVIDER_MISTRAL].model,
                messages: [
                    ...(role ? [{ role: 'system', content: role }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature: options.temperature ?? PROVIDERS[PROVIDER_MISTRAL].temperature 
            }
        },
        parseResponse: (response: any) => {
            if (!response?.choices) return null;
            return response.choices[0].message.content
        }
    },
}

export class AI extends Prompt {
    config: AIProvider;
    options: AIOptions;
    data?: PromptVariables;

    static fetch(prompt: string, config: AIFetchConfig, data?: PromptVariables) {
        const { provider, ...options } = config;

        return (new AI(provider))
            .setOptions(options)
            .setData(data)
            .fetchAPI(prompt);
    }

    static getModels(provider?: keyof typeof PROVIDERS) {
        return PROVIDERS[provider ?? PROVIDER_DEFAULT].models;
    }

    constructor(provider: keyof typeof PROVIDERS = PROVIDER_DEFAULT) {
        super();
        this.config     = PROVIDERS[provider];
        this.options    = {};
    }

    setOptions(options: AIOptions) {
        this.options = options;
        return this;
    }

    setData(data?: PromptVariables) {
        this.data = data;
        return this;
    }   

    static defaults() {
        return {
            ...super.defaults(),
            model: localStorage.getItem("prompt.model") || PROVIDERS[PROVIDER_DEFAULT].model,
        }
    }

    async fetchAPI(prompt: string): Promise<any> {
        const body = this.config.parseBody(
            AI.parsePrompt(prompt, { ...this.options, ...this.data }), 
            AI.parseRole(this.options.role, this.options), 
            this.options
        );
        console.log(this.config.name + "->request", body);

        return fetchRest(this.config.url, {
            method: 'POST',
            headers: this.config.parseHeaders(),
            body: body
        })
        .then(response => {
            console.log(this.config.name + "->response", response);
            return this.config.parseResponse(response)
        })
        .then(response => {
            if (response === null) {
                console.error('fetchAI->warning: Response is null');
                return null;
            }
            try {
                return (response.startsWith("{") || response.startsWith("[")
                    ? JSON.parse(response)
                    : response
                )
            } catch (error) {
                console.error('fetchAI->error: Failed to parse response', error);
                return null;
            }
        })
        .catch(error => {
            console.error('fetchAI->error: Failed to fetch', error);
            return null;
        });

    }
}
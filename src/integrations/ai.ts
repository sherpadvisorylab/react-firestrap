
import {getPromptLang, getPromptStyle, getPromptVoice, PROMPTS, PROMPTS_ROLE} from "../conf/Prompt";
import {fetchRest} from "../libs/fetch";
import {consoleLog} from "../constant";
import {AIConfig, Config, onConfigChange} from "../Config";

const TYPE_CHATGPT = "chatgpt";
const TYPE_GEMINI = "gemini";

const OUTPUT = "valid JSON array of objects. Make sure the array is always formatted as a JSON array, even if it contains only one element";
const OUTPUT_ARRAY = "valid JSON array simple. Make sure the array is always formatted as a JSON array and dont have object inside";

const CHATGPT_URL = 'https://api.openai.com/v1/chat/completions';
const CHATGPT_COMPLETION_URL = 'https://api.openai.com/v1/completions';

const CHATGPT_TEMPERATURE = 0.5;
const CHATGPT_MODEL = 'gpt-3.5-turbo';
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

type FetchAIOptions  = {
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
        .replaceAll('{language}', getPromptLang())
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

const apiLog = (aiType: string, strategy: string, response: any) => {
    consoleLog(aiType + "->response::", strategy, response);
    return response;
}

const chatGPTApiContinue = async (
    content: string,
    prevMessages: any[],
    countRetry = 0
): Promise<any> => {
    if(!config?.chatGptApiKey) {
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
        { role: 'user', content: 'Please continue: ' + content}
    ];

    console.log("Retry: " + countRetry, '<------------------------------------------------------------------------------------');
    return fetchRest(CHATGPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.chatGptApiKey
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

            return parseContent(continueContent) || chatGPTApiContinue(continueContent, prevMessages, countRetry);
        });
}


const fetchChatGPTApi = async (
    search: string,
    strategy: keyof typeof PROMPTS,
    {
        limit           = 10,
        keywords        = [],
        model           = undefined,
        framework       = undefined,
        temperature     = undefined,
        voice           = undefined,
        style           = undefined,
    }: FetchAIOptions
): Promise<any> => {
    if(!config?.chatGptApiKey) {
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
    const promptOptions: PromptPlaceholders = {
        keywords: keywords.join(', '), // 👈 qui convertiamo in stringa
        search,
        limit,
        voice,
        style,
        framework: framework || CHATGPT_FRAMEWORK,
    };
    const roles: Message[] = (PROMPTS_ROLE[strategy] || []).map(role => ({
        role: 'system',
        content: promptAssign(role, promptOptions),
    }));

    const body = {
        model: model || CHATGPT_MODEL,
        messages: [
            ...roles,
            { role: 'user', content: prompt }
        ],
        temperature: temperature || CHATGPT_TEMPERATURE
    };

    consoleLog(TYPE_CHATGPT + "->request::", strategy, body);
    return fetchRest(CHATGPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.chatGptApiKey
        },
        body: body
    })
        .then(response => apiLog(TYPE_CHATGPT, strategy, response))
        .then(response => {
            if (!response?.choices) {
                return null;
            }
            return parseContent(response.choices[0].message.content) || chatGPTApiContinue(response.choices[0].message.content, roles)
        });
}

const fetchGeminiApi = async (
    search: string,
    strategy: keyof typeof PROMPTS,
    {
        limit           = 10,
        keywords        = [],
        model           = undefined,
        framework       = undefined,
        temperature     = undefined,
        voice           = undefined,
        style           = undefined,
    }: FetchAIOptions
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
        const role =  'Assistant'; //todo: da schematizzare estraendo da PROMPTS_ROLE[strategy]
        const specialization = 'Generalist'; //todo: da schematizzare estraendo da PROMPTS_ROLE[strategy]

        return `**Role:** ${role}\n**Specialization:** ${specialization}\n\nYour question: ${question}`;
    }

    const prompt = promptRole(promptAssign(PROMPTS[strategy], promptOptions));
    const body = {
        instances: [{ content: prompt }]
    };

    consoleLog(TYPE_GEMINI + "->request::", strategy, body);
    return fetchRest(`${GEMINI_COMPLETION_URL}?model=${model || GEMINI_MODEL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + config.geminiApiKey
        },
        body: body
    })
        .then(response => apiLog(TYPE_GEMINI, strategy, response))
        .then(response => {
            if (response?.predictions) {
                return;
            }
            return parseContent(response.predictions[0].text)
        });
}

export default function fetchAI(type = TYPE_CHATGPT) {
    switch (type) {
        case TYPE_GEMINI:
            return fetchGeminiApi;
        case TYPE_CHATGPT:
        default:
            return fetchChatGPTApi;
    }
}
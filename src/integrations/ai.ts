
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


let config: AIConfig | undefined = undefined;
onConfigChange((newConfig: Config) => {
    config = newConfig.ai;
});

const promptAssign = (prompt, options = {}) => {
    Object.keys(options).forEach(key => {
        options[key] && (prompt = prompt.replaceAll(`{${key}}`, options[key]));
    });
    return prompt
        .replaceAll('{output}', OUTPUT)
        .replaceAll('{output_array}', OUTPUT_ARRAY)
        .replaceAll('{language}', getPromptLang())
        .replaceAll('{voice}', getPromptVoice())
        .replaceAll('{style}', getPromptStyle())
        .replace(/{[^{}]+}/g, '');
}

const parseContent = (str) => {
    try {
        return (str.startsWith("{") || str.startsWith("[")
                ? JSON.parse(str)
                : str
        )
    } catch (error) {
        console.error('Errore di sintassi JSON');
        return null;
    }
}

const apiLog = (aiType, strategy, response) => {
    consoleLog(aiType + "->response::", strategy, response);
    return response;
}

const chatGPTApiContinue = async (content, prevMessages, countRetry = 0) => {
    const messages = [
        ...prevMessages,
        //{ role: 'user', content: 'Please continue from the previous response and include the complete content in the new response.'}
        { role: 'user', content: 'Please continue: ' + content}
    ];
    countRetry++;
    if (countRetry > 3) {
        return null;
    }

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
    search,
    strategy,
    {
        limit       = 10,
        keywords    = [],
        model       = null,
        framework   = null,
        temperature = null,
        voice       = null,
        style       = null
    }) => {

    const promptOptions = { keywords, search, limit, voice, style, framework: framework || CHATGPT_FRAMEWORK };

    let roles = [];

    for (const promptRole of PROMPTS_ROLE[strategy]) {
        roles.push({ role: 'system', content: promptAssign(promptRole, promptOptions)});
    }
    const prompt = promptAssign(PROMPTS[strategy], promptOptions);
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

const fetchGeminiApi = async (search, strategy, {limit = 10, keywords = [], model = null, framework = null, temperature = null, voice = null, style = null}) => {
    const promptOptions = { keywords, search, limit, voice, style };

    const promptRole = (question) => {
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
                return null;
            }
            return parseContent(response.predictions[0].text)
        });
}

export function fetchAI(type = TYPE_CHATGPT) {
    switch (type) {
        case TYPE_GEMINI:
            return fetchGeminiApi;
        case TYPE_CHATGPT:
        default:
            return fetchChatGPTApi;
    }
}
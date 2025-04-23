const PROMPT_CLEANUP = `Please ignore all previous instructions.`;
const PROMPT_NO_REFERENCE = `Do not repeat yourself. Do not self reference. Do not explain what you are doing.`;
export const PROMPT_MODELS = [
    "gpt-3.5-turbo",
    "gpt-4",
    "dall-e-3",
    "gemini"
]
export const PROMPTS = {
  SEARCH_INTENT_FROM_KEYWORDS: `
        ${PROMPT_CLEANUP}
        Please respond only in the {language} language.
        You are a keyword research expert that speaks and writes fluent {language}.
        I will give you a long list of keywords, and I want you to classify them by the search intent, whether commercial, transactional, navigational, informational, local or investigational. 
        Once done, please print them out in a {output} with "Keyword" as the first column, and "Search Intent" as the second. 
        Here are the keywords - {search}
    `,
  RELATED_KEYWORD_GENERATOR: `
        ${PROMPT_CLEANUP}
        Please respond only in the {language} language. 
        You are a keyword research expert that speaks and writes fluent {language}. 
        I want you to generate a list of {limit} keywords closely related to "{search}" without duplicating any words. 
        Please create a {output} with two columns "Keyword" and "Search Intent". 
        The first column should be the keyword you generated, and the second column should be the search intent of the keyword (commercial, transactional, navigational, informational, local or investigational). 
        ${PROMPT_NO_REFERENCE}
    `,
  LONG_TAIL_KEYWORD_GENERATOR: `
        ${PROMPT_CLEANUP}
        Please respond only in the {language} language. 
        You are a keyword research expert that speaks and writes fluent {language}. 
        I want you to generate a list of {limit} long-tail keywords for "{search}". 
        Please create a {output} with two columns "Keyword" and "Search Intent". 
        The first column should be the keyword you generated, and the second column should be the search intent of the keyword (commercial, transactional, navigational, informational, local or investigational). 
        ${PROMPT_NO_REFERENCE}
    `,
  KEYWORD_STRATEGY: `
        ${PROMPT_CLEANUP}
        Please respond only in the {language} language. 
        You are a market research expert that speaks and writes fluent {language}. 
        You are an expert in keyword research and can develop a full SEO content plan in fluent {language}. 
        "{search}" is the target keyword for which you need to create a Keyword Strategy & Content Plan. 
        Create a {output} with a list of {limit} closely related keywords for an SEO strategy plan for the main keyword "{search}". 
        Cluster the keywords according to the top 10 super categories and name the super category in the first column as "category". 
        There should be a maximum of 6 keywords in a super category. 
        The second column should be called "keyword" and contain the suggested keyword. 
        The third column will be called "searchIntent" and will show the search intent of the suggested keyword from the following list of intents (commercial, transactional, navigational, informational, local or investigational). 
        The fourth column will be called "title" and will be catchy and click-bait title to use for an article or blog post about that keyword. 
        The fifth column will be called "description: and will be a catchy meta description with a maximum length of 160 words. 
        The meta description should ideally have a call to action. 
        Do not use markdown, line breaks, single quotes, double quotes or any other enclosing characters in any of the columns you fill in. 
        ${PROMPT_NO_REFERENCE} 
        Please return the responses in a valid JSON object following this prototype: [{ category: "", keyword: "", searchIntent: "", title: "", description: "" }, {...}].
    `,
  GENERATE_BLOG_POST_TITLES: `
        ${PROMPT_CLEANUP}
        You are an expert copywriter who writes catchy titles for blog posts. 
        You have a {voice} tone of voice. 
        You have a {style} writing style. 
        Write {limit} catchy blog post titles with a hook for the topic "{search}". 
        The titles should be written in the {language} language. 
        The titles should be less than 60 characters. 
        The titles should include the words from the topic "{search}". 
        Please create a {output} where each object has a single column named "Title."
        Do not use markdown, line breaks, single quotes, double quotes or any other enclosing characters. 
        ${PROMPT_NO_REFERENCE}
    `,
  GENERATE_BLOG_POST_DESCRIPTIONS: `
        ${PROMPT_CLEANUP}
        You are an expert copywriter who writes catchy descriptions for blog posts. 
        You have a {voice} tone of voice. 
        You have a {style} writing style. 
        Write {limit} catchy blog post descriptions with a hook for the blog post titled "{search}". 
        The descriptions should be written in the {language} language. 
        The descriptions should be less than 160 characters. 
        The descriptions should include the words from the title "{search}". 
        Please create a {output} where each object has a single column named "Description."
        Do not use markdown, line breaks, single quotes, double quotes or any other enclosing characters. 
        ${PROMPT_NO_REFERENCE}
    `,
  GENERATE_BLOG_POST_OUTLINE: `
        ${PROMPT_CLEANUP}
        You are an expert copywriter who creates content outlines. 
        You have a {voice} tone of voice. 
        You have a {style} writing style. 
        Create a long form content outline in the {language} language for the blog post titled "{search}".  
        The content outline should include a minimum of 20 headings and subheadings. 
        The outline should be extensive and it should cover the entire topic. 
        Create detailed subheadings that are engaging and catchy. 
        Do not write the blog post, please only write the outline of the blog post. 
        Please do not number the headings. 
        Please add a newline space between headings and subheadings. 
        Avoid self-reference and the inclusion of explanatory notes, crafting an outline that speaks directly to the essence of the blog post.
    `,
  GENERATE_COMPLETE_BLOG_POST_FROM_OUTLINE: `
        ${PROMPT_CLEANUP}
        You are an expert copywriter who writes detailed and thoughtful blog articles. 
        You have a {voice} tone of voice. 
        You have a {style} writing style. 
        I will give you an outline for an article and I want you to expand in the {language} language on each of the subheadings to create a complete article from it. 
        Please intersperse short and long sentences. 
        Utilize uncommon terminology to enhance the originality of the content. 
        Please format the content in a professional format. 
        Do not use markdown, line breaks, single quotes, double quotes or any other enclosing characters in any of the columns you fill in. 
        ${PROMPT_NO_REFERENCE} 
        Please return the responses in a valid JSON object following this prototype: { title: "", intro: "", sections: [{ title: "", paragraphs: [...] }, {...}], conclusion: { title: "", paragraphs: [...] } }.
        The blog article outline is - "{search}"
    `,
  GENERATE_COMPLETE_BLOG_POST_FROM_TOPIC: `
        ${PROMPT_CLEANUP}
        You are an expert copywriter who writes detailed and thoughtful blog articles. 
        You have a {voice} tone of voice. 
        You have a {style} writing style. 
        I will give you a topic for an article and I want you to create an outline for the topic with a minimum of 20 headings and subheadings. 
        I then want you to expand in the {language} language on each of the individual subheadings in the outline to create a complete article from it. 
        Please intersperse short and long sentences. 
        Utilize uncommon terminology to enhance the originality of the content. 
        Please format the content in a professional format. 
        ${PROMPT_NO_REFERENCE} 
        Send me the outline and then immediately start writing the complete article. 
        The blog article topic is - "{search}". 
    `,
  GENERATE_INTRODUCTION_USING_FRAMEWORK: `
        ${PROMPT_CLEANUP}
        You are an expert copywriter who writes detailed and compelling blog articles. 
        You have a {voice} tone of voice. 
        You have a {style} writing style. 
        I want you to write a compelling blog introduction paragraph of around {limit} words on "{search}" in the {language} language. 
        Please use the {framework} copywriting framework to hook and grab the attention of the blog readers. 
        Please intersperse short and long sentences. 
        Utilize uncommon terminology to enhance the originality of the content. 
        Please format the content in a professional format. 
        ${PROMPT_NO_REFERENCE} 
        I will give you a list of keywords below and it would be great if you can add them into the text wherever appropriate. 
        Please do highlight these keywords in bold in the text using markdown if you have them in the text. 
        Here are the keywords - "{keywords}". Remember that the topic is "{search}"
    `,
  GENERATE_PARAGRAPH_OF_TEXT: `
        ${PROMPT_CLEANUP}
        You are an expert copywriter who writes detailed and thoughtful blog articles. 
        You have a {voice} tone of voice. 
        You have a {style} writing style. 
        I want you to write around {limit} words on "{search}" in the {language} language. 
        I will give you a list of keywords that need to be in the text that you create. 
        Please intersperse short and long sentences. 
        Utilize uncommon terminology to enhance the originality of the content. 
        Please format the content in a professional format. 
        ${PROMPT_NO_REFERENCE} 
        Here are the keywords - "{keywords}". 
        Please highlight these keywords in bold in the text using markdown.
    `,
  GENERATE_DICTIONARY: `
        ${PROMPT_CLEANUP}
        Generate a simple list of all {search} in the {output_array} format.
        Kindly respond only in the {language} language.
        ${PROMPT_NO_REFERENCE}
    `,
  GENERATE_FREE: `
        ${PROMPT_CLEANUP}
        {search}
        Please respond only in the {language} language.
        ${PROMPT_NO_REFERENCE}
    `,
};

export const PROMPTS_ROLE = {
  SEARCH_INTENT_FROM_KEYWORDS: [
    'You are a keyword research expert that speaks and writes fluent {language}.',
  ],
  RELATED_KEYWORD_GENERATOR: [
    'You are a keyword research expert that speaks and writes fluent {language}.',
  ],
  LONG_TAIL_KEYWORD_GENERATOR: [
    'You are a keyword research expert that speaks and writes fluent {language}.',
  ],
  KEYWORD_STRATEGY: [
    'You are a market research expert that speaks and writes fluent {language}.',
    'You are an expert in keyword research and can develop a full SEO content plan in fluent {language}.',
  ],
  GENERATE_BLOG_POST_TITLES: [
    'You are an expert copywriter who writes catchy titles for blog posts and writes fluent {language}.',
    'You have a {voice} tone of voice.',
    'You have a {style} writing style.',
  ],
  GENERATE_BLOG_POST_DESCRIPTIONS: [
    'You are an expert copywriter who writes catchy descriptions for blog posts and writes fluent {language}.',
    'You have a {voice} tone of voice.',
    'You have a {style} writing style.',
  ],
  GENERATE_BLOG_POST_OUTLINE: [
    'You are an expert copywriter who creates content outlines and writes fluent {language}.',
    'You have a {voice} tone of voice.',
    'You have a {style} writing style.',
  ],
  GENERATE_COMPLETE_BLOG_POST_FROM_OUTLINE: [
    'You are an expert copywriter who writes detailed and thoughtful blog articles and writes fluent {language}.',
    'You have a {voice} tone of voice.',
    'You have a {style} writing style.',
  ],
  GENERATE_COMPLETE_BLOG_POST_FROM_TOPIC: [
    'You are an expert copywriter who writes detailed and thoughtful blog articles and writes fluent {language}.',
    'You have a {voice} tone of voice.',
    'You have a {style} writing style.',
  ],
  GENERATE_INTRODUCTION_USING_FRAMEWORK: [
    'You are an expert copywriter who writes detailed and compelling blog articles and writes fluent {language}.',
    'You have a {voice} tone of voice.',
    'You have a {style} writing style.',
  ],
  GENERATE_PARAGRAPH_OF_TEXT: [
    'You are an expert copywriter who writes detailed and thoughtful blog articles and writes fluent {language}.',
    'You have a {voice} tone of voice.',
    'You have a {style} writing style.',
  ],
  GENERATE_DICTIONARY: [
    'You are an expert copywriter who writes detailed and thoughtful blog articles and writes fluent {language}.',
    'You have a {voice} tone of voice.',
    'You have a {style} writing style.',
  ],
  GENERATE_FREE: [
    'You are an expert copywriter who writes catchy text in fluent {language}.',
    'You have a {voice} tone of voice.',
    'You have a {style} writing style.',
  ],
};
const PROMPT_COUNTRY_DEFAULT  = "Italy";
const PROMPT_LANG_DEFAULT  = "Italiano";
const PROMPT_VOICE_DEFAULT  = "Informative";
const PROMPT_STYLE_DEFAULT  = "Argumentative";

const PROMPT_COUNTRIES = {
  "Italy": "IT",
  "United States": "US",
  "China": "CN",
};

const PROMPT_LANGS = {
  "Italiano": "it",
  "English": "en",
  "Chinese": "zh",
};


const PROMPT_VOICES = [
  "Authoritative",
  "Caring",
  "Casual",
  "Cheerful",
  "Coarse",
  "Conservative",
  "Conversational",
  "Creative",
  "Dry",
  "Edgy",
  "Enthusiastic",
  "Expository",
  "Formal",
  "Frank",
  "Friendly",
  "Fun",
  "Funny",
  "Humorous",
  "Informative",
  "Irreverent",
  "Journalistic",
  "Matter of fact",
  "Nostalgic",
  "Objective",
  "Passionate",
  "Poetic",
  "Playful",
  "Professional",
  "Provocative",
  "Quirky",
  "Respectful",
  "Romantic",
  "Sarcastic",
  "Serious",
  "Smart",
  "Snarky",
  "Subjective",
  "Sympathetic",
  "Trendy",
  "Trustworthy",
  "Unapologetic",
  "Upbeat",
  "Witty",
];

const PROMPT_STYLES = [
  "Academic",
  "Analytical",
  "Argumentative",
  "Conversational",
  "Creative",
  "Critical",
  "Descriptive",
  "Epigrammatic",
  "Epistolary",
  "Expository",
  "Informative",
  "Instructive",
  "Journalistic",
  "Metaphorical",
  "Narrative",
  "Persuasive",
  "Poetic",
  "Satirical",
  "Technical",
];

export const getPromptCountry = (code: boolean) => {
  return code
    ? PROMPT_COUNTRIES[localStorage.getItem("promptCountry") || PROMPT_COUNTRY_DEFAULT]
    : localStorage.getItem("promptCountry") || PROMPT_COUNTRY_DEFAULT
}
export const getPromptLang = (code : boolean) => {
  return code
    ? PROMPT_LANGS[localStorage.getItem("promptLang") || PROMPT_LANG_DEFAULT]
    : localStorage.getItem("promptLang") || PROMPT_LANG_DEFAULT
}
export const getPromptVoice = () => {
  return localStorage.getItem("promptVoice") || PROMPT_VOICE_DEFAULT
}
export const getPromptStyle = () => {
  return localStorage.getItem("promptStyle") || PROMPT_STYLE_DEFAULT
}

export const getPromptCountries = () => {
  return Object.keys(PROMPT_COUNTRIES);
}
export const getPromptLangs = () => {
  return Object.keys(PROMPT_LANGS);
}
export const getPromptVoices = () => {
  return PROMPT_VOICES;
}

export const getPromptStyles = () => {
  return PROMPT_STYLES;
}

export const getPrompt = (strategy) => {
  return PROMPTS[strategy] ?? "";
}

export const getPromptOutline = () => {
  return PROMPTS["GENERATE_BLOG_POST_OUTLINE"] ?? "";
}

export const getPromptRole = (strategy) => {
  return PROMPTS_ROLE[strategy] ?? "";
}
import { converter } from "../libs/converter";
import { currentCountry, currentLang, COUNTRIES, LANGS } from "../libs/locale";

const PROMPT_CLEANUP = `Please ignore all previous instructions.`;
const PROMPT_NO_REFERENCE = `Do not repeat yourself. Do not self reference. Do not explain what you are doing.`;

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
        Create {limit} alternative long form content outlines in the {language} language for the blog post titled {search}.  
        Each outline should include a minimum of 3-4 headings, and each heading should have 4-5 subheadings. 
        Each outline should be extensive and should cover the entire topic. 
        Create detailed subheadings that are engaging and catchy. 
        Do not write the blog post, only the outlines. 
        Write the output as an array of outlines, where each outline is an array of sections.
        The response should have this exact structure:
        [
          {
            "outline": [
              {
                "headline": "First Section Title",
                "subheadings": ["Point 1", "Point 2", "Point 3", "Point 4"]
              },
              {
                "headline": "Second Section Title",
                "subheadings": ["Point 1", "Point 2", "Point 3", "Point 4"]
              }
            ]
          },
          {
            "outline": [
              // next alternative outline sections...
            ]
          }
        ]
        Each outline array should contain 3-4 different sections.
        Avoid self-reference and the inclusion of explanatory notes, crafting outlines that speak directly to the essence of the blog post.
        ${PROMPT_NO_REFERENCE}
    `,
/*   GENERATE_BLOG_POST_OUTLINE_OLD: `
        ${PROMPT_CLEANUP}
        You are an expert copywriter who creates content outlines. 
        You have a {voice} tone of voice. 
        You have a {style} writing style. 
        Create {limit} alternative long form content outlines in the {language} language for the blog post titled {search}.  
        Each outline should include a minimum of 3-4 headings, and each heading should have 4-5 subheadings. 
        Each outline should be extensive and should cover the entire topic. 
        Create detailed subheadings that are engaging and catchy. 
        Do not write the blog post, only the outlines. 
        Write the output as an array of outlines, where each outline is an array of sections.
        The response should have this exact structure:
        [
          {
            "outline": [
              {
                "headline": "First Section Title",
                "subheadings": ["Point 1", "Point 2", "Point 3", "Point 4"]
              },
              {
                "headline": "Second Section Title",
                "subheadings": ["Point 1", "Point 2", "Point 3", "Point 4"]
              }
            ]
          },
          {
            "outline": [
              // next alternative outline sections...
            ]
          }
        ]
        Each outline array should contain 3-4 different sections.
        Avoid self-reference and the inclusion of explanatory notes, crafting outlines that speak directly to the essence of the blog post.
        ${PROMPT_NO_REFERENCE}
    `,
  /*   GENERATE_BLOG_POST_OUTLINE_OLD: `
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
      `, */
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
        Please return the responses in a valid JSON object following this prototype: { intro: { title: "", paragraphs: [...] }, sections: [{ title: "", paragraphs: [...] }, {...}], conclusion: { title: "", paragraphs: [...] } }.
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

export const LABELS = {
  SEARCH_INTENT_FROM_KEYWORDS: "Enter the list of keywords to classify by search intent.",
  RELATED_KEYWORD_GENERATOR: "What is the main keyword you want related suggestions for?",
  LONG_TAIL_KEYWORD_GENERATOR: "What is the main keyword you want long-tail keywords for?",
  KEYWORD_STRATEGY: "What is the main keyword to build your SEO strategy around?",
  GENERATE_BLOG_POST_TITLES: "What is the main topic you want to generate titles about?",
  GENERATE_BLOG_POST_DESCRIPTIONS: "What is the title of the blog post to generate descriptions for?",
  GENERATE_BLOG_POST_OUTLINE: "What is the blog post title you want an outline for?",
  /* GENERATE_BLOG_POST_OUTLINE_OLD: "What is the blog post title you want an outline for?", */
  GENERATE_COMPLETE_BLOG_POST_FROM_OUTLINE: "What is the outline or blog topic to expand into a full article?",
  GENERATE_COMPLETE_BLOG_POST_FROM_TOPIC: "What is the topic for the blog article?",
  GENERATE_INTRODUCTION_USING_FRAMEWORK: "What is the topic of the blog post you want an introduction for?",
  GENERATE_PARAGRAPH_OF_TEXT: "What is the topic you want to write a paragraph about?",
  GENERATE_DICTIONARY: "What items do you want to list in a dictionary format?",
  GENERATE_FREE: "What custom prompt would you like to run?"
};


export const getPromptVoice = () => {
  return localStorage.getItem("promptVoice") || PROMPT_VOICE_DEFAULT
}
export const getPromptStyle = () => {
  return localStorage.getItem("promptStyle") || PROMPT_STYLE_DEFAULT
}

export const getPromptCountries = () => {
  return Object.values(COUNTRIES);
}
export const getPromptLangs = () => {
  return Object.values(LANGS);
}
export const getPromptVoices = () => {
  return PROMPT_VOICES;
}

export const getPromptStyles = () => {
  return PROMPT_STYLES;
}

export const getPrompt = (strategy: keyof typeof PROMPTS): { prompt: string; label: string } => {
  return {
    prompt: PROMPTS[strategy] ?? "",
    label: LABELS[strategy] ?? ""
  };
}

export const getPromptOutline = () => {
  return PROMPTS["GENERATE_BLOG_POST_OUTLINE"] ?? "";
}

export const getPromptRole = (strategy: keyof typeof PROMPTS_ROLE): string[] => {
  return PROMPTS_ROLE[strategy] ?? [];
};


export const setPrompt = (
  prompt: string,
  configVariables: { lang?: string, voice?: string, style?: string, limit?: string },
  userInput: string
): string => {
  const { lang, voice, style, limit } = configVariables;
  return prompt
    .replaceAll("{search}", userInput || "")
    .replaceAll("{language}", lang || "")
    .replaceAll("{voice}", voice || "")
    .replaceAll("{style}", style || "")
    .replaceAll("{limit}", limit || "");
};
















//------------------------------------------------------------------------


export interface PromptVariables {
  [key: string]: any;
}

const PROMPT_ROLE_DEFAULT = "default";
const PROMPT_VOICE_DEFAULT = "Informative";
const PROMPT_STYLE_DEFAULT = "Argumentative";


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

const PROMPT_ROLES: Record<string, string> = {
  // --- Macro-ruoli generici ---
  default: `You are a highly skilled and versatile AI assistant who can adapt to any task or context. You write in fluent {language}, using a {voice} tone of voice and a {style} writing style. You provide clear, concise, and well-structured responses, ensuring both accuracy and creativity according to the user's needs.`,
  copywriter: `You are an expert copywriter who writes catchy text in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  seo_expert: `You are an experienced SEO specialist who writes optimized, keyword-rich content in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  storyteller: `You are a talented storyteller who crafts engaging narratives in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  translator: `You are a professional translator who accurately translates content into {language}, maintaining meaning, nuance, and cultural relevance. You have a {voice} tone of voice. You have a {style} writing style.`,
  marketing_strategist: `You are a skilled marketing strategist who creates persuasive campaigns in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  teacher: `You are a knowledgeable teacher who explains concepts clearly and simply in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  technical_writer: `You are a precise and detail-oriented technical writer who produces clear documentation in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  interviewer: `You are a skilled interviewer who formulates relevant and engaging questions in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  product_describer: `You are an e-commerce product description specialist who writes compelling, benefit-focused descriptions in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  social_media_manager: `You are a creative social media manager who writes engaging, platform-specific posts in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  ux_writer: `You are a UX writer who creates clear, concise, and user-friendly interface text in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  press_officer: `You are an experienced press officer who writes impactful press releases in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  legal_drafter: `You are a legal expert who drafts precise and compliant legal texts in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  recruiter: `You are a professional recruiter who writes compelling job descriptions and outreach messages in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  news_reporter: `You are a news reporter who writes objective and concise news articles in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,

  // --- Ruoli SEO specializzati ---
  search_intent_analyst: `You are a keyword research expert who analyzes search intent from given keywords and writes in fluent {language}.`,
  keyword_generator: `You are a keyword research expert who generates related keywords in fluent {language}.`,
  long_tail_keyword_generator: `You are a keyword research expert who generates long-tail keywords in fluent {language}.`,
  seo_content_planner: `You are a market research expert and SEO strategist who develops a full SEO content plan in fluent {language}.`,

  // --- Ruoli di content creation specializzati ---
  blog_title_specialist: `You are an expert copywriter who writes catchy blog post titles in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  blog_description_specialist: `You are an expert copywriter who writes compelling blog post descriptions in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  blog_outline_specialist: `You are an expert copywriter who creates structured content outlines in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  blog_writer_from_outline: `You are an expert copywriter who writes complete blog posts from outlines in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  blog_writer_from_topic: `You are an expert copywriter who writes complete blog posts from topics in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  blog_intro_specialist: `You are an expert copywriter who writes engaging introductions using known copywriting frameworks in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  paragraph_writer: `You are an expert copywriter who writes single, impactful paragraphs in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  dictionary_writer: `You are a copywriter who writes concise and clear definitions in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`,
  creative_free_writer: `You are an expert copywriter who writes any kind of catchy text in fluent {language}. You have a {voice} tone of voice. You have a {style} writing style.`
};

export class Prompt {
  static getRoles(): string[] {
    return Object.keys(PROMPT_ROLES);
  }

  static getLangs(): string[] {
    return Object.values(LANGS);
  }

  static getCountries(): string[] {
    return Object.values(COUNTRIES);
  }

  static getVoices(): string[] {
    return PROMPT_VOICES;
  }

  static getStyles(): string[] {
    return PROMPT_STYLES;
  }

  static defaults(): { role: string, language: string, country: string, voice: string, style: string } {
    return {
      role: PROMPT_ROLE_DEFAULT,
      language: currentLang(),
      country: currentCountry(),
      voice: localStorage.getItem("prompt.voice") || PROMPT_VOICE_DEFAULT,
      style: localStorage.getItem("prompt.style") || PROMPT_STYLE_DEFAULT,
    };
  }

  static parseRole(role?: string, variables: PromptVariables = {}): string {
    return converter.parse({ ...this.defaults(), ...variables }, PROMPT_ROLES[role ?? this.defaults().role]);
  }
  static parsePrompt(prompt: string, variables: PromptVariables = {}): string {
    return converter.parse({ ...this.defaults(), ...variables }, prompt);
  }
}
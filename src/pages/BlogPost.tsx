import React, { useEffect, useState } from 'react'
import { getPrompt, getPromptLangs, getPromptStyles, getPromptVoices, PROMPTS } from '../conf/Prompt';
import Tab, { TabItem } from '../components/ui/Tab';
import { ActionButton } from '../components/ui/Buttons';
import { Number, TextArea } from '../components/ui/fields/Input';
import { Select } from '../components/ui/fields/Select';
import AssistantAI from '../components/ui/fields/AssistantAI'
import Form from '../components/widgets/Form';
import { FieldOnChange } from '../components/widgets/Form';

type PromptKey = keyof typeof PROMPTS;

interface Outline {
  headline: string;
  subheadings: string[];
}

interface SectionContent {
  title: string;
  paragraphs: string[];
}

interface Section {
  intro: SectionContent;
  sections: SectionContent[];
  conclusion: SectionContent;
}

interface Post {
  title: string;
  outline: Outline[];
  sections: Section;
  description: string;
}

interface ConfigVariables {
  lang: string;
  voice: string;
  style: string;
  limit: string;
}

const initialSection: SectionContent = { title: '', paragraphs: [] };
const initialPost: Post = {
  title: '',
  outline: [],
  sections: {
    intro: initialSection,
    sections: [],
    conclusion: initialSection
  },
  description: ''
};

export default function BlogPost({
  data = {
    lang: 'Italiano',
    voice: 'Informative',
    style: 'Descriptive',
    limit: '3'
  },
  promptTopic = 'GENERATE_BLOG_POST_TITLES',
  onChange = () => { },
  value = undefined
}: {
  data?: ConfigVariables,
  promptTopic?: PromptKey,
  onChange?: (e: any) => void
  value?: any
}) {
  const langsOptions = getPromptLangs();
  const voicesOptions = getPromptVoices();
  const stylesOptions = getPromptStyles();

  const [refreshKey, setRefreshKey] = useState(0);
  const [post, setPost] = useState<Post>(initialPost);
  const [configVariables, setConfigVariables] = useState<ConfigVariables>({
    lang: data.lang,
    voice: data.voice,
    style: data.style,
    limit: data.limit
  });
  const [disableVariables, setDisabledVariables] = useState(false);

  useEffect(() => {
    post.title && setDisabledVariables(true);
  }, [post.title]);

  const handleConfigChange: FieldOnChange = ({name, value}) => {
    setConfigVariables(prev => ({ ...prev, [name]: value }));
  };

  const updatePost = (field: keyof Post) => (value: any) => {
    setPost(prev => ({ ...prev, [field]: value }));
    onChange(post);
  };

  const updateSectionContent = (type: 'intro' | 'conclusion', field: keyof SectionContent, value: string) => {
    setPost(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [type]: {
          ...prev.sections[type],
          [field]: field === 'paragraphs' ? value.split('\n') : value
        }
      }
    }));
  };

  const updateSection = (index: number, field: keyof SectionContent, value: string) => {
    setPost(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        sections: prev.sections.sections.map((s, i) =>
          i === index ? { ...s, [field]: field === 'paragraphs' ? value.split('\n') : value } : s
        )
      }
    }));
  };

  type ResetType = 'all' | 'fromTitle' | 'fromOutline' | 'fromSections' | 'fromDescription';

  const resetPost = (type: ResetType = 'all') => {
    if (type === 'all') {
      setDisabledVariables(false);
      setRefreshKey(prev => prev + 1);
      setPost(initialPost);
      return;
    }

    setPost(prev => {
      switch (type) {
        case 'fromTitle':
          return {
            ...prev,
            title: '',
            outline: [],
            sections: { intro: initialSection, sections: [], conclusion: initialSection },
            description: ''
          };
        case 'fromOutline':
          return {
            ...prev,
            outline: [],
            sections: { intro: initialSection, sections: [], conclusion: initialSection },
            description: ''
          };
        case 'fromSections':
          return {
            ...prev,
            sections: { intro: initialSection, sections: [], conclusion: initialSection },
            description: ''
          };
        case 'fromDescription':
          return {
            ...prev,
            description: ''
          };
        default:
          return prev;
      }
    });
  };

  const formatOutlineForAI = (outline: Outline[]) => {
    return outline.map(item => (
      `Section: ${item.headline}\nTopics to cover:\n${item.subheadings.map(sub => `- ${sub}`).join('\n')}`
    )).join('\n\n');
  };

  type SectionItem =
    | { type: 'intro' | 'conclusion'; label: string; section: SectionContent }
    | { type: 'section'; label: string; section: SectionContent; index: number };

  return (
    <>
      <h1>Create Blog Post</h1>
      <Form>
          <div className='d-flex flex-column gap-2 mb-3'>
            <Select
              name='lang'
              pre='Language'
              value={configVariables.lang}
              options={langsOptions}
              onChange={handleConfigChange}
              disabled={disableVariables}
            />
            <Select
              name='voice'
              pre='Voice'
              value={configVariables.voice}
              options={voicesOptions}
              onChange={handleConfigChange}
              disabled={disableVariables}
            />
            <Select
              name='style'
              pre='Style'
              value={configVariables.style}
              options={stylesOptions}
              onChange={handleConfigChange}
              disabled={disableVariables}
            />
            <Number
              name="limit"
              pre="Limit"
              value={configVariables.limit}
              onChange={handleConfigChange}
              disabled={disableVariables}
            />
          </div>

          {post.title && (
            <div className='d-flex justify-content-end my-3'>
              <ActionButton label='refresh' onClick={() => resetPost('all')} />
            </div>
          )}


          <AssistantAI
            name='title'
            key={refreshKey + '-title'}
            promptTopic={getPrompt(promptTopic)}
            configVariables={configVariables}
            onChange={updatePost('title')}
            onReset={() => resetPost('fromTitle')}
          >
            <TextArea name='title' label='Title' value={post.title} rows={2} />
          </AssistantAI>

          {post.title && (
            <AssistantAI
              key={refreshKey + '-outline'}
              name='outline'
              initialValue={post.title || ''}
              promptTopic={getPrompt('GENERATE_BLOG_POST_OUTLINE')}
              configVariables={configVariables}
              onChange={updatePost('outline')}
              viewMode='carousel'
              onReset={() => resetPost('fromOutline')}
            >
              <TextArea
                name='postOutline'
                label='Outline'
                value={post.outline.map(item => (
                  item.headline + '\n' + item.subheadings.join('\n')
                )).join('\n')}
                rows={10}
              />
            </AssistantAI>
          )}

          {post.outline.length > 0 && (
            <AssistantAI
              key={refreshKey + '-outlines'}
              name='sections'
              initialValue={post.outline.length > 0 ? formatOutlineForAI(post.outline) : ''}
              promptTopic={getPrompt('GENERATE_COMPLETE_BLOG_POST_FROM_OUTLINE')}
              configVariables={configVariables}
              onChange={updatePost('sections')}
              onReset={() => resetPost('fromSections')}
              viewMode='carousel'
            >
              <Tab>
                {([
                  { type: 'intro', label: 'Intro', section: post.sections.intro },
                  ...post.sections.sections.map((section, index) => ({
                    type: 'section',
                    label: `Section ${index + 1}`,
                    section,
                    index
                  })),
                  { type: 'conclusion', label: 'Conclusion', section: post.sections.conclusion }
                ] as SectionItem[]).map((item) => (
                  <TabItem key={item.label} label={item.label}>
                    <TextArea
                      name={`post${item.label}Title`}
                      label={`${item.label} Title`}
                      value={item.section.title}
                      onChange={({value}) =>
                        item.type === 'section'
                          ? updateSection(item.index, 'title', value)
                          : updateSectionContent(item.type, 'title', value)
                      }
                      rows={2}
                    />
                    <TextArea
                      name={`post${item.label}`}
                      label={item.label}
                      value={item.section.paragraphs.join('\n')}
                      onChange={({value}) =>
                        item.type === 'section'
                          ? updateSection(item.index, 'paragraphs', value)
                          : updateSectionContent(item.type, 'paragraphs', value)
                      }
                      rows={5}
                    />
                  </TabItem>
                ))}
              </Tab>
            </AssistantAI>
          )}

          {post.sections.intro.title && (
            <AssistantAI
              key={refreshKey + '-desc'}
              name='description'
              initialValue={post.title || ''}
              promptTopic={getPrompt('GENERATE_BLOG_POST_DESCRIPTIONS')}
              configVariables={configVariables}
              onChange={updatePost('description')}
              onReset={() => resetPost('fromDescription')}
              autoStart={true}
            >
              <TextArea name='description' label='Description' value={post.description} rows={3} />
            </AssistantAI>
          )}

      </Form>

    </>
  );
}

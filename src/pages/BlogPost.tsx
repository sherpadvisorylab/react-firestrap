import React, { useEffect, useState } from 'react'
import { getPromptLangs, getPromptStyles, getPromptVoices } from '../conf/Prompt';
import { Col, Row } from '../components/ui/GridSystem';
import Tab, { TabItem } from '../components/ui/Tab';
import { ActionButton } from '../components/ui/Buttons';
import { Number, String, TextArea } from '../components/ui/fields/Input';
import { Select } from '../components/ui/fields/Select';
import AssistantAI from '../components/ui/fields/AssistantAI'
import Form from '../components/widgets/Form';

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
  description: string;
  outline: Outline[];
  sections: Section;
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
  description: '',
  outline: [],
  sections: {
    intro: initialSection,
    sections: [],
    conclusion: initialSection
  }
};

export default function BlogPost() {
  const langsOptions = getPromptLangs();
  const voicesOptions = getPromptVoices();
  const stylesOptions = getPromptStyles();

  const [refreshKey, setRefreshKey] = useState(0);
  const [post, setPost] = useState<Post>(initialPost);
  const [configVariables, setConfigVariables] = useState<ConfigVariables>({
    lang: 'Italiano',
    voice: 'Informative',
    style: 'Descriptive',
    limit: '3'
  });
  const [disableVariables, setDisabledVariables] = useState(false);

  useEffect(() => {
    post.title && setDisabledVariables(true);
  }, [post.title]);

  const handleConfigChange = (field: keyof ConfigVariables) => (e: { target: { value: string } }) => {
    setConfigVariables(prev => ({ ...prev, [field]: e.target.value }));
  };

  const updatePost = (field: keyof Post) => (value: any) => {
    setPost(prev => ({ ...prev, [field]: value }));
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

  type ResetType = 'all' | 'fromTitle' | 'fromDescription' | 'fromOutline';

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
            description: '',
            outline: [],
            sections: { intro: initialSection, sections: [], conclusion: initialSection }
          };
        case 'fromDescription':
          return {
            ...prev,
            description: '',
            outline: [],
            sections: { intro: initialSection, sections: [], conclusion: initialSection }
          };
        case 'fromOutline':
          return {
            ...prev,
            outline: [],
            sections: { intro: initialSection, sections: [], conclusion: initialSection }
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
      <Row>
        <Col xs={5}>
          <div className='d-flex flex-column gap-2 mb-3'>
            <Select 
              name='lang' 
              pre='Language' 
              value={configVariables.lang} 
              options={langsOptions} 
              onChange={handleConfigChange('lang')} 
              disabled={disableVariables} 
            />
            <Select 
              name='voice' 
              pre='Voice' 
              value={configVariables.voice} 
              options={voicesOptions} 
              onChange={handleConfigChange('voice')} 
              disabled={disableVariables} 
            />
            <Select 
              name='style' 
              pre='Style' 
              value={configVariables.style} 
              options={stylesOptions} 
              onChange={handleConfigChange('style')} 
              disabled={disableVariables} 
            />
            <Number
              name="limit"
              pre="Limit"
              value={configVariables.limit}
              onChange={handleConfigChange('limit')}
              disabled={disableVariables}
            />
          </div>

          {post.title && (
            <div className='d-flex justify-content-end my-3'>
              <ActionButton label='refresh' onClick={() => resetPost('all')} />
            </div>
          )}

          <Form>
            <AssistantAI
              key={refreshKey + '-title'}
              name='Title'
              promptTopic='GENERATE_BLOG_POST_TITLES'
              configVariables={configVariables}
              handleOutput={updatePost('title')}
              onReset={() => resetPost('fromTitle')}
            >
              <String name='Title' label='Title' value={post.title} />
            </AssistantAI>

            {post.title && (
              <AssistantAI
                key={refreshKey + '-desc'}
                name='Description'
                initialValue={post.title || ''}
                promptTopic='GENERATE_BLOG_POST_DESCRIPTIONS'
                configVariables={configVariables}
                handleOutput={updatePost('description')}
                onReset={() => resetPost('fromDescription')}
                autoStart={true}
              >
                <String name='Description' label='Description' value={post.description} />
              </AssistantAI>
            )}

            {post.description && (
              <AssistantAI
                key={refreshKey + '-outline'}
                name='Outline'
                initialValue={post.title || ''}
                promptTopic='GENERATE_BLOG_POST_OUTLINE'
                configVariables={configVariables}
                handleOutput={updatePost('outline')}
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
                name='Sections'
                initialValue={post.outline.length > 0 ? formatOutlineForAI(post.outline) : ''}
                promptTopic='GENERATE_COMPLETE_BLOG_POST_FROM_OUTLINE'
                configVariables={configVariables}
                handleOutput={updatePost('sections')}
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
                      <String 
                        name={`post${item.label}Title`}
                        label={`${item.label} Title`}
                        value={item.section.title}
                        onChange={e => 
                          item.type === 'section' 
                            ? updateSection(item.index, 'title', e.target.value)
                            : updateSectionContent(item.type, 'title', e.target.value)
                        }
                      />
                      <TextArea 
                        name={`post${item.label}`}
                        label={item.label}
                        value={item.section.paragraphs.join('\n')}
                        onChange={e => 
                          item.type === 'section'
                            ? updateSection(item.index, 'paragraphs', e.target.value)
                            : updateSectionContent(item.type, 'paragraphs', e.target.value)
                        }
                        rows={5}
                      />
                    </TabItem>
                  ))}
                </Tab>
              </AssistantAI>
            )}
          </Form>
        </Col>
        <Col xs={7}></Col>
      </Row>
    </>
  );
}

import React from 'react';
import { FormFieldProps } from '../../widgets/Form';
import { Col, Row, Wrapper } from '../GridSystem';
import { Prompt, PromptMode } from './Prompt';
import { Number, Url } from './Input';
import Image from '../Image';

export interface ImageUrlProps extends FormFieldProps {
    url: string;
    mode?: PromptMode;
}
export const ImageUrl = ({
    name,
    label,
    required,
    onChange,
    defaultValue,
    pre,
    post,
    wrapClass,
    className,
    mode,
}: ImageUrlProps) => {
    return <Wrapper className={wrapClass}>
        {pre}
        <Row>
            <Url name={name} label={label} pre="URL" required={required} className={className} onChange={onChange} defaultValue={defaultValue} />
            <Col className='pt-2'>
                <Prompt name={`${name}.alt`} label="Alt text" mode={mode} required={required} defaultValue={defaultValue} rows={2} />
                <Row>
                    <Col><Number name={`${name}.width`} pre="Width" required={required} defaultValue={defaultValue} /></Col>
                    <Col><Number name={`${name}.height`} pre="Height" required={required} defaultValue={defaultValue} /></Col>
                </Row>
            </Col>
            <Col xs={4}>
                <Image className='img-thumbnail w-100 h-100' src={defaultValue?.url} label={defaultValue?.alt} width={defaultValue?.width} height={defaultValue?.height} />
            </Col>
            
        </Row>
        {post}
    </Wrapper>

};
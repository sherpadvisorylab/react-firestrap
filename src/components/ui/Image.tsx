import React from "react";
import { Wrapper } from "./GridSystem";
import {PLACEHOLDER_IMAGE} from "../../Theme";
import { UIProps } from '../..';
import { useTheme } from "../../Theme";

type ImageProps = {
    src: string;
    placeholder?: string;
    label?: string;
    title?: string;
    feedback?: React.ReactNode;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
} & UIProps;

const Image = ({
                   src,
                   label        = undefined,
                   title        = undefined,
                   feedback     = undefined,
                   style        = undefined,
                   width        = undefined,
                   height       = undefined,
                   pre          = undefined,
                   post         = undefined,
                   wrapClass    = undefined,
                   className    = undefined
}: ImageProps) => {
    const theme = useTheme("image");

    return (
        <Wrapper className={wrapClass || theme.Image.wrapClass}>
            {pre}
                <img
                    src={src || PLACEHOLDER_IMAGE}
                    alt={label || title || src}
                    title={title}
                    className={className || theme.Image.className}
                    style={style}
                    width={width}
                    height={height}
                />
            {post}
            {feedback && <div className="feedback">{feedback}</div>}
        </Wrapper>
    );
};

export default Image;
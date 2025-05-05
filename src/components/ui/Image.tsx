import React from "react";
import { Wrapper } from "./GridSystem";
import {PLACEHOLDER_IMAGE} from "../../Theme";

type ImageProps = {
    src: string;
    placeholder?: string;
    label?: string;
    title?: string;
    pre?: React.ReactNode;
    post?: React.ReactNode;
    feedback?: React.ReactNode;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    wrapClass?: string;
    className?: string;
};

const Image = ({
                   src,
                   label        = undefined,
                   title        = undefined,
                   pre          = undefined,
                   post         = undefined,
                   feedback     = undefined,
                   style        = undefined,
                   width        = undefined,
                   height       = undefined,
                   wrapClass    = undefined,
                   className    = undefined
}: ImageProps) => {

    return (
        <Wrapper className={wrapClass}>
            {pre}
                <img
                    src={src || PLACEHOLDER_IMAGE}
                    alt={label || title || src}
                    title={title}
                    className={className}
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
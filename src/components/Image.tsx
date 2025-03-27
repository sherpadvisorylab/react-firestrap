import React from "react";
import { Wrapper } from "./GridSystem";

type ImageProps = {
    src: string;
    placeholder?: string;
    label?: string;
    title?: string;
    pre?: React.ReactNode;
    post?: React.ReactNode;
    feedback?: React.ReactNode;
    style?: React.CSSProperties;
    wrapClass?: string;
    className?: string;
};

const Image = ({
                   src,
                   label        = undefined,
                   placeholder  = "/assets/images/noimg.svg",
                   title        = undefined,
                   pre          = undefined,
                   post         = undefined,
                   feedback     = undefined,
                   style        = undefined,
                   wrapClass    = undefined,
                   className    = undefined
}: ImageProps) => {

    return (
        <Wrapper className={wrapClass}>
            {pre}
                <img
                    src={src}
                    alt={label || title || src}
                    title={title || placeholder}
                    className={className}
                    style={style}
                />
            {post}
            {feedback && <div className="feedback">{feedback}</div>}
        </Wrapper>
    );
};

export default Image;
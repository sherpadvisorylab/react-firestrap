import React from "react";
import { Wrapper } from "./GridSystem";

type ImageProps = {
    src: string;
    placeholder?: string;
    label?: string | null;
    title?: string | null;
    pre?: React.ReactNode;
    post?: React.ReactNode;
    feedback?: React.ReactNode;
    style?: React.CSSProperties;
    wrapClass?: string;
    className?: string;
};

const Image = ({
                   src,
                   label        = null,
                   placeholder  = "/assets/images/noimg.svg",
                   title        = null,
                   pre          = null,
                   post         = null,
                   feedback     = null,
                   style        = null,
                   wrapClass    = "",
                   className    = ""
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
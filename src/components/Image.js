import React, { useState, useEffect } from "react";
import { Wrapper } from "./GridSystem.js";


const Image = ({
    src,
    placeholder = "/assets/images/noimg.svg",
    label = null,
    title = null,
    pre = null,
    post = null,
    feedback = null,
    wrapClass = null,
    className = null,
    style = null
}) => {


    return (
        <Wrapper className={wrapClass}>
            {pre}
                <img
                    src={src}
                    alt={label || title}
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
import React, { useEffect, useState } from "react";
import path from "../../libs/path";
import {PLACEHOLDER_USER, useTheme} from "../../Theme";
import { UIProps } from '../..';
import { Wrapper } from "./GridSystem";

interface ImageAvatarProps extends UIProps {
    src: string;
    width?: number;
    height?: number;
    title?: string;
    alt?: string;
    cacheKey?: string;
}

const ImageAvatar = ({
    src,
    width      = undefined,
    height     = undefined,
    title      = undefined,
    alt        = undefined,
    pre        = undefined,
    post       = undefined,
    wrapClass  = undefined,
    className  = undefined,
}: ImageAvatarProps) => {
    const theme = useTheme("image");
    const [imgSrc, setImgSrc] = useState(PLACEHOLDER_USER);

    const storageKey = `avatar::${src}`;

    const resolvedAlt = alt || title || path.filename(src || PLACEHOLDER_USER);

    useEffect(() => {
        const cached = localStorage.getItem(storageKey);

        if (cached) {
            setImgSrc(cached);
            return;
        }

        // Fetch e salvataggio in base64
        fetch(src)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to load image (${res.status})`);
                return res.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    localStorage.setItem(storageKey, base64data);
                    setImgSrc(base64data);
                };
                reader.readAsDataURL(blob);
            })
            .catch(err => {
                console.warn("ImageAvatar error:", err.message);
                setImgSrc(PLACEHOLDER_USER);
            });
    }, [src, storageKey]);

    return (
        <Wrapper className={wrapClass || theme.ImageAvatar.wrapClass}>
            {pre}
            <img
                key={imgSrc}
                src={imgSrc}
                alt={resolvedAlt}
                width={width}
                height={height}
                className={className}
                title={title}
                onError={() => setImgSrc(PLACEHOLDER_USER)}
            />
            {post}
        </Wrapper>
    );
};

export default ImageAvatar;
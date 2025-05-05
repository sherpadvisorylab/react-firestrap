import React, { useEffect, useState } from "react";
import path from "../../libs/path";
import {PLACEHOLDER_USER} from "../../Theme";

interface ImageAvatarProps {
    src: string;
    width?: number;
    height?: number;
    className?: string;
    title?: string;
    alt?: string;
    cacheKey?: string;
}

const ImageAvatar = ({
    src,
    width      = undefined,
    height     = undefined,
    className  = undefined,
    title      = undefined,
    alt        = undefined
}: ImageAvatarProps) => {
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
    );
};

export default ImageAvatar;
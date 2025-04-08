import React, { useEffect, useState } from "react";
import path from "../libs/path";

export const NOAVATAR_SRC = "/assets/images/noavatar.svg";

interface ImageAvatarProps {
    src: string;
    height?: number | string;
    className?: string;
    title?: string;
    alt?: string;
    cacheKey?: string;
}

const ImageAvatar: React.FC<ImageAvatarProps> = ({
                                                     src,
                                                     height,
                                                     className,
                                                     title,
                                                     alt
                                                 }) => {
    const [imgSrc, setImgSrc] = useState(NOAVATAR_SRC);

    const storageKey = `avatar::${src}`;

    const resolvedAlt = alt || title || path.filename(src || NOAVATAR_SRC);

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
                setImgSrc(NOAVATAR_SRC);
            });
    }, [src, storageKey]);

    return (
        <img
            key={imgSrc}
            src={imgSrc}
            alt={resolvedAlt}
            height={height}
            className={className}
            title={title}
            onError={() => setImgSrc(NOAVATAR_SRC)}
        />
    );
};

export default ImageAvatar;
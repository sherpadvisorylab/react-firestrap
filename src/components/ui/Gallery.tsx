import React, {useMemo} from 'react';
import {useTheme} from "../../Theme";
import Carousel from "../blocks/Carousel";
import {Wrapper} from "../ui/GridSystem";
import {converter} from "../../libs/converter";
import {RecordProps} from "../../integrations/google/firedatabase";
import { UIProps } from '../..';

type ImageProps = React.ReactElement<HTMLImageElement>;
type GalleryRecord = RecordProps & {
    img?: React.ReactElement<{
        className: string;
        style?: React.CSSProperties;
        onClick?: (e: React.MouseEvent<HTMLImageElement>) => void
    }>;
    thumbnail?: string;
    mimetype?: string;
    width?: number;
    height?: number;
    name?: string;
};

interface GalleryProps extends UIProps {
    body?: GalleryRecord[];
    Header?: string | React.ReactNode;
    Footer?: string | React.ReactNode;
    itemTopLeft?: string | React.ReactNode;
    itemTopRight?: string | React.ReactNode;
    itemBottomLeft?: string | React.ReactNode;
    itemBottomRight?: string | React.ReactNode;
    itemMiddleLeft?: string | React.ReactNode;
    itemMiddleRight?: string | React.ReactNode;
    onClick?: (index: number) => void;
    gutterSize?: 0 | 1 | 2 | 3 | 4 | 5;
    rowCols?: 1 | 2 | 3 | 4 | 6;
    groupBy?: string | string[];
    scrollClass?: string;
    headerClass?: string;
    bodyClass?: string;
    footerClass?: string;
    selectedClass?: string;
}

const Gallery = ({
                   body             = undefined,
                   Header           = undefined,
                   Footer           = undefined,
                   itemTopLeft      = undefined,
                   itemTopRight     = undefined,
                   itemBottomLeft   = undefined,
                   itemBottomRight  = undefined,
                   itemMiddleLeft   = undefined,
                   itemMiddleRight  = undefined,
                   onClick          = undefined,
                   gutterSize       = undefined,
                   rowCols          = undefined,
                   groupBy          = undefined,
                   pre              = undefined,
                   post             = undefined,
                   wrapClass        = undefined,
                   className        = undefined,
                   headerClass      = undefined,
                   scrollClass      = undefined,
                   bodyClass        = undefined,
                   footerClass      = undefined,
                   selectedClass    = undefined
}: GalleryProps) => {
    const theme    = useTheme("gallery");
    const activeClass   = selectedClass || theme.Gallery.selectedClass;
    const paddingSize   = gutterSize || theme.Gallery.gutterSize;
    const numCols       = rowCols || theme.Gallery.rowCols;

    const handleClick = (e: React.MouseEvent<HTMLElement>, index: number) => {
        if (activeClass) {
            let currentElement = e.target as HTMLElement;

            while (currentElement && !currentElement.classList.contains("item")) {
                if (currentElement.tagName === 'A' || currentElement.tagName === 'BUTTON') {
                    return;
                }
                currentElement = currentElement.parentNode as HTMLElement;
            }

            if (!currentElement.classList.contains(activeClass)) {
                Array.from(currentElement.parentNode?.children || []).forEach(row => {
                    row.classList.remove(activeClass as string);
                });

                currentElement.classList.add(activeClass);
            }
        }

        onClick?.(index);
    }

    const getImage = (item: GalleryRecord, index: number): ImageProps => {
        const imgElement = item.img;

        if (imgElement && React.isValidElement(imgElement)) {
            return React.cloneElement(imgElement, {
                className: "img-fluid",
                style: {
                    ...(imgElement.props.style || {}),
                    cursor: onClick ? "pointer" : "default",
                },
                onClick: (e: React.MouseEvent<HTMLImageElement>) => {
                    handleClick(e, index);
                    imgElement.props.onClick?.(e);
                },
            }) as ImageProps;
        }

        return (
            <img
                className="img-fluid"
                src={
                    item.thumbnail
                        ? item.mimetype + item.thumbnail
                        : 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAgAAAAwAAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
                }
                alt={item.name}
                width={item.width}
                height={item.height}
                style={{ cursor: onClick ? "pointer" : "default" }}
                onClick={(e: React.MouseEvent<HTMLImageElement>) => handleClick(e, index)}
            />
        );
    };

    const getGroups = (body: GalleryRecord[], seps: string | string[]): React.ReactElement[] => {
        const groupMap: Record<string, ImageProps[]> = {};
        const result: React.ReactElement[] = [];
        let index = 0;
        for (const item of body) {
            const imgElement = getImage(item, index++);
            const alt = imgElement.props.alt || "";
            const src = imgElement.props.src || "";
            if (!alt || !src) continue;

            const [leftPart] = converter.splitFirst(alt.toUpperCase(), seps, /^\d/g);

            if (!groupMap[leftPart]) {
                groupMap[leftPart] = [];
                result.push(
                    <Carousel
                        key={leftPart}
                    >
                        {groupMap[leftPart]}
                    </Carousel>
                );
            }

            groupMap[leftPart].push(imgElement);
        }

        return result;
    };

    const renderedBody = useMemo(() => {
        if (!Array.isArray(body)) return undefined;

        return groupBy
            ? getGroups(body, groupBy)
            : body.map((item, index) => getImage(item, index));
    }, [body, groupBy]);

    if (renderedBody === undefined) {
        return <p className={"p-4"}><i className={"spinner-border spinner-border-sm"}></i> Caricamento in corso...</p>;
    } else if (renderedBody.length === 0) {
        return <p className={"p-4"}>Nessun dato trovato</p>;
    }

    return (
        <Wrapper className={wrapClass || theme.Gallery.wrapClass}>
            {pre}
            <Wrapper className={className || theme.Gallery.className}>
                {Header && <div className={headerClass || theme.Gallery.headerClass}>{Header}</div>}
                <Wrapper className={scrollClass || theme.Gallery.scrollClass}>
                    <div className={"d-flex flex-wrap text-center align-items-center g-2 row-cols-" + numCols + " " + (bodyClass || theme.Gallery.bodyClass)}>
                        {renderedBody.map((Component, index) => (
                            <div key={index} className={"item position-relative p-" + paddingSize}>
                                {Component}
                                {itemTopLeft && <div className={"position-absolute start-0 top-0 p-" + paddingSize}>
                                    {itemTopLeft}
                                </div>}
                                {itemTopRight && <div className={"position-absolute end-0 top-0 p-" + paddingSize}>
                                    {itemTopRight}
                                </div>}
                                {itemBottomLeft && <div className={"position-absolute start-0 bottom-0 p-" + paddingSize}>
                                    {itemBottomLeft}
                                </div>}
                                {itemBottomRight && <div className={"position-absolute end-0 bottom-0 p-" + paddingSize}>
                                    {itemBottomRight}
                                </div>}
                                {itemMiddleLeft && <div className={"position-absolute top-50 start-0 translate-middle-y p-" + paddingSize}>
                                    {itemMiddleLeft}
                                </div>}
                                {itemMiddleRight && <div className={"position-absolute top-50 end-0 translate-middle-y p-" + paddingSize}>
                                    {itemMiddleRight}
                                </div>}

                            </div>
                        ))}
                    </div>
                </Wrapper>
                {Footer && <div className={footerClass || theme.Gallery.footerClass}>{Footer}</div>}
            </Wrapper>
            {post}
        </Wrapper>)
}

export default Gallery;


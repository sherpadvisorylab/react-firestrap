import React from 'react';
import {useTheme} from "../Theme.js";
import Carousel from "./Carousel.js";
import {Wrapper} from "./GridSystem.js";
import {converter} from "../libs/converter.js";

function Gallery({
                   body,
                   Header = null,
                   Footer = null,
                   itemTopLeft = null,
                   itemTopRight = null,
                   itemBottomLeft = null,
                   itemBottomRight = null,
                   itemMiddleLeft = null,
                   itemMiddleRight = null,
                   onClick = null,
                   wrapClass = null,
                   scrollClass = null,
                   headerClass = null,
                   bodyClass = null,
                   footerClass = null,
                   selectedClass = null,
                   gutterSize = null,
                   rowCols = null,
                   groupBy = null,
               } : {
    body: React.HTMLAttributes<HTMLImageElement>[],
    Header?: string | React.ReactNode,
    Footer?: string | React.ReactNode,
    itemTopLeft?: string | React.ReactNode,
    itemTopRight?: string | React.ReactNode,
    itemBottomLeft?: string | React.ReactNode,
    itemBottomRight?: string | React.ReactNode,
    itemMiddleLeft?: string | React.ReactNode,
    itemMiddleRight?: string | React.ReactNode,
    onClick?: (key: string) => void,
    wrapClass?: string,
    scrollClass?: string,
    tableClass?: string,
    headerClass?: string,
    bodyClass?: string,
    footerClass?: string,
    selectedClass?: string,
    gutterSize?: [ 0 | 1 | 2 | 3 | 4 | 5 ],
    rowCols?: [ 1 | 2 | 3 | 4 | 6 ],
    groupBy: string
}) {
    const theme = useTheme();
    selectedClass = selectedClass || theme.Gallery.selectedClass;
    gutterSize = gutterSize || theme.Gallery.gutterSize;
    rowCols = rowCols || theme.Gallery.rowCols;

    if (!Array.isArray(body)) {
        return <p className={"p-4"}><i className={"spinner-border spinner-border-sm"}></i> Caricamento in corso...</p>;
    } else if (body.length === 0) {
        return <p className={"p-4"}>Nessun dato trovato</p>;
    }

    const handleClick = (images, e) => {
        if (selectedClass) {
            let currentElement = e.target;

            while (currentElement && !currentElement.classList.contains("item")) {
                if (currentElement.tagName === 'A' || currentElement.tagName === 'BUTTON') {
                    return;
                }
                currentElement = currentElement.parentNode;
            }

            if (!currentElement.classList.contains(selectedClass)) {
                Array.from(currentElement.parentNode.children).forEach(row => {
                    row.classList.remove(selectedClass);
                });

                currentElement.classList.add(selectedClass);
            }
        }

        onClick(images[0].key);
    }

    const getImage = ((item) => React.isValidElement(item.img)
        ? React.cloneElement(item.img, {
            className: "img-fluid",
            style: {
                ...item.img.props.style,
                cursor: onClick ? "pointer" : "cursor"
            },
            onClick: (e) => {
                handleClick([item], e);
                item.img.props.onClick && item.img.props.onClick(e);
            }
        })
        : <img
            key={item.key}
            className={"img-fluid"}
            src={item.thumbnail
                ? item.mimetype + item.thumbnail
                : 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAgAAAAwAAAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
            }
            alt={item.name}
            width={item.width}
            height={item.height}
            style={{cursor: onClick ? "pointer" : "cursor"}}
            onClick={(e) => handleClick([item], e)}
        />
    );

    const getGroups = (body: { key: string, [key: string]: any }[], seps: string | string[]) : React.ReactNode[] => {
        const groups = Object.values(body.reduce((acc, item) => {
            const imgElement = getImage(item);
            const alt = imgElement.props.alt || "";
            const src = imgElement.props.src || "";
            if(!alt || !src) return acc;

            const [leftPart] = converter.splitFirst(alt.toUpperCase(), seps, /^\d/g);
            if (!acc[leftPart]) {
                acc[leftPart] = [];
            }
            acc[leftPart].push(imgElement);
            return acc;
        }, {}));

        return groups.map((Images, index) => (
            <Carousel
                key={index}
                onClick={(e) => handleClick(Images, e)}
            >{Images}</Carousel>
        ));
    }

    const Body = (groupBy
        ? getGroups(body, groupBy)
        : body.map((item) => getImage(item))
    );

    return (
        <Wrapper className={wrapClass || theme.Gallery.wrapClass}>
            {Header && <div className={headerClass || theme.Gallery.headerClass}>{Header}</div>}
            <Wrapper className={scrollClass || theme.Gallery.scrollClass}>
                <div className={"d-flex flex-wrap text-center align-items-center g-2 row-cols-" + rowCols + " " + (bodyClass || theme.Gallery.bodyClass)}>
                    {Body.map((Component, index) => (
                        <div key={index} className={"item position-relative p-" + gutterSize}>
                            {Component}
                            {itemTopLeft && <div className={"position-absolute start-0 top-0 p-" + gutterSize}>
                                {itemTopLeft}
                            </div>}
                            {itemTopRight && <div className={"position-absolute end-0 top-0 p-" + gutterSize}>
                                {itemTopRight}
                            </div>}
                            {itemBottomLeft && <div className={"position-absolute start-0 bottom-0 p-" + gutterSize}>
                                {itemBottomLeft}
                            </div>}
                            {itemBottomRight && <div className={"position-absolute end-0 bottom-0 p-" + gutterSize}>
                                {itemBottomRight}
                            </div>}
                            {itemMiddleLeft && <div className={"position-absolute top-50 start-0 translate-middle-y p-" + gutterSize}>
                                {itemMiddleLeft}
                            </div>}
                            {itemMiddleRight && <div className={"position-absolute top-50 end-0 translate-middle-y p-" + gutterSize}>
                                {itemMiddleRight}
                            </div>}

                        </div>
                    ))}
                </div>
            </Wrapper>
            {Footer && <div className={footerClass || theme.Gallery.footerClass}>{Footer}</div>}
        </Wrapper>)
}

export default Gallery;


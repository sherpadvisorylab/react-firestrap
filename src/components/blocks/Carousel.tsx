import React from 'react';
import {useTheme} from "../../Theme";
import {generateUniqueId} from "../../libs/utils";

type AutoPlayOptions = {
    interval: number;
    pause: "hover" | "false" | "true";
    wrap: boolean;
};

type CarouselProps = {
    children: React.ReactElement[];
    showIndicators?: boolean;
    showControls?: boolean;
    showCaption?: boolean;
    layoutDark?: boolean;
    autoPlay?: AutoPlayOptions;
    startSlide?: number;
    onParseCaption?: (image: React.ReactElement) => React.ReactElement;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const Carousel = ({
                    children,
                    showIndicators  = false,
                    showControls    = false,
                    showCaption     = false,
                    layoutDark      = false,
                    autoPlay        = undefined,
                    startSlide      = 0,
                    onParseCaption  = undefined,
                    onClick         = undefined,
} : CarouselProps) => {
    const theme = useTheme("carousel");
    showIndicators = showIndicators || theme.Carousel.showIndicators;
    showControls = showControls || theme.Carousel.showControls;
    showCaption = showCaption || theme.Carousel.showCaption;
    layoutDark = layoutDark || theme.Carousel.layoutDark;
    autoPlay = autoPlay || theme.Carousel.autoPlay;


    const [isHover, setIsHover] = React.useState(false);
    const id = generateUniqueId();
    const bgOverlay = layoutDark ? "bg-white" : "bg-dark";
    const textCaption = layoutDark ? "text-gray" : "text-white";

    const Caption = (image : React.ReactElement) : React.ReactElement | null => {
        if (!showCaption) return null;
        if (onParseCaption) return onParseCaption(image);

        const { alt, description } = image.props;
        if (alt || description) {
            return (
                <div className="carousel-caption d-none d-md-block opacity-75 bottom-0">
                    {alt && <h5 className={textCaption}>{alt}</h5>}
                    {description && <p>{description}</p>}
                </div>
            );
        }
        return null;
    }

    return (
        <div id={id}
             className={"carousel slide" + (layoutDark ? " carousel-dark" : "")}
             data-bs-ride={autoPlay ? "carousel" : "false"}
             data-bs-interval={autoPlay?.interval || 2000}
             data-bs-pause={autoPlay?.pause || "hover"}
             data-bs-wrap={autoPlay?.wrap || "true"}
             onMouseEnter={() => setIsHover(true)}
             onMouseLeave={() => setIsHover(false)}
        >
            {children.length > 1 && <ol className="carousel-indicators mb-0">
                {showIndicators && children.map((_, index) => {
                    return (
                        <li key={index} data-bs-target={"#" + id} data-bs-slide-to={index} className={index === startSlide ? "active" : ""}></li>
                    );
                })}
            </ol>}
            <div className="carousel-inner" onClick={onClick} style={{cursor: onClick ? "pointer" : "default"}}>
                {children.map((image, index) => {
                    return (
                        <div key={index} className={`carousel-item${index === startSlide ? " active" : ""}`}>
                            {image}
                            {(showIndicators || showControls || showCaption) && isHover && <div className={"pe-none position-absolute top-0 bottom-0 start-0 end-0 opacity-25 " + bgOverlay}></div>}
                            {isHover && Caption(image)}
                        </div>
                    );
                })}
            </div>
            {showControls && isHover && children.length > 1 && <>
                <a className="carousel-control-prev" href={"#" + id} role="button" data-bs-slide="prev"><span className="carousel-control-prev-icon" aria-hidden="true"></span><span className="sr-only">Previous</span></a>
                <a className="carousel-control-next" href={"#" + id} role="button" data-bs-slide="next"><span className="carousel-control-next-icon" aria-hidden="true"></span><span className="sr-only">Next</span></a>
            </>}
        </div>
    );
}

export default Carousel;

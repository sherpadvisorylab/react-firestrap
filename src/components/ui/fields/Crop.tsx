import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Card from "../Card";
import { String, Switch } from "./Input";
import { FileProps, getFileUrl } from "./Upload";


const scales: Record<string, number> = {
    "1:1": 1 / 1,
    "3:4": 3 / 4,
    "4:3": 4 / 3,
};

interface CropProps  {
    fileName: string;
    type: string;
    scale: string;
    top: number;
    left: number;
    width: number;
    height: number;
    base64?: string;
}

interface ImageProps extends FileProps {
    variants: Record<string, CropProps>;
}


type ImageBounds = { width: number; height: number; offsetX: number; offsetY: number };

export const CropImage = forwardRef(({img, title} : { img: ImageProps, title?: string }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRefs = useRef<Record<string, HTMLImageElement | null>>({});
    const [imageBoundsMap, setImageBoundsMap] = useState<Record<string, ImageBounds>>({});

    useImperativeHandle(ref, () => ({
        triggerSave: () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;
            
            const variants: Record<string, CropProps> = {};
            for (const scale of selectedScales) {
                const currentImage = imgRefs.current[scale];
                const bounds = imageBoundsMap[scale];
                const data = cropData[scale];
                if (!currentImage || !bounds || !data) return;

                const delta = currentImage.naturalWidth / bounds.width;
                const { top, left, width, height } = data;
                canvas.width = width;
                canvas.height = height;

                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(
                    currentImage,
                    (left - bounds.offsetX) * delta,
                    (top - bounds.offsetY) * delta,
                    width * delta,
                    height * delta,
                    0, 0, width, height);

                variants[scale] = {
                    fileName: cropData[scale].fileName,
                    type: cropData[scale].type,
                    scale,
                    top,
                    left,
                    width,
                    height,
                    base64: canvas.toDataURL(cropData[scale].type),
                }
            }

            return { fileName: originalFileName, variants };
        }
    }));

    const [selectedScales, setSelectedScales] = useState<string[]>(() => Object.keys(img.variants ?? scales).filter(k => k !== "original"));

    const [originalFileName, setOriginalFileName] = useState<string>(img.fileName)

    const [cropData, setCropData] = useState<Record<string, CropProps>>(img.variants ?? {});

    const [dragging, setDragging] = useState<{ [scale: string]: boolean }>({});
    const [resizing, setResizing] = useState<{ [scale: string]: boolean }>({});
    const [dragOffset, setDragOffset] = useState<{ [scale: string]: { x: number, y: number } }>({});
    const [resizeStart, setResizeStart] = useState<{ [scale: string]: { mouseX: number, mouseY: number, width: number, height: number } }>({});

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>, scale: string) => {
        const currentImage = e.currentTarget;

        setImageBoundsMap(prev => ({
            ...prev,
            [scale]: { width: currentImage.width, height: currentImage.height, offsetX: 0, offsetY: 0 }
        }));

        setCropData(prev => {
            if (prev[scale]) return prev; 

            const ratio = scales[scale];
            const maxWidth = Math.min(currentImage.width, currentImage.height * ratio);
            const maxHeight = Math.min(currentImage.height, currentImage.width / ratio);

            return {
                ...prev,
                [scale]: {
                    fileName: img.fileName,
                    type: img.type,
                    scale,
                    top: (currentImage.height - maxHeight) / 2,
                    left: (currentImage.width - maxWidth) / 2,
                    width: maxWidth,
                    height: maxHeight,
                    base64: ''
                }
            };
        });
    };

    const calculateCropByScale = (
        scale: string,
        image: HTMLImageElement,
        cropDataState: Record<string, CropProps>
    ): CropProps | null => {
        const { width, height } = image.getBoundingClientRect();
        const ratio = scales[scale];
        const crop = cropDataState[scale];
        if (!crop) return null;

        const maxWidth = Math.min(width, height * ratio);

        let newWidth = Math.min(crop.width, maxWidth);
        let newHeight = newWidth / ratio;

        let newLeft = Math.min(Math.max(crop.left, 0), width - newWidth);
        let newTop = Math.min(Math.max(crop.top, 0), height - newHeight);

        return {
            ...crop,
            width: newWidth,
            height: newHeight,
            left: newLeft,
            top: newTop,
        };
    };

    useEffect(() => {
        const handleResize = () => {
            setCropData(prevCropData => {
                const newCropData = { ...prevCropData };
                Object.keys(imageBoundsMap).forEach(scale => {
                    const currentImage = imgRefs.current[scale];
                    if (!currentImage) return;

                    const updatedCrop = calculateCropByScale(scale, currentImage, newCropData);
                    if (updatedCrop) {
                        newCropData[scale] = updatedCrop;
                    }
                });
                return newCropData;
            });

            Object.keys(imageBoundsMap).forEach(scale => {
                const currentImage = imgRefs.current[scale];
                if (!currentImage) return;

                const { width, height } = currentImage.getBoundingClientRect();
                setImageBoundsMap(prev => ({
                    ...prev,
                    [scale]: { width, height, offsetX: 0, offsetY: 0 }
                }));
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [imageBoundsMap]);

    const handleMouseDown = (e: React.MouseEvent, scale: string, type: "move" | "resize") => {
        e.stopPropagation();
        const { left, top, width, height } = cropData[scale]

        if (type === "move") {
            setDragging(prev => ({ ...prev, [scale]: true }));
            setDragOffset(prev => ({
                ...prev,
                [scale]: {
                    x: e.clientX - left,
                    y: e.clientY - top
                }
            }));
        } else {
            setResizing(prev => ({ ...prev, [scale]: true }));
            setResizeStart(prev => ({
                ...prev,
                [scale]: {
                    mouseX: e.clientX,
                    mouseY: e.clientY,
                    width: width,
                    height: height
                }
            }));
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        selectedScales.forEach(scale => {
            const bounds = imageBoundsMap[scale];
            const crop = cropData[scale];
            const offset = dragOffset[scale];
            const start = resizeStart[scale];
            const ratio = scales[scale];
            if (!bounds || !crop) return;

            if (dragging[scale] && offset) {
                const newLeft = Math.max(bounds.offsetX, Math.min(e.clientX - offset.x, bounds.offsetX + bounds.width - crop.width));
                const newTop = Math.max(bounds.offsetY, Math.min(e.clientY - offset.y, bounds.offsetY + bounds.height - crop.height));
                setCropData(prev => ({
                    ...prev,
                    [scale]: { ...prev[scale], left: newLeft, top: newTop }
                }));
            }

            if (resizing[scale] && start) {
                let newWidth = start.width + (e.clientX - start.mouseX);
                let newHeight = newWidth / ratio;

                const maxWidth = bounds.width - (crop.left - bounds.offsetX);
                const maxHeight = bounds.height - (crop.top - bounds.offsetY);

                if (newWidth > maxWidth) {
                    newWidth = maxWidth;
                    newHeight = newWidth / ratio;
                }
                if (newHeight > maxHeight) {
                    newHeight = maxHeight;
                    newWidth = newHeight * ratio;
                }

                const minSize = 50;
                if (newWidth >= minSize && newHeight >= minSize) {
                    setCropData(prev => ({
                        ...prev,
                        [scale]: { ...prev[scale], width: newWidth, height: newHeight }
                    }));
                }
            }
        });
    };

    const handleMouseUp = () => {
        setDragging({});
        setResizing({});
    };

    return (
        <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {title && <h3>{title}</h3>}
            <div className="mb-2">
                <h6>Original Image</h6>
                <ImageEditorItem
                    img={{
                        src: getFileUrl(img),
                        alt: 'Original Image'
                    }}
                    file={{
                        value: originalFileName,
                        onChange: setOriginalFileName,
                        label: 'Original File Name'
                    }}
                />
            </div>
            <div className="mb-2">
                {Object.keys(scales).map((scale) => (
                    <Card key={scale}>
                        <Switch
                            name={scale}
                            label={scale}
                            value={selectedScales.includes(scale)}
                            onChange={(e) => {
                                setSelectedScales(prev =>
                                    e.target.checked
                                        ? [...prev, scale]
                                        : prev.filter(a => a !== scale)
                                );
                            }}
                        />
                        {selectedScales.includes(scale) && (
                            <ImageEditorItem
                                img={{
                                    src: getFileUrl(img),
                                    alt: `Crop ${scale}`,
                                    ref: el => imgRefs.current[scale] = el,
                                    onLoad: (e) => handleLoad(e, scale),
                                    post: <CropBox cropData={cropData} scale={scale} handleMouseDown={handleMouseDown} />
                                }}
                                file={{
                                    value: cropData[scale]?.fileName ?? img.fileName,
                                    scale: scale,
                                    onChange: fileName => setCropData(prev => ({ ...prev, [scale]: { ...prev[scale], fileName } })),
                                    label: `Nome file per ${scale}`
                                }}
                            />
                        )}
                    </Card>
                ))}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
});


const CropBox = ({
    cropData,
    scale,
    handleMouseDown
}: {
    cropData: Record<string, CropProps>;
    scale: string;
    handleMouseDown: (e: React.MouseEvent, scale: string, type: 'move' | 'resize') => void;
}) => {
    return (
        <>
            {cropData[scale] && (
                <div
                    onMouseDown={(e) => handleMouseDown(e, scale, "move")}
                    className="position-absolute"
                    style={{
                        top: cropData[scale].top,
                        left: cropData[scale].left,
                        width: cropData[scale].width,
                        height: cropData[scale].height,
                        border: "2px dashed rgba(0, 0, 0, 0.8)",
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        cursor: "move",
                    }}
                >
                    <div
                        onMouseDown={(e) => handleMouseDown(e, scale, "resize")}
                        className="position-absolute bottom-0 end-0"
                        style={{
                            width: 15,
                            height: 15,
                            backgroundColor: "rgba(0,0,0,0.8)",
                            cursor: "nwse-resize",
                        }}
                    />
                </div>
            )}
        </>
    )
}


interface ImageEditorItemProps {
    img: {
        src: string;
        alt: string;
        ref?: React.LegacyRef<HTMLImageElement>;
        onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
        post?: React.ReactNode;
    };
    file: {
        value: string;
        scale?: string;
        onChange: (newName: string) => void;
        label?: string;
    };
}

const ImageEditorItem = ({
    img,
    file
}: ImageEditorItemProps) => {
    return (<>
        <div className="position-relative">
            <img
                src={img.src}
                alt={img.alt}
                ref={img.ref}
                onLoad={img.onLoad}
                className="position-relative img-fluid"
                draggable={false}
            />
            {img.post}
        </div>
        <FileNameEditor {...file} />
    </>)
}


interface FileNameEditorProps {
    value: string;
    onChange: (newName: string) => void;
    scale?: string;
    label?: string;
}

export const FileNameEditor = ({
    value,
    onChange,
    label = undefined,
    scale = undefined,
}: FileNameEditorProps) => {

    const ext = value?.split('.').pop() ?? "";

    const scaleSuffix = scale && `_${scale.replace(":", "x")}`;

    const stripFileName = (fullName: string): string => {
        const base = fullName.replace(/\.[^/.]+$/, "");
        if (!scaleSuffix) return base;
        return base.endsWith(scaleSuffix)
            ? base.slice(0, -scaleSuffix.length)
            : base;
    };

    const inputValue = stripFileName(value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const baseName = e.target.value.trim();
        onChange(`${baseName}${scaleSuffix ?? ''}.${ext}`);
    };

    return (
        <String
            name="fileName"
            label={label}
            value={inputValue}
            onChange={handleChange}
            post={scale}
        />
    );
};
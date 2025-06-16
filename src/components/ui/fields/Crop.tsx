import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Card from "../Card";
import { String, Switch } from "./Input";


const aspectRatios: Record<string, number> = {
    "1:1": 1 / 1,
    "3:4": 3 / 4,
    "4:3": 4 / 3,
};

interface CropData {
    scale: string;
    top: number;
    left: number;
    width: number;
    height: number;
}

type ImageData = {
    fileName: string;
    url: string;
};

interface PreviewImage {
    original: ImageData;
    crops: Record<string, ImageData>;
    cropData?: Record<string, CropData>;
    progress: number;
}

type ImageBounds = { width: number; height: number; offsetX: number; offsetY: number };

export const CropImage = forwardRef(({img} : { img: PreviewImage }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRefs = useRef<Record<string, HTMLImageElement | null>>({});
    const [imageBoundsMap, setImageBoundsMap] = useState<Record<string, ImageBounds>>({});

    useImperativeHandle(ref, () => ({
        triggerSave: () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;

            const crops: Record<string, ImageData> = {};
            const cropDetails: Record<string, CropData> = {};

            for (const aspect of selectedAspects) {
                const img = imgRefs.current[aspect];
                const bounds = imageBoundsMap[aspect];
                const data = cropData[aspect];
                if (!img || !bounds || !data) return;

                const scale = img.naturalWidth / bounds.width;
                const { top, left, width, height } = data;
                canvas.width = width;
                canvas.height = height;

                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(
                    img,
                    (left - bounds.offsetX) * scale,
                    (top - bounds.offsetY) * scale,
                    width * scale,
                    height * scale,
                    0, 0, width, height);

                const crop = {
                    fileName: fileNames[aspect],
                    url: canvas.toDataURL("image/jpeg")
                };
                crops[aspect] = crop;
                cropDetails[aspect] = data;
            }

            return { originalFileName, crops, cropDetails };
        }
    }));

    const [selectedAspects, setSelectedAspects] = useState<string[]>(() => Object.keys(img.cropData ?? aspectRatios).filter(k => k !== "original"));

    const [originalFileName, setOriginalFileName] = useState<string>(img.original.fileName)
    const [fileNames, setFileNames] = useState<Record<string, string>>(
        Object.fromEntries(
            Object.entries(img.crops).map(([scale, data]) => [scale, data.fileName])
        )
    );

    const [cropData, setCropData] = useState<Record<string, CropData>>(() =>
        Object.fromEntries(
            Object.keys(aspectRatios).map(scale => [
                scale,
                img.cropData?.[scale] ?? {
                    scale,
                    top: 50,
                    left: 50,
                    width: 100,
                    height: 100
                },
            ])
        )
    );

    const [dragging, setDragging] = useState<{ [aspect: string]: boolean }>({});
    const [resizing, setResizing] = useState<{ [aspect: string]: boolean }>({});
    const [dragOffset, setDragOffset] = useState<{ [aspect: string]: { x: number, y: number } }>({});
    const [resizeStart, setResizeStart] = useState<{ [aspect: string]: { mouseX: number, mouseY: number, width: number, height: number } }>({});

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>, scale: string) => {
        const img = e.currentTarget;

        setImageBoundsMap(prev => ({
            ...prev,
            [scale]: { width: img.width, height: img.height, offsetX: 0, offsetY: 0 }
        }));

        setCropData(prev => {
            if (prev[scale]) return prev; 

            const ratio = aspectRatios[scale];
            const maxWidth = Math.min(img.width, img.height * ratio);
            const maxHeight = Math.min(img.height, img.width / ratio);

            return {
                ...prev,
                [scale]: {
                    scale,
                    top: (img.height - maxHeight) / 2,
                    left: (img.width - maxWidth) / 2,
                    width: maxWidth,
                    height: maxHeight,
                }
            };
        });
    };

    const calculateCropForAspect = (
        scale: string,
        img: HTMLImageElement,
        cropDataState: Record<string, CropData>
    ): CropData | null => {
        const { width, height } = img.getBoundingClientRect();
        const ratio = aspectRatios[scale];
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
                    const img = imgRefs.current[scale];
                    if (!img) return;

                    const updatedCrop = calculateCropForAspect(scale, img, newCropData);
                    if (updatedCrop) {
                        newCropData[scale] = updatedCrop;
                    }
                });
                return newCropData;
            });

            Object.keys(imageBoundsMap).forEach(scale => {
                const img = imgRefs.current[scale];
                if (!img) return;

                const { width, height } = img.getBoundingClientRect();
                setImageBoundsMap(prev => ({
                    ...prev,
                    [scale]: { width, height, offsetX: 0, offsetY: 0 }
                }));
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [imageBoundsMap]);

    useEffect(() => {
        setCropData(prev => Object.fromEntries(selectedAspects.map(a => [a, prev[a]])));
        setFileNames(prev => Object.fromEntries(selectedAspects.map(a => [a, prev[a] ?? a])));
    }, [img.original.url, selectedAspects]);

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
        selectedAspects.forEach(scale => {
            const bounds = imageBoundsMap[scale];
            const crop = cropData[scale];
            const offset = dragOffset[scale];
            const start = resizeStart[scale];
            const ratio = aspectRatios[scale];
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
            <h3>Crop Image</h3>
            <div className="mb-2">
                <h6>Original Image</h6>
                <ImageEditorItem
                    img={{
                        src: img.original.url,
                        alt: 'Original Image'
                    }}
                    file={{
                        value: originalFileName,
                        originalFileName: img.original.fileName,
                        onChange: newName => setOriginalFileName(newName),
                    }}
                />
            </div>
            <div className="mb-2">
                {Object.keys(aspectRatios).map((scale) => (
                    <Card key={scale}>
                        <Switch
                            name={scale}
                            label={scale}
                            value={selectedAspects.includes(scale)}
                            onChange={(e) => {
                                setSelectedAspects(prev =>
                                    e.target.checked
                                        ? [...prev, scale]
                                        : prev.filter(a => a !== scale)
                                );
                            }}
                        />
                        {selectedAspects.includes(scale) && (
                            <ImageEditorItem
                                img={{
                                    src: img.original.url,
                                    alt: `Crop ${scale}`,
                                    ref: el => imgRefs.current[scale] = el,
                                    onLoad: (e) => handleLoad(e, scale),
                                    post: (
                                        <CropBox
                                            cropData={cropData}
                                            scale={scale}
                                            handleMouseDown={handleMouseDown}
                                        />
                                    )
                                }}
                                file={{
                                    value: fileNames[scale],
                                    originalFileName: img.original.fileName,
                                    scale: scale,
                                    onChange: newName => setFileNames(prev => ({ ...prev, [scale]: newName })),
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


/* ------------------------ Riquadro Crop ---------------------- */

const CropBox = ({
    cropData,
    scale,
    handleMouseDown
}: {
    cropData: Record<string, CropData>;
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

/* ------------------------------------- */

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
        originalFileName: string;
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


/* --------------------------------------- */

interface FileNameEditorProps {
    value: string;
    onChange: (newName: string) => void;
    originalFileName?: string;
    scale?: string;
    label?: string;
}

export const FileNameEditor = ({
    value,
    onChange,
    originalFileName = undefined,
    scale = undefined,
    label = "File name",
}: FileNameEditorProps) => {

    const ext = originalFileName?.split('.').pop()
        ?? value?.split('.').pop()
        ?? "";

    const scaleSuffix = scale && `_${scale.replace(":", "x")}`;

    const stripFileName = (fullName: string): string => {
        const base = fullName.replace(/\.[^/.]+$/, "");
        if (!scaleSuffix) return base;
        return base.endsWith(scaleSuffix)
            ? base.slice(0, -scaleSuffix.length)
            : base;
    };

    const inputValue = stripFileName(value || originalFileName || "");

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
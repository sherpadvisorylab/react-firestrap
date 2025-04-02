import React, {useRef, useEffect, useCallback, useState} from 'react';
import TuiImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import Modal from "./Modal";
import {useTheme} from "../Theme";
import {LoadingButton} from "./Buttons";

type ImageEditorProps = {
    imageUrl: string;
    title?: string;
    width?: number;
    height?: number;
    modal?: boolean;
    onImageLoad?: () => void;
    onClose?: () => void;
    onSave?: (dataUrl: string) => void;
};

type DrawingMode =
    | 'ZOOMIN'
    | 'ZOOMOUT'
    | 'UNDO'
    | 'REDO'
    | 'CROPPER'
    | 'FLIPX'
    | 'FLIPY'
    | 'ROTATE'
    | 'FREE_DRAWING'
    | 'LINE_DRAWING'
    | 'TEXT'
    | 'circle'
    | 'rect'
    | 'triangle';

type LineDrawingOptions = {
    width?: number;
    color?: string;
    arrowType?: {
        tail?: string;
        head?: string;
    };
};

const ImageEditor = ({
                         imageUrl,
                         title          = undefined,
                         width          = 700,
                         height         = 500,
                         modal          = false,
                         onImageLoad    = undefined,
                         onClose        = undefined,
                         onSave         = undefined
}: ImageEditorProps) => {
    const theme = useTheme("editor");
    const rootEl = useRef<HTMLDivElement | null>(null);
    const imageEditorInst = useRef<InstanceType<typeof TuiImageEditor> | null>(null);
    const objStyle = {
        width: 10,
        color: 'rgba(255,0,0,0.5)',
        fill: 'transparent'
    }

    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });


    useEffect(() => {
        if (!rootEl.current) return;

        const editor = new TuiImageEditor(rootEl.current, {
            cssMaxWidth: width,
            cssMaxHeight: height,
            selectionStyle: {
                cornerSize: 10,
                rotatingPointOffset: 70,
                cornerColor: 'white',
                cornerStrokeColor: 'red',
                borderColor: 'red',
            },
        });

        imageEditorInst.current = editor;

        editor.on('objectAdded', (obj) => {
            console.log('objectAdded', obj);
            editor.stopDrawingMode();
        });

        editor.on('addText', (pos) => {
            editor.stopDrawingMode();
            editor.addText('init text', {
                styles: {
                    fill: '#FF0000',
                    fontSize: 30,
                    fontWeight: 'bold',
                },
                position: {
                    x: pos.originPosition.x,
                    y: pos.originPosition.y,
                },
            });
        });

        return () => {
            editor.destroy();
            imageEditorInst.current = null;
        };
    }, [width, height]);


    const loadImage = useCallback(() => {
        const editor = imageEditorInst.current;
        if (!imageUrl || !editor) return;

        editor.loadImageFromURL(imageUrl, 'Sample Image')
            .then(() => {
                onImageLoad?.();
                editor.clearUndoStack();
                editor.clearRedoStack();
            })
            .catch((err) => {
                console.error('Error loading image:', err);
            });
    }, [imageUrl, onImageLoad]);

    useEffect(() => {
        loadImage();
    }, [loadImage]);


    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);


    const handleStartDrawingMode = (e: React.MouseEvent<HTMLButtonElement>, mode: DrawingMode) => {
        e.preventDefault();

        const editor = imageEditorInst.current;
        if (!editor) return;

        const maxZoom = 3;
        const minZoom = 1;

        switch (mode) {
            // 🔍 Zoom controls
            case 'ZOOMIN':
                if (zoom < maxZoom) setZoom((prev) => prev * 1.2);
                break;

            case 'ZOOMOUT':
                if (zoom > minZoom) setZoom((prev) => Math.max(prev * 0.8, minZoom));
                break;

            // 🔁 History controls
            case 'UNDO':
                if (!editor.isEmptyUndoStack()) editor.undo();
                break;
            case 'REDO':
                if (!editor.isEmptyRedoStack()) editor.redo();
                break;

            // 🔄 Transform controls
            case 'FLIPX':
                editor.flipX();
                break;
            case 'FLIPY':
                editor.flipY();
                break;
            case 'ROTATE':
                editor.rotate(90);
                break;

            // ✂️ Crop
            case 'CROPPER':
                editor.startDrawingMode(mode);
                break;

            // ✏️ Free drawing
            case 'FREE_DRAWING':
                editor.startDrawingMode(mode, {
                    width: objStyle.width,
                    color: objStyle.color,
                });
                break;

            // ➖ Line drawing
            case 'LINE_DRAWING':
                editor.startDrawingMode(mode, {
                    width: objStyle.width,
                    color: objStyle.color,
                    arrowType: {
                        tail: 'chevron',
                    },
                } as LineDrawingOptions);
                break;

            // 🔤 Text
            case 'TEXT':
                editor.startDrawingMode(mode);
                break;

            // 🟠🟦🔺 Shapes
            case 'circle':
            case 'rect':
            case 'triangle':
                editor.setDrawingShape(mode, {
                    fill: objStyle.fill,
                    stroke: objStyle.color,
                    strokeWidth: 3,
                });
                editor.startDrawingMode('SHAPE');
                break;

            default:
                break;
        }
    };

    const handleSave = async () => {
        const editor = imageEditorInst.current;
        if (!editor) return;

        await onSave?.(editor.toDataURL());

        document.body.style.overflow = '';
    };

    const handleClose = () => {
        document.body.style.overflow = '';
        onClose?.();
    }

    window.document.body.style.overflow = 'hidden';
    const Controls = <div className={"d-flex border-bottom"}>
        <div className={"border-end"}>
            <button className={"btn"} title="Undo" onClick={(e) => handleStartDrawingMode(e, 'UNDO')}>
                <i className={theme.getIcon("arrow-arc-left")}></i>
            </button>
            <button className={"btn"} title="Redo" onClick={(e) => handleStartDrawingMode(e, 'REDO')}>
                <i className={theme.getIcon("arrow-arc-right")}></i>
            </button>
            <button className={"btn"} title="Zoom In" onClick={(e) => handleStartDrawingMode(e, 'ZOOMIN')}>
                <i className={theme.getIcon("magnifying-glass-minus")}></i>
            </button>
            <button className={"btn"} title="Zoom Out" onClick={(e) => handleStartDrawingMode(e, 'ZOOMOUT')}>
                <i className={theme.getIcon("magnifying-glass-plus")}></i>
            </button>
        </div>
        <div className={"border-end"}>
            <button className={"btn"} title="Crop" onClick={(e) => handleStartDrawingMode(e, 'CROPPER')}>
                <i className={theme.getIcon("crop")}></i>
            </button>
            <button className={"btn"} title="Flip X" onClick={(e) => handleStartDrawingMode(e, 'FLIPX')}>
                <i className={theme.getIcon("arrow-line-right")}></i>
            </button>
            <button className={"btn"} title="Flip Y" onClick={(e) => handleStartDrawingMode(e, 'FLIPY')}>
                <i className={theme.getIcon("arrow-line-down")}></i>
            </button>
            <button className={"btn"} title="Rotate" onClick={(e) => handleStartDrawingMode(e, 'ROTATE')}>
                <i className={theme.getIcon("camera-rotate")}></i>
            </button>
        </div>
        <div className={"border-end"}>
            <button className={"btn"} title="Free Drawing" onClick={(e) => handleStartDrawingMode(e, 'FREE_DRAWING')}>
                <i className={theme.getIcon("pencil")}></i>
            </button>
            <button className={"btn"} title="Line" onClick={(e) => handleStartDrawingMode(e, 'LINE_DRAWING')}>
                <i className={theme.getIcon("arrow-right")}></i>
            </button>
            <button className={"btn"} title="Text" onClick={(e) => handleStartDrawingMode(e, 'TEXT')}>
                <i className={theme.getIcon("text-t")}></i>
            </button>
            <button className={"btn"} title="Rect" onClick={(e) => handleStartDrawingMode(e, 'rect')}>
                <i className={theme.getIcon("rectangle")}></i>
            </button>
            <button className={"btn"} title="Circle" onClick={(e) => handleStartDrawingMode(e, 'circle')}>
                <i className={theme.getIcon("circle")}></i>
            </button>
            <button className={"btn"} title="Triangle" onClick={(e) => handleStartDrawingMode(e, 'triangle')}>
                <i className={theme.getIcon("triangle")}></i>
            </button>
        </div>
        {onSave && <div className={"ms-auto"}>
            <LoadingButton className={"btn-primary"} onClick={handleSave} icon={"floppy-disk"} label={"Save"} />
        </div>}
    </div>;

    const Editor = <div
        onMouseDown={handleMouseDown}
        style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            display: 'inline-block',
            userSelect: 'none',
        }}
    >
        <div ref={rootEl} className={"d-flex align-items-center justify-content-center"}
             style={{width: '100%', height: height + 'px'}}/>
    </div>;


    return (modal
            ? <Modal
                size={"xl"}
                title={title || "Image Editor"}
                header={Controls}
                modalClass={"bg-secondary"}
                onClose={handleClose}
                footer={false}
            >
                {Editor}
            </Modal>
            : <>{Controls}{Editor}</>
    );
};

export default ImageEditor;

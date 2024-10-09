import React, { useRef, useEffect, useCallback } from 'react';
import TuiImageEditor from 'tui-image-editor';
import 'tui-image-editor/dist/tui-image-editor.css';
import Modal from "./Modal";
import {useTheme} from "../Theme";
import {LoadingButton} from "./Buttons";

const ImageEditor = ({
                         title = null,
                         imageUrl,
                         width = 700,
                         height = 500,
                         modal = false,
                         onImageLoad,
                         onClose =  () => {},
                         onSave = () => {}
                     }: {
    imageUrl: string,
    width?: number,
    height?: number,
    modal?: boolean,
    onImageLoad?: () => void,
    onClose?: () => void,
    onSave?: (dataUrl: string) => void,
}) => {
    const theme = useTheme("editor");
    const rootEl = useRef(null);
    const imageEditorInst = useRef(null);
    const objStyle = {
        width: 10,
        color: 'rgba(255,0,0,0.5)',
        fill: 'transparent'
    }

    useEffect(() => {
        imageEditorInst.current = new TuiImageEditor(rootEl.current, {
            width,
            height,
            selectionStyle: {
                cornerSize: 10,
                rotatingPointOffset: 70,
                cornerColor: 'white',
                cornerStrokeColor: 'red',
                borderColor: 'red'
            }
        });

        imageEditorInst.current.on('objectAdded', (obj) => {
            console.log('objectAdded', obj);
            imageEditorInst.current.stopDrawingMode();
        });
        imageEditorInst.current.on('addText', (pos) => {
            imageEditorInst.current.stopDrawingMode();
            imageEditorInst.current.addText('init text', {
                styles: {
                    fill: '#FF0000',
                    fontSize: 30,
                    fontWeight: 'bold'
                },
                position: {
                    x: pos.originPosition.x,
                    y: pos.originPosition.y
                }
            });
        });

        return () => {
            if (imageEditorInst.current) {
                imageEditorInst.current.destroy();
                imageEditorInst.current = null;
            }
        };
    }, [width, height]);

    const loadImage = useCallback(() => {
        if (imageUrl && imageEditorInst.current) {
            imageEditorInst.current.loadImageFromURL(imageUrl, 'Sample Image')
                .then(() => {
                    if (onImageLoad) {
                        onImageLoad();
                    }
                    imageEditorInst.current.clearUndoStack();
                    imageEditorInst.current.clearRedoStack();
                })
                .catch((err) => {
                    console.error('Error loading image:', err);
                });
        }
    }, [imageUrl, onImageLoad]);

    useEffect(() => {
        loadImage();
    }, [loadImage]);

    const handleStartDrawingMode = (e, mode) => {
        e.preventDefault();

        if (imageEditorInst.current) {
            switch (mode) {
                case 'ZOOMIN':
                    const currentZoomIn = imageEditorInst.current.getZoom();
                    const maxZoom = 3; // Ad esempio, massimo 3x zoom

                    if (currentZoomIn < maxZoom) {
                        imageEditorInst.current.zoom(currentZoomIn * 1.2); // Aumenta il livello di zoom
                    }
                    break;
                case 'ZOOMOUT':
                    const currentZoomOut = imageEditorInst.current.getZoom();
                    const minZoom = 0.1; // Ad esempio, minimo 0.1x zoom

                    if (currentZoomOut > minZoom) {
                        imageEditorInst.current.zoom(currentZoomOut * 0.8); // Riduci il livello di zoom
                    }
                    break;
                case 'UNDO':
                    if (!imageEditorInst.current.isEmptyUndoStack()) {
                        imageEditorInst.current.undo();
                    }
                    break;
                case 'REDO':
                    if (!imageEditorInst.current.isEmptyRedoStack()) {
                        imageEditorInst.current.redo();
                    }
                    break;
                case 'CROPPER':
                    imageEditorInst.current.startDrawingMode(mode);
                    break;
                case 'FLIPX':
                    imageEditorInst.current.flipX()
                    break;
                case 'FLIPY':
                    imageEditorInst.current.flipY();
                    break;
                case 'ROTATE':
                    imageEditorInst.current.rotate(90);
                    break;
                case 'FREE_DRAWING':
                    imageEditorInst.current.startDrawingMode(mode, {
                        width: objStyle.width,
                        color: objStyle.color
                    });
                    break;
                case 'LINE_DRAWING':
                    imageEditorInst.current.startDrawingMode(mode, {
                        width: objStyle.width,
                        color: objStyle.color,
                        arrowType: {
                            tail: 'chevron' // triangle
                        }
                    });
                    break;
                case 'TEXT':
                    imageEditorInst.current.startDrawingMode(mode);
                    break;
                case 'circle':
                case 'rect':
                case 'triangle':
                    imageEditorInst.current.setDrawingShape(mode, {
                        fill: objStyle.fill,
                        stroke: objStyle.color,
                        strokeWidth: 3,
                    });
                    imageEditorInst.current.startDrawingMode('SHAPE');
                    break;
                default:
                    break;
            }

        }
    };
    const handleSave = async () => {
        onSave && await onSave(imageEditorInst.current.toDataURL());
        window.document.body.style = '';
    };
    const handleClose = () => {
        window.document.body.style = '';
        onClose && onClose();
    }
    window.document.body.style = 'overflow: hidden';
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
    const Editor = <div ref={rootEl} className={"d-flex align-items-center justify-content-center"}
                        style={{width: '100%', height: height + 'px'}}/>;


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
            : Controls + Editor
    );
};

export default ImageEditor;

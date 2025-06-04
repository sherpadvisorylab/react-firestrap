import React, { useRef, useState } from "react";
import { PLACEHOLDER_IMAGE } from "../../../Theme";
import Modal from "../Modal";
import { ActionButton } from "../Buttons";
import Badge from "../Badge";
import Table from "../Table";
import Percentage from "../Percentage";
import { CropImage, FileNameEditor } from "./Crop";
import { Label } from "./Input";
import { Wrapper } from "../GridSystem";


/* ------------------------ Pulsanti modifica ed eliminazione ---------------------- */

interface EditDeleteButtonsProps {
    editAction: () => void;
    deleteAction: () => void;
    editable?: boolean;
}
const EditDeleteButtons = ({
    editAction,
    deleteAction,
    editable = false
}: EditDeleteButtonsProps) => {
    return (
        <>
            {editable && <ActionButton onClick={editAction} icon='pencil' className="border-0 text-primary" />}
            <ActionButton onClick={deleteAction} icon='x' className="border-0 text-primary" />
        </>
    )
}

/* ------------------------ Pulsante e input aggiunta elementi ---------------------- */

type FileOrPreview = DocumentFile | PreviewImage;

interface FileInputProps {
    multiple?: boolean;
    elements: FileOrPreview[];
    triggerUpload: () => void;
    accept: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    heightButton?: number;
    widthButton?: number;
}

const FileInput = ({
    multiple = false,
    elements,
    triggerUpload,
    accept,
    fileInputRef,
    handleFileChange,
    heightButton = 100,
    widthButton = 100
}: FileInputProps) => {
    const max = multiple ? 100 : 1;
    return (
        <>
            {elements.length < max && <ActionButton
                label={<img width={widthButton} height={heightButton} src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHBhdGggZD0iTTQgMTVWMThIMjBWMTUiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4NCjxwYXRoIGQ9Ik0xMiA2TDEyIDE0IiBzdHJva2U9IiMzMzMzMzMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8cGF0aCBkPSJNMTIgNkwxNSA4LjUiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4NCjxwYXRoIGQ9Ik0xMiA2TDkgOC41IiBzdHJva2U9IiMzMzMzMzMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8L3N2Zz4=" />}
                onClick={triggerUpload}
                className="p-0"
            />}

            <input
                type="file"
                accept={accept}
                ref={fileInputRef}
                multiple={multiple}
                className="d-none"
                onChange={handleFileChange}
            />
        </>
    );
};


/* ------------------------ Modale modifica ---------------------- */

interface EditFileModalProps {
    title: string;
    file: DocumentFile | PreviewImage;
    type: 'img' | 'document';
    onSave: (
        fileName: string,
        crops?: Record<string, ImageData>,
        cropDetails?: Record<string, CropData>,
    ) => void;
    onClose: () => void;
}

const EditFileModal = ({
    title = 'Editor',
    file,
    type,
    onSave = () => { },
    onClose = () => { }
}: EditFileModalProps) => {

    const [fileName, setFileName] = useState(() =>
        'original' in file ? file.original.fileName : file.fileName
    );

    // Ref per accedere ai metodi esposti dal componente CropImage
    const cropRef = useRef<{
        triggerSave: () => {
            originalFileName: string;
            crops: Record<string, ImageData>;
            cropDetails: Record<string, CropData>;
        };
    }>(null);

    const handleSave = async () => {
        if (cropRef.current) {
            const { originalFileName, crops, cropDetails } = cropRef.current.triggerSave();
            onSave?.(originalFileName, crops, cropDetails);
        } else {
            onSave?.(fileName);
        }
    };

    return (
        <Modal
            title={title}
            onSave={handleSave}
            onClose={onClose}
            size="fullscreen"
        >
            {type === 'document' &&
                <FileNameEditor
                    value={fileName}
                    onChange={setFileName} />}

            {'original' in file && type === 'img' &&
                <CropImage
                    ref={cropRef}
                    img={file}
                />
            }
        </Modal>
    )
}


/* ------------------------ Caricamento documenti ---------------------- */

export interface UploadDocumentProps {
    name: string;
    value?: string;
    onChange?: (e: { target: { name: string; value: DocumentFile[] } }) => void;
    label?: string;
    required?: boolean;
    editable?: boolean;
    multiple?: boolean;
    className?: string;
    accept?: string;
}

type DocumentFile = {
    key: string;
    fileName: string;
    size: number;
    type: string;
    progress: number;
}

export const UploadDocument = ({
    name,
    value       = undefined,
    onChange    = undefined,
    label       = undefined,
    required    = false,
    editable    = false,
    multiple    = false,
    className   = undefined,
    accept      = ".pdf,.doc,.docx,.txt,.iso",
}: UploadDocumentProps) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<DocumentFile[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);

        selectedFiles.forEach(file => {
            const fileKey = `${file.name}-${file.size}-${file.lastModified}`;

            const isDuplicate = files.some(f => f.key === fileKey);
            if (isDuplicate) return;

            const newFile: DocumentFile = {
                key: fileKey,
                fileName: file.name,
                size: file.size,
                type: file.type,
                progress: 0,
            };

            setFiles(prev => [...prev, newFile]);

            const updateProgress = (percent: number) => {
                setFiles(prev =>
                    prev.map(f =>
                        f.key === fileKey ? { ...f, progress: percent } : f
                    )
                );
            };

            const reader = new FileReader();

            reader.onprogress = e => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    updateProgress(percent);
                }
            };

            reader.onloadend = () => {
                updateProgress(99);
                setTimeout(() => updateProgress(100), 500);
            };

            reader.readAsArrayBuffer(file);
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerUpload = () => fileInputRef.current?.click();

    const handleRemove = (index: number) => setFiles(files.filter((_, i) => i !== index));

    const handleFileRename = (newName: string) => {
        if (editingIndex === null) return;

        const updatedFiles = files.map((file, i) =>
            i === editingIndex ? { ...file, fileName: newName } : file
        );

        setFiles(updatedFiles);
        setEditingIndex(null);
    };

    return (
        <div className={className}>
            {label && <Label label={label} required={required} />}

            <Table
                header={[
                    { label: 'Name', key: 'name' },
                    { label: 'Kilobyte', key: 'kilobyte' },
                    { label: 'Actions', key: 'actions' }
                ]}
                body={files.map((file, i) => ({
                    name: file.fileName,
                    kilobyte: (
                        file.progress === 100 
                        ? (file.size / 1024).toFixed(2) + ' KB' 
                        : <Percentage max={100} min={0} val={file.progress} shape="bar" />
                    ),
                    actions: (
                        <EditDeleteButtons
                            editAction={() => setEditingIndex(i)}
                            deleteAction={() => handleRemove(i)}
                            editable={editable}
                        />
                    )
                }))}
            />

            <FileInput
                multiple={multiple}
                elements={files}
                triggerUpload={triggerUpload}
                accept={accept}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
            />

            {editable && editingIndex !== null && (
                <EditFileModal
                    title="Editor Document"
                    file={files[editingIndex]}
                    type="document"
                    onSave={(result) => handleFileRename(result)}
                    onClose={() => setEditingIndex(null)}
                />
            )}
        </div>
    );
};


/* ------------------------ Caricamento immagini ---------------------- */

export interface UploadImageProps {
    name: string;
    value?: string;
    onChange?: (e: { target: { name: string; value: File[] } }) => void;
    label?: string;
    editable?: boolean;
    multiple?: boolean;
    extensions?: string[];
    required?: boolean;
    className?: string;
    addButtonPosition?: "left" | "right";
    previewHeight?: number;
    previewWidth?: number;
}

type ImageData = {
    fileName: string;
    url: string;
};

interface CropData {
    scale: string;
    top: number;
    left: number;
    width: number;
    height: number;
}

interface PreviewImage {
    original: ImageData;
    crops: Record<string, ImageData>;
    cropData?: Record<string, CropData>;
    progress: number;
}

export const UploadImage = ({
    name,
    value       = undefined,
    onChange    = undefined,
    label       = undefined,
    editable    = false,
    multiple    = false,
    extensions  = undefined,
    required    = false,
    className   = undefined,
    addButtonPosition = "left",
    previewHeight = 100,
    previewWidth = 100
}: UploadImageProps) => {

    const fileInputRef = useRef<HTMLInputElement | null>(null); // riferimento all'input file
    const [previews, setPreviews] = useState<PreviewImage[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null); // img selezionata

    // gestione caricamento imgs
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);

        selectedFiles.forEach((file) => {
            const newImage: PreviewImage = {
                original: {
                    fileName: file.name,
                    url: ''
                },
                crops: {},
                cropData: {},
                progress: 0
            };

            setPreviews(prev => [...prev, newImage]);

            const reader = new FileReader();

            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setPreviews(prev =>
                        prev.map(img =>
                            img.original.fileName === file.name
                                ? { ...img, progress: percent }
                                : img
                        )
                    );
                }
            };

            reader.onloadend = () => {
                const url = URL.createObjectURL(file);
                setPreviews(prev =>
                    prev.map(img =>
                        img.original.fileName === file.name
                            ? { ...img, original: { ...img.original, url: url }, crops: {}, progress: 100 }
                            : img
                    )
                );

                if (fileInputRef.current) fileInputRef.current.value = "";
            };

            reader.readAsDataURL(file);
        });
    };

    const triggerUpload = () => fileInputRef.current?.click();

    const handleRemove = (index: number) => setPreviews(prev => prev.filter((_, i) => i !== index));

    // salva modifiche crop e nome file
    const handleSave = (
        fileName: string,
        crops?: Record<string, ImageData>,
        cropDetails?: Record<string, CropData>,
    ) => {
        if (editingIndex === null) return;

        setPreviews(prev => prev.map((img, i) =>
            i === editingIndex
                ? {
                    ...img,
                    original: {
                        ...img.original,
                        fileName: fileName || img.original.fileName,
                    },
                    crops: crops ?? {},
                    cropData: cropDetails ?? {},
                }
                : img
        ));
        setEditingIndex(null);
    };

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const fileInput = <FileInput
        multiple={multiple}
        elements={previews}
        triggerUpload={triggerUpload}
        accept={extensions && extensions.length > 0
            ? extensions.map(ext => (ext.startsWith('.') ? ext : '.' + ext)).join(',')
            : "image/*"
        }
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        heightButton={previewHeight}
        widthButton={previewWidth}
    />  
    return (
        <Wrapper className={className}>
            {label && <Label label={label} required={required} />}
            {/* anteprime */}
            <div className="d-flex gap-2 flex-wrap">
                {addButtonPosition === "left" && fileInput}
                {previews.map((img, i) => (
                    <div
                        key={i}
                        className="position-relative overflow-hidden"
                        style={{ width: previewHeight, height: previewWidth }}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {img.progress === 100 ? (
                            <>
                                {/* anteprima img */}
                                <img
                                    src={img.original.url}
                                    alt={`preview-${i}`}
                                    className="img-thumbnail"
                                />

                                {/* badge */}
                                {editable && Object.keys(img.crops) &&
                                    <div className="position-absolute bottom-0 start-0 w-100 p-1 d-flex align-items-center justify-content-between">
                                        {Object.keys(img.crops)
                                            .map((scale) => (
                                                <Badge key={scale}>{scale}</Badge>
                                            ))
                                        }
                                    </div>
                                }
                                {/* pulsanti modifica/elimina */}
                                <div className="actions position-absolute top-0 start-0 w-100 justify-content-end" style={{ display: hoveredIndex === i ? "flex" : "none" }}>
                                    <EditDeleteButtons editAction={() => setEditingIndex(i)} deleteAction={() => handleRemove(i)} editable={editable} />
                                </div>
                            </>
                        ) : (
                            <Percentage max={100} min={0} val={img.progress} shape="bar" />
                        )}
                    </div>
                ))}
                {addButtonPosition === "right" && fileInput}
                {/* aggiunta immagini */}
                
            </div>

            {/* modale modifica */}
            {editable && editingIndex !== null &&
                <EditFileModal
                    title="Editor Document"
                    file={previews[editingIndex]}
                    type="img"
                    onSave={(fileName, crops, cropDetails) => handleSave(fileName, crops, cropDetails)}
                    onClose={() => setEditingIndex(null)}
                />
            }
        </Wrapper>
    );
};

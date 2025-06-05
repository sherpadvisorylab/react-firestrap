import React, { useRef, useState } from "react";
import { PLACEHOLDER_IMAGE } from "../../../Theme";
import Modal from "../Modal";
import { ActionButton } from "../Buttons";
import Badge from "../Badge";
import Table from "../Table";
import Percentage from "../Percentage";
import { CropImage, FileNameEditor } from "./Crop";


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

interface AddFileInputProps {
    multiple?: boolean;
    elements: FileOrPreview[];
    triggerUpload: () => void;
    accept: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    heightButton?: number;
    widthButton?: number;
}

const AddFileInput = ({
    multiple = false,
    elements,
    triggerUpload,
    accept,
    fileInputRef,
    handleFileChange,
    heightButton = 100,
    widthButton = 100
}: AddFileInputProps) => {
    const max = multiple ? 100 : 1;
    return (
        <>
            {elements.length < max && <ActionButton
                label={<img width={widthButton} height={heightButton} src={PLACEHOLDER_IMAGE} />}
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

    const handleSave = () => {
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
            onSave={async () => { handleSave() }}
            onDelete={async () => { onClose() }}
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
    onChange?: (e: { target: { name: string; value: DocumentFile[] } }) => void;
    label?: string;
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
    onChange,
    label,
    editable = false,
    multiple = false,
    className,
    accept = ".pdf,.doc,.docx,.txt,.iso",
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
            {label && <label>{label}</label>}

            <Table
                header={[
                    { label: 'Name', key: 'name' },
                    { label: 'Kilobyte', key: 'kilobyte' },
                    { label: 'Actions', key: 'actions' }
                ]}
                body={files.map((file, i) => ({
                    name: file.fileName,
                    kilobyte: (file.progress === 100 ? (file.size / 1024).toFixed(2) + ' KB' : <Percentage max={100} min={0} val={file.progress} styleType="progress" />),
                    actions: (
                        <EditDeleteButtons
                            editAction={() => setEditingIndex(i)}
                            deleteAction={() => handleRemove(i)}
                            editable={editable}
                        />
                    )
                }))}
            />

            <AddFileInput
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
    editable?: boolean;
    multiple?: boolean;
    extensions?: string[];
    onChange?: (e: { target: { name: string; value: File[] } }) => void;
    label?: string;
    disabled?: boolean;
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
    editable = false,
    multiple = false,
    extensions = undefined,
    onChange = undefined,
    label = undefined,
    disabled = false,
    className = undefined,
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

    return (
        <div className="d-flex gap-3 align-items-center">
            {/* aggiunta immagini */}
            <div className={addButtonPosition === "left" ? "order-0" : "order-2"}>
                <AddFileInput
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
            </div>

            {/* anteprime */}
            <div className="d-flex gap-2 flex-wrap order-1">
                {previews.map((img, i) => (
                    <div
                        key={i}
                        className="position-relative rounded-2 overflow-hidden border border-1 border-white"
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
                                    className="w-100 h-100"
                                    style={{ objectFit: "contain" }}
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
                            <Percentage max={100} min={0} val={img.progress} styleType="progress" />
                        )}
                    </div>
                ))}
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
        </div>
    );
};

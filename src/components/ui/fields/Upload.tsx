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
import { UIProps } from "../..";


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
    name: string;
    label?: string;
    icon?: string;
    required?: boolean;
    multiple?: boolean;
    elements: FileOrPreview[];
    triggerUpload: () => void;
    accept: string;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    height?: number;
    width?: number;
}

const FileInput = ({
    name,
    label = undefined,
    icon = undefined,
    required = false,
    multiple = false,
    elements,
    triggerUpload,
    accept,
    fileInputRef,
    onChange,
    height = undefined,
    width = undefined
}: FileInputProps) => {
    const max = multiple ? 100 : 1;
    return (
        <>
            {elements.length < max && <ActionButton
                icon={icon}
                label={label}
                onClick={triggerUpload}
                style={{height: height, width: width}}
            />}

            <input
                name={name}
                type="file"
                accept={accept}
                ref={fileInputRef}
                multiple={multiple}
                required={required}
                className="d-none"
                onChange={onChange}
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
export interface UploadDocumentProps extends UIProps {
    name: string;
    value?: string;
    onChange?: (e: { target: { name: string; value: File[] } }) => void;
    label?: string;
    required?: boolean;
    editable?: boolean;
    multiple?: boolean;
    accept?: string;
}

export interface UploadImageProps extends UploadDocumentProps {
    previewHeight?: number;
    previewWidth?: number;
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
    accept      = ".pdf,.doc,.docx,.txt,.iso",
    pre         = undefined,
    post        = undefined,
    wrapClass   = undefined,
    className   = undefined,
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
        <Wrapper className={wrapClass}>
            {pre}
            <div className={className}>
                <div className="d-flex justify-content-between align-items-center">
                    {label && <Label label={label} required={required} />}
                    <FileInput
                        name={name}
                        label={"Upload"}
                        icon={"upload"}
                        required={required}
                        multiple={multiple}
                        elements={files}
                        triggerUpload={triggerUpload}
                        accept={accept}
                        fileInputRef={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>
                {files.length > 0 && <Table
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
                />}

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
            {post}
        </Wrapper>
    );
};


/* ------------------------ Caricamento immagini ---------------------- */

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
    value           = undefined,
    onChange        = undefined,
    label           = undefined,
    editable        = false,
    multiple        = false,
    accept          = "image/*",
    required        = false,
    previewHeight   = 100,
    previewWidth    = 100,
    pre             = undefined,
    post            = undefined,
    wrapClass       = undefined,
    className       = undefined,
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
        <Wrapper className={wrapClass}>
            {pre}
            <Wrapper className={className}>
                {label && <Label label={label} required={required} />}
                <div className="d-flex gap-2 flex-wrap">
                    {/* anteprime */}
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

                    {/* aggiunta immagini */}
                    <FileInput
                        name={name}
                        icon={"upload"}
                        required={required}
                        multiple={multiple}
                        elements={previews}
                        triggerUpload={triggerUpload}
                        accept={accept}
                        fileInputRef={fileInputRef}
                        onChange={handleFileChange}
                        height={previewHeight}
                            width={previewWidth}
                        />
                </div>
            </Wrapper>

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
            {post}
        </Wrapper>
    );
};

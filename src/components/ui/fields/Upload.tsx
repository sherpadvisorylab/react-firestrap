import React, { useRef, useState } from "react";
import Modal from "../Modal";
import { ActionButton } from "../Buttons";
import Badge from "../Badge";
import Table from "../Table";
import Percentage from "../Percentage";
import { CropImage, FileNameEditor, ImageData, CropData } from "./Crop";
import { Label } from "./Input";
import { Wrapper } from "../GridSystem";
import { UIProps } from "../..";
import { Link } from "react-router-dom";

interface DocumentFile {
    fileName: string;
    size: number;
    type: string;
    progress: number;
    url: string;
} 

interface ImageFile extends DocumentFile {
    crops: Record<string, ImageData>;
    cropData?: Record<string, CropData>;
}

type FileType = DocumentFile | ImageFile;

const useFileUpload = <T extends FileType>(
    name: string,
    onChange?: (e: { target: { name: string; value: any } }) => void
) => {
    const [files, setFiles] = useState<T[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const updateFileState = (fileName: string, updates: Partial<T>) => {
        setFiles(prev =>
            prev.map(f =>
                f.fileName === fileName ? { ...f, ...updates } : f
            )
        );
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);

        selectedFiles.forEach(file => {
            const newFile = {
                fileName: file.name,
                size: file.size,
                type: file.type,
                progress: 0,
                url: '',
                crops: {}, cropData: {} 
            } as T;

            setFiles(prev => {
                const existingFileIndex = prev.findIndex(f => f.fileName === file.name);
                if (existingFileIndex !== -1) {
                    const newFiles = [...prev];
                    newFiles[existingFileIndex] = newFile;
                    return newFiles;
                } else {
                    return [...prev, newFile];
                }
            });

            const reader = new FileReader();
            reader.onprogress = e => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    updateFileState(file.name, { progress: percent } as Partial<T>);
                }
            };

            reader.onloadend = () => {
                updateFileState(file.name, { progress: 99 } as Partial<T>);
                setTimeout(() => {
                    updateFileState(file.name, { 
                        progress: 100, 
                        url: URL.createObjectURL(file) 
                    } as Partial<T>);
                    onChange?.({ target: { name: name, value: files} });
                }, 500);
            };

            reader.readAsArrayBuffer(file);
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onUpload = () => fileInputRef.current?.click();

    const handleRemove = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

    return {
        files,
        setFiles,
        fileInputRef,
        handleFileChange,
        onUpload,
        handleRemove
    };
};

export interface UploadDocumentProps extends UIProps {
    name: string;
    value?: string;
    onChange?: (e: { target: { name: string; value: any } }) => void;
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

interface FileInputProps {
    name: string;
    elements: DocumentFile[] | ImageFile[];
    fileInputRef: React.RefObject<HTMLInputElement>;
    accept: string;
    onUpload: () => void;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    icon?: string;
    required?: boolean;
    multiple?: boolean;
    height?: number;
    width?: number;
    iconClass?: string;
}

interface EditFileModalProps {
    title: string;
    file: DocumentFile | ImageFile;
    type: 'img' | 'document';
    onSave: (
        fileName: string,
        crops?: Record<string, ImageData>,
        cropDetails?: Record<string, CropData>,
    ) => void;
    onClose: () => void;
}   

const FileInput = ({
    name,
    elements,
    fileInputRef,
    accept              = "*/*",
    onUpload,
    onChange            = undefined,
    label               = undefined,
    icon                = undefined,
    required            = false,
    multiple            = false,
    height              = undefined,
    width               = undefined,
    iconClass           = undefined
}: FileInputProps) => {
    const max = multiple ? 100 : 1;
    return (
        <>
            {elements.length < max && <ActionButton
                icon={icon}
                label={label}
                onClick={onUpload}
                iconClass={iconClass}
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
const EditFileModal = ({
    title = 'Editor',
    file,
    type,
    onSave = () => { },
    onClose = () => { }
}: EditFileModalProps) => {
    const [fileName, setFileName] = useState(file.fileName);

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

            {type === 'img' &&
                <CropImage
                    ref={cropRef}
                    img={file as ImageFile}
                />
            }
        </Modal>
    )
}


/* ------------------------ Caricamento documenti ---------------------- */
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
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const { files, setFiles, fileInputRef, handleFileChange, onUpload, handleRemove } = useFileUpload<DocumentFile>(name, onChange);

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
                        elements={files}
                        fileInputRef={fileInputRef}
                        accept={accept}
                        onUpload={onUpload}
                        onChange={handleFileChange}
                        label={"Upload"}
                        icon={"upload"}
                        required={required}
                        multiple={multiple}
                    />
                </div>
                {files.length > 0 && <Table
                    header={[
                        { label: 'Name', key: 'name' },
                        { label: 'Kilobyte', key: 'kilobyte' },
                        { label: 'Actions', key: 'actions' }
                    ]}
                    body={files.map((file, i) => ({
                        name: file.progress === 100 ? <Link to={file.url} target="_blank">{file.fileName}</Link> : file.fileName,
                        kilobyte: (
                            file.progress === 100 
                            ? (file.size / 1024).toFixed(2) + ' KB' 
                            : <Percentage max={100} min={0} val={file.progress} shape="bar" />
                        ),
                        actions: (
                            <>
                                {editable && <ActionButton onClick={() => setEditingIndex(i)} icon='pencil' className="border-0 text-primary" />}
                                {<ActionButton onClick={() => handleRemove(i)} icon='x' className="border-0 text-primary" />}
                            </>
                        )
                    }))}
                />}
            </div>
            {editable && editingIndex !== null && (
                <EditFileModal
                    title="Editor Document"
                    file={files[editingIndex]}
                    type="document"
                    onSave={(result) => handleFileRename(result)}
                    onClose={() => setEditingIndex(null)}
                />
            )}
            {post}
        </Wrapper>
    );
};

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
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const { files, setFiles, fileInputRef, handleFileChange, onUpload, handleRemove } = useFileUpload<ImageFile>(name, onChange);

    const handleSave = (
        fileName: string,
        crops?: Record<string, ImageData>,
        cropDetails?: Record<string, CropData>,
    ) => {
        if (editingIndex === null) return;

        setFiles(prev => prev.map((img, i) =>
            i === editingIndex
                ? {
                    ...img,
                    fileName: fileName || img.fileName,
                    crops: crops ?? {},
                    cropData: cropDetails ?? {},
                }
                : img
        ));

        onChange?.({ target: { name: name, value: files} });
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
                    {files.map((img, i) => (
                        <div
                            key={i}
                            className="position-relative overflow-hidden"
                            style={{ width: previewHeight, height: previewWidth }}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {img.progress === 100 ? (
                                <>
                                    <img
                                        src={img.url}
                                        alt={`preview-${i}`}
                                        className="img-thumbnail h-100 w-100"
                                    />
                                    {editable && Object.keys(img.crops) &&
                                        <div className="position-absolute bottom-0 start-0 w-100 p-1 d-flex align-items-center justify-content-between">
                                            {Object.keys(img.crops)
                                                .map((scale) => (
                                                    <Badge key={scale}>{scale}</Badge>
                                                ))
                                            }
                                        </div>
                                    }
                                    
                                    <Link to={img.url} target="_blank" className="bg-dark opacity-75 position-absolute top-0 start-0 bottom-0 end-0 justify-content-end align-items-start" style={{ display: hoveredIndex === i ? "flex" : "none" }}>
                                        {editable && <ActionButton onClick={() => setEditingIndex(i)} icon='pencil' className="p-1" />}
                                        {<ActionButton onClick={() => handleRemove(i)} icon='x' className="p-1" />}
                                    </Link>
                                </>
                            ) : (
                                <Percentage max={100} min={0} val={img.progress} shape="circle" />
                            )}
                        </div>
                    ))}

                    {/* aggiunta immagini */}
                    <FileInput
                        name={name}
                        elements={files}
                        fileInputRef={fileInputRef}
                        accept={accept} 
                        onUpload={onUpload}
                        onChange={handleFileChange}
                        icon={"upload"}
                        required={required}
                        multiple={multiple}
                        height={previewHeight}
                        width={previewWidth}
                        iconClass="fs-1"
                    />
                </div>
            </Wrapper>

            {/* modale modifica */}
            {editable && editingIndex !== null &&
                <EditFileModal
                    title="Editor Document"
                    file={files[editingIndex]}
                    type="img"
                    onSave={(fileName, crops, cropDetails) => handleSave(fileName, crops, cropDetails)}
                    onClose={() => setEditingIndex(null)}
                />
            }
            {post}
        </Wrapper>
    );
};

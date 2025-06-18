import React, { useRef, useState } from "react";
import Modal from "../Modal";
import { ActionButton } from "../Buttons";
import Badge from "../Badge";
import Table from "../Table";
import Percentage from "../Percentage";
import { CropImage, FileNameEditor } from "./Crop";
import { Label } from "./Input";
import { Wrapper } from "../GridSystem";
import { UIProps } from "../..";
import { Link } from "react-router-dom";
import { render2Base64 } from "../../../libs/utils";

export interface FileProps {
    key: string;
    fileName: string;
    size: number;
    type: string;
    progress: number;
    url: string;
    base64?: string;
    variants: Record<string, any>;
} 

const useFileUpload = <T extends FileProps>(
    name: string,
    value?: any,
    onChange?: (e: { target: { name: string; value: any } }) => void
) => {
    const [files, setFiles] = useState<T[]>(value ?? []);
    const [editingFile, setEditingFile] = useState<T | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    
    const updateFiles = (newFiles: T[]) => {
        setFiles(newFiles);
        onChange?.({ target: { name, value: newFiles} });
    };
    
    const updateFileState = (fileName: string, updates: Partial<T>) => {
        setFiles(prev => {
            const updatedFiles = prev.map(f =>
                f.fileName === fileName ? { ...f, ...updates } : f
            );
            onChange?.({ target: { name, value: updatedFiles } });
            return updatedFiles;
        });
    };

    const handleSave = (updates: Partial<T>) => {
        if (!editingFile) return;
        const updatedFiles = files.map(file =>
            file.key === editingFile.key ? { ...file, ...updates } : file
        );
        updateFiles(updatedFiles);
        setEditingFile(null);
    };

    const handleEdit = (index: number) => setEditingFile(files[index]);
    const handleClose = () => setEditingFile(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);

        setFiles(prev => {
            const updatedFiles = [...prev];
            
            selectedFiles.forEach(file => {
                const newFile = {
                    key: file.name,
                    fileName: file.name,
                    size: file.size,
                    type: file.type,
                    progress: 0,
                    url: '',
                    base64: '',
                    variants: {}
                } as T;
                
                const existingIndex = updatedFiles.findIndex(f => f.key === file.name);
                if (existingIndex !== -1) {
                    updatedFiles[existingIndex] = newFile;
                } else {
                    updatedFiles.push(newFile);
                }

                // Avvia il caricamento
                const reader = new FileReader();
                reader.onprogress = e => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        setFiles(prev => {
                            const filesWithProgress = prev.map(f =>
                                f.fileName === file.name ? { ...f, progress: percent } : f
                            );
                            onChange?.({ target: { name, value: filesWithProgress } });
                            return filesWithProgress;
                        });
                    }
                };

                reader.onloadend = () => {
                    setFiles(prev => {
                        const filesWith99 = prev.map(f =>
                            f.fileName === file.name ? { ...f, progress: 99 } : f
                        );
                        onChange?.({ target: { name, value: filesWith99 } });
                        return filesWith99;
                    });
                    setTimeout(() => {
                        setFiles(prev => {
                            const finalFiles = prev.map(f =>
                                f.fileName === file.name
                                    ? {
                                        ...f,
                                        progress: 100,
                                        url: URL.createObjectURL(file),
                                        base64: `data:${file.type};base64,${render2Base64(reader.result as ArrayBuffer)}`
                                    }
                                    : f
                            );
                            onChange?.({ target: { name, value: finalFiles } });
                            return finalFiles;
                        });
                    }, 500);
                };

                reader.readAsArrayBuffer(file);
            });
            
            return updatedFiles;
        });
        
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return {
        files,
        editingFile,
        fileInputRef,
        handleChange,
        handleUpload: () => fileInputRef.current?.click(),
        handleRemove: (index: number) => {
            const updatedFiles = files.filter((_, i) => i !== index);
            updateFiles(updatedFiles);
        },
        handleSave,
        handleEdit,
        handleClose
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
    max?: number;
}

export interface UploadImageProps extends UploadDocumentProps {
    previewHeight?: number;
    previewWidth?: number;
}

interface FileInputProps {
    name: string;
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

interface FileEditorProps {
    title: string;
    file: FileProps;
    type: 'img' | 'document';
    onSave?: (result: { fileName: string; variants: Record<string, any> }) => void;
    onClose?: () => void;
}   

const FileInput = ({
    name,
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
    return (
        <>
            <ActionButton
                icon={icon}
                label={label}
                onClick={onUpload}
                iconClass={iconClass}
                style={{height: height, width: width}}
            />

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

const FileEditor = ({
    title,
    file,
    type,
    onSave = undefined,
    onClose = undefined
}: FileEditorProps) => {
    const [fileName, setFileName] = useState(file.fileName);

    // Ref per accedere ai metodi esposti dal componente CropImage
    const cropRef = useRef<{
        triggerSave: () => {
            fileName: string;
            variants: Record<string, any>;
        };
    }>(null);

    const handleSave = async () => {
        if (cropRef.current) {
            onSave?.(cropRef.current.triggerSave());
        } else {
            onSave?.({ fileName, variants: {} });
        }
    };

    return (
        <Modal
            title={title}
            onSave={handleSave}
            onClose={onClose}
            size={type === 'img' ? "fullscreen" : undefined}
        >
            {type === 'document' &&
                <FileNameEditor
                    value={fileName}
                    onChange={setFileName}
                    label={"File name"}
                />}

            {type === 'img' &&
                <CropImage
                    ref={cropRef}
                    img={file}
                />
            }
        </Modal>
    )
}
const isUploadable = (files: FileProps[], max: number, multiple: boolean) => {
    return files.length < max && (multiple || files.length === 0);
}

export const UploadDocument = ({
    name,
    value       = undefined,
    onChange    = undefined,
    label       = undefined,
    required    = false,
    editable    = false,
    multiple    = false,
    max         = 100,
    accept      = ".pdf,.doc,.docx,.txt,.iso",
    pre         = undefined,
    post        = undefined,
    wrapClass   = undefined,
    className   = undefined,
}: UploadDocumentProps) => {
    const { files, editingFile, fileInputRef, handleChange, handleUpload, handleRemove, handleSave, handleEdit, handleClose } = useFileUpload<FileProps>(name, value, onChange);

    return (
        <Wrapper className={wrapClass}>
            {pre}
            <div className={className}>
                <div className="d-flex justify-content-between align-items-center">
                    {label && <Label label={label} required={required} />}
                    {isUploadable(files, max, multiple) && <FileInput
                        name={name}
                        fileInputRef={fileInputRef}
                        accept={accept}
                        onUpload={handleUpload}
                        onChange={handleChange}
                        label={"Upload"}
                        icon={"upload"}
                        required={required}
                        multiple={multiple}
                    />}
                </div>
                {files.length > 0 && <Table
                    onClick={(index) => editable && handleEdit(index)}
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
                                {<ActionButton onClick={() => handleRemove(i)} icon='x' className="p-1" />}
                            </>
                        )
                    }))}
                />}
            </div>
            {editable && editingFile && (
                <FileEditor
                    title="Editor Document"
                    file={editingFile}
                    type="document"
                    onSave={handleSave}
                    onClose={handleClose}
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
    max             = 100,
    previewHeight   = 100,
    previewWidth    = 100,
    pre             = undefined,
    post            = undefined,
    wrapClass       = undefined,
    className       = undefined,
}: UploadImageProps) => {
    const { files, editingFile, fileInputRef, handleChange, handleUpload, handleRemove, handleSave, handleEdit, handleClose } = useFileUpload<FileProps>(name, value, onChange);

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const ScaleBadge = ({scales}: {scales: string[]}) => {
        if (scales.length === 0) return null;

        return <div className="position-absolute bottom-0 start-0 w-100 p-1 d-flex align-items-center justify-content-between">
            {scales
                .map((scale) => (
                    <Badge key={scale}>{scale}</Badge>
                ))
            }
        </div>
    }

    return (
        <Wrapper className={wrapClass}>
            {pre}
            <Wrapper className={className}>
                {label && <Label label={label} required={required} />}
                <div className="d-flex gap-2 flex-wrap">
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
                                        src={img.base64 ?? img.url}
                                        alt={`preview-${i}`}
                                        className="img-thumbnail h-100 w-100"
                                    />
                                    {editable && <ScaleBadge scales={Object.keys(img.variants)} />}
                                    
                                    <Link to={img.url} target="_blank" className="bg-dark opacity-75 position-absolute top-0 start-0 bottom-0 end-0 justify-content-end align-items-start" style={{ display: hoveredIndex === i ? "flex" : "none" }}>
                                        {editable && <ActionButton onClick={() => handleEdit(i)} icon='pencil' className="p-1" />}
                                        {<ActionButton onClick={() => handleRemove(i)} icon='x' className="p-1" />}
                                    </Link>
                                </>
                            ) : (
                                <Percentage max={100} min={0} val={img.progress} shape="circle" />
                            )}
                        </div>
                    ))}

                    {isUploadable(files, max, multiple) && <FileInput
                        name={name}
                        fileInputRef={fileInputRef}
                        accept={accept} 
                        onUpload={handleUpload}
                        onChange={handleChange}
                        icon={"upload"}
                        required={required}
                        multiple={multiple}
                        height={previewHeight}
                        width={previewWidth}
                        iconClass="fs-1"
                    />}
                </div>
            </Wrapper>

            {editable && editingFile &&
                <FileEditor
                    title="Editor Image"
                    file={editingFile}
                    type="img"
                    onSave={handleSave}
                    onClose={handleClose}
                />
            }
            {post}
        </Wrapper>
    );
};

import React, {useRef, useState} from "react";
import storage  from "../libs/storage";
import Image from "./Image";


interface UploadProps {
    name: string;
    value?: string;
    onChange?: (e: { target: { name: string; value: string } }) => void;
    required?: boolean;
    updatable?: boolean;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
    title?: string;
    pre?: React.ReactNode;
    post?: React.ReactNode;
    feedback?: string;
    wrapClass?: string;
    className?: string;
    imageWidth?: number;
}

const Upload = ({
    name,
    value = undefined,
    onChange = undefined,
    required = false,
    updatable = true,
    disabled = false,
    placeholder = "/assets/images/noimg.svg",
    label = undefined,
    title = undefined,
    pre = undefined,
    post = undefined,
    feedback = undefined,
    wrapClass = undefined,
    className = undefined,
    imageWidth = 150,
}: UploadProps) => {
    const [imageURL, setImageURL] = useState(value || placeholder);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Image = reader.result;
                if (typeof base64Image !== "string") {
                    console.error("Invalid file format");
                    return;
                }
                const downloadURL = await storage.upload(base64Image, `images/${file.name}`); // Usa upload da storageFunctions
                if(!downloadURL) {
                    console.error("Failed to upload file");
                    return;
                }
                setImageURL(downloadURL); // Aggiorna l'URL dell'immagine locale
                onChange?.({target: {name: name, value: downloadURL}});
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`d-flex flex-column align-items-center ${wrapClass || ""}`}>
            {pre}
            {label && <label htmlFor={name} className="mb-2">{label}</label>}
            <div 
                className="mb-4 d-flex justify-content-center"
                onClick={handleImageClick}   
                style={{ cursor: 'pointer' }} 
            >
                <Image
                    className={className}
                    src={imageURL}
                    label={"Uploaded content" }
                    title={title}
                />
            </div>
            <input
                required={required}
                type="file"
                className="form-control d-none"
                ref={fileInputRef}
                id={name}
                onChange={handleFileChange}
                disabled={disabled}
            />
            {post}
            {feedback && <div className="feedback">{feedback}</div>}
        </div>
    );
};

export default Upload;
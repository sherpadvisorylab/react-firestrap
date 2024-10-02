import React, { useState } from "react";
import { storage } from "../libs/firestorage.js";
import Image from "./Image.js";

const Upload = ({
    name,
    value = null,
    onChange = () => {},
    required = false,
    updatable = true,
    disabled = false,
    placeholder = "/assets/images/noimg.svg",
    label = null,
    title = null,
    pre = null,
    post = null,
    feedback = null,
    wrapClass = null,
    className = null,
    imageWidth = 150, // Default width for the image
}) => {
    const [imageURL, setImageURL] = useState(value || placeholder);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Image = reader.result;
                const downloadURL = await storage.upload(base64Image, `images/${file.name}`); // Usa upload da storageFunctions
                setImageURL(downloadURL); // Aggiorna l'URL dell'immagine locale
                onChange({target: {name: name, value: downloadURL}});
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = () => {
        document.getElementById(name).click();
    };

    return (
        <div className={`d-flex flex-column align-items-center ${wrapClass}`}>
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
                    name={name}
                    title={title}
                />
            </div>
            <input
                required={required}
                type="file"
                className="form-control d-none"
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
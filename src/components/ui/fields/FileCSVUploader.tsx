import React, { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { useTheme } from '../../../Theme';

interface CsvRow {
  [key: string]: string;
}

interface CsvParserProps {
  name: string;
  onDataLoaded: (data: CsvRow[], file: File) => void;
  label?: string;
  icon?: string;
  pre?: React.ReactNode;
  post?: React.ReactNode;
  wrapClass?: string;
  className?: string;
}

export const FileCSVUploader: React.FC<CsvParserProps> = ({
  name,
  onDataLoaded,
  label,
  icon = "upload",
  pre,
  post,
  wrapClass,
  className,
}) => {
  const theme = useTheme("button");
  const [data, setData] = useState<CsvRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CsvRow>) => {
        setData(results.data);
        onDataLoaded(results.data, file);
        setError(null);
      },
      error: (err) => {
        setError(err.message);
      },
    });
  };

  useEffect(()=>{
    console.log(data);
  }, [data])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    file && handleFile(file);
  };

  // Drag & drop handlers
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <>
      <div
        data-name={name}
        className={"fileinput-button " + (wrapClass || "text-end")}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {pre}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className={className}
        />
        {icon && <i className={(label ? "me-1 " : "") + theme.getIcon(icon)}></i>}
        <span>{label || "Drag or click to upload"}</span>
        {post}
      </div>

      {error && <p style={{ color: 'red' }}>Errore: {error}</p>}

    </>
  );
};


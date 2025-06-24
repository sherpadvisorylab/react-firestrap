import React, { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { useTheme } from '../../../Theme';
import { Wrapper } from '../GridSystem';
import { Icon, UIProps } from '../../..';

interface CsvRow {
  [key: string]: string;
}

interface CsvParserProps extends UIProps {
  name: string;
  onDataLoaded: (data: CsvRow[], file: File) => void;
  label?: string;
  icon?: string;
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
  ...rest
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
      error: (err: any) => {
        setError(err.message);
      },
    });
  };

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
    <Wrapper className={wrapClass}>
      {pre}
      <div
        data-name={name}
        className={"fileinput-button " + (className || "")}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
        />
        <Icon icon={icon} label={label || "Drag or click to upload"} />
      </div>

      {error && <p style={{ color: 'red' }}>Errore: {error}</p>}
      {post}
    </Wrapper>
  );
};


import React, { useState, ChangeEvent, DragEvent } from 'react';
import Papa, { ParseResult } from 'papaparse';
import { Wrapper } from '../GridSystem';
import { Icon, normalizeKey, UIProps } from '../../..';

type CsvCell = string | null | undefined;
interface CsvDataProps {
  [key: string]: CsvCell;
}
interface UploadCSVData {
  data: CsvDataProps[];
  fields: string[];
  file: File;
}
type ParseFieldProp = [key: string, value: CsvCell];

interface UploadCSVProps extends UIProps {
  name: string;
  onDataLoaded: (results: UploadCSVData) => void;
  onParseField: (field: ParseFieldProp) => ParseFieldProp | undefined;
  label?: string;
  icon?: string;
  delimiter?: string;
  normalizeKeys?: boolean;
  removeEmptyFields?: boolean;
}

export const UploadCSV: React.FC<UploadCSVProps> = ({
  name,
  onDataLoaded,
  onParseField  = undefined,
  label         = undefined,
  icon          = "upload",
  delimiter     = undefined,
  normalizeKeys = false,
  removeEmptyFields = false,
  pre           = undefined,
  post          = undefined,
  wrapClass     = undefined,
  className     = undefined,
}) => {
  const [error, setError] = useState<string | null>(null);

  const sanitizeField = ([key, value]: ParseFieldProp) => {
    if (["", null, undefined].includes(key)) return;
    if (value === undefined) return;
    if (removeEmptyFields && ["", null].includes(value)) return;
    if (normalizeKeys) key = normalizeKey(key);
    if (onParseField) return onParseField([key, value]);

    return [key.trim(), typeof value === "string" ? value.trim() : value] as ParseFieldProp;
  }

  const handleFile = (file: File | null) => {
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: delimiter,
      complete: (results: ParseResult<CsvDataProps>) => {
        setError(null);
        onDataLoaded({data: results.data.map(item =>
          Object.fromEntries(
            Object.entries(item).reduce<ParseFieldProp[]>((acc, [k, v]) => {
              const sanitizedField = sanitizeField([k, v]);
              if (sanitizedField) acc.push(sanitizedField);
              return acc;
            }, [])
          )
        ), fields: (results.meta?.fields || []).reduce<string[]>((acc, field) => {
          if (!field) return acc;
          acc.push(normalizeKeys ? normalizeKey(field) : field);
          return acc;
        }, []), file: file});
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
          onChange={handleFileChange}
          accept=".csv,.tsv,text/csv,text/plain"
        />
        <Icon icon={icon} label={label || "Drag or click to upload"} />
      </div>

      {error && <p style={{ color: 'red' }}>Errore: {error}</p>}
      {post}
    </Wrapper>
  );
};


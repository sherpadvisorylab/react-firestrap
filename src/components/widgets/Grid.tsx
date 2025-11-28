import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTheme } from "../../Theme";
import Table, { TableHeaderProp } from "../ui/Table";
import Gallery from "../ui/Gallery";
import Card from "../ui/Card";
import db from "../../libs/database";
import Modal from "../ui/Modal";
import { getRecordValue, safeClone, trimSlash, ucfirst } from "../../libs/utils";
import { useLocation } from "react-router-dom";
import { converter } from "../../libs/converter";
import FormEnhancer, { extractComponentProps } from "../FormEnhancer";
import { RecordArray, RecordProps } from "../../integrations/google/firedatabase";
import Form, { FormRef } from "./Form";
import { PaginationParams } from '../ui/Pagination';

type ColumnFormatter = (args: {
    value: any;
    record: any;
    key?: string;
}) => React.ReactNode;

type Column = TableHeaderProp & {
    onDisplay?: ColumnFormatter | string;
};

type ColumnFormatters = Record<string, ColumnFormatter>;

type ConverterKey = keyof typeof converter;

type GridProps = {
    columns?: Column[];
    format?: { [key: string]: ConverterKey | ColumnFormatter };
    dataStoragePath?: string;
    dataArray?: RecordArray;
    header?: React.ReactNode;
    headerAction?: React.ReactNode | ((records?: RecordArray) => React.ReactNode);
    footer?: React.ReactNode;
    allowedActions?: Array<"add" | "edit" | "delete">;
    allowedSorting?: boolean;
    modal?: {
        mode?: "form" | "empty";
        size?: "sm" | "md" | "lg" | "xl" | "fullscreen";
        position?: "center" | "top" | "left" | "right" | "bottom";
        setHeader?: (record?: RecordProps) => React.ReactNode;
        onOpen?: ({ record }: { record?: RecordProps }) => React.ReactNode;
    };
    pagination?: PaginationParams
    setPrimaryKey?: (record: RecordProps) => string;
    onLoadRecord?: (record: RecordProps, index: number) => RecordProps | boolean;
    onDisplayBefore?: (records: RecordArray,
        setRecords: React.Dispatch<React.SetStateAction<RecordArray | undefined>>,
        setLoader?: React.Dispatch<React.SetStateAction<boolean>>
    ) => Promise<void> | void;
    // Form handlers for external control
    onSave?: ({ record, action, storagePath }: { record?: RecordProps, storagePath?: string, action: 'create' | 'update' }) => Promise<string | undefined>;
    onDelete?: ({ record }: { record?: RecordProps }) => Promise<string | undefined>;
    onFinally?: ({ record, action }: { record?: RecordProps, action: 'create' | 'update' | 'delete' }) => Promise<boolean>;
    onClick?: (record: RecordProps) => void;
    children?: React.ReactNode;
    scroll?: boolean;
    type?: "table" | "gallery";
    showLoader?: boolean;
    groupBy?: string | string[];
    sticky?: "top" | "bottom";
    log?: boolean;
    wrapClass?: string;
};

const Grid = (props: GridProps) => {
    return props.dataArray === undefined
        ? <GridDatabase {...props} />
        : <GridArray {...props} />;
}

const GridDatabase = (props: Omit<GridProps, 'dataArray'>) => {
    const { dataStoragePath, ...rest } = props;
    const location = useLocation();

    const dbStoragePath = dataStoragePath || trimSlash(location.pathname);
    const [records, setRecords] = useState<RecordArray | undefined>(undefined);

    db.useListener(dbStoragePath, setRecords);

    return <GridArray {...rest} dataArray={records} dataStoragePath={dbStoragePath} />;
};

const defaultHeader = (key: string) => {
    return {
        label: converter.toCamel(key, " "),
        key,
        sort: true,
    };
}

const GridArray = ({
    columns = undefined,
    format = {},
    dataStoragePath = undefined,
    dataArray = undefined,
    header = undefined,
    headerAction = undefined,
    footer = undefined,
    allowedActions = undefined,
    allowedSorting = true,
    modal = undefined,
    pagination = undefined,
    setPrimaryKey = undefined,
    onLoadRecord = undefined,
    onDisplayBefore = undefined,
    onSave = undefined,
    onDelete = undefined,
    onFinally = undefined,
    onClick = undefined,
    children = undefined,
    scroll = false,
    type = "table",
    showLoader = false,
    groupBy = undefined,
    sticky = undefined,
    log = false,
    wrapClass = undefined
}: GridProps) => {
    const theme = useTheme("grid");

    const [loader, setLoader] = useState(false);
    const [modalData, setModalData] = useState<RecordProps | undefined>(undefined);
    const [formRef, setFormRef] = useState<FormRef | undefined>(undefined);

    const [beforeRecords, setBeforeRecords] = useState<RecordArray | undefined>(undefined);
    useEffect(() => {
        if (!dataArray || !onDisplayBefore) return;
        console.log("GRID: onDisplayBefore", dataArray);
        onDisplayBefore(safeClone(dataArray), setBeforeRecords, setLoader);
    }, [dataArray, onDisplayBefore]);

    const canEdit = (children || modal) && (!allowedActions || allowedActions.includes("edit"));

    const records = useMemo(() => {
        if (!dataArray) return undefined;
        if (onDisplayBefore) return beforeRecords;

        return safeClone(dataArray);
    }, [dataArray, onDisplayBefore, beforeRecords]);

    // 1. Calcolo colonne
    const tableHeaders: Column[] = useMemo(() => {
        if (columns) return columns;
        if (!records || records.length === 0) return [];
        return (
            children && typeof children !== 'function'
                ? extractComponentProps(children, (props) => defaultHeader(props.name))
                : Object.entries(records[0]).reduce((acc: Column[], [key, value]) => {
                    if (key.startsWith("_")) return acc;
                    if (
                        React.isValidElement(value) ||
                        typeof value !== 'object' ||
                        Array.isArray(value)
                    ) {
                        acc.push(defaultHeader(key));
                    }
                    return acc;
                }, [])
        );
    }, [columns, records, children]);

    // 2. Funzioni di formattazione colonne
    const columnFormatters: ColumnFormatters = useMemo(() => {
        return (tableHeaders).reduce((acc: ColumnFormatters, column: Column) => {
            const key = column.key;
            const formatKey = format?.[column.key];
            if (column?.onDisplay) {
                acc[key] = typeof column.onDisplay === "string" ? ({ value }) => converter[column.onDisplay as keyof typeof converter]?.(value) : column.onDisplay;
            } else if (formatKey && typeof formatKey === "function") {
                acc[key] = formatKey;
            } else if (formatKey && converter[formatKey]) {
                acc[key] = ({ value }) => (converter[formatKey]?.(value));
            } else {
                acc[key] = ({ value }) => value;
            }
            return acc;
        }, {});
    }, [tableHeaders, format]);

    const [sortState, setSortState] = useState<{ key: string; order: 'asc' | 'desc' } | null>(null);

    useEffect(() => {
      if (allowedSorting && !sortState && tableHeaders) {
        const initialColumn = tableHeaders.find(c => c.sort) || tableHeaders[0];    // primo el con sort
        if (initialColumn) {
          setSortState({ key: initialColumn.key, order: 'asc' });
        }
      }
    }, [sortState, tableHeaders]);

    // 3. Ordinamento prima dei formatters
    const sortedRecords = useMemo(() => {
        if (!records || !sortState?.key) return records;
        const col = tableHeaders.find(c => c.key === sortState.key);
        if (!col) return records;
        let compare = (a: any, b: any) => {
            const av = a[sortState.key];
            const bv = b[sortState.key];
            if (av == null && bv == null) return 0; // null o undefined
            if (av == null) return 1;
            if (bv == null) return -1;
            if (typeof av === 'number' && typeof bv === 'number') return av - bv;   // numero
            return ('' + av).localeCompare('' + bv);
        };
        const arr = [...records];
        arr.sort((a, b) => {
          const cmp = compare(a, b);
          return sortState.order === 'desc' ? -cmp : cmp;   // inverte se desc
        });
        return arr;
    }, [records, sortState, tableHeaders]);

    // 4. Applicazione columnsFunc e formatters SUI DATI ORDINATI
    const body: RecordArray | undefined = useMemo(() => {
        if (!sortedRecords) return undefined;
        return sortedRecords.reduce((acc: RecordArray, item: RecordProps, index: number) => {
            const transformed = onLoadRecord ? onLoadRecord(item, index) : item; 
            
            //@todo trovare un modo per non distruggere gli indici
            if (!transformed) return acc;
            const result = (transformed === true ? item : transformed);
            
            //@todo secondo me non serve
            const displayRow = { ...result };
            for (const key of Object.keys(columnFormatters)) {
                displayRow[key] = columnFormatters[key]({
                    value: getRecordValue(result, key),
                    record: result,
                    key: item?._key
                });
            }
            acc.push(displayRow);
            return acc;
        }, []);
    }, [sortedRecords, onLoadRecord, columnFormatters]);

    console.log("GRIDodaiuto", dataArray, dataStoragePath, body, records, tableHeaders);

    const closeModal = useCallback(() => {
        setModalData(undefined);
        setFormRef(undefined);
    }, []);

    const handleClick = useCallback((index: number) => {
        const data = dataArray?.[index];

        if (!data) {
            console.error(`handleClick: Nessun dato trovato in dataArray all'indice ${index}`);
            return;
        }
        const record = safeClone(data);

        onClick?.(record);

        if (canEdit && record?._key) {
            setModalData(record);
        }
    }, [dataArray, onClick, canEdit, setModalData]);

    const setFormRefCallback = useCallback((ref: FormRef | null) => {
        setFormRef(ref ?? undefined);
        console.log("GRID: formRef callback", ref);
    }, []);

    const headerActionComponent = useMemo(() => {
        if (headerAction && typeof headerAction === "function") {
            return headerAction(records);
        }
        return headerAction;
    }, [headerAction, records]);

    const addNewButton = useMemo(() => {
        if ((children || modal) && (allowedActions && !allowedActions.includes("add"))) {
            return;
        }

        return (
            <button
                className="btn btn-primary"
                onClick={() => setModalData({})}
            >
                Aggiungi
            </button>
        );
    }, [children, allowedActions, setModalData]);


    // click ordinamento
    const handleHeaderClick = (column: TableHeaderProp) => {
        let order: 'asc' | 'desc' = 'asc';
        // se clicchi su una colonna diversa → sempre asc
        if (sortState?.key === column.key && sortState.order === 'asc') {
            order = 'desc';
        }
        setSortState({ key: column.key, order });
    };


    const displayComponent = useMemo(() => {
        switch (type) {
            case "gallery":
                return <Gallery
                    body={body}
                    onClick={(onClick || canEdit) ? handleClick : undefined}
                    pagination={pagination}
                    wrapClass={theme.Grid.Gallery.wrapperClass}
                    scrollClass={theme.Grid.Gallery.scrollClass}
                    headerClass={theme.Grid.Gallery.headerClass}
                    bodyClass={theme.Grid.Gallery.bodyClass}
                    footerClass={theme.Grid.Gallery.footerClass}
                    selectedClass={!canEdit && (theme.Grid.Gallery.selectedClass)}
                    gutterSize={theme.Grid.Gallery.gutterSize}
                    rowCols={theme.Grid.Gallery.rowCols}
                    groupBy={groupBy}
                />;
            case "table":
            default:
                return <Table
                    header={tableHeaders}
                    body={body}
                    onClick={(onClick || canEdit) ? handleClick : undefined}
                    onHeaderClick={handleHeaderClick}
                    pagination={pagination}
                    wrapClass={theme.Grid.Table.wrapperClass}
                    className={theme.Grid.Table.className}
                    headerClass={theme.Grid.Table.headerClass}
                    bodyClass={theme.Grid.Table.bodyClass}
                    footerClass={theme.Grid.Table.footerClass}
                    scrollClass={theme.Grid.Table.scrollClass}
                    selectedClass={!canEdit && (theme.Grid.Table.selectedClass)}
                />;
        }
    }, [type, body, onClick, canEdit, handleClick, groupBy, tableHeaders]);

    const modalComponent = useMemo((): React.ReactNode => {
        if (!modalData) return null;

        const component = modal?.onOpen?.({ record: modalData }) || children;
        switch (modal?.mode) {
            case "empty":
                return component && React.isValidElement(component) && React.cloneElement(component as React.ReactElement, {
                    record: modalData,
                    dataStoragePath: modalData?._key ? `${dataStoragePath}/${modalData?._key}` : `${dataStoragePath}/${new Date().getTime()}`,
                    savePath: (record: RecordProps) => record?._key
                        ? `${dataStoragePath}/${record?._key}`
                        : `${dataStoragePath}/${setPrimaryKey?.(record ?? {}) ?? new Date().getTime()}`,
                    ...component?.props,
                    ref: setFormRefCallback
                });
            case "form":
            default:
                return <Form
                    aspect="empty"
                    defaultValues={modalData ?? {}}
                    log={log}
                    dataStoragePath={modalData?._key ? `${dataStoragePath}/${modalData?._key}` : `${dataStoragePath}/${Date.now()}`}
                    savePath={(record: RecordProps) => record?._key
                        ? `${dataStoragePath}/${record?._key}`
                        : `${dataStoragePath}/${setPrimaryKey?.(record ?? {}) ?? Date.now()}`
                    }
                    onSave={onSave}
                    onDelete={onDelete}
                    onFinally={async ({ record, action }) => {
                        const success = await onFinally?.({ record, action }) ?? true;

                        success && closeModal();
                        return success;
                    }}
                    ref={setFormRefCallback}
                >
                    {component}
                </Form>

        }
    }, [modalData, modal?.mode, modal?.onOpen, children, log, onSave, onDelete, onFinally, setPrimaryKey, setFormRefCallback, dataStoragePath]);

    const currentRecord = formRef?.getRecord();
    console.log("GRID: formRef", formRef, modalData, currentRecord);

    return (<>
        <Card
            wrapClass={wrapClass}
            header={(header || headerActionComponent || addNewButton) && <>
                {header || <span />}
                {(headerActionComponent || addNewButton) && (
                    <span>
                        {headerActionComponent}
                        {addNewButton}
                    </span>
                )}
            </>}
            footer={footer}
            className={(theme.Grid.Card.className + (sticky ? ' sticky-' + sticky : '')).trim()}
            headerClass={theme.Grid.Card.headerClass}
            bodyClass={theme.Grid.Card.bodyClass}
            footerClass={theme.Grid.Card.footerClass}
            showLoader={loader || showLoader}
            showArrow={theme.Grid.Card.showArrow}
        >{displayComponent}</Card>
        {modalData && (
            <Modal
                size={modal?.size || theme.Grid.Modal.size}
                position={modal?.position || theme.Grid.Modal.position}
                header={formRef?.getHeader() || modal?.setHeader?.(currentRecord) || (currentRecord?._key ? "Modifica" : "Aggiungi")}
                onClose={closeModal}
                onSave={formRef?.handleSave}
                onDelete={currentRecord?._key && (!allowedActions || allowedActions.includes("delete"))
                    ? formRef?.handleDelete
                    : undefined
                }
                wrapClass={theme.Grid.Modal.wrapClass}
                className={theme.Grid.Modal.className}
                headerClass={theme.Grid.Modal.headerClass}
                titleClass={theme.Grid.Modal.titleClass}
                bodyClass={theme.Grid.Modal.bodyClass}
                footerClass={theme.Grid.Modal.footerClass}
            >
                {modalComponent}
            </Modal>
        )}
    </>);
}

export default Grid;
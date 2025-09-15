import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {useTheme} from "../../Theme";
import Table, {TableHeaderProp} from "../ui/Table";
import Gallery from "../ui/Gallery";
import Card from "../ui/Card";
import db from "../../libs/database";
import Modal from "../ui/Modal";
import {getRecordValue, safeClone, trimSlash, ucfirst} from "../../libs/utils";
import {useLocation} from "react-router-dom";
import {converter} from "../../libs/converter";
import FormEnhancer, {extractComponentProps} from "../FormEnhancer";
import {RecordArray, RecordProps} from "../../integrations/google/firedatabase";
import Form, {FormRef} from "./Form";
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
    header?: string | React.ReactNode;
    headerAction?: string | React.ReactNode;
    footer?: string | React.ReactNode;
    allowedActions?: Array<"add" | "edit" | "delete">;
    modal?: {
        mode?: "form" | "empty";
        size?: "sm" | "md" | "lg" | "xl" | "fullscreen";
        position?: "center" | "top" | "left" | "right" | "bottom";
        setHeader?: (record?: RecordProps) => string;
        onOpen?: (data?: ModalProps) => React.ReactNode;
    };
    pagination?: PaginationParams
    setPrimaryKey?: (record: RecordProps) => string;
    onLoadRecord?: (record: RecordProps, index: number) => RecordProps | boolean;
    onDisplayBefore?: (records: RecordArray,
                       setRecords: React.Dispatch<React.SetStateAction<RecordArray | undefined>>,
                       setLoader?: React.Dispatch<React.SetStateAction<boolean>>
    ) => Promise<void> | void;
    // Form handlers for external control
    onSave?: ({record, action, storagePath}: {record?: RecordProps, storagePath?: string, action: 'create' | 'update'}) => Promise<string | undefined>;
    onDelete?: ({record}: {record?: RecordProps}) => Promise<void>;
    onFinally?: ({record, action}: {record?: RecordProps, action: 'create' | 'update' | 'delete'}) => Promise<boolean>;
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

interface ModalProps {
    record?: RecordProps;
    recordKey?: string;
    title?: string;
    dataStoragePath?: string;
}

interface OpenModalParams {
    title?: string;
    data?: RecordProps;
    recordKey?: string;
}

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
                       columns          = undefined,
                       format           = {},
                       dataStoragePath  = undefined,
                       dataArray        = undefined,
                       header           = undefined,
                       headerAction     = undefined,
                       footer           = undefined,
                       allowedActions   = undefined,
                       modal            = undefined,
                       pagination       = undefined,
                       setPrimaryKey    = undefined,
                       onLoadRecord     = undefined,
                       onDisplayBefore  = undefined,
                       onSave           = undefined,
                       onDelete         = undefined,
                       onFinally        = undefined,
                       onClick          = undefined,
                       children         = undefined,
                       scroll           = false,
                       type             = "table",
                       showLoader       = false,
                       groupBy          = undefined,
                       sticky           = undefined,
                       log              = false,
                       wrapClass        = undefined
}: GridProps) => {
    const theme = useTheme("grid");

    const [loader, setLoader] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<ModalProps | undefined>(undefined);
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
                acc[key] = typeof column.onDisplay === "string" ? ({value}) => converter[column.onDisplay as keyof typeof converter]?.(value) : column.onDisplay;
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

    // 3. Applicazione columnsFunc e onLoadRecord
    const body: RecordArray | undefined = useMemo(() => {
        if (!records) return undefined;

        return records.reduce((acc: RecordArray, item: RecordProps, index: number) => {
            const transformed = onLoadRecord ? onLoadRecord(item, index) : item;
            //@todo trovare un modo per non distruggere gli indici
            if (!transformed) return acc;

            const result = (transformed === true ? item : transformed);
            //@todo secondo me non serve
            const displayRow = {...result};
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
    }, [records, onLoadRecord, columnFormatters]);

    console.log("GRID", dataArray, dataStoragePath, body, records);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setModalData(undefined);
        setFormRef(undefined);
    }, []);

    const openModal = useCallback((
        {
            title       = undefined,
            data        = undefined,
            recordKey   = undefined
        }: OpenModalParams
    ): void => {
        const formDataStoragePath = recordKey 
            ? `${dataStoragePath}/${recordKey}`
            : dataStoragePath;

        setModalData({
            record: data,
            recordKey: recordKey,
            title: title,
            dataStoragePath: formDataStoragePath
        });
        setIsModalOpen(true);
    }, [dataStoragePath]);

    const handleSave = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) =>
          formRef?.handleSave(e, modal?.mode !== "empty" && !modalData?.recordKey).then(success => {
            success && closeModal();
            return success;
          }) ?? true,
        [formRef, modalData?.recordKey, closeModal, modal?.mode]
      );

    const handleDelete = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!formRef) return;
        
        await formRef.handleDelete(e);
        
        closeModal();
    }, [formRef, closeModal]);

    const handleClick = useCallback((index: number) => {
        const data = dataArray?.[index];

        if (!data) {
            console.error(`handleClick: Nessun dato trovato in dataArray all'indice ${index}`);
            return;
        }
        const record = safeClone(data);

        onClick?.(record);

        if (canEdit && record?._key) {
            openModal({
                title: modal?.setHeader?.(record) || "Modifica",
                data: record,
                recordKey: record._key
            });
        }
    }, [dataArray, onClick, canEdit, openModal, modal?.setHeader]);

    const setFormRefCallback = useCallback((ref: FormRef | null) => {
        setFormRef(ref ?? undefined);
        console.log("GRID: formRef callback", ref);
    }, []);

    const addNewButton = useMemo(() => {
        if ((children || modal) && (allowedActions && !allowedActions.includes("add"))) {
            return;
        }
        
        return (
            <button 
                className="btn btn-primary" 
                onClick={() => {
                    openModal({
                        title: modal?.setHeader?.() || "Aggiungi",
                    })
                }}
            >
                Aggiungi
            </button>
        );
    }, [children, allowedActions, openModal, modal?.setHeader]);

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
        
        const component = modal?.onOpen?.(modalData) || children;
        switch (modal?.mode || theme.Grid.Modal.mode) {
            case "form":
                return <Form
                    aspect="empty"
                    dataStoragePath={modalData.dataStoragePath}
                    defaultValues={modalData.record ?? {}}
                    log={log}
                    onSave={onSave}
                    onDelete={onDelete}
                    onFinally={onFinally}
                    setPrimaryKey={setPrimaryKey}
                    ref={setFormRefCallback}
                >
                    {component}
                </Form>
            case "empty":
            default:
                return component && React.isValidElement(component) && React.cloneElement(component as React.ReactElement, {
                    ...modalData,
                    ...component?.props,
                    ref: setFormRefCallback
                });
        }
    }, [modalData, modal?.mode, modal?.onOpen, children, log, onSave, onDelete, onFinally, setPrimaryKey, setFormRefCallback]);
    console.log("GRID: formRef", formRef);
    return (<>
        <Card
            wrapClass={wrapClass}
            header={(header || headerAction || addNewButton) &&  <>
                {header || <span />}
                {(headerAction || addNewButton) &&  (
                <span>
                    {headerAction}
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
        {modalData && isModalOpen && (
            <Modal
                size={modal?.size || theme.Grid.Modal.size}
                position={modal?.position || theme.Grid.Modal.position}
                title={modalData.title}
                onClose={closeModal}
                onSave={formRef?.handleSave ? handleSave : undefined}
                onDelete={formRef?.handleDelete && modalData.recordKey && (!allowedActions || allowedActions.includes("delete")) ? handleDelete : undefined}
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
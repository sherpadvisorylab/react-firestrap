import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {useTheme} from "../../Theme";
import Table, {TableHeaderProp} from "../ui/Table";
import Gallery from "../ui/Gallery";
import Card from "../ui/Card";
import db from "../../libs/database";
import Modal from "../ui/Modal";
import {safeClone, trimSlash, ucfirst} from "../../libs/utils";
import {useLocation} from "react-router-dom";
import {converter} from "../../libs/converter";
import {extractComponentProps} from "../ComponentEnhancer";
import {RecordArray, RecordProps} from "../../integrations/google/firedatabase";
import Form, {FormRef} from "./Form";

type ColumnFunction = (args: {
    value: any;
    record: any;
    key?: string;
}) => string;

type Column = TableHeaderProp & {
    onDisplay?: ColumnFunction;
};

type ColumnMap = Record<string, ColumnFunction>;

type GridProps = {
    columns?: Column[];
    format?: { [key: string]: string | ColumnFunction };
    dataStoragePath?: string;
    dataArray?: RecordArray;
    Header?: string | React.ReactNode;
    HeaderAction?: string | React.ReactNode;
    Footer?: string | React.ReactNode;
    allowedActions?: Array<"add" | "edit" | "delete">;
    modalSize?: string;
    setModalHeader?: (record?: RecordProps) => string;
    setPrimaryKey?: (record: RecordProps) => string;
    onLoadRecord?: (record: RecordProps, index: number) => RecordProps | boolean;
    onDisplayBefore?: (records: RecordArray,
                       setRecords: React.Dispatch<React.SetStateAction<RecordArray | undefined>>,
                       setLoader?: React.Dispatch<React.SetStateAction<boolean>>
    ) => Promise<void> | void;
    // Form handlers for external control
    onInsert?: (record: any) => Promise<void>;
    onUpdate?: (record: any) => Promise<void>;
    onDelete?: (record: any) => Promise<void>;
    onFinally?: (record: any, action: 'create' | 'update' | 'delete') => Promise<void>;
    onClick?: (record: RecordProps) => void;
    children?: React.ReactNode | ((props: { record?: RecordProps, key?: string }) => React.ReactNode);
    scroll?: boolean;
    type?: "table" | "gallery";
    showLoader?: boolean;
    groupBy?: string | string[];
    sticky?: "top" | "bottom";
    log?: boolean;
    wrapClass?: string;
};

interface OpenModalParams {
    title?: string;
    data?: RecordProps;
    key ?: string;
    savePath?: string;
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

const GridArray = ({
                       columns          = undefined,
                       format           = {},
                       dataStoragePath  = undefined,
                       dataArray        = undefined,
                       Header           = undefined,
                       HeaderAction     = undefined,
                       Footer           = undefined,
                       allowedActions   = undefined,
                       modalSize        = "lg",
                       setModalHeader   = undefined,
                       setPrimaryKey    = undefined,
                       onLoadRecord     = undefined,
                       onDisplayBefore  = undefined,
                       onInsert         = undefined,
                       onUpdate         = undefined,
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
    const [modalData, setModalData] = useState<{
        record?: RecordProps, 
        key?: string, 
        title?: string,
        dataStoragePath?: string
    } | undefined>(undefined);
    const [formRef, setFormRef] = useState<FormRef | null>(null);

    const [beforeRecords, setBeforeRecords] = useState<RecordArray | undefined>(undefined);
    useEffect(() => {
        if (!dataArray || !onDisplayBefore) return;
        console.log("GRID: onDisplayBefore", dataArray);
        onDisplayBefore(safeClone(dataArray), setBeforeRecords, setLoader);
    }, [dataArray, onDisplayBefore]);

    const records = useMemo(() => {
        if (!dataArray) return undefined;
        if (onDisplayBefore) return beforeRecords;

        return safeClone(dataArray);
    }, [dataArray, onDisplayBefore, beforeRecords]);

    // 1. Calcolo colonne
    const header: Column[] = useMemo(() => {
        if (columns) return columns;
        if (!records || records.length === 0) return [];

        return (
            children && typeof children !== 'function'
                ? extractComponentProps(children, (child) => ({
                    label: converter.toCamel(child.props.name, " "),
                    key: child.props.name,
                    sort: true,
                }))
                : Object.entries(records[0]).reduce((acc: Column[], [key, value]) => {
                    if (key.startsWith("_")) return acc;
                    if (
                        React.isValidElement(value) ||
                        typeof value !== 'object' ||
                        Array.isArray(value)
                    ) {
                        acc.push({
                            label: converter.toCamel(key, " "),
                            key,
                            sort: true,
                        });
                    }
                    return acc;
                }, [])
        );
    }, [columns, records, children]);

    // 2. Funzioni di formattazione colonne
    const columnsFunc: ColumnMap = useMemo(() => {
        return (header).reduce((acc: ColumnMap, column: Column) => {
            const key = column.key;
            const formatKey = format?.[column.key];

            if (column?.onDisplay) {
                acc[key] = column.onDisplay;
            } else if (formatKey && typeof formatKey === "function") {
                acc[key] = formatKey;
            } else if (formatKey) {
                const convFunc = (converter[formatKey]
                        ? formatKey
                        : `to${ucfirst(formatKey)}`
                );
                acc[key] = ({ value }) => (converter[convFunc]?.(value)) || value;
            }
            return acc;
        }, {});
    }, [header, format]);

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
            for (const key of Object.keys(columnsFunc)) {
                displayRow[key] = columnsFunc[key]({
                    value: result[key],
                    record: result,
                    key: item?._key
                });
            }

            acc.push(displayRow);
            return acc;
        }, []);
    }, [records, onLoadRecord, columnsFunc]);

    console.log("GRID", dataArray, dataStoragePath, body, records);

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(undefined);
        setFormRef(null);
    };

    const openModal = (
        {
            title       = undefined,
            data        = undefined,
            key         = undefined,
            savePath    = ""
        }: OpenModalParams
    ): void => {
        const formDataStoragePath = key 
            ? `${dataStoragePath}/${key}`
            : dataStoragePath;

        setModalData({
            record: data || {} as RecordProps,
            key: key,
            title: title,
            dataStoragePath: formDataStoragePath
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!formRef) return;
        
        await formRef.handleSave(e, !modalData?.key);
        
        closeModal();
    };

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!formRef) return;
        
        await formRef.handleDelete(e);
        
        closeModal();
    };

    const actionAddNew = children && (!allowedActions || allowedActions.includes("add")) && <button className="btn btn-primary" onClick={() => {
        openModal({
            title: setModalHeader?.(),
        })
    }}>Aggiungi</button>

    const canEdit = children && (!allowedActions || allowedActions.includes("edit"));

    const handleClick = (index: number) => {
        const data = dataArray?.[index];

        if (!data) {
            console.error(`handleClick: Nessun dato trovato in dataArray all'indice ${index}`);
            return;
        }
        const record = safeClone(data);

        onClick?.(record);

        if (canEdit && record?._key) {
            openModal({
                title: setModalHeader?.(record),
                data: record,
                key: record._key
            });
        }
    }

    const getComponent = () => {
        switch (type) {
            case "gallery":
                return <Gallery
                    body={body}
                    onClick={(onClick || canEdit) ? handleClick : undefined}
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
                    header={header}
                    body={body}
                    onClick={(onClick || canEdit) ? handleClick : undefined}
                    wrapClass={theme.Grid.Table.wrapperClass}
                    className={theme.Grid.Table.className}
                    headerClass={theme.Grid.Table.headerClass}
                    bodyClass={theme.Grid.Table.bodyClass}
                    footerClass={theme.Grid.Table.footerClass}
                    scrollClass={theme.Grid.Table.scrollClass}
                    selectedClass={!canEdit && (theme.Grid.Table.selectedClass)}
                />;
        }
    }

    const setFormRefCallback = useCallback((ref: FormRef | null) => {
        setFormRef(ref);
        console.log("GRID: formRef", ref);
    }, []);

    return (<>
        <Card
            wrapClass={wrapClass}
            header={(Header || HeaderAction || actionAddNew) &&  <>
                {Header || <span />}
                {(HeaderAction || actionAddNew) &&  (
                <span>
                    {HeaderAction}
                    {actionAddNew}
                </span>
                )}
            </>}
            footer={Footer}
            className={(theme.Grid.Card.className + (sticky ? ' sticky-' + sticky : '')).trim()}
            headerClass={theme.Grid.Card.headerClass}
            bodyClass={theme.Grid.Card.bodyClass}
            footerClass={theme.Grid.Card.footerClass}
            showLoader={loader || showLoader}
            showArrow={theme.Grid.Card.showArrow}
        >{getComponent()}</Card>
        {modalData && isModalOpen && (
            <Modal
                size={modalSize || theme.Grid.Modal.size}
                title={modalData.title || (modalData.key ? "Modifica" : "Aggiungi")}
                onClose={closeModal}
                onSave={handleSave}
                onDelete={modalData.key && (!allowedActions || allowedActions.includes("delete")) ? handleDelete : undefined}
                wrapClass={theme.Grid.Modal.wrapClass}
                className={theme.Grid.Modal.className}
                headerClass={theme.Grid.Modal.headerClass}
                titleClass={theme.Grid.Modal.titleClass}
                bodyClass={theme.Grid.Modal.bodyClass}
                footerClass={theme.Grid.Modal.footerClass}
            >
                <Form
                    dataStoragePath={modalData.dataStoragePath}
                    defaultValues={modalData.record}
                    log={log}
                    onInsert={onInsert}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onFinally={onFinally}
                    setPrimaryKey={setPrimaryKey}
                    ref={setFormRefCallback}
                >
                    {children}
                </Form>
            </Modal>
        )}
    </>);
}

export default Grid;
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTheme} from "../../Theme";
import Table, {TableHeaderProp} from "../ui/Table";
import Gallery from "../ui/Gallery";
import Card from "../ui/Card";
import db from "../../libs/database";
import Modal from "../ui/Modal";
import {generateUniqueId, normalizeKey, safeClone, trimSlash, ucfirst} from "../../libs/utils";
import {useLocation} from "react-router-dom";
import {converter} from "../../libs/converter";
import ComponentEnhancer, {extractComponentProps} from "../ComponentEnhancer";
import setLog from "../../libs/log";
import {RecordArray, RecordProps} from "../../integrations/google/firedatabase";
//todo: fare pulizia dei //todo: da togliere
//todo: gestire refDomElem poiche non viene mai scritto
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
    onInsertRecord?: (record: RecordProps) => Promise<RecordProps>;
    onUpdateRecord?: (record: RecordProps, key: string) => Promise<RecordProps>;
    onDeleteRecord?: (record: RecordProps, key: string) => Promise<boolean>;
    onFinallyRecord?: (action: string, record: RecordProps, key: string) => Promise<RecordProps>;
    onClick?: (record: RecordProps) => void;
    Form?: any;
    scroll?: boolean;
    type?: "table" | "gallery";
    showLoader?: boolean;
    groupBy?: string | string[];
    sticky?: "top" | "bottom";
    log?: boolean;
    wrapClass?: string;
};

type RecordForm = {
    data: RecordProps;
    savePath: string;
    key?: string;
    title?: string;
    form?: React.ReactNode;
    onInsert?: (record: RecordProps) => Promise<RecordProps>;
    onUpdate?: (record: RecordProps, key: string) => Promise<RecordProps>;
    onDelete?: (record: RecordProps, key: string) => Promise<boolean>;
    onFinally?: (action: string, record: RecordProps, key: string) => Promise<RecordProps>;
    genKey: (record: RecordProps) => string;
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
                       onInsertRecord   = undefined,
                       onUpdateRecord   = undefined,
                       onDeleteRecord   = undefined,
                       onFinallyRecord  = undefined,
                       onClick          = undefined,
                       Form             = undefined,
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
    const [record, setRecord] = useState<RecordForm | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const refDomElem = useRef<Record<string, HTMLElement | null>>({});

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
            Form && typeof Form !== 'function'
                ? extractComponentProps(Form, (child) => ({
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
    }, [columns, records, Form]);

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
        setRecord(undefined);
    };

    const openModal = (
        {
            title       = undefined,
            data        = undefined,
            key         = undefined,
            savePath    = ""
        }: OpenModalParams
    ): void => {
        setRecord({
            key: key,
            data: data || {} as RecordProps,
            title: title,
            form: Form && <ComponentEnhancer
                components={typeof Form === "function"
                    ? <Form record={data} />
                    : Form
                }
                record={data}
                handleChange={handleChange}
            />,
            savePath: savePath,
            onInsert: onInsertRecord,
            onUpdate: onUpdateRecord,
            onDelete: onDeleteRecord,
            onFinally: onFinallyRecord,
            genKey: setPrimaryKey || (() => generateUniqueId())
        });
        setIsModalOpen(true);
    };

    const getValue = (e: React.ChangeEvent<any>) => {
        const { type, value, checked } = e.target;

        if (type === 'checkbox') {
            return checked ? value : null;
        }

        return typeof value === 'string' ? value.trim() : value;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        const value = getValue(e);

        setRecord((prevState) => {
            if (!prevState) return undefined;

            return {
                ...prevState,
                data: {
                    ...prevState.data,
                    [name]: value,
                },
            };
        });
    };

    const handleSave = async () => {
        if(!record) return;

        const data = (
            record.key
            ? record.onUpdate && await record.onUpdate(record.data, record.key)
            : record.onInsert && await record.onInsert(record.data)
        ) || record.data;
        const key = record.key || normalizeKey(record.genKey(data));
        if (!key) {
            console.error("Save Failed: Key not generated correctly.");
            return;
        }
        dataStoragePath && db.set(`${dataStoragePath}/${key}${record.savePath}`, data)
            .then(() => {
                if (!record.key && key && refDomElem.current[key]) {
                    refDomElem.current[key]?.click();
                }
                console.log('Data updated successfully in Firebase');
            })
            .catch((error) => {
                console.error('Error updating data in Firebase:', error);
            })
            .finally(async() => {
                closeModal();

                const action = record.key ? "update" : "create";
                log && setLog(dataStoragePath, action, record.data, key);
                return record.onFinally && await record.onFinally(action, record.data, key);
            });
    };

    const handleDelete = async () => {
        if(!record?.key) return;

        const key = record.key;
        if (record.onDelete && await record.onDelete(record.data, key)) {
            return;
        }

        dataStoragePath && db.remove(`${dataStoragePath}/${key}`)
            .then(() => {
                console.log('Element deleted successfully from Firebase');
            })
            .catch((error) => {
                console.error('Error deleting element from Firebase:', error);
            })
            .finally(async() => {
                closeModal();

                log && setLog(dataStoragePath, "delete", record.data, key);
                return record.onFinally && await record.onFinally("delete", record.data, key);

            });
    };

    const actionAddNew = Form && (!allowedActions || allowedActions.includes("add")) && <button className="btn btn-primary" onClick={() => {
        openModal({
            title: setModalHeader?.(),
        })
    }}>Aggiungi</button>

    const canEdit = Form && (!allowedActions || allowedActions.includes("edit"));

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
        {record && isModalOpen && (
            <Modal
                size={modalSize || theme.Grid.Modal.size}
                title={record.title || (record.key ? "Modifica" : "Aggiungi")}
                onClose={closeModal}
                onSave={handleSave}
                onDelete={record.key && (!allowedActions || allowedActions.includes("delete")) ? handleDelete : undefined}
                wrapClass={theme.Grid.Modal.wrapClass}
                className={theme.Grid.Modal.className}
                headerClass={theme.Grid.Modal.headerClass}
                titleClass={theme.Grid.Modal.titleClass}
                bodyClass={theme.Grid.Modal.bodyClass}
                footerClass={theme.Grid.Modal.footerClass}
            ><div className={"row"}>
                {record.form}
            </div>
            </Modal>
        )}
    </>);
}

export default Grid;
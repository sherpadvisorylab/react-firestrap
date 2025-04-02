import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTheme} from "../Theme";
import Table, {TableHeaderProp} from "./Table";
import Gallery from "./Gallery";
import Card from "./Card";
import db from "../libs/database";
import Modal from "./Modal";
import {generateUniqueId, normalizeKey, safeClone, trimSlash, ucfirst} from "../libs/utils";
import {useLocation} from "react-router-dom";
import {converter} from "../libs/converter";
import ComponentEnhancer, {extractComponentProps} from "./ComponentEnhancer";
import setLog from "../libs/log";
import {RecordArray, RecordProps} from "../integrations/google/firedatabase";
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
    onDisplayBefore?: (records: RecordArray, setRecords: React.Dispatch<React.SetStateAction<RecordArray | undefined>>, setLoader: React.Dispatch<React.SetStateAction<boolean>>) => void;
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
    return props.dataArray
        ? <GridArray {...props} />
        : <GridDatabase {...props} />;
}

const GridDatabase = ({ dataStoragePath, ...props }: Omit<GridProps, 'dataArray'>) => {
    const [records, setRecords] = useState<RecordArray | undefined>(undefined);
    const location = useLocation();
    const dbStoragePath = dataStoragePath || trimSlash(location.pathname);

    db.useListener(dbStoragePath, setRecords);

    return <GridArray {...props} dataArray={records} />;
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
    const [records, setRecords] = useState<RecordArray | undefined>(undefined);
    const [record, setRecord] = useState<RecordForm | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const refDomElem = useRef<Record<string, HTMLElement | null>>({});
    const location = useLocation();
    //@todo: da valutare se serve o meno
    //const dbStoragePath = dataStoragePath || (dataStoragePath === false ? null : trimSlash(location.pathname));
    const dbStoragePath = dataStoragePath || trimSlash(location.pathname);

    //@todo: da capire chi valorizza a []
    console.warn(records, dataArray);
    if(!records && Array.isArray(dataArray) && dataArray.length === 0) {
        console.error("Revert records => dataArray");
        //dataArray = records;
    }

    useEffect(() => {
        if (!dataArray) return;

        const cloned = safeClone(dataArray);

        if (onDisplayBefore) {
            onDisplayBefore(cloned, setRecords, setLoader);
        } else {
            setRecords(cloned);
        }
    }, [dataArray, onDisplayBefore]);


    // 1. Calcolo colonne
    const computedColumns: Column[] = useMemo(() => {
        if (columns) return columns;
        if (!records) return [];

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
        return (computedColumns || []).reduce((acc: ColumnMap, column: Column) => {
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
    }, [computedColumns, format]);

    // 3. Applicazione columnsFunc e onLoadRecord
    const body: RecordArray | undefined = useMemo(() => {
        if (!records) return undefined;

        return records.reduce((acc: RecordArray, item: RecordProps, index: number) => {
            const transformed = onLoadRecord ? onLoadRecord(item, index) : item;
            if (!transformed) return acc;

            const result = (transformed === true ? item : transformed);
            for (const key of Object.keys(columnsFunc)) {
                result[key] = columnsFunc[key]({
                    value: result[key],
                    record: result,
                    key: result?._key
                });
            }

            acc.push(result);
            return acc;
        }, []);
    }, [records, onLoadRecord, columnsFunc]);

    //@todo: da capire chi valorizza a []
    if(Array.isArray(dataArray) && dataArray.length === 0) {
        console.log(records, dataArray, body);
        console.trace();
    }
    //@todo: da capire chi valorizza a []
    console.log("BOOODUUUUUUU", dataArray, dbStoragePath, body, records);

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

        return value.trim();
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
        dbStoragePath && db.set(`${dbStoragePath}/${key}${record.savePath}`, data)
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
                log && setLog(dbStoragePath, action, record.data, key);
                return record.onFinally && await record.onFinally(action, record.data, key);
            });
    };

    const handleDelete = async () => {
        if(!record?.key) return;

        const key = record.key;
        if (record.onDelete && await record.onDelete(record.data, key)) {
            return;
        }

        dbStoragePath && db.remove(`${dbStoragePath}/${key}`)
            .then(() => {
                console.log('Element deleted successfully from Firebase');
            })
            .catch((error) => {
                console.error('Error deleting element from Firebase:', error);
            })
            .finally(async() => {
                closeModal();

                log && setLog(dbStoragePath, "delete", record.data, key);
                return record.onFinally && await record.onFinally("delete", record.data, key);

            });
    };

    const actionAddNew = Form && (!allowedActions || allowedActions.includes("add")) && <button className="btn btn-primary" onClick={() => {
        openModal({
            title: setModalHeader?.(),
        })
    }}>Aggiungi</button>

    const canEdit = Form && (!allowedActions || allowedActions.includes("edit"));
    const handleClick = (record: RecordProps) => {
        onClick?.(record);

        const index = record._index;
        if (typeof index !== "number") {
            console.error("handleClick: _index non valido o assente nel record", record);
            return;
        }

        const data = safeClone(dataArray?.[index]);
        if (!data) {
            console.error(`handleClick: Nessun dato trovato in dataArray all'indice ${index}`);
            return;
        }

        if (canEdit && data?._key) {
            openModal({
                title: setModalHeader?.(record),
                data: data,
                key: data._key
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
                    header={columns || []}
                    body={body}
                    onClick={(onClick || canEdit) ? handleClick : undefined}
                    wrapClass={theme.Grid.Table.wrapperClass}
                    scrollClass={theme.Grid.Table.scrollClass}
                    tableClass={theme.Grid.Table.tableClass}
                    headerClass={theme.Grid.Table.headerClass}
                    bodyClass={theme.Grid.Table.bodyClass}
                    footerClass={theme.Grid.Table.footerClass}
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
            cardClass={(theme.Grid.Card.cardClass + (sticky ? ' sticky-' + sticky : '')).trim()}
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
                modalClass={theme.Grid.Modal.modalClass}
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
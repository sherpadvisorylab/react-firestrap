import React, {useEffect, useRef, useState} from 'react';
import {useTheme} from "../Theme";
import Table, {TableHeaderProp} from "./Table";
import Gallery from "./Gallery";
import Card from "./Card";
import db from "../libs/database";
import Modal from "./Modal";
import {generateUniqueId, normalizeKey, trimSlash, ucfirst} from "../libs/utils";
import {useLocation} from "react-router-dom";
import {converter} from "../libs/converter";
import ComponentEnhancer, {extractComponentProps} from "./ComponentEnhancer";
import setLog from "../libs/log";
import {RecordArray, RecordProps} from "../integrations/google/firedatabase";
//todo: fare pulizia dei //todo: da togliere
//todo: sistemare le key usando _key
//todo: far un altro useListener scorporando i filedmap. E cosi togliere i filedmap dal listener di base
type ColumnFunction = (args: {
    value: any;
    record: any;
    key?: string;
}) => string;

type Column = TableHeaderProp & {
    onDisplay?: ColumnFunction;
};

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
    setModalHeader?: (record?: any) => string;
    setPrimaryKey?: (record: any) => string;
    onLoadRecord?: (record: any, index: number) => any;
    onDisplayBefore?: (records: any, setRecords: (records: any) => void, setLoader: (loader: boolean) => void) => void;
    onInsertRecord?: (record: any) => any;
    onUpdateRecord?: (record: any, key: string) => any;
    onDeleteRecord?: (record: any, key: string) => boolean;
    onFinallyRecord?: (action: string, record: any, key: string) => any;
    onClick?: (record: RecordProps) => any;
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
    key?: string;
    data?: any;
    title?: string;
    form?: React.ReactNode;
    savePath: string;
    onInsert?: (record: any) => any;
    onUpdate?: (record: any, key: string) => any;
    onDelete?: (record: any, key: string) => boolean;
    onFinally?: (action: string, record: any, key: string) => any;
    genKey: (record: any) => string;
};

interface OpenModalParams {
    title?: string;
    data?: any;
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
    const refDomElem = useRef({});
    const location = useLocation();
    //@todo: da valutare se serve o meno
    //const dbStoragePath = dataStoragePath || (dataStoragePath === false ? null : trimSlash(location.pathname));
    const dbStoragePath = dataStoragePath || trimSlash(location.pathname);

    //@todo: da capire chi valorizza a []
    console.warn(records, dataArray);
    if(!records && Array.isArray(dataArray) && dataArray.length === 0) {
        console.error("Revert records => dataArray");
        dataArray = records;
    }

    useEffect(() => {
        if (onDisplayBefore && dataArray) {
            onDisplayBefore([...dataArray], setRecords, setLoader);
        } else {
            //setRecords(dataArray);
            setRecords(prevData => prevData == dataArray ? prevData : dataArray);
        }
    }, [dataArray, onDisplayBefore]);

    if (!columns && records) {
        columns = (
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
                    //value === null ||         todo: da capire se serve
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
        ) as Column[];
    }

    const columnsFunc = (columns || []).reduce((acc, column) => {
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
            )

            acc[key] = ({value}) => (converter[convFunc] && converter[convFunc](value)) || value;
        }
        return acc;
    }, {} as Record<string, ColumnFunction>);

    const body: RecordArray | undefined = records?.map((item, index) => {
        const originalRecord = typeof structuredClone === 'function'
            ? structuredClone(item)
            : JSON.parse(JSON.stringify(item));

        const onLoadResult = onLoadRecord ? onLoadRecord(originalRecord, index) : originalRecord;
        const record = onLoadResult === true ? originalRecord : { ...onLoadResult };

        for (const [key, value] of Object.entries(originalRecord)) {
            if (key.startsWith("_")) {
                record[key] = value;
            } else if (columnsFunc[key]) {
                record[key] = columnsFunc[key]({
                    value,
                    record: originalRecord,
                    key: originalRecord._key
                });
            }
        }

        return record;
    });

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
           title    = undefined,
           data     = undefined,
           savePath = ""
        }: OpenModalParams,
        key?: string
    ): void => {
        setRecord({
            key: key,
            data: data,
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
        } as RecordForm);
        setIsModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const name = e.target.name;
        const value = e.target.value;

        setRecord((prevState) => ({
            ...prevState,
            data: typeof prevState.data === 'string' ? value : {
                ...prevState.data,
                [name]: typeof value === 'string' ? value.trim() : value,
            },
        }));
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
                if (!record.key && key && refDomElem[key]) {
                    refDomElem[key].click();
                }
                console.log('Data updated successfully in Firebase');
            })
            .catch((error) => {
                console.error('Error updating data in Firebase:', error);
            })
            .finally(() => {
                closeModal();

                const action = record.key ? "update" : "create";
                log && setLog(dbStoragePath, action, record.data, key);
                return record.onFinally && record.onFinally(action, record.data, key);
            });
    };

    const handleDelete = () => {
        if(!record?.key) return;

        const key = record.key;
        if (record.onDelete && record.onDelete(record.data, key)) {
            return;
        }

        dbStoragePath && db.remove(`${dbStoragePath}/${key}`)
            .then(() => {
                console.log('Element deleted successfully from Firebase');
            })
            .catch((error) => {
                console.error('Error deleting element from Firebase:', error);
            })
            .finally(() => {
                closeModal();

                log && setLog(dbStoragePath, "delete", record.data, key);
                return record.onFinally && record.onFinally("delete", record.data, key);

            });
    };

    const actionAddNew = Form && (!allowedActions || allowedActions.includes("add")) && <button className="btn btn-primary" onClick={() => {
        openModal({
            title: setModalHeader && setModalHeader(),
        })
    }}>Aggiungi</button>

    const canEdit = Form && (!allowedActions || allowedActions.includes("edit"));
    const handleClick = (record: RecordProps) => {
        onClick?.(record);

        if (canEdit && record._key) {
            openModal({
                title: setModalHeader?.(record),
                data: record
            }, record._key);
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
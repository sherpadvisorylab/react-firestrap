import React, {useEffect, useRef, useState} from 'react';
import {useTheme} from "../Theme";
import Table from "./Table";
import Gallery from "./Gallery";
import Card from "./Card";
import db from "../libs/database";
import Modal from "./Modal";
import {generateUniqueId, normalizeKey, trimSlash, ucfirst} from "../libs/utils";
import {useLocation} from "react-router-dom";
import {converter} from "../libs/converter";
import ComponentEnhancer, {extractComponentProps} from "./ComponentEnhancer";
import setLog from "../libs/log";


function Grid({
    columns = null,
    format = {},
    dataStoragePath = null,
    dataArray = null,
    Header = null,
    HeaderAction = null,
    Footer = null,
    allowedActions = null,
    modalSize = "lg",
    setModalHeader = null,
    setPrimaryKey = null,
    onLoadRecord = null,
    onDisplayBefore = null,
    onInsertRecord = null,
    onUpdateRecord = null,
    onDeleteRecord = null,
    onFinallyRecord = null,
    onClick = null,
    Form = null,
    wrapClass = null,
    scroll = false,
    type = "table",
    showLoader =  false,
    groupBy = null,
    sticky= null,
    log= false
}: {
    columns?: Array<{ label: string, key: string, sort?: boolean, onDisplay?: (value: string, record: any, key: string) => string }>,
    format?: { [key: string]: string | ((data: string) => string) },
    dataStoragePath?: string,
    dataArray?: Array<{ [key: string]: any }>,
    Header?: string | React.ReactNode,
    HeaderAction?: string | React.ReactNode,
    Footer?: string | React.ReactNode,
    allowedActions ?: Array<"add" | "edit" | "delete">,
    modalSize ?: string,
    setModalHeader ?: (record ?: any) => string,
    setPrimaryKey ?: (record: any) => string,
    onLoadRecord?: (record: any, index, number) => any,
    onDisplayBefore?: (records: any, setRecords: (records: any) => void, setLoader: (loader: boolean) => void) => void,
    onInsertRecord?: (record: any, key: string) => any,
    onUpdateRecord?: (record: any, key: string) => any,
    onDeleteRecord?: (record: any, key: string) => any,
    onFinallyRecord?: (action: string, record: any, key: string) => any,
    onClick?: (record: any, key: string) => any,
    Form?: any,
    wrapClass?: string,
    scroll?: boolean,
    type?: "table" | "gallery",
    showLoader?: boolean,
    groupBy?: string | string[],
    sticky?: "top" | "bottom",
    log?: boolean
}) {
    return (dataArray
        ? <GridArray
            columns={columns}
            format={format}
            dataArray={dataArray}
            Header={Header}
            HeaderAction={HeaderAction}
            Footer={Footer}
            allowedActions={allowedActions}
            modalSize={modalSize}
            setModalHeader={setModalHeader}
            setPrimaryKey={setPrimaryKey}
            onLoadRecord={onLoadRecord}
            onDisplayBefore={onDisplayBefore}
            onInsertRecord={onInsertRecord}
            onUpdateRecord={onUpdateRecord}
            onDeleteRecord={onDeleteRecord}
            onFinallyRecord={onFinallyRecord}
            onClick={onClick}
            Form={Form}
            wrapClass={wrapClass}
            scroll={scroll}
            type={type}
            showLoader={showLoader}
            groupBy={groupBy}
            sticky={sticky}
            log={log}
        />
        : <GridDatabase
            columns={columns}
            format={format}
            dataStoragePath={dataStoragePath}
            Header={Header}
            HeaderAction={HeaderAction}
            Footer={Footer}
            allowedActions={allowedActions}
            modalSize={modalSize}
            setModalHeader={setModalHeader}
            setPrimaryKey={setPrimaryKey}
            onLoadRecord={onLoadRecord}
            onDisplayBefore={onDisplayBefore}
            onInsertRecord={onInsertRecord}
            onUpdateRecord={onUpdateRecord}
            onDeleteRecord={onDeleteRecord}
            onFinallyRecord={onFinallyRecord}
            onClick={onClick}
            Form={Form}
            wrapClass={wrapClass}
            scroll={scroll}
            type={type}
            showLoader={showLoader}
            groupBy={groupBy}
            sticky={sticky}
            log={log}
        />
    );
}

function GridDatabase({
                  columns = null,
                  format = {},
                  dataStoragePath = null,
                  Header = null,
                  HeaderAction = null,
                  Footer = null,
                  allowedActions = null,
                  modalSize = "lg",
                  setModalHeader = null,
                  setPrimaryKey = null,
                  onLoadRecord = null,
                  onDisplayBefore = null,
                  onInsertRecord = null,
                  onUpdateRecord = null,
                  onDeleteRecord = null,
                  onFinallyRecord = null,
                  onClick = null,
                  Form = null,
                  wrapClass = null,
                  scroll = false,
                  type = "table",
                  showLoader =  false,
                  groupBy = null,
                  sticky= null,
                  log= false
              }: {
    columns?: Array<{ label: string, key: string, sort?: boolean, onDisplay?: (value: string, record: any, key: string) => string }>,
    format?: { [key: string]: string | ((data: string) => string) },
    dataStoragePath?: string,
    Header?: string | React.ReactNode,
    HeaderAction?: string | React.ReactNode,
    Footer?: string | React.ReactNode,
    allowedActions ?: Array<"add" | "edit" | "delete">,
    modalSize ?: string,
    setModalHeader ?: (record ?: any) => string,
    setPrimaryKey ?: (record: any) => string,
    onLoadRecord?: (record: any, index, number) => any,
    onDisplayBefore?: (records: any, setRecords: (records: any) => void, setLoader: (loader: boolean) => void) => void,
    onInsertRecord?: (record: any, key: string) => any,
    onUpdateRecord?: (record: any, key: string) => any,
    onDeleteRecord?: (record: any, key: string) => any,
    onFinallyRecord?: (action: string, record: any, key: string) => any,
    onClick?: (record: any, key: string) => any,
    Form?: any,
    wrapClass?: string,
    scroll?: boolean,
    type?: "table" | "gallery",
    showLoader?: boolean,
    groupBy?: string | string[],
    sticky?: "top" | "bottom",
    log?: boolean
}) {
    const [records, setRecords] = useState(null);
    const location = useLocation();
    const dbStoragePath = dataStoragePath || (dataStoragePath === false ? null : trimSlash(location.pathname));

    db.useListener(dbStoragePath, setRecords);

    return <GridArray
                columns={columns}
                format={format}
                dataStoragePath={dataStoragePath}
                dataArray={records}
                Header={Header}
                HeaderAction={HeaderAction}
                Footer={Footer}
                allowedActions={allowedActions}
                modalSize={modalSize}
                setModalHeader={setModalHeader}
                setPrimaryKey={setPrimaryKey}
                onLoadRecord={onLoadRecord}
                onDisplayBefore={onDisplayBefore}
                onInsertRecord={onInsertRecord}
                onUpdateRecord={onUpdateRecord}
                onDeleteRecord={onDeleteRecord}
                onFinallyRecord={onFinallyRecord}
                onClick={onClick}
                Form={Form}
                wrapClass={wrapClass}
                scroll={scroll}
                type={type}
                showLoader={showLoader}
                groupBy={groupBy}
                sticky={sticky}
                log={log}
            />
}

function GridArray({
                  columns = null,
                  format = {},
                  dataStoragePath = null,
                  dataArray = null,
                  Header = null,
                  HeaderAction = null,
                  Footer = null,
                  allowedActions = null,
                  modalSize = "lg",
                  setModalHeader = null,
                  setPrimaryKey = null,
                  onLoadRecord = null,
                  onDisplayBefore = null,
                  onInsertRecord = null,
                  onUpdateRecord = null,
                  onDeleteRecord = null,
                  onFinallyRecord = null,
                  onClick = null,
                  Form = null,
                  wrapClass = null,
                  scroll = false,
                  type = "table",
                  showLoader =  false,
                  groupBy = null,
                  sticky = null,
                  log = false
              }: {
    columns?: Array<{ label: string, key: string, sort?: boolean, onDisplay?: (value: string, record: any, key: string) => string }>,
    format?: { [key: string]: string | ((data: string) => string) },
    dataStoragePath?: string,
    dataArray?: Array<{ [key: string]: any }>,
    Header?: string | React.ReactNode,
    HeaderAction?: string | React.ReactNode,
    Footer?: string | React.ReactNode,
    allowedActions ?: Array<"add" | "edit" | "delete">,
    modalSize ?: string,
    setModalHeader ?: (record ?: any) => string,
    setPrimaryKey ?: (record: any) => string,
    onLoadRecord?: (record: any, index, number) => any,
    onDisplayBefore?: (records: any, setRecords: (records: any) => void, setLoader: (loader: boolean) => void) => void,
    onInsertRecord?: (record: any, key: string) => any,
    onUpdateRecord?: (record: any, key: string) => any,
    onDeleteRecord?: (record: any, key: string) => any,
    onFinallyRecord?: (action: string, record: any, key: string) => any,
    onClick?: (record: any, key: string) => any,
    Form?: any,
    wrapClass?: string,
    scroll?: boolean,
    type?: "table" | "gallery",
    showLoader?: boolean,
    groupBy?: string | string[],
    sticky?: "top" | "bottom",
    log?: boolean
}) {
    const theme = useTheme();

    const [loader, setLoader] = useState(false);
    const [records, setRecords] = useState(null);
    const [record, setRecord] = useState({ id: null, data: {} });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const refDomElem = useRef({});
    const location = useLocation();
    const dbStoragePath = dataStoragePath || (dataStoragePath === false ? null : trimSlash(location.pathname));

    //@todo: da capire chi valorizza a []
    console.warn(records, dataArray);
    if(!records && Array.isArray(dataArray) && dataArray.length === 0) {
        console.error("Revert records => dataArray");
        dataArray = records;
    }

    useEffect(() => {
        if (onDisplayBefore && dataArray) {
            onDisplayBefore(Array.isArray(dataArray) ? [...dataArray] : {...dataArray}, setRecords, setLoader);
        } else {
            //setRecords(dataArray);
            setRecords(prevData => prevData == dataArray ? prevData : dataArray);
        }
    }, [dataArray, onDisplayBefore]);

    if (!columns && records) {
        columns = (Form && typeof Form !== 'function'
            ? extractComponentProps(Form, (child) => {
                return { label: converter.toCamel(child.props.name, " "), key: child.props.name, sort: true}
            })
            : Object.keys(Object.values(records)[0] || {}).reduce((acc, key) => {
                const value = Object.values(records)[0][key];
                if (React.isValidElement(value) || typeof value !== 'object' || value === null || Array.isArray(value)) {
                    acc.push({ label: converter.toCamel(key, " "), key: key, sort: true });
                }
                return acc;
            }, [])
        );
    }

    const columnsFunc = (columns || []).reduce((acc, column) => {
        if (column?.onDisplay) {
            acc[column.key] = column.onDisplay;
        } else if (format[column.key] && typeof format[column.key] === "function") {
            acc[column.key] = format[column.key];
        } else if (format[column.key] && typeof format[column.key] === "string") {
            const convFunc = (converter[format[column.key]]
                    ? format[column.key]
                    : `to${ucfirst(format[column.key])}`
            )

            acc[column.key] = ({value}) => (converter[convFunc] && converter[convFunc](value)) || value;
        }
        return acc;
    }, {});

    const body = (records
        ? Object.keys(records).map((key) => {
            const originalRecord = {...records[key]};
            const onLoadResult = onLoadRecord ? onLoadRecord(originalRecord, key) : originalRecord;

            const record = {
                key: key,
                ...(onLoadResult === true
                    ? originalRecord
                    : onLoadResult
                )
            };

            for (const colKey of Object.keys(columnsFunc)) {
                record[colKey] = columnsFunc[colKey]({value: originalRecord[colKey] , record: originalRecord, key});
            }

            return record;
        })
        : records
    );

    //@todo: da capire chi valorizza a []
    if(Array.isArray(dataArray) && dataArray.length === 0) {
        console.log(records, dataArray, body);
        console.trace();
    }
    //@todo: da capire chi valorizza a []
    console.log("BOOODUUUUUUU", dataArray, dbStoragePath, body, records);

    const closeModal = () => {
        setIsModalOpen(false);
        setRecord(null);
    };

    const openModal = ({
                           title    = null,
                           data     = null,
                           savePath = ""
                       }, key = null
    ) => {
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
        });
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
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
        const data = (
            record.key
            ? record.onUpdate && await record.onUpdate(record.data, record.key)
            : record.onInsert && await record.onInsert(record.data, record.key)
        ) || record.data;
        const key = record.key || normalizeKey(record.genKey(data));
        if (!key) {
            console.error("Save Failed: Key not generated correctly.");
            return;
        }
        db.set(`${dbStoragePath}/${key}${record.savePath}`, data)
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

                const action = record.key ? "update" : "insert";
                log && setLog(dbStoragePath, action, record.data, record.key);
                return record.onFinally && record.onFinally(action, record.data, record.key);
            });
    };

    const handleDelete = () => {
        if (record.onDelete && record.onDelete(record.data, record.key)) {
            return;
        }

        db.remove(`${dbStoragePath}/${record.key}`)
            .then(() => {
                console.log('Element deleted successfully from Firebase');
            })
            .catch((error) => {
                console.error('Error deleting element from Firebase:', error);
            })
            .finally(() => {
                closeModal();

                log && setLog(dbStoragePath, "delete", record.data, record.key);
                return record.onFinally && record.onFinally("delete", record.data, record.key);

            });
    };

    const actionAddNew = Form && (!allowedActions || allowedActions.includes("add")) && <button className="btn btn-primary" onClick={() => {
        openModal({
            title: setModalHeader && setModalHeader(),
        })
    }}>Aggiungi</button>

    const actionEdit = Form && (!allowedActions || allowedActions.includes("edit")) ? (key) => {
        openModal({
            title: setModalHeader && setModalHeader(records[key]),
            data: records[key]
        }, key);
    } : null;

    const handleClick = (key) => {
        onClick && onClick(records[key], key);
        actionEdit && actionEdit(key);
    }

    const getComponent = () => {
        switch (type) {
            case "gallery":
                return <Gallery
                    header={columns}
                    body={body}
                    onClick={(onClick || actionEdit) && handleClick }
                    wrapperClass={theme.Grid.Gallery.wrapperClass}
                    scrollClass={theme.Grid.Gallery.scrollClass}
                    galleryClass={theme.Grid.Gallery.galleryClass}
                    headerClass={theme.Grid.Gallery.headerClass}
                    bodyClass={theme.Grid.Gallery.bodyClass}
                    footerClass={theme.Grid.Gallery.footerClass}
                    selectedClass={!actionEdit && theme.Grid.Gallery.selectedClass}
                    gutterSize={theme.Grid.Gallery.gutterSize}
                    rowCols={theme.Grid.Gallery.rowCols}
                    groupBy={groupBy}

                />;
            case "table":
            default:
                return <Table
                    header={columns}
                    body={body}
                    onClick={(onClick || actionEdit) && handleClick }
                    wrapClass={theme.Grid.Table.wrapperClass}
                    scrollClass={theme.Grid.Table.scrollClass}
                    tableClass={theme.Grid.Table.tableClass}
                    headerClass={theme.Grid.Table.headerClass}
                    bodyClass={theme.Grid.Table.bodyClass}
                    footerClass={theme.Grid.Table.footerClass}
                    selectedClass={!actionEdit && theme.Grid.Table.selectedClass}
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
        {isModalOpen && (
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
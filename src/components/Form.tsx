import React, {useEffect, useState} from 'react';
import {useLocation} from "react-router-dom";
import {Wrapper} from "./GridSystem";
import ComponentEnhancer from "./ComponentEnhancer";
import {trimSlash} from "../libs/utils";
import db from "../libs/database";
import Card from "./Card";
import {LoadingButton} from "./Buttons";
import setLog from "../libs/log";
import {useTheme} from "../Theme";
import Alert from "./Alert";

function Form({
                  children,
                  header= null,
                  footer= null,
                  dataStoragePath = null,
                  dataObject = null,
                  onLoad = null,
                  onInsert = null,
                  onUpdate = null,
                  onDelete = null,
                  onFinally = null,
                  log = false,
                  showNotice = true,
                  wrapClass = null,
                  headerClass = null,
                  className = null,
                  footerClass = null
              }) {


    return dataObject
        ? <FormData
            children={children}
            header={header}
            footer={footer}
            dataStoragePath={dataStoragePath}
            dataObject={dataObject}
            onLoad={onLoad}
            onInsert={onInsert}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onFinally={onFinally}
            log={log}
            showNotice={showNotice}
            wrapClass={wrapClass}
            headerClass={headerClass}
            className={className}
            footerClass={footerClass}
        />
        : <FormDatabase
            children={children}
            header={header}
            footer={footer}
            dataStoragePath={dataStoragePath}
            onLoad={onLoad}
            onInsert={onInsert}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onFinally={onFinally}
            log={log}
            showNotice={showNotice}
            wrapClass={wrapClass}
            headerClass={headerClass}
            className={className}
            footerClass={footerClass}
        />
}

function FormDatabase({
                          children,
                          header = null,
                          footer = null,
                          dataStoragePath = null,
                          onLoad = null,
                          onInsert = null,
                          onUpdate = null,
                          onDelete = null,
                          onFinally = null,
                          log = false,
                          showNotice = true,
                          wrapClass = null,
                          headerClass = null,
                          className = null,
                          footerClass = null
                      }) {
    const [record, setRecord] = useState(null);
    const location = useLocation();
    const dbStoragePath = dataStoragePath || (dataStoragePath === false ? null : trimSlash(location.pathname));

    db.useListener(dbStoragePath, setRecord);

    return <FormData
        children={children}
        header={header}
        footer={footer}
        dataStoragePath={dbStoragePath}
        dataObject={record}
        onLoad={onLoad}
        onInsert={onInsert}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onFinally={onFinally}
        log={log}
        showNotice={showNotice}
        wrapClass={wrapClass}
        headerClass={headerClass}
        className={className}
        footerClass={footerClass}
    />
}

function FormData({
                  children,
                  header = null,
                  footer = null,
                  dataStoragePath = null,
                  dataObject = null,
                  onLoad = null,
                  onInsert = null,
                  onUpdate = null,
                  onDelete = null,
                  onFinally = null,
                  log = false,
                  showNotice = true,
                  wrapClass = null,
                  headerClass = null,
                  className = null,
                  footerClass = null
              }) {
    const theme = useTheme();

    const [record, setRecord] = useState(undefined);
    const [notification, setNotification] = useState(null);

    const notice = (message, type = "danger") => {
        if (showNotice) {
            setNotification({type, message});
            setTimeout(() => setNotification(null), 5000);
        }
    };

    useEffect(() => {
        setRecord(prevData => prevData == dataObject ? prevData : dataObject);
    }, [dataObject]);

    const handleChange = (e) => {
        setRecord(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        showNotice && setNotification(null);
        dataObject && onInsert && await onInsert(record);
        !dataObject && onUpdate && await onUpdate(record);
        dataStoragePath && await db.set(dataStoragePath, record);

        await handleFinally(dataObject ? "update" : "insert");
    };

    const handleDelete = async (e) => {
        e.preventDefault();

        showNotice && setNotification(null);
        dataStoragePath && await db.remove(dataStoragePath);

        await handleFinally("delete");
    };

    const handleFinally = async(action) => {
        log && setLog(dataStoragePath, action, record);

        onFinally && await onFinally();

        notice(`Record ${action}ed successfully`, "success");
    }

    return (
        <Wrapper className={wrapClass || theme.Form.wrapClass}>
            {notification && (
                <Alert type={notification.type}>
                    {notification.message}
                </Alert>
            )}
            <Card
                header={header || (dataObject ? "Update Record" : "Insert Record")}
                footer={footer !== false && <>
                    {footer}
                    {(onInsert || dataStoragePath) && !dataObject && <LoadingButton
                        className="btn-primary"
                        label={"Insert"}
                        onClick={handleSave}
                    />}
                    {(onUpdate || dataStoragePath) && dataObject && <LoadingButton
                        className="btn-primary"
                        label={"Update"}
                        onClick={handleSave}
                    />}
                    {(onDelete || dataStoragePath) && <LoadingButton
                        className="btn-danger"
                        label={"Delete"}
                        onClick={handleDelete}
                    />}
                </>}
                headerClass={headerClass || theme.Form.Card.headerClass}
                bodyClass={className || theme.Form.Card.bodyClass}
                footerClass={footerClass || theme.Form.Card.footerClass}
            >
                <ComponentEnhancer
                    components={children}
                    record={record}
                    handleChange={handleChange}
                />
            </Card>
        </Wrapper>
    )
}

export default Form;
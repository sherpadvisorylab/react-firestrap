import React, {useEffect, useState} from 'react';
import {useLocation} from "react-router-dom";
import {Wrapper} from "../ui/GridSystem";
import ComponentEnhancer from "../ComponentEnhancer";
import {trimSlash} from "../../libs/utils";
import db from "../../libs/database";
import Card from "../ui/Card";
import {BackLink, LoadingButton} from "../ui/Buttons";
import setLog from "../../libs/log";
import {useTheme} from "../../Theme";
import Alert from "../ui/Alert";
import {RecordProps} from "../../integrations/google/firedatabase";
import {converter} from "../../libs";

export interface FormProps {
    children: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode | false;
    dataStoragePath?: string;
    dataObject?: any;
    onLoad?: () => void;
    onInsert?: (record: any) => Promise<void>;
    onUpdate?: (record: any) => Promise<void>;
    onDelete?: (record: any) => Promise<void>;
    onFinally?: () => Promise<void>;
    log?: boolean;
    showNotice?: boolean;
    showBack?: boolean;
    wrapClass?: string;
    headerClass?: string;
    className?: string;
    footerClass?: string;
}

function Form(props: FormProps) {
    return props.dataObject
        ? <FormData {...props} />
        : <FormDatabase {...props} />;
}

export function FormDatabase(props: FormProps) {
    const { dataStoragePath, dataObject, ...rest } = props;
    const location = useLocation();

    const dbStoragePath = props.dataStoragePath ?? trimSlash(location.pathname);
    const [record, setRecord] = useState<any>(undefined);

    useEffect(() => {
        db.read(dbStoragePath).then(data => {
            setRecord({...dataObject, ...data});
        }).catch(error => {
            console.error(error);
            setRecord({});
        });
    }, [dbStoragePath]);

    if (!record) {
        return <p className={"p-4"}><i className={"spinner-border spinner-border-sm"}></i> Caricamento in corso...</p>;
    }

    return <FormData {...rest} dataObject={record} dataStoragePath={dbStoragePath} />;
}

type NoticeProps = {
    type: "danger" | "success" | "info" | "warning" | "primary" | "secondary" | "light" | "dark";
    message: string;
};


export function FormData({
                  children,
                  header            = undefined,
                  footer            = undefined,
                  dataStoragePath   = undefined,
                  dataObject        = undefined,
                  onLoad            = undefined,
                  onInsert          = undefined,
                  onUpdate          = undefined,
                  onDelete          = undefined,
                  onFinally         = undefined,
                  log               = false,
                  showNotice        = true,
                  showBack          = true,
                  wrapClass         = undefined,
                  headerClass       = undefined,
                  className         = undefined,
                  footerClass       = undefined
} : FormProps) {
    const theme = useTheme("form");

    const [record, setRecord] = useState<RecordProps | undefined>(dataObject);
    const [notification, setNotification] = useState<NoticeProps | undefined>(undefined);

    console.log("FORM", record);
    const notice = ({ message, type = "danger" }: NoticeProps) => {
        if (showNotice) {
            setNotification({type, message});
            setTimeout(() => setNotification(undefined), 5000);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("CHANGE", e.target.name, e.target.value, record);
        setRecord(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const handleSave = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        showNotice && setNotification(undefined);
        dataObject && onInsert && await onInsert(record);
        !dataObject && onUpdate && await onUpdate(record);
        dataStoragePath && await db.set(dataStoragePath, record);

        await handleFinally(dataObject ? "update" : "create");
    };

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        showNotice && setNotification(undefined);
        dataStoragePath && await db.remove(dataStoragePath);

        await handleFinally("delete");
    };

    const handleFinally = async(action: 'create' | 'update' | 'delete') => {
        log && dataStoragePath && setLog(dataStoragePath, action, record);

        onFinally && await onFinally();

        notice({message: `Record ${action}ed successfully`, type: "success"});
    }

    return (
        <Wrapper className={wrapClass || theme.Form.wrapClass}>
            {notification && (
                <Alert type={notification.type}>
                    {notification.message}
                </Alert>
            )}
            <Card
                header={header || (dataObject ? "Update " : "Insert ") + converter.toCamel(dataStoragePath ?? "Record", "/")}
                footer={footer !== false && <>
                    {footer}
                    {(onInsert || dataStoragePath) && !dataObject && <LoadingButton
                        className={theme.Form.buttonSaveClass}
                        label={"Insert"}
                        onClick={handleSave}
                    />}
                    {(onUpdate || dataStoragePath) && dataObject && <LoadingButton
                        className={theme.Form.buttonSaveClass}
                        label={"Update"}
                        onClick={handleSave}
                    />}
                    {(onDelete || dataStoragePath) && dataObject && <LoadingButton
                        className={theme.Form.buttonDeleteClass}
                        label={"Delete"}
                        onClick={handleDelete}
                    />}
                    {showBack && <BackLink
                        className={theme.Form.buttonBackClass}
                        label={"Back"}
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
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
import {FieldDefinition} from "../Models";
import Breadcrumbs from "../blocks/Breadcrumbs";


type FormFieldsProps = { [key: string]: React.ReactNode };

interface BaseFormProps {
    header?: React.ReactNode;
    footer?: React.ReactNode | false;
    dataStoragePath?: string;
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
interface FormDefaultProps extends BaseFormProps {
    children: React.ReactNode;
    dataObject?: any;
}

interface FormModelProps extends BaseFormProps {
    model: { [key: string]: FieldDefinition<any> | React.ReactNode };
    children?: ((fields: { [key: string]: React.ReactNode }) => React.ReactNode);
}

interface FormProps extends BaseFormProps {
    model?: { [key: string]: FieldDefinition<any> | React.ReactNode };
    children?: React.ReactNode | ((fields: { [key: string]: React.ReactNode }) => React.ReactNode);
    dataObject?: any;
}
function Form(props: FormProps) {
    const { model, dataObject, children, ...rest } = props;

    if (model) {
        return (
            <FormModel model={model} {...rest}>
                {typeof children === 'function' ? children : () => <>{children}</>}
            </FormModel>
        );
    }

    const formChildren = children as React.ReactNode;
    return dataObject
        ? <FormData children={formChildren} dataObject={dataObject} {...rest} />
        : <FormDatabase children={formChildren} dataObject={dataObject} {...rest} />;
}

export function FormDatabase(props: FormDefaultProps) {
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
                  showBack          = false,
                  wrapClass         = undefined,
                  headerClass       = undefined,
                  className         = undefined,
                  footerClass       = undefined
} : FormDefaultProps) {
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
                header={header ||  <Breadcrumbs pre={(dataObject ? "Update " : "Insert ")} path={dataStoragePath ?? "Record"} />}
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

function normalizeValue(value: any): any {
    if (Array.isArray(value)) {
        return value.map(normalizeValue);
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([k, v]) => [k, normalizeValue(v)])
        );
    }
    return value === undefined ? null : value;
}

function isFieldDefinition(obj: any): obj is FieldDefinition<any> {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.form === 'function'
    );
}

export function FormModel({
                                 model,
                                 children,
                                 ...formProps
                             }: FormModelProps
) {
    const [fields, values] = React.useMemo(() => {
        if (!model) return [{}, {}];

        let defaults: Record<string, any> = {};

        const fieldMap = Object.entries(model).reduce((acc: FormFieldsProps, [key, fieldModel]) => {
            if (isFieldDefinition(fieldModel)) {
                acc[key] = fieldModel.form(key);
                defaults = { ...defaults, ...fieldModel.defaults?.(key) };
            } else {
                acc[key] = fieldModel;
            }
            return acc;
        }, {});

        return [fieldMap, normalizeValue(defaults)];
    }, [model]);

    return (
        <FormDatabase dataObject={values} {...formProps}>
            {typeof children === 'function'
                ? children(fields)
                : Object.values(fields)}
        </FormDatabase>
    );
}

export default Form;
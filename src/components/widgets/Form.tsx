import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { useLocation } from "react-router-dom";
import { Wrapper } from "../ui/GridSystem";
import FormEnhancer from "../FormEnhancer";
import { trimSlash } from "../../libs/utils";
import db from "../../libs/database";
import Card from "../ui/Card";
import { BackLink, LoadingButton } from "../ui/Buttons";
import setLog from "../../libs/log";
import { useTheme } from "../../Theme";
import Alert from "../ui/Alert";
import { RecordProps } from "../../integrations/google/firedatabase";
import {FormTree, ModelProps, buildFormFields} from "../Component";
import Breadcrumbs from "../blocks/Breadcrumbs";

interface BaseFormProps {
    header?: React.ReactNode;
    footer?: React.ReactNode;
    dataStoragePath?: string;
    onLoad?: () => void;
    onInsert?: (record: any) => Promise<void>;
    onUpdate?: (record: any) => Promise<void>;
    onDelete?: (record: any) => Promise<void>;
    onFinally?: (record: any, action: 'create' | 'update' | 'delete') => Promise<void>;
    setPrimaryKey?: (record: RecordProps) => string;
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
    defaultValues?: any;
}

interface FormModelProps extends BaseFormProps {
    model: ModelProps;
    children?: ((fields: FormTree) => React.ReactNode);
}

interface FormProps extends BaseFormProps {
    children?: React.ReactNode | ((fields: FormTree) => React.ReactNode);
    defaultValues?: any;
}

export interface FormRef {
    handleSave: (e: React.MouseEvent<HTMLButtonElement>, generateKey?: boolean) => Promise<boolean>;
    handleDelete: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    getRecord: () => RecordProps | undefined;
}

function Form(props: FormProps, ref?: React.Ref<FormRef>) {
    const { defaultValues, children, ...rest } = props;

    const formChildren = children as React.ReactNode;

    console.log("Form", defaultValues, children, rest);
    return defaultValues
        ? <FormData children={formChildren} defaultValues={defaultValues} {...rest} ref={ref} />
        : <FormDatabase children={formChildren} defaultValues={defaultValues} {...rest} ref={ref} />;
}

export const FormDatabase = forwardRef<FormRef, FormDefaultProps>((props, ref) => {
    const { dataStoragePath, defaultValues, ...rest } = props;
    const location = useLocation();

    const dbStoragePath = props.dataStoragePath ?? trimSlash(location.pathname);
    const [record, setRecord] = useState<any>(undefined);

    useEffect(() => {
        db.read(dbStoragePath).then(data => {
            setRecord({ ...defaultValues, ...data });
        }).catch(error => {
            console.error(error);
            setRecord({});
        });
    }, [dbStoragePath]);

    console.log("FormDatabase", defaultValues, record);
    if (!record) {
        return <p className={"p-4"}><i className={"spinner-border spinner-border-sm"}></i> Caricamento in corso...</p>;
    }

    return <FormData {...rest} defaultValues={record} dataStoragePath={dbStoragePath} ref={ref} />;
});

type NoticeProps = {
    type: "danger" | "success" | "info" | "warning" | "primary" | "secondary" | "light" | "dark";
    message: string;
};

const FormData = forwardRef<FormRef, FormDefaultProps>(({
    children,
    header = undefined,
    footer = undefined,
    dataStoragePath = undefined,
    defaultValues = undefined,
    onLoad = undefined,
    onInsert = undefined,
    onUpdate = undefined,
    onDelete = undefined,
    onFinally = undefined,
    setPrimaryKey = undefined,
    log = false,
    showNotice = true,
    showBack = false,
    wrapClass = undefined,
    headerClass = undefined,
    className = undefined,
    footerClass = undefined
}, ref) => {
    const theme = useTheme("form");

    const [record, setRecord] = useState<RecordProps | undefined>(defaultValues);
    
    console.log("FormData", defaultValues, children, record, dataStoragePath);
    const recordRef = useRef(record);
    useEffect(() => { 
        recordRef.current = record;
     }, [record]);

    const [notification, setNotification] = useState<NoticeProps | undefined>(undefined);
    const notice = useCallback(({ message, type = "danger" }: NoticeProps) => {
        if (showNotice) {
            setNotification({ type, message });
            setTimeout(() => setNotification(undefined), 5000);
        }
    }, [showNotice]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const path = e.target.name.split(".");
        const value = e.target.value;
    
        setRecord(prev => {
            const updated = { ...prev };
            let target = updated;
    
            for (let i = 0; i < path.length - 1; i++) {
                if (!target[path[i]]) {
                    if(path.length > i + 1 && !isNaN(Number(path[i + 1]))) {
                        target[path[i]] = Array.from({ length: Number(path[i + 1]) + 1 }, () => ({}));
                    } else {
                        target[path[i]] = {};
                    }
                }
                target = target[path[i]];
            }

            const lastKey = path[path.length - 1];
            if (value == null || value === "") {
                if (Array.isArray(target) && !isNaN(Number(lastKey))) {
                    target.splice(Number(lastKey), 1);
                } else {
                    delete (target as Record<string, any>)[lastKey];
                    //TODO: da ottimizzare. nel tabdynamic se rimuovi un tab intermedio questo pezzo è necessario per ricostruire l'array poiche per qualche motivo non era un array ma un oggetto.
                    //il problema è a monte quando si crea la struttura dati.
                    /*const keys = Object.keys(target);
                    if (keys.every(k => !isNaN(Number(k)))) {
                        const arr = keys
                            .sort((a, b) => Number(a) - Number(b))
                            .map(k => target[k]);
                        Object.keys(target).forEach(k => delete target[k]);
                        arr.forEach((item, idx) => target[idx] = item);
                    }*/
                }
            } else {
                target[lastKey] = value;
            }
            
             console.log("FORM handleChange", path, value, updated);

            return updated;
        });
    }, []);

    const cleanedRecord = (record: RecordProps | undefined): RecordProps => {
        const cleaned: RecordProps = {};

        if (!record) return cleaned;
        if (record instanceof File) return {
            name: record.name,
            type: record.type,
            size: record.size,
            lastModified: record.lastModified
        };
        for (const [k, v] of Object.entries(record)) {
            if (Array.isArray(v)) {
                cleaned[k] = v
                .map(item => typeof item === 'object' ? cleanedRecord(item) : item)
                .filter(item => item !== undefined);
            } else if(v && typeof v === 'object') {
                cleaned[k] = cleanedRecord(v);
            } else if (v !== undefined) {
                cleaned[k] = v;
            }
        }
        return cleaned;
    }

    const handleSave = useCallback(async (e: React.MouseEvent<HTMLButtonElement>, newStoragePath?: string): Promise<boolean> => {
        e.preventDefault();
                
        showNotice && setNotification(undefined);
        const emptyRequiredFields = document.querySelectorAll('[required]:not([value]), [required][value=""]');
        if (emptyRequiredFields.length > 0) {
            showNotice && setNotification({ message: "Please fill in all required fields", type: "warning" });
            return false;
        }

        defaultValues && onInsert && await onInsert(recordRef.current);
        !defaultValues && onUpdate && await onUpdate(recordRef.current);

        const recordStoragePath = newStoragePath ?? dataStoragePath;
        recordStoragePath && await db.set(recordStoragePath, cleanedRecord(recordRef.current));
        await handleFinally(newStoragePath ? "create" : "update");

        return true;
    }, [dataStoragePath, onInsert, onUpdate, onFinally, defaultValues, showNotice]);

    const handleDelete = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        showNotice && setNotification(undefined);
        dataStoragePath && await db.remove(dataStoragePath);
        
        await handleFinally("delete");
    }, [onDelete, onFinally, showNotice]);

    const handleFinally = useCallback(async (action: 'create' | 'update' | 'delete') => {
        log && dataStoragePath && setLog(dataStoragePath, action, recordRef.current);
        console.log("handleFinally", onFinally, action, recordRef.current);
        onFinally && await onFinally(recordRef.current, action);

        notice({ message: `Record ${action}ed successfully`, type: "success" });
    }, [log, dataStoragePath, onFinally, notice]);

    useImperativeHandle(ref, () => ({
        handleSave: async (e: React.MouseEvent<HTMLButtonElement>, generateKey?: boolean) => {
            const storagePath = generateKey && recordRef.current 
                ? dataStoragePath + '/' + (setPrimaryKey?.(recordRef.current) ?? Date.now())
                : undefined;
            return handleSave(e, storagePath);
        },
        handleDelete,
        getRecord: () => recordRef.current
    }), [handleSave, handleDelete]);

    console.log("FORMMMMMM", defaultValues, record, recordRef.current, "REFF", ref);
    return (
        <Wrapper className={wrapClass || theme.Form.wrapClass}>
            {notification && (
                <Alert type={notification.type}>
                    {notification.message}
                </Alert>
            )}
            {ref 
            ? <FormEnhancer
                components={children}
                record={record}
                handleChange={handleChange}
            />
            : <Card
                header={header || <Breadcrumbs pre={(defaultValues ? "Update " : "Insert ")} path={dataStoragePath ?? "Record"} />}
                footer={(footer || dataStoragePath ||onInsert || onUpdate || onDelete || showBack) && <>
                    {footer}
                    {(onInsert || dataStoragePath) && !defaultValues && <LoadingButton
                        className={theme.Form.buttonSaveClass}
                        label={"Insert"}
                        onClick={e => handleSave(e, dataStoragePath)}
                    />}
                    {(onUpdate || dataStoragePath) && defaultValues && <LoadingButton
                        className={theme.Form.buttonSaveClass}
                        label={"Update"}
                        onClick={handleSave}
                    />}
                    {(onDelete || dataStoragePath) && defaultValues && <LoadingButton
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
                <FormEnhancer
                    components={children}
                    record={record}
                    handleChange={handleChange}
                />
            </Card>
            }
        </Wrapper>
    )
});

function defaultFormRenderer(tree: FormTree): React.ReactNode {
    return Object.entries(tree).map(([key, value]) => {
        if (React.isValidElement(value)) {
            return (
                <div key={key} className="form-group">
                    {value}
                </div>
            );
        } else if (value && typeof value === 'object') {
            return (
                <>
                    {defaultFormRenderer(value as FormTree)}
                </>
            );
        } else {
            return null;
        }
    });
}

export function FormModel({
                              model,
                              children,
                              ...formProps
                          }: FormModelProps
) {
    const [ fields, defaults ] = React.useMemo(() => {
        if (!model) return [{}, {}];
        return buildFormFields(model);
    }, [model]);
    console.log("formnodel nodes", children && children(fields));
    return (
        <FormDatabase defaultValues={defaults} {...formProps}>
            {children && children(fields)}
        </FormDatabase>

    );
}

export default forwardRef(Form);
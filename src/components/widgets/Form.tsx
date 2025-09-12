    import React, { createContext, useContext, useEffect, useState, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
    import { useLocation } from "react-router-dom";
    import { Wrapper } from "../ui/GridSystem";
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
    import { UIProps } from 'index';

    export type ChangeHandler = React.ChangeEvent<any> | { target: { name: string; value?: any } };

    type FormHandleChange = (event: ChangeHandler) => void;
    interface FormProviderProps {
        record: any;
        setRecord: React.Dispatch<React.SetStateAction<any>>;
        wrapClass?: string;
    }
    export type FieldOnChange = (params: {event: ChangeHandler, name: string, value: any, record: RecordProps, onChange: FormHandleChange}) => void;

    interface FormContextProps {
        name: string;
        onChange?: FieldOnChange;
        wrapClass?: string;
    }
    interface FormContextResult {
        value: any;
        handleChange: FormHandleChange;
        formWrapClass?: string;
    }

    export interface FormFieldProps extends UIProps {
        name: string;
        label?: string;
        value?: any;
        required?: boolean;
        onChange?: FieldOnChange;
        defaultValue?: any; //todo: da propagare per le select, checkbox e vrificare la copertura ovunque
    }

    interface SetFormFieldsNameProps {
        children: React.ReactNode;
        parentName: string;
        parentKey?: string;
    }

    const FormContext = createContext<FormProviderProps | null>(null);




    export const useFormContext = ({name, onChange, wrapClass}: FormContextProps): FormContextResult => {
        const ctx = useContext(FormContext);
        if (!ctx) throw new Error("useFormContext must be used within a FormContext.Provider");
        if (!name) throw new Error("useFormContext: name is required");
        
        const record = {...ctx.record};
        const formChange = (event: ChangeHandler) => {
            const path = event.target.name.split(".");
            const value = event.target.value;
            
            let target = record;
            for (let i = 0; i < path.length - 1; i++) {
                const key = path[i];
                const nextKey = path[i + 1];
            
                if (!target[key] || (typeof target[key] !== "object" && nextKey !== undefined)) {
                    target[key] = !isNaN(Number(nextKey))
                    ? Array.from({ length: Number(nextKey) + 1 }, () => ({}))
                    : {};
                }
                target = target[key];
            }
            
        
            const lastKey = path[path.length - 1];
            if (value == null || value === "") {
                if (Array.isArray(target) && !isNaN(Number(lastKey))) {
                    target.splice(Number(lastKey), 1);
                } else {
                    delete (target as Record<string, any>)[lastKey];
                }
            } else {
                target[lastKey] = value;
            }
            
            console.log("FORM handleChange", path, value, record);
        }

        const value = name.split(".").reduce((acc, key) => acc?.[key], ctx.record);
        return {
            value,
            handleChange: (event) => {
                formChange(event);
                onChange?.({event, name, value, record, onChange: formChange});

                ctx.setRecord(record);
                console.log("useFormContext handleChange", onChange);
            },
            formWrapClass: [wrapClass, ctx.wrapClass].filter(Boolean).join(" ")
        };  
    };

    function setParentName(name: string, parentName: string) {
        if (name.indexOf('.') === -1 || parentName.indexOf('.') === -1) return `${parentName}.${name}`;

        const min = Math.min(name.length, parentName.length);
        let i = 0;

        while (i < min && name.charCodeAt(i) === parentName.charCodeAt(i)) i++;

        const lastDot = name.lastIndexOf('.', i - 1);
        if (lastDot === -1) return `${parentName}.${name}`;

        return `${parentName}.${name.slice(lastDot + 1)}`;
    }
    
    export const setFormFieldsName = ({children, parentName, parentKey}: SetFormFieldsNameProps): React.ReactNode => {
        return React.Children.map(children, (child) => {
            if (!parentName || !React.isValidElement(child)) return child;

            const {name, children: childChildren} = child.props;
            const newProps: Record<string, any> = {};
            if (name) {
                newProps.name   = setParentName(name, parentName);
                newProps.key    = parentKey ?? newProps.name;
            }
            if (childChildren) {
                newProps.children = setFormFieldsName({
                    children: childChildren, 
                    parentName, 
                    parentKey,
                });
            }

            return React.cloneElement(child as any, newProps);
        });
    }


    interface BaseFormProps {
        header?: React.ReactNode;
        footer?: React.ReactNode;
        dataStoragePath?: string;
        onLoad?: (record: any) => void;
        onSave?: ({record, action, storagePath}: {record?: RecordProps, storagePath?: string, action: 'create' | 'update'}) => Promise<string | undefined>;
        onDelete?: ({record}: {record?: RecordProps}) => Promise<void>;
        onFinally?: ({record, action}: {record?: RecordProps, action: 'create' | 'update' | 'delete'}) => Promise<boolean>;
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
        children: React.ReactNode | ((args: { record: RecordProps | undefined}) => React.ReactNode);
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
        handleDelete: (e: React.MouseEvent<HTMLButtonElement>) => Promise<boolean>;
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
        onSave = undefined,
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

        useEffect(()=>{
            onLoad?.({...defaultValues});
        }, [])
        
        console.log("FormData", defaultValues, children, record, dataStoragePath);
        const recordRef = useRef(record);
        useEffect(() => { 
            recordRef.current = record;
        }, [record]);
        

        const [notification, setNotification] = useState<NoticeProps | undefined>(undefined);
        const notice = useCallback(({ message, type = "danger" }: NoticeProps) => {
            if (showNotice) {
                setNotification({ type, message });
            }
        }, [showNotice]);

    /*
        const handleChange: FormHandleChange = useCallback((event) => {
            const path = event.target.name.split(".");
            const value = event.target.value;
        
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
                    }
                } else {
                    target[lastKey] = value;
                }
                
                console.log("FORM handleChange", path, value, updated);

                return updated;
            });
        }, []);
    */
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
                //return false;
            }

            const recordStoragePath = onSave 
                ? await onSave({
                    record: recordRef.current, 
                    action: newStoragePath ? "create" : "update", 
                    storagePath: newStoragePath ?? dataStoragePath
                }) 
                : newStoragePath ?? dataStoragePath;

            recordStoragePath && await db.set(recordStoragePath, cleanedRecord(recordRef.current));
            return await handleFinally(newStoragePath ? "create" : "update");
        }, [dataStoragePath, onSave, onFinally, showNotice]);

        const handleDelete = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            
            showNotice && setNotification(undefined);

            const recordStoragePath = onDelete 
                ? await onDelete({record: recordRef.current})
                : dataStoragePath;

            recordStoragePath && await db.remove(recordStoragePath);
            return await handleFinally("delete");
        }, [dataStoragePath, onDelete, onFinally, showNotice]);

        const handleFinally = useCallback(async (action: 'create' | 'update' | 'delete') => {
            log && dataStoragePath && setLog(dataStoragePath, action, recordRef.current);
            console.log("handleFinally", onFinally, action, recordRef.current);

            notice({ message: `Record ${action}ed successfully`, type: "success" });

            return (await onFinally?.({record: recordRef.current, action})) ?? true;
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

        const components = <FormContext.Provider value={{ record, setRecord, wrapClass: "mb-3" }}>
                                {typeof children === 'function' ? children({record}) : children}
                            </FormContext.Provider>;
        return (
            <Wrapper className={wrapClass || theme.Form.wrapClass}>
                {notification && (
                    <Alert type={notification.type} onClose={()=>setNotification(undefined)}>
                        {notification.message}
                    </Alert>
                )}
                {ref 
                ? components
                : <Card
                    header={header || <Breadcrumbs pre={(record?._key ? "Update " : "Insert ")} path={dataStoragePath ?? "Record"} />}
                    footer={(footer || dataStoragePath || onSave || onDelete || showBack) && <>
                        {footer}
                        {(onSave || dataStoragePath) && !record?._key && <LoadingButton
                            className={theme.Form.buttonSaveClass}
                            label={"Save"}
                            onClick={e => handleSave(e)}
                        />}
                        {(onDelete || dataStoragePath) && record?._key && <LoadingButton
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
                    {components}
                </Card>
                }
            </Wrapper>
        )
    });
    /*
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
    */
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
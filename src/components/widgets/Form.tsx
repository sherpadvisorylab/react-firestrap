    import React, { createContext, useContext, useEffect, useState, forwardRef, useImperativeHandle, useRef, useCallback, useMemo } from 'react';
    import { useLocation } from "react-router-dom";
    import { Wrapper } from "../ui/GridSystem";
    import { trimSlash, cleanRecord } from "../../libs/utils";
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
        record: RecordProps | undefined;
        setRecord: React.Dispatch<React.SetStateAction<RecordProps | undefined>>;
        wrapClass?: string;
    }
    export type FieldOnChange = (params: {event: ChangeHandler, name: string, value: any, record: RecordProps, onChange: FormHandleChange}) => void;
    export type InputType = "text" | "number" | "email" | "password" | "color" | "date" | "time" | "datetime-local" | "week" | "month" | "range" | "checkbox" | "radio" | "url" ;
    
    interface FormContextProps {
        name: string;
        onChange?: FieldOnChange;
        wrapClass?: string;
        inputType?: InputType;
        defaultValue?: any;
    }
    interface FormContextResult {
        value: any;
        handleChange: FormHandleChange;
        formWrapClass?: string;
        record: RecordProps;
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
        wrapClass?: string;
    }

    const FormContext = createContext<FormProviderProps | null>(null);
    

    export const useFormContext = ({name, onChange, wrapClass, inputType = "text", defaultValue}: FormContextProps): FormContextResult => {
        const ctx = useContext(FormContext);
        if (!ctx) throw new Error("useFormContext must be used within a FormContext.Provider");
        if (!name) throw new Error("useFormContext: name is required");

        const record = {...ctx.record};
        //const initialized = useRef(false);

        const formChange = (event: ChangeHandler) => {
            const path = event.target.name.split(".");
            const value = ["number", "range"].includes(inputType) ? Number(event.target.value) : event.target.value;
            
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
/*
        const currentValue = name.split(".").reduce((acc, key) => acc?.[key], ctx.record);
        if (!initialized.current && currentValue === undefined && defaultValue !== undefined) {
            console.log("FORM defaultValue!!!!!!!!!!!!", name, defaultValue);
            formChange({ target: { name, value: defaultValue } });
            initialized.current = true;
        }

        const value = currentValue ?? defaultValue;
*/

        const value = useMemo(() => {
            const currentValue = name.split(".").reduce((acc, key) => (acc === undefined ? undefined : acc[key]), ctx.record);
            //if (!initialized.current) {
               // initialized.current = true;
                if (currentValue === undefined && defaultValue !== undefined) {
                    //formChange({ target: { name, value: defaultValue } });
                    return defaultValue ?? '';
                }
            //}
            return currentValue ?? '';
        }, [name, ctx.record, defaultValue]);

        
        return {
            value,
            handleChange: (event) => {
                formChange(event);
                onChange?.({event, name, value, record, onChange: formChange});

                ctx.setRecord({...record});
            },
            formWrapClass: [wrapClass, ctx.wrapClass].filter(Boolean).join(" "),
            record: record,
        };  
    };

    type UseHandleDropProps = {
        name: string;
        value: string;
        handleChange?: FormHandleChange;
      };

    export const useHandleDrop = ({ name, value, handleChange }: UseHandleDropProps) => {
        return React.useCallback(
          (e: React.DragEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            e.preventDefault();
      
            const target = e.target as HTMLTextAreaElement | HTMLInputElement;
            const raw = e.dataTransfer.getData("text/plain");
            const text = `${raw}`;
      
            target.focus();
      
            // Calcola posizione caret
            const caretPosition = (() => {
              const position =
                document.caretPositionFromPoint?.(e.clientX, e.clientY) ??
                (document as any).caretRangeFromPoint?.(e.clientX, e.clientY);
              return position && "offset" in position
                ? position.offset
                : target.value.length;
            })();
      
            // Crea nuovo valore
            const newValue =
              (value ?? "").slice(0, caretPosition) +
              text +
              (value ?? "").slice(caretPosition);
      
            // Notifica onChange
      
            handleChange?.({
              target: {
                value: newValue.trim(),
                name,
              },
            });
      
            // Posiziona il cursore dopo il testo inserito
            requestAnimationFrame(() => {
              const newPosition = caretPosition + text.length;
              target.setSelectionRange(newPosition, newPosition);
            });
          },
          [name, value, handleChange]
        );
    }

    function setParentName(name: string, parentName: string) {
        if (name.indexOf('.') === -1 || parentName.indexOf('.') === -1) return `${parentName}.${name}`;

        const min = Math.min(name.length, parentName.length);
        let i = 0;

        while (i < min && name.charCodeAt(i) === parentName.charCodeAt(i)) i++;

        const lastDot = name.lastIndexOf('.', i - 1);
        if (lastDot === -1) return `${parentName}.${name}`;

        return `${parentName}.${name.slice(lastDot + 1)}`;
    }
    
    export const setFormFieldsName = ({children, parentName, parentKey, wrapClass}: SetFormFieldsNameProps): React.ReactNode => {
        return React.Children.map(children, (child) => {
            if (!parentName || !React.isValidElement(child)) return child;

            const {name, children: childChildren} = child.props;
            const newProps: Record<string, any> = {};
            if (name) {
                newProps.name       = setParentName(name, parentName);
                newProps.key        = parentKey ?? newProps.name;
                newProps.wrapClass  = child.props.wrapClass ?? wrapClass;

                if (child.props.pre && React.isValidElement(child.props.pre) ) {
                    newProps.pre = setFormFieldsName({
                        children: child.props.pre,
                        parentName,
                        parentKey: `${newProps.key}.pre` ,
                    });
                }
                if (child.props.post && React.isValidElement(child.props.post) ) {
                    newProps.post = setFormFieldsName({
                        children: child.props.post,
                        parentName,
                        parentKey: `${newProps.key}.post` ,
                    });
                }
            }
            if (childChildren) {
                newProps.children   = setFormFieldsName({
                    children: childChildren, 
                    parentName, 
                    parentKey,
                });
            }

            return React.cloneElement(child as any, newProps);
        });
    }

    export type SavePathProps = {
        record: RecordProps;
        storagePath?: string;
    }

    interface BaseFormProps {
        aspect?: "card" | "empty";
        header?: React.ReactNode;
        footer?: React.ReactNode;
        dataStoragePath?: string;
        handlers?: FormHandlers;
        setPrimaryKey?: (record: RecordProps) => string;
        savePath?: (props: SavePathProps) => string | undefined;
        onLoad?: (record: RecordProps) => void;
        onSave?: ({record, prevRecord, action, storagePath}: {record?: RecordProps, prevRecord?: RecordProps, storagePath?: string, action: 'create' | 'update'}) => Promise<string | undefined>;
        onDelete?: ({record}: {record?: RecordProps}) => Promise<string | undefined>;
        onFinally?: ({record, action}: {record?: RecordProps, action: 'create' | 'update' | 'delete'}) => Promise<boolean>;
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
        defaultValues?: RecordProps;
    }

    interface FormDatabaseProps extends FormDefaultProps {
        dataStoragePath: string;
    }
    interface FormModelProps extends BaseFormProps {
        model: ModelProps;
        children?: ((fields: FormTree) => React.ReactNode);
    }

    interface FormProps extends BaseFormProps {
        children?: React.ReactNode | ((fields: FormTree) => React.ReactNode);
        defaultValues?: RecordProps;
    }

    export interface FormRef {
        handleSave: (e: React.MouseEvent<HTMLButtonElement>) => Promise<boolean>;
        handleDelete: (e: React.MouseEvent<HTMLButtonElement>) => Promise<boolean>;
        getHeader: () => React.ReactNode;
        getRecord: () => {record: RecordProps, isNewRecord: boolean};
        getFooter: () => React.ReactNode;
    }
    type FormHandlers = Partial<FormRef>;



    function Form(props: FormProps, ref?: React.Ref<FormRef>) {
        const location = useLocation();
        const { dataStoragePath, setPrimaryKey, handlers, defaultValues, children, ...rest } = props;

        const genStoragePath = (record: RecordProps) => {
            return `${dataStoragePath ?? trimSlash(location.pathname)}/${setPrimaryKey?.(record) ?? Date.now()}`;
        };
        const getStoragePath = (dataStoragePath: string | undefined) => (
            dataStoragePath ?? (location.hash 
                ? `${trimSlash(location.pathname)}/${location.hash.slice(1)}` 
                : undefined)
        );

        const dbStoragePath = getStoragePath(dataStoragePath);
        const savePath = ({record, storagePath}: SavePathProps) => storagePath ?? genStoragePath(record);

        return defaultValues || !dbStoragePath || (handlers && !dataStoragePath)
            ? <FormData children={children} defaultValues={defaultValues} handlers={handlers} savePath={savePath} dataStoragePath={dbStoragePath} {...rest} ref={ref} />
            : <FormDatabase children={children} defaultValues={defaultValues} handlers={handlers} savePath={savePath} dataStoragePath={dbStoragePath} {...rest} ref={ref} />;
    }

    export const FormDatabase = forwardRef<FormRef, FormDatabaseProps>((props, ref) => {
        const { dataStoragePath, defaultValues, ...rest } = props;
        
        const [record, setRecord] = useState<RecordProps | undefined>(undefined);
        
        useEffect(() => {
            db.read(dataStoragePath).then(data => {
                setRecord({ ...defaultValues, ...data});
            }).catch(error => {
                console.error(error);
                setRecord({});
            });
        }, [dataStoragePath]);
        

        if (!record) {
            return <p className={"p-4"}><i className={"spinner-border spinner-border-sm"}></i> Caricamento in corso...</p>;
        }

        console.log("FormDatabase", dataStoragePath, defaultValues, record);

        return <FormData {...rest} defaultValues={record} dataStoragePath={dataStoragePath} ref={ref} />;
    });

    type NoticeProps = {
        type: "danger" | "success" | "info" | "warning" | "primary" | "secondary" | "light" | "dark";
        message: string;
    };

    const FormData = forwardRef<FormRef, FormDefaultProps>(({
        children,
        aspect = undefined,
        header = undefined,
        footer = undefined,
        dataStoragePath = undefined,
        handlers = undefined,
        defaultValues = undefined,
        savePath = undefined,
        onLoad = undefined,
        onSave = undefined,
        onDelete = undefined,
        onFinally = undefined,
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
        const isNewRecord = !dataStoragePath;

        useEffect(()=>{
            if (defaultValues) {
                setRecord({...defaultValues});
                onLoad?.({...defaultValues});
            }
        }, [defaultValues]);
        
        console.log("FormData", defaultValues, record, dataStoragePath, children);
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

        

        const handleSave = useCallback(async (e: React.MouseEvent<HTMLButtonElement>): Promise<boolean> => {
            e.preventDefault();
                    
            showNotice && setNotification(undefined);
            const emptyRequiredFields = document.querySelectorAll('[required]:not([value]), [required][value=""]');
            if (emptyRequiredFields.length > 0) {
                showNotice && setNotification({ message: theme.Form.i18n.noticeRequiredFields, type: "warning" });
                //return false;
            }
            const action = isNewRecord ? "create" : "update";
            const recordStoragePath = onSave 
                ? await onSave({
                    record: recordRef.current, 
                    prevRecord: defaultValues,
                    action: action, 
                    storagePath: dataStoragePath
                }) ?? dataStoragePath
                : savePath 
                    ? savePath?.({record: recordRef.current ?? {}, storagePath: dataStoragePath})
                    : dataStoragePath;

            recordStoragePath && await db.set(recordStoragePath, cleanRecord(recordRef.current));
            return await handleFinally(action);
        }, [dataStoragePath, onSave, onFinally, showNotice, savePath]);

        const handleDelete = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            
            showNotice && setNotification(undefined);

            const recordStoragePath = onDelete 
                ? await onDelete({record: recordRef.current})
                : savePath?.({record: recordRef.current ?? {}, storagePath: dataStoragePath}) ?? dataStoragePath;

            recordStoragePath && await db.remove(recordStoragePath);
            return await handleFinally("delete");
        }, [dataStoragePath, onDelete, onFinally, showNotice, savePath]);

        const handleFinally = useCallback(async (action: 'create' | 'update' | 'delete') => {
            log && dataStoragePath && setLog(dataStoragePath, action, recordRef.current);
            console.log("handleFinally", onFinally, action, recordRef.current);

            notice({ message: `Record ${action}ed successfully`, type: "success" });

            return (await onFinally?.({record: recordRef.current, action})) ?? true;
        }, [log, dataStoragePath, onFinally, notice]);

        useImperativeHandle(ref, () => ({
            handleSave: handlers?.handleSave ?? handleSave,
            handleDelete: handlers?.handleDelete ?? handleDelete,
            getHeader: handlers?.getHeader ?? (() => header),
            getRecord: handlers?.getRecord ?? (() => ({record: recordRef.current ?? {}, isNewRecord})),
            getFooter: handlers?.getFooter ?? (() => footer),
        }), [handleSave, handleDelete, handlers]);

        console.log("FORMMMMMM", defaultValues, record, recordRef.current, "REFF", ref);

        const components = <FormContext.Provider value={{ record, setRecord, wrapClass: "mb-3" }}>
                                {typeof children === 'function' ? children({record}) : children}
                            </FormContext.Provider>;


        const displayComponent = useMemo(() => {
            if(!aspect && ref) return components;

            switch (aspect) {
                case "empty":
                    return components;
                case "card":
                default:
                    return <Card
                        header={header || <Breadcrumbs pre={(isNewRecord ? theme.Form.i18n.headerAdd : theme.Form.i18n.headerEdit)} path={dataStoragePath ?? theme.Form.i18n.headerNewRecord} />}
                        footer={(footer || !isNewRecord || onSave || onDelete || showBack) && <>
                            {footer}
                            {(onSave || !isNewRecord) && <LoadingButton
                                className={theme.Form.buttonSaveClass}
                                label={theme.Form.i18n.buttonSave}
                                onClick={e => handleSave(e)}
                            />}
                            {(onDelete || !isNewRecord) && <LoadingButton
                                className={theme.Form.buttonDeleteClass}
                                label={theme.Form.i18n.buttonDelete}
                                onClick={handleDelete}
                            />}
                            {showBack && <BackLink
                                className={theme.Form.buttonBackClass}
                                label={theme.Form.i18n.buttonBack}
                            />}
                        </>}
                        headerClass={headerClass || theme.Form.Card.headerClass}
                        bodyClass={className || theme.Form.Card.bodyClass}
                        footerClass={footerClass || theme.Form.Card.footerClass}
                    >
                        {components}
                    </Card>;
            }
        }, [aspect, header, footer, onSave, onDelete, showBack, record, components, ref]);

        return (
            <Wrapper className={wrapClass || theme.Form.wrapClass}>
                {notification && (
                    <Alert type={notification.type} onClose={()=>setNotification(undefined)}>
                        {notification.message}
                    </Alert>
                )}
                {displayComponent}
            </Wrapper>
        )
    });
    
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

        const location = useLocation();
        const getStoragePath = (dataStoragePath: string | undefined) => (
            dataStoragePath ?? (location.hash 
                ? `${trimSlash(location.pathname)}/${location.hash.slice(1)}` 
                : undefined)
        );

        console.log("formnodel nodes", children && children(fields));
        const dataStoragePath = getStoragePath(formProps.dataStoragePath);
        if (!dataStoragePath) return null;

        return (
            <FormDatabase dataStoragePath={dataStoragePath} defaultValues={defaults} {...formProps}>
                {children && children(fields)}
            </FormDatabase>

        );
    }

    export default forwardRef(Form);
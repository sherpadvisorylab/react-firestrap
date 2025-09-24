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
        aspect?: "card" | "empty";
        header?: React.ReactNode;
        footer?: React.ReactNode;
        dataStoragePath?: string ;
        handlers?: FormHandlers;
        savePath?: (record: RecordProps) => string;
        onLoad?: (record: RecordProps) => void;
        onSave?: ({record, action, storagePath}: {record?: RecordProps, storagePath?: string, action: 'create' | 'update'}) => Promise<string | undefined>;
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
        getHeader: () => React.ReactNode | undefined;
        getRecord: () => RecordProps | undefined;
        getFooter: () => React.ReactNode | undefined;
    }
    type FormHandlers = Partial<FormRef>;

    function Form(props: FormProps, ref?: React.Ref<FormRef>) {
        const { dataStoragePath, handlers, defaultValues, children, ...rest } = props;

        return defaultValues || (handlers && !dataStoragePath)
            ? <FormData children={children} defaultValues={defaultValues} handlers={handlers} dataStoragePath={dataStoragePath} {...rest} ref={ref} />
            : <FormDatabase children={children} defaultValues={defaultValues} handlers={handlers} dataStoragePath={dataStoragePath} {...rest} ref={ref} />;
    }

    export const FormDatabase = forwardRef<FormRef, FormDefaultProps>((props, ref) => {
        const { dataStoragePath, defaultValues, ...rest } = props;
        const location = useLocation();

        const dbStoragePath = dataStoragePath ?? trimSlash(location.pathname);
        const [record, setRecord] = useState<RecordProps | undefined>(undefined);

        useEffect(() => {
            db.read(dbStoragePath).then(data => {
                setRecord({ ...defaultValues, ...data });
            }).catch(error => {
                console.error(error);
                setRecord({});
            });
        }, [dbStoragePath]);

        console.log("FormDatabase", dbStoragePath, defaultValues, record);
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

        

        const handleSave = useCallback(async (e: React.MouseEvent<HTMLButtonElement>): Promise<boolean> => {
            e.preventDefault();
                    
            showNotice && setNotification(undefined);
            const emptyRequiredFields = document.querySelectorAll('[required]:not([value]), [required][value=""]');
            if (emptyRequiredFields.length > 0) {
                showNotice && setNotification({ message: "Please fill in all required fields", type: "warning" });
                //return false;
            }
            const action = recordRef.current?._key ? "update" : "create";
            const recordStoragePath = onSave 
                ? await onSave({
                    record: recordRef.current, 
                    action: action, 
                    storagePath: dataStoragePath
                }) 
                : savePath?.(recordRef.current ?? {}) ?? dataStoragePath;

            console.log("handleSave TESSST", recordRef.current?._key, defaultValues, Object.keys(defaultValues ?? {}).length, recordStoragePath, dataStoragePath);

            recordStoragePath && await db.set(recordStoragePath, cleanRecord(recordRef.current));
            return await handleFinally(action);
        }, [dataStoragePath, onSave, onFinally, showNotice, savePath]);

        const handleDelete = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            
            showNotice && setNotification(undefined);

            const recordStoragePath = onDelete 
                ? await onDelete({record: recordRef.current})
                : savePath?.(recordRef.current ?? {}) ?? dataStoragePath;

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
            getRecord: handlers?.getRecord ?? (() => recordRef.current),
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
                        header={header || <Breadcrumbs pre={(record?._key ? "Update " : "Insert ")} path={dataStoragePath ?? "Record"} />}
                        footer={(footer || dataStoragePath || onSave || onDelete || showBack) && <>
                            {footer}
                            {(onSave || dataStoragePath) && <LoadingButton
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
        console.log("formnodel nodes", children && children(fields));
        return (
            <FormDatabase defaultValues={defaults} {...formProps}>
                {children && children(fields)}
            </FormDatabase>

        );
    }

    export default forwardRef(Form);
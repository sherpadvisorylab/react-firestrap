import React, {useState} from 'react';
import { createPortal } from 'react-dom';
import {useTheme} from "../../Theme";
import {ActionButton, LoadingButton} from "./Buttons";
import { UIProps } from '../..';
import { Wrapper } from "./GridSystem";

interface ModalProps extends UIProps {
    children: React.ReactNode;
    title?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode | false;
    onClose?: () => void;
    onSave?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<boolean>;
    onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<boolean>;
    size?: "sm" | "md" | "lg" | "xl" | "fullscreen";
    position?: "center" | "top" | "left" | "right" | "bottom";
    buttonFullscreen?: boolean;
    headerClass?: string;
    titleClass?: string;
    subTitleClass?: string;
    bodyClass?: string;
    footerClass?: string;
}

interface ModalYesNoProps {
    title?: string;
    children: React.ReactNode;
    onYes?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<boolean>;
    onNo?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<boolean>;
    onClose?: () => void;
}

interface ModalOkProps {
    children: React.ReactNode;
    title?: string;
    onClose?: () => void;
}

const Modal = (props: ModalProps) => {
    return <ModalDefault {...props} />;
};

const ModalDefault = ({
                          children,
                          title             = undefined,
                          header            = undefined,
                          footer            = undefined,
                          onClose           = undefined,
                          onSave            = undefined,
                          onDelete          = undefined,
                          size              = undefined,
                          position          = undefined,
                          buttonFullscreen  = true,
                          pre               = undefined,
                          post              = undefined,
                          wrapClass         = undefined,
                          className         = undefined,
                          headerClass       = undefined,
                          titleClass        = undefined,
                          subTitleClass     = undefined,
                          bodyClass         = undefined,
                          footerClass       = undefined
}: ModalProps) => {
    const theme = useTheme("modal");

    const [sizeClass, setSizeClass] = useState(size);

    const positions = {
        center: {
            coverClass: `modal modal-cover fade show d-block`,
            dialogClass: `modal-dialog modal-${sizeClass || theme.Modal.size} ${wrapClass || theme.Modal.wrapClass}`,
            contentClass: `modal-content ${className || theme.Modal.className}`,
            headerClass: `modal-header ${headerClass || theme.Modal.headerClass}`,
            titleClass: `modal-title ${titleClass || theme.Modal.titleClass}`,
            subTitleClass: `modal-sub-title ${subTitleClass || theme.Modal.subTitleClass}`,
            bodyClass: `modal-body ${bodyClass || theme.Modal.bodyClass}`,
            footerClass: `modal-footer ${footerClass || theme.Modal.footerClass}`,
            backdropClass: `modal-backdrop fade show`,
        },
        top: {
            coverClass: ``,
            dialogClass: `offcanvas offcanvas-top modal-${size || theme.Modal.size} ${wrapClass || theme.Modal.wrapClass}`,
            contentClass: ``,
            headerClass: `offcanvas-header ${headerClass || theme.Modal.headerClass}`,
            titleClass: `offcanvas-title ${titleClass || theme.Modal.titleClass}`,
            subTitleClass: `offcanvas-sub-title ${subTitleClass || theme.Modal.subTitleClass}`,
            bodyClass: `offcanvas-body ${bodyClass || theme.Modal.bodyClass}`,
            footerClass: `offcanvas-footer ${footerClass || theme.Modal.footerClass}`,
            backdropClass: `offcanvas-backdrop fade show`,
        },
        left: {
            coverClass: ``,
            dialogClass: `offcanvas offcanvas-start modal-${size || theme.Modal.size} ${wrapClass || theme.Modal.wrapClass}`,
            contentClass: ``,
            headerClass: `offcanvas-header ${headerClass || theme.Modal.headerClass}`,
            titleClass: `offcanvas-title ${titleClass || theme.Modal.titleClass}`,
            subTitleClass: "offcanvas-sub-title " + (subTitleClass || theme.Modal.subTitleClass),
            bodyClass: `offcanvas-body ${bodyClass || theme.Modal.bodyClass}`,
            footerClass: `offcanvas-footer ${footerClass || theme.Modal.footerClass}`,
            backdropClass: `offcanvas-backdrop fade show`,
        },
        right: {
            coverClass: ``,
            dialogClass: `offcanvas offcanvas-end modal-${size || theme.Modal.size} ${wrapClass || theme.Modal.wrapClass}`,
            contentClass: ``,
            headerClass: `offcanvas-header ${headerClass || theme.Modal.headerClass}`,
            titleClass: `offcanvas-title ${titleClass || theme.Modal.titleClass}`,
            subTitleClass: "offcanvas-sub-title " + (subTitleClass || theme.Modal.subTitleClass),
            bodyClass: `offcanvas-body ${bodyClass || theme.Modal.bodyClass}`,
            footerClass: `offcanvas-footer ${footerClass || theme.Modal.footerClass}`,
            backdropClass: `offcanvas-backdrop fade show`,
        },
        bottom: {
            coverClass: ``,
            dialogClass: `offcanvas offcanvas-bottom modal-${size || theme.Modal.size} ${wrapClass || theme.Modal.wrapClass}`,
            contentClass: ``,
            headerClass: `offcanvas-header ${headerClass || theme.Modal.headerClass}`,
            titleClass: `offcanvas-title ${titleClass || theme.Modal.titleClass}`,
            subTitleClass: "offcanvas-sub-title " + (subTitleClass || theme.Modal.subTitleClass),
            bodyClass: `offcanvas-body ${bodyClass || theme.Modal.bodyClass}`,
            footerClass: `offcanvas-footer ${footerClass || theme.Modal.footerClass}`,
            backdropClass: `offcanvas-backdrop fade show`,
        }
    }

    const pos = positions[sizeClass === "fullscreen" ? "center" : (position || theme.Modal.position) as keyof typeof positions];

    window.document.body.style.overflow = "hidden";
    const handleClose = () => {
        window.document.body.style.overflow = "auto";
        onClose && onClose();
    }

    return createPortal(<>
        <Wrapper className={pos.coverClass}>
            <div className={pos.dialogClass}>
                {pre}
                <Wrapper className={pos.contentClass}>
                    {(header || title || buttonFullscreen || onClose) && <div className={pos.headerClass}>
                        <div>
                            {title && <h3 className={pos.titleClass}>{title}</h3>}
                            {(title && header) && <div className={pos.subTitleClass}>{header}</div>}
                            {!title && header && (typeof header === "string" ? <h3 className={pos.titleClass}>{header}</h3> : header)}
                        </div>
                        {(buttonFullscreen || onClose) && <div className={"ms-auto"}>
                            {buttonFullscreen && <ActionButton
                                icon={sizeClass === "fullscreen" ? theme.Modal.iconCollapse : theme.Modal.iconExpand}
                                className={"border-0 p-2"}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSizeClass((prev) => prev === "fullscreen" ? size === "fullscreen" ? "lg" : size : "fullscreen")
                                }}
                            />}
                            {onClose && <LoadingButton
                                className="btn-close"
                                onClick={handleClose}
                            />}
                        </div>}
                    </div>}
                    <div className={pos.bodyClass}>{children}</div>
                    {(footer || onSave || onDelete || onClose) && <div className={pos.footerClass}>
                        {footer}
                        {onSave && <LoadingButton
                            className="btn-primary"
                            label={"Save"}
                            onClick={async (e) => {
                                e.preventDefault();
                                
                                if (await onSave(e)) {
                                    handleClose()
                                }
                            }}
                        />}
                        {onDelete && <LoadingButton
                            className="btn-danger"
                            label={"Delete"}
                            onClick={async (e) => {
                                e.preventDefault();
                                await onDelete(e);
                                handleClose()
                            }}
                        />}
                        {onClose && <LoadingButton
                            className="btn-link"
                            label={"Cancel"}
                            onClick={handleClose}
                        />}
                    </div>}
                </Wrapper>
                {post}
            </div>
        </Wrapper>
        <Wrapper className={pos.backdropClass}/>
    </>, document.body);
};

export const ModalYesNo = ({
                               children,
                               title    = undefined,
                               onYes    = undefined,
                               onNo     = undefined,
                               onClose  = undefined
}: ModalYesNoProps) => {
    return <ModalDefault
        title={title}
        buttonFullscreen={false}
        onClose={onClose}
        footer={<>
            {onYes && <LoadingButton
                className="btn-primary"
                label={"Yes"}
                onClick={async (e) => {
                    e.preventDefault();
                    await onYes(e);
                    onClose && onClose()
                }}
            />}
            {onNo && <LoadingButton
                className="btn-secondary"
                label={"No"}
                onClick={async (e) => {
                    e.preventDefault();
                    await onNo(e);
                    onClose && onClose()
                }}
            />}
        </>}
    >
        {children}
    </ModalDefault>
}

export const ModalOk = ({
                            children,
                            title       = undefined,
                            onClose     = undefined
                        }: ModalOkProps) => {
    return <ModalDefault
        title={title}
        buttonFullscreen={false}
        onClose={onClose}
        footer={<>
            <LoadingButton className="btn-primary" label={"Ok"} onClick={onClose} />
        </>}
    >
        {children}
    </ModalDefault>
}

export default Modal;

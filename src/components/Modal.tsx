import React, {useState} from 'react';
import {useTheme} from "../Theme";
import {ActionButton, LoadingButton} from "./Buttons";

interface ModalProps {
    children: React.ReactNode;
    title?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode | false;
    onClose?: () => void;
    onSave?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    size?: string;
    display?: string | null;
    showFullscreen?: boolean;
    wrapClass?: string;
    modalClass?: string;
    headerClass?: string;
    titleClass?: string;
    bodyClass?: string;
    footerClass?: string;
}

interface ModalYesNoProps {
    title?: string;
    children: React.ReactNode;
    onYes?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    onNo?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
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
                          display           = undefined,
                          showFullscreen    = true,
                          wrapClass         = undefined,
                          modalClass        = undefined,
                          headerClass       = undefined,
                          titleClass        = undefined,
                          bodyClass         = undefined,
                          footerClass       = undefined
}: ModalProps) => {
    const theme = useTheme("modal");

    const [fullScreen, setFullScreen] = useState(size === "fullscreen");

    let positionClass: string;
    switch (display || theme.Modal.display) {
        case "right":
            positionClass = " position-absolute end-0 bottom-0 top-0";
            break;
        case "left":
            positionClass = ""; // Define what should happen for "left"
            break;
        case "top":
            positionClass = ""; // Define what should happen for "top"
            break;
        case "bottom":
            positionClass = ""; // Define what should happen for "bottom"
            break;
        default:
            positionClass = "";
            break;
    }

    const fullScreenClass = fullScreen ? " modal-fullscreen" : "";

    window.document.body.style.overflow = "hidden";
    const handleClose = () => {
        window.document.body.style.overflow = "auto";
        onClose && onClose();
    }

    return (<>
      <div
        className={"modal modal-cover fade show d-block"}
        role="dialog"
      >
        <div className={"modal-dialog " + (wrapClass || theme.Modal.wrapClass) + " modal-" + (size || theme.Modal.size) + positionClass + fullScreenClass}>
          <div className={"modal-content " + (modalClass || theme.Modal.modalClass)}>
              <div className={"modal-header " + (headerClass || theme.Modal.headerClass)}>
                  {title ?
                      <h3 className={"modal-title text-nowrap " + (titleClass || theme.Modal.titleClass)}>{title}</h3> : ""}
                  {!title && header}
                  <div>
                      {(showFullscreen || fullScreen) && <ActionButton
                          icon={fullScreen ? theme.Modal.iconCollapse : theme.Modal.iconExpand}
                          className={"btn border-0 p-0"}
                          onClick={(e) => {
                              e.preventDefault();
                              setFullScreen(!fullScreen)}
                          }
                      />}
                      {onClose && (
                          <LoadingButton
                              className="btn-close"
                              onClick={handleClose}
                          />
                      )}
                  </div>
              </div>
              {header && title && <div className="modal-sub-header">{header}</div>}
              <div className={"modal-body " + (bodyClass || theme.Modal.bodyClass)}>{children}</div>
              {footer !== false && <div className={"modal-footer " + (footerClass || theme.Modal.footerClass)}>
                  {footer}
                  {onSave && <LoadingButton
                      className="btn-primary"
                      label={"Save"}
                      onClick={async (e) => {
                          e.preventDefault();
                          await onSave(e);
                          handleClose()
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
          </div>
        </div>
      </div>
        <div className="modal-backdrop fade show"/>
    </>);
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
        showFullscreen={false}
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
        showFullscreen={false}
        onClose={onClose}
        footer={<>
            <LoadingButton className="btn-primary" label={"Ok"} onClick={onClose} />
        </>}
    >
        {children}
    </ModalDefault>
}



export default Modal;

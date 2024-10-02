import React, {useState} from 'react';
import {useTheme} from "../Theme.js";
import {ActionButton, LoadingButton} from "./Buttons.js";

const Modal = ({
                   size = null,
                   title,
                   header,
                   children,
                   footer,
                   onClose,
                   onSave,
                   onDelete,
                   display = null,
                   showFullscreen = true,
                   wrapClass = null,
                   modalClass = null,
                   headerClass = null,
                   titleClass = null,
                   bodyClass = null,
                   footerClass = null

}) => {
    return <ModalDefault
        size={size}
        title={title}
        header={header}
        children={children}
        footer={footer}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
        display={display}
        showFullscreen={showFullscreen}
        wrapClass={wrapClass}
        modalClass={modalClass}
        headerClass={headerClass}
        titleClass={titleClass}
        bodyClass={bodyClass}
        footerClass={footerClass}
    />
}

const ModalDefault = ({
                 size = null,
                 title,
                 header,
                 children,
                 footer,
                 onClose,
                 onSave,
                 onDelete,
                 display = null,
                 showFullscreen = true,
                 wrapClass = null,
                 modalClass = null,
                 headerClass = null,
                 titleClass = null,
                 bodyClass = null,
                 footerClass = null

}) => {
    const theme = useTheme();

    const [fullScreen, setFullScreen] = useState(size === "fullscreen");

    let positionClass = "";
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

export const ModalYesNo = ({title, children, onYes, onNo, onClose}) => {
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

export const ModalOk = ({title, children, onClose}) => {
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

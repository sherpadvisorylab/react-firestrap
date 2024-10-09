import React, {useEffect, useState} from 'react';
import {useTheme} from "../Theme";

export interface IButton {
    onClick?: (e: any) => void,
    icon?: string,
    label?: string,
    badge?: string,
    pre?: string,
    post?: string,
    title?: string,
    className?: string,
    badgeClass?: string,
    toggle?: string,
    target?: string
}
export const LoadingButton = ({
                                  onClick,
                                  icon = null,
                                  label = null,
                                  badge = null,
                                  pre = null,
                                  post = null,
                                  title = null,
                                  disabled = false,
                                  showLoader = false,
                                  className = null,
                                  badgeClass = null
} : IButton = {} ) => {
    const [loader, setLoader] = useState(showLoader);
    const [disable, setDisable] = useState(disabled);
    const theme = useTheme("button");

    useEffect(() => {
        setLoader(showLoader);
    }, [showLoader]);

    return (
        <button
            title={title}
            className={"btn border-0 " + (className || theme.LoadingButton.className) + (badge ? " position-relative" : "")}
            disabled={disable || loader}
            onClick={async (e) => {
                e.stopPropagation();
                //const target = (e.target.tagName === "BUTTON" ? e.target : e.target.parentElement);

                //if(target.hasAttribute("disabled")) return;
                //target.setAttribute("disabled", "disabled");
                setDisable(true);
                setLoader(true);
                await onClick(e);
                setLoader(false);
                setDisable(false);
                //target.removeAttribute("disabled");
            }}
        >
            {pre}
            {loader && <i className={theme.LoadingButton.spinnerClass}></i>}
            {icon && !loader && <i className={theme.getIcon(icon)}></i>}
            {label}
            {badge && !loader && <span className={"position-absolute end-0 top-0 badge " + (badgeClass || theme.LoadingButton.badgeClass)}>{badge}</span>}
            {post}
        </button>
    );
};


export const ActionButton = ({
                                 onClick,
                                 icon = null,
                                 label = null,
                                 badge = null,
                                 pre = null,
                                 post = null,
                                 title = null,
                                 disabled = false,
                                 className = null,
                                 badgeClass = null,
                                 toggle = "",
                                 target = ""
} : IButton = {}) => {
    const theme = useTheme("button");

    return (
        <button
            title={title}
            className={"btn border-0 " + (className || theme.ActionButton.className) + (badge ? " position-relative" : "")}
            data-bs-toggle={toggle}
            data-bs-target={target}
            disabled={disabled}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                onClick(e);
            }}
        >
            {pre}
            {icon && <i className={theme.getIcon(icon)}></i>}
            {label}
            {badge && <span className={"position-absolute badge " + (badgeClass || theme.ActionButton.badgeClass)}>{badge}</span>}
            {post}
        </button>
    );
};

export const GoSite = ({ label, url }) => {
  return (
    <h1 className="page-header mb-0">
      {label + " "}
      <a href={url} target="_blank" rel="noopener noreferrer">
        <i className="fa fa-external-link" />
      </a>
    </h1>
  );
};

export const ReferSite = ({ title, url, imageUrl, width }) => {
  return (
    <a
      href={url}
      className="me-1"
      target="_blank"
      title={title}
      rel="noopener noreferrer"
    >
      <img src={imageUrl} width={width ? width : "100"} height="30" alt={title} />
    </a>
  );
};

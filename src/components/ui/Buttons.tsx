import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import {useTheme} from "../../Theme";
import { UIProps } from '../..';
import { Wrapper } from './GridSystem';

export interface IButton extends UIProps {
    onClick?: (e: any) => void;
    icon?: string;
    label?: string | React.ReactNode;
    badge?: string;
    title?: string;
    disabled?: boolean;
    showLoader?: boolean;
    badgeClass?: string;
    iconClass?: string;
    toggle?: string;
    target?: string;
    style?: React.CSSProperties;
}

export const LoadingButton = ({
    onClick,
    icon            = undefined,
    label           = undefined,
    badge           = undefined,
    title           = undefined,
    disabled        = false,
    showLoader      = false,
    pre             = undefined,
    post            = undefined,
    wrapClass       = undefined,
    className       = undefined,
    badgeClass      = undefined,
    iconClass       = undefined,
    style           = undefined
}: IButton = {}) => {
    const [loader, setLoader] = useState(showLoader);
    const [disable, setDisable] = useState(disabled);
    const theme = useTheme("button");

    useEffect(() => {
        setLoader(showLoader);
        setDisable(disabled);
    }, [showLoader, disabled]);

    return (
        <Wrapper className={wrapClass}>
            {pre}
            <button
                title={title}
                className={"btn " + (className || theme.LoadingButton.className) + (badge ? " position-relative" : "")}
                style={style}
                disabled={disable || loader}
                onClick={async (e) => {
                    e.stopPropagation();
                    setDisable(true);
                    setLoader(true);
                    await onClick?.(e);
                    setLoader(false);
                    setDisable(false);
                }}
            >
                {loader && <i className={theme.LoadingButton.spinnerClass}></i>}
                {(icon && !loader) && <i className={(label ? "me-1 " : "") + (iconClass ? iconClass + " " : "") + theme.getIcon(icon)}></i>}
                {label}
                {badge && !loader && <span className={"position-absolute end-0 top-0 badge " + (badgeClass || theme.LoadingButton.badgeClass)}>{badge}</span>}
            </button>
            {post}
        </Wrapper>
    );
};

export const ActionButton = ({
    onClick,
    icon            = undefined,
    label           = undefined,
    badge           = undefined,
    title           = undefined,
    disabled        = false,
    toggle          = undefined,
    target          = undefined,
    pre             = undefined,
    post            = undefined,
    wrapClass       = undefined,
    className       = undefined,
    badgeClass      = undefined,
    iconClass       = undefined,
    style           = undefined
}: IButton = {}) => {
    const theme = useTheme("button");

    return (
        <Wrapper className={wrapClass}>
            {pre}
            <button
                title={title}
                className={"btn " + (className || theme.ActionButton.className) + (badge ? " position-relative" : "")}
                style={style}
                data-bs-toggle={toggle}
                data-bs-target={target}
                disabled={disabled}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick?.(e);
                }}
            >
                {icon && <i className={(label ? "me-1 " : "") + (iconClass ? iconClass + " " : "") + theme.getIcon(icon)}></i>}
                {label}
                {badge && <span className={"position-absolute badge " + (badgeClass || theme.ActionButton.badgeClass)}>{badge}</span>}
            </button>
            {post}
        </Wrapper>
    );
};

interface BackLinkProps extends UIProps {
    label?: string;
}

export const BackLink = ({
    label           = "← Back",
    pre             = undefined,
    post            = undefined,
    wrapClass       = undefined,
    className       = undefined
}: BackLinkProps) => {
    const navigate = useNavigate();
    const theme = useTheme("button");
    
    return (
        <Wrapper className={wrapClass}>
            {pre}
            <a href="#"
               className={"btn " + (className || theme.LinkButton.className)}
               onClick={(e) => {
                   e.preventDefault();
                   navigate(-1);
               }}
            >
                {label}
            </a>
            {post}
        </Wrapper>
    );
};

interface GoSiteProps extends UIProps {
    label: string;
    url: string;
}

export const GoSite = ({
    label,
    url,
    pre             = undefined,
    post            = undefined,
    wrapClass       = undefined,
    className       = undefined
}: GoSiteProps) => {
    return (
        <Wrapper className={wrapClass}>
            {pre}
            <h1 className={"page-header mb-0 " + (className || "")}>
                {label + " "}
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <i className="fa fa-external-link" />
                </a>
            </h1>
            {post}
        </Wrapper>
    );
};

interface ReferSiteProps extends UIProps {
    title: string;
    url: string;
    imageUrl: string;
    width?: number | string;
}

export const ReferSite = ({
    title,
    url,
    imageUrl,
    width,
    pre             = undefined,
    post            = undefined,
    wrapClass       = undefined,
    className       = undefined
}: ReferSiteProps) => {
    return (
        <Wrapper className={wrapClass}>
            {pre}
            <a
                href={url}
                className={"me-1 " + (className || "")}
                target="_blank"
                title={title}
                rel="noopener noreferrer"
            >
                <img src={imageUrl} width={width ? width : "100"} height="30" alt={title} />
            </a>
            {post}
        </Wrapper>
    );
};

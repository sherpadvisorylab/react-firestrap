import React, { CSSProperties, ReactNode } from 'react';

type BaseProps = {
    children: ReactNode;
    className?: string;
};

type RowProps = BaseProps & {
    style?: CSSProperties;
};

type ColProps = BaseProps & {
    size?: number;
};

export const Wrapper = ({
                            children,
                            className = undefined
} : BaseProps) => {
    return className
        ? <div className={className}>{children}</div>
        : <>{children}</>;
};


export const Container = ({
                                                   children,
                                                   className = undefined
}: BaseProps) => {
    const fullClassName = className ? `container ${className}` : 'container';

    return (<div className={fullClassName}>{children}</div>);
};

export const Row = ({
                        children,
                        className = undefined,
                        style = undefined
}: RowProps) => {
    const fullClassName = className ? `row ${className}` : 'row';

    return (<div className={fullClassName} style={style}>{children}</div>);
};

export const Col = ({
                        children,
                        className = undefined,
                        size = 6
}: ColProps) => {
    const fullClassName = className ? `col-${size} ${className}` : `col-${size}`;

    return (<div className={fullClassName}>{children}</div>);
};
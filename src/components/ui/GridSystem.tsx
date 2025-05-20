import React, { CSSProperties, ReactNode } from 'react';

type ContainerProps = {
    children: ReactNode;
    className?: string;
};

type RowProps = ContainerProps & {
    style?: CSSProperties;
};

type ColProps = ContainerProps & {
    defaultSize?: number;
    xxl?: number;
    xl?: number;
    lg?: number;
    md?: number;
    sm?: number;
    xs?: number;
};

export const Wrapper = ({
                            children,
                            className = undefined
} : ContainerProps) => {
    return className
        ? <div className={className}>{children}</div>
        : <>{children}</>;
};


export const Container = ({
                                                   children,
                                                   className = undefined
}: ContainerProps) => {
    const fullClassName = className ? `container ${className}` : 'container';

    return (<div className={fullClassName}>{children}</div>);
};

export const Row = ({
                        children,
                        className   = undefined,
                        style       = undefined
}: RowProps) => {
    const fullClassName = className ? `row ${className}` : 'row';

    return (<div className={fullClassName} style={style}>{children}</div>);
};

export const Col = ({
                        children,
                        className   = undefined,
                        xxl         = undefined,
                        xl          = undefined,
                        lg          = undefined,
                        md          = undefined,
                        sm          = undefined,
                        xs          = undefined,
                    }: ColProps) => {
    const entries = (
        [
            ["", xs],
            ["-sm", sm],
            ["-md", md],
            ["-lg", lg],
            ["-xl", xl],
            ["-xxl", xxl],
        ]
    ).filter(([, v]) => v !== undefined);

    const classParts = entries.reduce<string[]>((acc, [bp, val], i) => {
        if (i === 0 || val !== entries[i - 1][1]) {
            acc.push(`col${bp}-${val}`);
        }
        return acc;
    }, []);


    const fullClassName = (classParts.join(" ") || `col`) + (className ? ` ${className}` : "");

    return <div className={fullClassName}>{children}</div>;
};

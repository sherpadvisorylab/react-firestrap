import React, { CSSProperties, ReactNode } from 'react';

type ContainerProps = {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
};

type ColProps = ContainerProps & {
    defaultSize?: number;
    xxl?: number | 'auto';
    xl?: number | 'auto';
    lg?: number | 'auto';
    md?: number | 'auto';
    sm?: number | 'auto';
    xs?: number | 'auto';
};

export const Wrapper = ({
                            children    = undefined,
                            className   = undefined,
                            style       = undefined
} : ContainerProps) => {
    return className
        ? <div className={className} style={style}>{children}</div>
        : <>{children}</>;
};


export const Container = ({
                            children    = undefined,
                            className   = undefined,
                            style       = undefined
}: ContainerProps) => {
    const fullClassName = className ? `container ${className}` : 'container';

    return (<div className={fullClassName} style={style}>{children}</div>);
};

export const Row = ({
                            children    = undefined,
                            className   = undefined,
                            style       = undefined
}: ContainerProps) => {
    const fullClassName = className ? `row ${className}` : 'row';

    return (<div className={fullClassName} style={style}>{children}</div>);
};

export const Col = ({
                            children    = undefined,
                            className   = undefined,
                            style       = undefined,
                            xxl         = undefined,
                            xl          = undefined,
                            lg          = undefined,
                            md          = undefined,
                            sm          = undefined,
                            xs          = undefined
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

    return <div className={fullClassName} style={style}>{children}</div>;
};

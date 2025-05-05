import React, { CSSProperties, ReactNode } from 'react';

type BaseProps = {
    children: ReactNode;
    className?: string;
};

type RowProps = BaseProps & {
    style?: CSSProperties;
};

type ColProps = BaseProps & {
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
                        className = "",
                        defaultSize = 12,
                        xxl,
                        xl,
                        lg,
                        md,
                        sm,
                        xs,
                    }: ColProps) => {
    const entries = (
        [
            ["", xs],
            ["-sm", sm],
            ["-md", md],
            ["-lg", lg],
            ["-xl", xl],
            ["-xxl", xxl],
        ] as [string, number | undefined][]
    ).filter(([, v]) => v !== undefined);

    const classParts = entries.reduce<string[]>((acc, [bp, val], i) => {
        if (i === 0 || val !== entries[i - 1][1]) {
            acc.push(`col${bp}-${val}`);
        }
        return acc;
    }, []);

    const classSize =
        classParts.join(" ") || `col-${defaultSize}`;

    return <div className={`${classSize} ${className}`}>{children}</div>;
};

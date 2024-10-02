export const Wrapper = ({children, className = null}) => {
    return (className
            ? <div className={className}>{children}</div>
            : children
    );
};

export const Container = ({children, className = null}) => {
    className = className ? `container ${className}` : 'container';

    return (<div className={className}>{children}</div>);
};

export const Row = ({children, className = null, style = null}) => {
    className = className ? `row ${className}` : 'row';

    return (<div className={className} style={style}>{children}</div>);
};

export const Col = ({children, size = 6, className = null}) => {
    className = className ? `col-${size} ${className}` : `col-${size}`;

    return (<div className={className}>{children}</div>);
};
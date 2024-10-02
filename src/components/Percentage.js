import React, { useEffect, useState } from "react";

const Percentage = ({
    val = null,
    max = null,
    min = null,
    styleType = "rounded", // or "progress"
    children
}) => {
    // Calcola il numero di campi completati
    const initialCompletedFields = React.Children.toArray(children).reduce((count, child) => {
        if (React.isValidElement(child) && child.props.value) {
            return count + 1;
        }
        return count;
    }, 0);

    const [value, setValue] = useState(val !== null ? val : initialCompletedFields);

    const peak = max || React.Children.count(children);
    const pit = min || 0;

    const [progress, setProgress] = useState(((value - pit) / (peak - pit)) * 100);

    const handleChange = (e) => {
        setValue(prev => prev + (e.target.value.length ? 1 : -1));
    };

    const components = React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const { onChange, ...rest } = child.props;

        const newProps = {
            ...rest, 
            onChange: (event) => {
                onChange?.(event);
                handleChange?.(event);
            },
        }

        return React.cloneElement(child, newProps);
    });

    console.log("Percentage val:", value);

    useEffect(() => {
        setProgress(((value - pit) / (peak - pit)) * 100);
    }, [value, peak, pit]);

    const getSegmentColors = (index) => {
        const colors = ['#4db8ff', '#ff4d4d', '#4dff4d', '#ffff4d', '#4d4dff']; // Esempio di colori
        return colors[index % colors.length];
    };

    if (styleType === "progress") {
        return (
            <>
                <div style={{ position: 'relative', width: '100%' }}>
                    <div className="progress" style={{ width: '100%' }}>
                        <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                                width: `${Math.min(progress, 100)}%`,
                                backgroundColor: getSegmentColors(0),
                            }}
                            aria-valuenow={Math.round(progress)}
                            aria-valuemin={pit}
                            aria-valuemax={Math.max(value, peak)}
                        />
                        {progress > 100 && (
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                    width: `${progress - 100}%`,
                                    backgroundColor: getSegmentColors(1),
                                }}
                                aria-valuenow={Math.round(progress)}
                                aria-valuemin={pit}
                                aria-valuemax={Math.max(value, peak)}
                            />
                        )}
                    </div>
                    <div style={{ position: 'absolute', width: '100%', textAlign: 'center', top: '50%', transform: 'translateY(-50%)' }}>
                        {`${Math.round(progress)}%`}
                    </div>
                </div>
                {components}
            </>
        );
    }

    const radius = 35; // Raggio del cerchio
    const strokeWidth = 10; // Larghezza del bordo del cerchio
    const normalizedRadius = radius - strokeWidth * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;

    const totalSegments = Math.ceil(progress / 100);
    const segmentProgress = Array.from({ length: totalSegments }, (_, index) => {
        return Math.min(progress - (index * 100), 100);
    });

    const progressCircleStyles = segmentProgress.map((segment, index) => {
        const segmentCircumference = circumference;
        const strokeDashoffset = segmentCircumference - (segment / 100) * segmentCircumference;
        return {
            stroke: getSegmentColors(index),
            strokeWidth: `${strokeWidth}px`,
            fill: 'none',
            strokeDasharray: segmentCircumference,
            strokeDashoffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
        };
    });

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
    };

    const backgroundCircleStyle = {
        stroke: '#e6e6e6',
        strokeWidth: `${strokeWidth}px`,
        fill: 'none',
    };

    const textStyle = {
        fontSize: '20px',
        fill: '#000',
        dominantBaseline: 'middle',
        textAnchor: 'middle',
    };

    return (
        <>
            <div style={containerStyle}>
                <svg
                    width={radius * 2}
                    height={radius * 2}
                    viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                >
                    <circle
                        style={backgroundCircleStyle}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    {progressCircleStyles.map((style, index) => (
                        <circle
                            key={index}
                            style={style}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                    ))}
                    <text
                        x="50%"
                        y="50%"
                        style={textStyle}
                    >
                        {`${Math.round(progress)}%`}
                    </text>
                </svg>
            </div>
            {components}
        </>
    );
}

export default Percentage;

import React from 'react';

interface RepeatProps {
    children: React.ReactNode;
    onRemove?: () => void;
    className?: string;
}

const Repeat = ({
                    children,
                    onRemove    = undefined,
                    className   = undefined
}: RepeatProps) => {
    return (
        <div className={className}>
            <div className="p-4 border position-relative">
                <div className="d-flex justify-content-between mb-2">
                    <h6>Ripetizione</h6>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={onRemove}
                    >
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Repeat;

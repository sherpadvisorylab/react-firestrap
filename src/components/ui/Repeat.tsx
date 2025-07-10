import React, { useMemo, useState } from 'react';
import { ActionButton } from './Buttons';
import FormEnhancer, { asForm } from '../FormEnhancer';

interface RepeatProps {
    name: string;
    children: React.ReactNode;
    value?: any[];
    onChange?: (event: { target: { name: string; value?: any } }) => void;
    onAdd?: (value: any[]) => void;
    onRemove?: (index: number) => void;
    className?: string;
    min?: number;
    max?: number;
    title?: string;
    readOnly?: boolean;
}

const getInitialRecords = (value: any, min: number) => {
    if (Array.isArray(value)) return value;
    return Array.from({ length: min }, () => ({}));
};

const Repeat = ({
    name,
    children,
    value = [],
    onChange,
    onAdd,
    onRemove,
    className,
    min = 1,
    max = undefined,
    title,
    readOnly = false,
}: RepeatProps) => {
    const [records, setRecords] = useState<any[]>(() => getInitialRecords(value, min));
    const [release, setRelease] = useState(0);

    const components = useMemo(
        () =>
            Array.from({ length: Math.max(min, value.length) }, (_, i) => (
                <div key={`${name}-${i}`} className="p-4 border position-relative mb-2">
                    {!readOnly && value.length > min && (
                        <div className="d-flex justify-content-end mb-2">
                            <ActionButton icon="x" onClick={() => handleRemove(i)} />
                        </div>
                    )}
                    <FormEnhancer
                        parentName={`${name}.${i}`}
                        components={children}
                        handleChange={onChange}
                        record={value[i]}
                    />
                </div>
            )),
        [value, children, name, onChange, min, release, readOnly]
    );

    const handleAdd = () => {
        const updated = [...records, {}];
        onAdd?.(updated);
        onChange?.({ target: { name: `${name}.${value.length}`, value: {} } });
        setRecords(updated);
        setRelease(prev => prev + 1);
    };
    
    const handleRemove = (index: number) => {
        const updated = records.filter((_, i) => i !== index);
        onRemove?.(index);
        onChange?.({ target: { name: `${name}.${index}` } });
        setRecords(updated)
        setRelease(prev => prev + 1);
    };

    return (
        <div className={className}>
            {title && <h3>{title}</h3>}
            {components}
            {!readOnly && (!max || value.length < max) && (
                <ActionButton icon="plus" onClick={handleAdd} />
            )}
        </div>
    );
};

export default asForm(Repeat);

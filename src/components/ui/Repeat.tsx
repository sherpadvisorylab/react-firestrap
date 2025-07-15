import React, { useMemo, useState } from 'react';
import { ActionButton } from './Buttons';
import FormEnhancer, { asForm } from '../FormEnhancer';
import { ChangeHandler } from 'index';

interface RepeatProps {
    name: string;
    children: React.ReactNode | ((record: any) => React.ReactNode);
    value?: any[];
    onChange?: (event: ChangeHandler) => void;
    onAdd?: (value: any[]) => void;
    onRemove?: (index: number) => void;
    className?: string;
    min?: number;
    max?: number;
    label?: string;
    readOnly?: boolean;
}

const Repeat = ({
    name,
    children,
    value = undefined,
    onChange,
    onAdd,
    onRemove,
    className,
    min = undefined,
    max = undefined,
    label = undefined,
    readOnly = false,
}: RepeatProps) => {
    const [release, setRelease] = useState(0);

    const components = useMemo(() =>
        (Array.isArray(value) ? value : Array.from({ length: min || 0 }, () => ({})))?.map((_, index) =>
            <div key={`${name}-${index}-${release}`} className="p-2 border position-relative mb-2">
                {!readOnly && index >= (min || 0) && <ActionButton 
                    wrapClass='position-absolute top-0 end-0' 
                    className='btn-link' 
                    icon="x" 
                    onClick={() => handleRemove(index)} 
                />}
                <FormEnhancer
                    parentName={`${name}.${index}`}
                    components={typeof children === 'function'
                        ? children({record: value?.[index], records: value, index: index})
                        : children}
                    handleChange={onChange}
                    record={value?.[index]}
                />
            </div>
        ),
        [value, children, name, onChange, min, release, readOnly]
    );

    const handleAdd = () => {
        const next = Array.isArray(value) 
            ? [...value, {}] 
            : Array.from({ length: components.length + 1 }, () => ({}));
        onAdd?.(next);
        onChange?.({ target: { name: `${name}.${next.length - 1}`, value: {} } });
        setRelease(prev => prev + 1);
    };
    
    const handleRemove = (index: number) => {
        onRemove?.(index);
        onChange?.({ target: { name: `${name}.${index}` } });
        setRelease(prev => prev + 1);
    };

    const addButton = useMemo(() => {
        if (readOnly) return null;
        if (!max || components.length < max) {
            return <ActionButton wrapClass='text-end' icon='plus' label='Add' onClick={handleAdd} />
        }
        return null;
    }, [readOnly, max, components.length]);

    return (
        <div className={className}>
            {label && <h4 className='d-flex justify-content-between'>{label}{addButton}</h4>}
            {components}
            {!label && addButton}
        </div>
    );
};

export default asForm(Repeat);

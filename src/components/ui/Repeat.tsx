import React, { useMemo, useState } from 'react';
import { ActionButton } from './Buttons';
import { FieldOnChange, setFormFieldsName, useFormContext } from '../widgets/Form';
import { Row } from './GridSystem';

interface RepeatProps {
    name: string;
    children: React.ReactNode | ((record: any) => React.ReactNode);
    value?: any[];
    onChange?: FieldOnChange;
    onAdd?: (value: any[]) => void;
    onRemove?: (index: number) => void;
    className?: string;
    layout?: 'vertical' | 'horizontal';
    min?: number;
    max?: number;
    label?: string;
    readOnly?: boolean;
}

const Repeat = ({
    name,
    children,
    //value = undefined,
    onChange,
    onAdd,
    onRemove,
    className,
    layout = 'vertical',
    min = undefined,
    max = undefined,
    label = undefined,
    readOnly = false,
}: RepeatProps) => {
    const { value, handleChange } = useFormContext({name, onChange});
    const [release, setRelease] = useState(0);

    const components = (Array.isArray(value) ? value : Array.from({ length: min || 0 }, () => ({})))?.map((_, index) =>
        <div key={`${name}-${index}-${release}`} className={`position-relative pt-3 px-2`}>
            {!readOnly && index >= (min || 0) && <ActionButton 
                wrapClass='position-absolute top-0 end-0' 
                className='btn-close' 
                
                onClick={() => handleRemove(index)} 
            />}
            <Row>
                {setFormFieldsName({
                    children: typeof children === 'function'
                    ? children({record: value?.[index], records: value, index: index})
                    : children, 
                    parentName: `${name}.${index}`
                })}
            </Row>
            <hr />
        </div>
    );

    const handleAdd = () => {
        const next = Array.isArray(value) 
            ? [...value, {}] 
            : Array.from({ length: components.length + 1 }, () => ({}));
        onAdd?.(next);
        handleChange({ target: { name: `${name}.${next.length - 1}`, value: {} } });
        setRelease(prev => prev + 1);
    };
    
    const handleRemove = (index: number) => {
        onRemove?.(index);
        handleChange({ target: { name: `${name}.${index}` } });
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

export default Repeat;

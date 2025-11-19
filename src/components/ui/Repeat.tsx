import React, { useMemo, useState } from 'react';
import { ActionButton } from './Buttons';
import { FieldOnChange, setFormFieldsName, useFormContext } from '../widgets/Form';
import { Col, Row } from './GridSystem';

interface RepeatProps {
    name: string;
    children: React.ReactNode | ((record: any) => React.ReactNode);
    value?: any[];
    onChange?: FieldOnChange;
    onAdd?: (value: any[]) => void;
    onRemove?: (index: number) => void;
    className?: string;
    layout?: 'vertical' | 'horizontal' | 'inline';
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
    layout = 'horizontal',
    min = undefined,
    max = undefined,
    label = undefined,
    readOnly = false,
}: RepeatProps) => {
    const { value, handleChange } = useFormContext({ name, onChange });
    const [release, setRelease] = useState(0);

    const renderChildren = (index: number, wrapClass?: string) => {
        return setFormFieldsName({
            children: typeof children === 'function'
                ? children({ record: value?.[index], records: value, index: index })
                : children,
            parentName: `${name}.${index}`,
            wrapClass
        })
    }
    const renderLayout = (index: number, canRemove: boolean) => {
        switch (layout) {
            case 'horizontal': 
            return <>
                {canRemove && (<div className='d-flex justify-content-between ps-1 mb-2'>
                    <h6>#{index + 1}</h6>
                    <ActionButton
                        className="btn-close p-0"
                        onClick={() => handleRemove(index)}
                    />
                </div>)}
                <div className={`ps-2`}>
                    {renderChildren(index)}
                </div>
                <hr className='mb-2' />
            </>
            case 'vertical':
                return <></>
            case 'inline':
            return <Row className={`ps-2`}>
                {renderChildren(index, 'col')}
                {canRemove && (
                    <Col xs='auto' className='d-flex align-items-center justify-content-end'>
                        <ActionButton
                            className="btn-close p-0"
                            onClick={() => handleRemove(index)}
                        />
                    </Col>
                )}
            </Row>
        }
    }


    const components = (Array.isArray(value) ? value : Array.from({ length: min || 0 }, () => ({})))?.map((_, index) => {
        const canRemove = !readOnly && index >= (min || 0);

        return (
            <React.Fragment key={`${name}-${index}-${release}`}>
                {renderLayout(index, canRemove)}
            </React.Fragment>
        );
    });

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
            return <ActionButton wrapClass='text-end' icon='plus' label={label ? undefined : 'Add'} onClick={handleAdd} />
        }
        return null;
    }, [readOnly, max, components.length]);

    return (
        <div className={className}>
            {label && <h6 className='d-flex align-items-center justify-content-between'>{label}{addButton}</h6>}
            {components}
            {!label && addButton}
        </div>
    );
};

export default Repeat;

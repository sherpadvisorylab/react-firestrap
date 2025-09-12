import React, { useMemo, useState } from 'react';
import { ActionButton } from "./Buttons";
import {converter} from "../../libs/converter";
import { TabLayouts, TabPosition } from './Tab';
import { FieldOnChange, setFormFieldsName, useFormContext } from '../widgets/Form';

interface TabDynamicProps {
    children: React.ReactNode | ((record: any) => React.ReactNode);
    name: string;
    onChange?: FieldOnChange;
    onAdd?: (value: any[]) => void;
    onRemove?: (index: number) => void;
    value?: any[];
    label?: string;
    min?: number;
    max?: number;
    activeIndex?: number;
    title?: string;
    readOnly?: boolean;
    tabPosition?: TabPosition;
}

const TabDynamic = ({
                 children,
                 name,
                 onChange       = undefined,
                 onAdd          = undefined,
                 onRemove       = undefined,
                 //value          = undefined,
                 label          = "Tab",
                 min            = 1,
                 max            = undefined,
                 activeIndex    = 0,
                 title          = undefined,
                 readOnly       = false,
                 tabPosition    = "default"
}: TabDynamicProps) => {
    const { value, handleChange } = useFormContext({name, onChange});
    
    const [active, setActive] = useState(activeIndex);
    const [release, setRelease] = useState(0);


    const tabs = useMemo(() => {
        return (Array.isArray(value) ? value : Array.from({ length: min }, () => ({})))?.map((_, index) => label.includes("{")
        ? converter.parse(value?.[index], label)
        : label + " " + (index + 1))
    }, [value, label, min, release]);

    const components = typeof children === 'function'
    ? children({record: value?.[active], records: value, currentIndex: active})
    : children;

    const component = useMemo(() => {
        return setFormFieldsName({
            children: components, 
            parentName: `${name}.${active}`, 
            parentKey: `${name}-${active}-${release}`
        });
    }, [active, components, name, release]);

      
    const handleAdd = () => {
        const next = Array.isArray(value) 
            ? [...value, {}] 
            : Array.from({ length: tabs.length + 1 }, () => ({}));
        onAdd?.(next);
        handleChange({ target: { name: `${name}.${next.length - 1}`, value: {} } });

        setActive(next.length - 1);
        setRelease(prev => prev + 1);
    }

    const handleRemove = (index: number) => {
        const lastIndex = tabs.length - 1;
        onRemove?.(index);
        //setRecords(next);
        handleChange({ target: { name: `${name}.${index}` } });

        if(active >= lastIndex) {
            setActive(prev => prev - 1);
        }
        setRelease(prev => prev + 1);
    }


    
    const TabLayout = TabLayouts[tabPosition];

    return (
        <div>
            {title && <h3>{title}</h3>}
            <TabLayout
                menu={<>
                    {tabs?.map((label, index) => 
                        <li key={`${name}-${index}`} className="nav-item me-1 position-relative">
                            <button
                               onClick={() => setActive(index)}
                               className={`nav-link ${index === active ? 'active' : ''}`}
                            >
                                {label}
                            </button>
                            {(!readOnly && tabs.length -1 >= min && index === active) &&
                                <ActionButton className="position-absolute top-0 end-0 p-0" icon="x"
                                              onClick={() => handleRemove(index)}/>}
                        </li>
                    )}
                    {!readOnly && (!max || tabs.length < max) && <li key={tabs.length + 1} className="nav-item me-1">
                        <ActionButton className="nav-link" icon="plus" onClick={handleAdd} />
                    </li>}
                </>}
                content={<div className="tab-pane fade show active">
                    {component}
                </div>}
            />
        </div>
    );
}

export default TabDynamic;

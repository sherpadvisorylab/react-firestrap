import React, {useMemo, useState} from 'react';
import {ActionButton} from "./Buttons";
import FormEnhancer, { asForm } from "../FormEnhancer";
import {converter} from "../../libs/converter";
import { TabLayouts, TabPosition } from './Tab';
import { path } from 'libs';

interface TabDynamicProps {
    children: React.ReactNode | ((record: any) => React.ReactNode);
    name: string;
    onChange?: (event: { target: { name: string; value?: any } }) => void;
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
                 value          = undefined,
                 label          = "Tab",
                 min            = 1,
                 max            = undefined,
                 activeIndex    = 0,
                 title          = undefined,
                 readOnly       = false,
                 tabPosition    = "default"
}: TabDynamicProps) => {
    const [active, setActive] = useState(activeIndex);
    const [release, setRelease] = useState(0);


    const tabs = useMemo(() => {
        console.log("tabs", value, label, min);
        return (Array.isArray(value) ? value : Array.from({ length: min }, () => ({})))?.map((_, index) => label.includes("{")
        ? converter.parse(value?.[index], label)
        : label + " " + (index + 1))
    }, [value, label, min, release]);

    console.log("ASDADSAD", active, value, tabs );

    const components = typeof children === 'function'
    ? children(value?.[active])
    : children;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [parent, indexStr, field] = e.target.name.split(".");
        const index = parseInt(indexStr);
        console.log("handleChange", e, parent, index, field);

        /*setRecords(prev => {
            const updated = [ ...prev ];
            updated[index] = { ...updated[index], [field]: e.target.value };
            return updated;
        });*/
        onChange?.(e);
    }
    
    const component = useMemo(() => {
        console.log("component", active, value, components, children);
        return <FormEnhancer
            key={`${name}-${active}-${release}`}
            parentName={`${name}.${active}`}
            components={components}
            record={value?.[active]}
            handleChange={handleChange}
        />
    }, [active, components, name, release]);

      
    const handleAdd = () => {
        console.log(value, typeof value, Array.isArray(value));
        const next = Array.isArray(value) 
            ? [...value, {}] 
            : Array.from({ length: tabs.length + 1 }, () => ({}));
        onAdd?.(next);
        onChange?.({ target: { name: `${name}.${next.length - 1}`, value: {} } });

        setActive(next.length - 1);
        setRelease(prev => prev + 1);
        console.log("handleAdd", next, value);
    }

    const handleRemove = (index: number) => {
        const lastIndex = tabs.length - 1;
        onRemove?.(index);
        //setRecords(next);
        onChange?.({ target: { name: `${name}.${index}` } });

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

export default asForm(TabDynamic);

import React, {useMemo, useState} from 'react';
import {ActionButton} from "./Buttons";
import FormEnhancer, { asForm } from "../FormEnhancer";
import {converter} from "../../libs/converter";
import { TabLayouts, TabPosition } from './Tab';

interface TabDynamicProps {
    children: React.ReactNode;
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
    const [internalValue, setInternalValue] = useState(() =>
        Array.from({ length: min }, () => ({}))
      );    
    const records = value ?? internalValue;

    const setLabel = (index: number) => {
        return (label.includes("{")
            ? converter.parse(records?.[index], label) || "New " + (index + 1)
            : label + " " + (index + 1)
        );
    }

    const components = useMemo(
        () =>
          Array.from({ length: Math.max(min, records?.length) }, (_, i) =>
            <FormEnhancer
                parentName={`${name}.${i}`}
                components={children}
                record={records?.[i]}
                handleChange={onChange}
            />
          ),
        [records, children, name, onChange, min, release]
    );
      
    const handleAdd = () => {
        const next = [...records, {}];
        onAdd?.(next);
        onChange?.({ target: { name: `${name}.${components.length}`, value: {} } });

        !value && setInternalValue(next);
        
        setActive(components.length);
    }

    const handleRemove = (index: number) => {
        onRemove?.(index);
        onChange?.({ target: { name: `${name}.${index}` } });

        !value && setInternalValue(prev => prev.filter((_, i) => i !== index));

        if(index == components.length - 1) {
            setActive(index - 1);
        }
        setRelease(prev => prev + 1);
    }

    const TabLayout = TabLayouts[tabPosition];

    return (
        <div>
            {title && <h3>{title}</h3>}
            <TabLayout
                menu={<>
                    {components.map((_, index) => 
                        <li key={`${name}-${index}`} className="nav-item me-1 position-relative">
                            <button
                               onClick={() => setActive(index)}
                               className={`nav-link ${index === active ? 'active' : ''}`}
                            >
                                {setLabel(index)}
                            </button>
                            {(!readOnly && components.length -1 >= min && index === active) &&
                                <ActionButton className="position-absolute top-0 end-0 p-0" icon="x"
                                              onClick={() => handleRemove(index)}/>}
                        </li>
                    )}
                    {!readOnly && (!max || components.length < max) && <li key={components.length + 1} className="nav-item me-1">
                        <ActionButton className="nav-link" icon="plus" onClick={handleAdd} />
                    </li>}
                </>}
                content={<div
                    key={`${name}-${active}-${release}`}
                    className="tab-pane fade show active"
                  >
                    {components[active]}
                  </div>}
            />
        </div>
    );
}

export default asForm(TabDynamic);

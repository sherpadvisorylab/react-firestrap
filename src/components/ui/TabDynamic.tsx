import React, {ChangeEvent, useEffect, useMemo, useState} from 'react';
import {ActionButton} from "./Buttons";
import ComponentEnhancer from "../ComponentEnhancer";
import {converter} from "../../libs/converter";
import {RecordArray, RecordProps} from "../../integrations/google/firedatabase";
import { TabLayout } from './Tab';

interface TabDynamicLayoutProps {
    menu: React.ReactNode;
    content: React.ReactNode;
}

interface TabDynamicProps {
    children: React.ReactNode;
    name: string;
    onChange?: (event: { target: { name: string; value?: any } }) => void;
    value?: any[];
    label?: string;
    min?: number;
    max?: number;
    activeIndex?: number;
    title?: string;
    onAdd?: () => void;
    onRemove?: (index: number) => void;
    readOnly?: boolean;
    tabPosition?: "top" | "left" | "right";
}


const TabDynamicTop = ({menu, content}: TabDynamicLayoutProps) => (
    <>
        <ul className="nav nav-tabs">{menu}</ul>
        <div className="tab-content pt-3">{content}</div>
    </>
);


const TabDynamicLeft = ({menu, content}: TabDynamicLayoutProps) => (
    <div className="d-flex">
        <ul className="nav nav-tabs flex-column text-nowrap border-end border-bottom-0">{menu}</ul>
        <div className="tab-content ps-3 pt-3 border-top">{content}</div>
    </div>
);

const TabDynamicRight = ({menu, content}: TabDynamicLayoutProps) => (
    <div className="d-flex">
        <div className="tab-content pe-3 pt-3 border-top">{content}</div>
        <ul className="nav nav-tabs flex-column text-nowrap border-start border-bottom-0">{menu}</ul>
    </div>
);

const TabDynamic = ({
                 children,
                 name,
                 onChange       = undefined,
                 value          = undefined,
                 label          = "Tab",
                 min            = 1,
                 max            = undefined,
                 activeIndex    = 0,
                 title          = undefined,
                 onAdd          = undefined,
                 onRemove       = undefined,
                 readOnly       = false,
                 tabPosition    = "top"
}: TabDynamicProps) => {
    const [active, setActive] = useState(activeIndex);

    const setLabel = (index: number) => {
        return (label.includes("{")
            ? converter.parse(value?.[index], label) || "New " + (index + 1)
            : label + " " + (index + 1)
        );
    }
    const addComponent = (index: number, record: RecordProps) => {
        return <ComponentEnhancer
            parentName={`${name}.${index}`}
            components={children}
            record={record}
            handleChange={onChange}
        />
    }
    console.log(value, "valueXXXXXXXXXXXXXXXXXXXXXXX");
    const components = useMemo(
        () =>
          Array.from({ length: Math.max(min, value?.length || 0) }, (_, i) =>
            addComponent(i, value?.[i] ?? {})
          ),
        [value, children, name, onChange, min]
    );
      

    const handleAdd = () => {
        onChange?.({ target: { name: `${name}.${components.length}`, value: {} } });

        setActive(components.length);
    }

    const handleRemove = (index: number) => {
        onChange?.({ target: { name: `${name}.${index}` } });
        console.log(index, components.length, "index, components.length");
        if(index == components.length - 1) {
            setActive(index - 1);
        }
    }

    const TabDynamicDisplayed = {
        top:    TabDynamicTop,
        left:   TabDynamicLeft,
        right:  TabDynamicRight
    }[tabPosition] || TabDynamicTop;

    return (
        <div>
            {title && <h3>{title}</h3>}
            <TabDynamicDisplayed
                menu={<>
                    {components.map((_, index) => 
                        <li key={index} className="nav-item me-1 position-relative">
                            <a href={`#${name}-${index}`}
                               onClick={() => setActive(index)}
                               className={`nav-link ${index === active ? 'active' : ''}`}
                               data-bs-toggle="tab">
                                {setLabel(index)}
                            </a>
                            {(!readOnly && components.length -1 >= min && index === active) &&
                                <ActionButton className="position-absolute top-0 end-0 p-0" icon="x"
                                              onClick={() => handleRemove(index)}/>}
                        </li>
                    )}
                    {!readOnly && <li key={components.length + 1} className="nav-item me-1">
                        <ActionButton className="nav-link" icon="plus" onClick={handleAdd} />
                    </li>}
                </>}
                content={components.map((component, index) => 
                    <div key={index} className={`tab-pane fade ${index === active ? 'show active' : ''}`} id={name + "-" + index}>
                        {component}
                    </div>
                )}
            />
        </div>
    );
}

TabDynamic.enhance = true;
export default TabDynamic;

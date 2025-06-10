import React, {useState} from 'react';
import {ActionButton} from "./Buttons";
import ComponentEnhancer from "../ComponentEnhancer";
import {converter} from "../../libs/converter";
import {RecordArray, RecordProps} from "../../integrations/google/firedatabase";

interface TabDynamicLayoutProps {
    menu: React.ReactNode;
    content: React.ReactNode;
}

interface TabDynamicProps {
    children: React.ReactNode;
    name?: string;
    onChange?: (e: { target: { name: string; value: any[] } }) => void;
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
                 name           = undefined,
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
    // const recordEmpty = propsComponentEnhancer(children);
    const [active, setActive] = useState(activeIndex);
    const [uniqueKey, setUniqueKey] = useState(0);

    const [records, setRecords] = useState<RecordArray>(() => {
        if (!value) {
            value = [];
        }

        if (min && value.length < min) {
            for (let i = value.length; i < min; i++) {
                value.push({});
            }
        }
        return value;
    });

    const [components, setComponents] = useState(() => {
        return records.map((record, index) =>
            <ComponentEnhancer
                components={children}
                record={record}
                handleChange={(e) => handleChange(e, index)}
            />
        );
    });

    const addComponent = (index: number, record: RecordProps) => {
        return (<ComponentEnhancer
            components={children}
            record={record}
            handleChange={(e) => handleChange(e, index)}
        />)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
        setRecords(prevRecords => {
            const newRecords = [...prevRecords];
            newRecords[index] = {...newRecords[index], [e.target.name]: e.target.value};

            if(onChange && name) {
                setTimeout(() => {
                    onChange({target: {name, value: newRecords}});
                }, 0);
            }
            console.log("TAB CHANGE", records, newRecords);
            return newRecords;
        });
    };

    const handleAdd = () => {
        const updatedRecords = [...records, {} as RecordProps];
        const lastIndex = updatedRecords.length - 1;

        setRecords(updatedRecords);
        setComponents(prevComponents => {
            return [...prevComponents, addComponent(lastIndex, updatedRecords[lastIndex])];
        });
        setActive(lastIndex);

        console.log("tagAdd", records, updatedRecords);
    };


    const handleRemove = (index: number) => {
        setRecords(prevRecords => {
            const updatedRecords = [...prevRecords];
            updatedRecords.splice(index, 1);

            if (onChange && name) {
                setTimeout(() => {
                    onChange({target: {name, value: updatedRecords}});
                }, 0);
            }
            setUniqueKey(uniqueKey + 1);
            if (index > updatedRecords.length - 1) {
                setActive(updatedRecords.length - 1);
            }

            setComponents(updatedRecords.map((record, index) =>
                <ComponentEnhancer
                    components={children}
                    record={record}
                    handleChange={(e) => handleChange(e, index)}
                />
            ));

            console.log("tabRemove", records, updatedRecords);
            return updatedRecords;
        });
    }
    const setLabel = (index: number) => {
        return (label.includes("{")
            ? converter.parse(records[index], label) || "New " + (index + 1)
            : label + " " + (index + 1)
        );
    }

    const domKey = name || "TabDynamic";
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
                    {components.map((_, index) => (
                        <li key={domKey + index + uniqueKey} className="nav-item me-1 position-relative">
                            <a href={`#${domKey}-${index}`}
                               onClick={() => setActive(index)}
                               className={`nav-link ${index === active ? 'active' : ''}`}
                               data-bs-toggle="tab">
                                {setLabel(index)}
                            </a>
                            {(!readOnly && index === active) &&
                                <ActionButton className="position-absolute top-0 end-0 p-0 me-1" post="x"
                                              onClick={() => handleRemove(index)}/>}
                        </li>
                    ))}
                    {!readOnly && <li key={records.length + 1} className="nav-item me-1">
                        <ActionButton className="nav-link" icon="plus" onClick={handleAdd} />
                    </li>}
                </>}
                content={components.map((component, index) => (
                    <div key={domKey + index + uniqueKey} className={`tab-pane fade ${index === active ? 'show active' : ''}`} id={domKey + "-" + index}>
                        {component}
                    </div>
                ))}
            />
        </div>
    );
}

export default TabDynamic;

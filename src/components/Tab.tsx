import React, {useState} from 'react';
import {ActionButton} from "./Buttons";
import ComponentEnhancer from "./ComponentEnhancer";
import {converter} from "../libs";

const TabTop = ({menu, content}) => {
    return <>
        <ul className="nav nav-tabs">
            {menu}
        </ul>
        <div className="tab-content pt-3">
            {content}
        </div>
    </>
}


const TabLeft = ({menu, content}) => {
    return <div className="d-flex">
        <ul className="nav nav-tabs flex-column text-nowrap border-end border-bottom-0">
            {menu}
        </ul>
        <div className="tab-content ps-3 pt-3 border-top">
            {content}
        </div>
    </div>
}

const TabRight = ({menu, content}) => {
    return <div className="d-flex">
        <div className="tab-content pe-3 pt-3 border-top">
            {content}
        </div>
        <ul className="nav nav-tabs flex-column text-nowrap border-start border-bottom-0">
            {menu}
        </ul>
    </div>
}

const Tab = ({
                 children,
                 name = null,
                 onChange = () => {
                 },
                 value = null,
                 label = "Tab",
                 min = 1,
                 max = null,
                 activeIndex = 0,
                 title,
                 onAdd,
                 onRemove,
                 readOnly = false,
                 tabPosition = "top"
             }: {
    children: any,
    name?: string,
    onChange?: any,
    value?: any[],
    label?: string,
    min?: number,
    max?: number,
    activeIndex?: number,
    title?: string,
    onAdd?: any,
    onRemove?: any,
    readOnly: boolean,
    tabPosition: "top" | "left" | "right"
}) => {
    // const recordEmpty = propsComponentEnhancer(children);
    const [active, setActive] = useState(activeIndex);
    const [uniqueKey, setUniqueKey] = useState(0);

    const [records, setRecords] = useState(() => {
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

    const addComponent = (index, record) => {
        return (<ComponentEnhancer
            components={children}
            record={record}
            handleChange={(e) => handleChange(e, index)}
        />)
    }

    const handleChange = (e, index) => {
        setRecords(prevRecords => {
            const newRecords = [...prevRecords];
            newRecords[index] = {...newRecords[index], [e.target.name]: e.target.value};

            if(onChange && name) {
                setTimeout(() => {
                    onChange({target: {name, value: newRecords}});
                }, 0);
            }
            console.log("change", records, newRecords);
            return newRecords;
        });
    };

    const handleAdd = () => {
        const updatedRecords = [...records, {}];
        const lastIndex = updatedRecords.length - 1;

        setRecords(updatedRecords);
        setComponents(prevComponents => {
            return [...prevComponents, addComponent(lastIndex, updatedRecords[lastIndex])];
        });
        setActive(lastIndex);

        console.log("tagAdd", records, updatedRecords);
    };


    const handleRemove = (index) => {
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
    const setLabel = (index) => {
        return (label.includes("{")
            ? converter.parse(records[index], label) || "New " + (index + 1)
            : label + " " + (index + 1)
        );
    }

    const domKey = name || "Tab";
    const TabDisplayed = {
        top:    TabTop,
        left:   TabLeft,
        right:  TabRight
    }[tabPosition] || TabTop;

    return (
        <div>
            {title && <h3>{title}</h3>}
            <TabDisplayed
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

Tab.enhance = true;
export default Tab;

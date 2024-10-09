import React, {useState} from 'react';
import {ActionButton} from "./Buttons";
import ComponentEnhancer from "./ComponentEnhancer";

const Tab = ({
                 children,
                 name = null,
                 onChange = () => {},
                 value = null,
                 label = "Tab",
                 min = 1,
                 max = null,
                 key = "tab",
                 activeIndex = 0,
                 title,
                 onAdd,
                 onRemove
} : {
    children: any,
    name?: string,
    onChange?: any,
    value?: any[],
    label?: string,
    min?: number,
    max?: number,
    key?: string,
    activeIndex?: number,
    title?: string,
    onAdd?: any,
    onRemove?: any
}) => {
   // const recordEmpty = propsComponentEnhancer(children);
    const [active, setActive] = useState(activeIndex);
    const [uniqueKey, setUniqueKey] = useState(0);

    const [records, setRecords] = useState(() => {
        if(!value) {
            value = [];
        }

        if(min && value.length < min) {
            for(let i = value.length; i < min; i++) {
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

    const domKey = name || key;

    return (
        <div>
            {title && <h3>{title}</h3>}
            <ul className="nav nav-tabs">
                {components.map((_, index) => (
                    <li key={key + index + uniqueKey} className="nav-item me-1 position-relative">
                        <a href={`#${domKey}-${index}`}
                           onClick={() => setActive(index)}
                           className={`nav-link ${index === active ? 'active' : ''}`}
                           data-bs-toggle="tab">
                            {label + " " + (index + 1)}
                        </a>
                        {index === active && <ActionButton className={"position-absolute top-0 end-0 p-0 me-1"} post={"x"} onClick={() => handleRemove(index)} />}
                    </li>
                ))}
                {<li key={records.length + 1} className="nav-item me-1">
                    <ActionButton className={`nav-link`} icon="plus" onClick={handleAdd} />
                </li>}
            </ul>
            <div className="tab-content pt-3">
                {components.map((component, index) => (
                    <div key={key + index + uniqueKey} className={`tab-pane fade ${index === active ? 'show active' : ''}`} id={domKey + "-" + index}>
                        {component}
                    </div>
                ))}
            </div>
        </div>
    );
}

Tab.enhance = true;
export default Tab;

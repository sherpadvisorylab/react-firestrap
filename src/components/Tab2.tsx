import React, {useState} from 'react';
import {ActionButton} from "./Buttons";

interface TabItem {
    label: React.ReactNode;
    content: React.ReactNode;
}

interface Tab2Props {
    items: TabItem[];
    key?: string;
    activeIndex?: number;
    onAdd?: () => void;
    onRemove?: (index: number) => void;
    className?: string;
}

const Tab2 = ({
                  items,
                  key = "tab",
                  activeIndex = 0,
                  onAdd,
                  onRemove,
                  className = undefined
}: Tab2Props) => {
    const [active, setActive] = useState(activeIndex);

    return (
        <div>
            <ul className="nav nav-tabs">
                {items.map((item, index) => (
                    <li key={key + index} className="nav-item me-1">
                        <a href={`#${key}-${index}`}
                           onClick={() => setActive(index)}
                           className={`nav-link ${index === active ? 'active' : ''}`}
                           data-bs-toggle="tab">
                            {item.label}
                            {onRemove && <ActionButton className={"border-0 ms-1"} label={"x"} onClick={() => {
                                onRemove(index);
                                setActive(index - 1);
                            }} />}
                        </a>
                    </li>
                ))}
                {onAdd && <li key={items.length + 1} className="nav-item me-1">
                    <button className={`nav-link`} onClick={() => {
                        onAdd();
                        setActive(items.length);
                    }}><i className={"bi bi-plus"} /></button>
                </li>}
            </ul>
            <div className="tab-content pt-3">
                {items.map((item, index) => (
                    <div key={key + index} className={`tab-pane fade ${index === active ? 'show active' : ''}`} id={key + "-" + index}>
                        {item.content}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tab2;

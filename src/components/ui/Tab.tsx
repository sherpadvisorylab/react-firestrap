import React, { useState, Children, ReactElement } from 'react';
import { Wrapper } from "./GridSystem";
import { UIProps } from '../..';

export type TabPosition = "default" | "top" | "left" | "right" | "bottom";

interface TabItemProps {
    label: React.ReactNode;
    children: React.ReactNode;
}

interface TabLayoutProps {
    menu: React.ReactNode;
    content: React.ReactNode;
}

interface TabProps extends UIProps {
    children: React.ReactNode;
    defaultTab?: number;
    tabPosition?: TabPosition;
}

export const TabLayouts: Record<TabPosition, (props: TabLayoutProps) => JSX.Element> = {
    default: ({menu, content}) => (
        <>
            <ul className="nav nav-tabs mb-2">{menu}</ul>
            <div className="tab-content">{content}</div>
        </>
    ),
    top: ({menu, content}) => (
        <>
            <ul className="nav nav-pills mb-2">{menu}</ul>
            <div className="tab-content">{content}</div>
        </>
    ),
    left: ({menu, content}) => (
        <div className="d-flex">
            <ul className="nav nav-pills flex-column me-2">{menu}</ul>
            <div className="tab-content flex-fill">{content}</div>
        </div>
    ),
    right: ({menu, content}) => (
        <div className="d-flex">
            <div className="tab-content flex-fill">{content}</div>
            <ul className="nav nav-pills flex-column ms-2">{menu}</ul>
        </div>
    ),
    bottom: ({menu, content}) => (
        <>
            <div className="tab-content">{content}</div>
            <ul className="nav nav-pills">{menu}</ul>
        </>
    )
};


export const TabItem: React.FC<TabItemProps> = () => null;

const Tab: React.FC<TabProps> = ({
    children,
    defaultTab = 0,
    tabPosition = "default",
    pre = undefined,
    post = undefined,
    wrapClass = undefined,
    className = undefined
}) => {
    const [active, setActive] = useState(defaultTab);
    
    const items = Children.toArray(children)
        .filter((child): child is ReactElement<TabItemProps> => 
            React.isValidElement(child) && child.type === TabItem
        );

    const TabLayout = TabLayouts[tabPosition];

    return (
        <Wrapper className={wrapClass}>
            {pre}
            <div className={className}>
                <TabLayout
                    menu={items.map((item, index) => (
                        <li key={index} className="nav-item me-1">
                            <button 
                               onClick={() => setActive(index)}
                               className={`nav-link ${index === active ? 'active' : ''}`}
                            >
                                {item.props.label}
                            </button>
                        </li>
                    ))}
                    content={
                        <div 
                            key={active}
                            className={`tab-pane fade show active`}
                        >
                            {items[active].props.children}
                        </div>
                    }
                />
            </div>
            {post}
        </Wrapper>
    );
};

export default Tab;

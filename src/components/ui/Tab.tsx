import React, { useState, Children, ReactElement } from 'react';
import { Wrapper } from "./GridSystem";
import { UIProps } from '../..';

interface TabItemProps {
    label: React.ReactNode;
    children: React.ReactNode;
}

export const TabItem: React.FC<TabItemProps> = () => null;

interface TabLayoutProps {
    menu: React.ReactNode;
    content: React.ReactNode;
}

const TabTop = ({menu, content}: TabLayoutProps) => (
    <>
        <ul className="nav nav-tabs">{menu}</ul>
        <div className="tab-content pt-3">{content}</div>
    </>
);

const TabLeft = ({menu, content}: TabLayoutProps) => (
    <div className="d-flex">
        <ul className="nav nav-tabs flex-column text-nowrap border-end border-bottom-0">{menu}</ul>
        <div className="tab-content ps-3 pt-3 border-top">{content}</div>
    </div>
);

const TabRight = ({menu, content}: TabLayoutProps) => (
    <div className="d-flex">
        <div className="tab-content pe-3 pt-3 border-top">{content}</div>
        <ul className="nav nav-tabs flex-column text-nowrap border-start border-bottom-0">{menu}</ul>
    </div>
);

const TabBottom = ({menu, content}: TabLayoutProps) => (
    <div className="d-flex">
        <div className="tab-content ps-3 pt-3 border-top">{content}</div>
        <ul className="nav nav-tabs flex-column text-nowrap border-start border-bottom-0">{menu}</ul>
    </div>
);

interface TabProps extends UIProps {
    children: React.ReactNode;
    defaultTab?: number;
    tabPosition?: "top" | "left" | "right" | "bottom";
}

const Tab: React.FC<TabProps> = ({
    children,
    defaultTab = 0,
    tabPosition = "top",
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

    const TabDisplayed = {
        top: TabTop,
        left: TabLeft,
        right: TabRight,
        bottom: TabBottom
    }[tabPosition] || TabTop;

    return (
        <Wrapper className={wrapClass}>
            {pre}
            <div className={className}>
                <TabDisplayed
                    menu={items.map((item, index) => (
                        <li key={index} className="nav-item me-1">
                            <a href={`#tab-${index}`}
                               onClick={() => setActive(index)}
                               className={`nav-link ${index === active ? 'active' : ''}`}
                               data-bs-toggle="tab">
                                {item.props.label}
                            </a>
                        </li>
                    ))}
                    content={items.map((item, index) => (
                        <div 
                            key={index}
                            className={`tab-pane fade ${index === active ? 'show active' : ''}`}
                            id={`tab-${index}`}
                        >
                            {item.props.children}
                        </div>
                    ))}
                />
            </div>
            {post}
        </Wrapper>
    );
};

export default Tab;

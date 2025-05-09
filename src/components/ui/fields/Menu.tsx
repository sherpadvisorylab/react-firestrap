import React from 'react'
import { Select } from './Select';
import { getContextMenu, useMenu } from '../../../App';
import { useTheme } from '../../../Theme';
import { Link } from 'react-router-dom';
import { Wrapper } from '../GridSystem';
import Badge, { BadgeProps } from '../Badge';

/* component/block/menu -> component/model -> [pages/pageHelper, dindex/pages/section/topBar] */

interface MenuProps {
  context: string;
  Type?: 'ul' | 'ol';
  badges?: { type?: BadgeProps["type"], text: string }[];
  pre?: React.ReactNode;
  post?: React.ReactNode;
  wrapClass?: string;
  className?: string;
  itemClass?: string;
  linkClass?: string;
}

export const Menu = ({
  context,
  Type = 'ul',
  badges = [],
  pre = undefined,
  post = undefined,
  wrapClass = undefined,
  className = undefined,
  itemClass = undefined,
  linkClass = undefined
}: MenuProps) => {
  const menu = useMenu(context);
  const theme = useTheme('menu');

  const renderMenu = (items: any[]) => {
    return items.map((item, index) => {
      const HeaderLI = () => (
        <li key={index} className={`menu-header ${itemClass || theme.Menu.itemClass}`}>
          {item.icon && <i className={theme.getIcon(item.icon)}></i>}
          <span>{item.title}</span>
        </li>
      );

      const hasChildren = item.children && item.children.length > 0;

      const ItemLI = () => (
        <li key={index} className={itemClass || theme.Menu.itemClass}>
          <Link
            to={item.path}
            className={linkClass || theme.Menu.linkClass}
            {...(hasChildren && {
              'data-bs-toggle': 'collapse',
              'data-bs-target': `#collapse${index}`,
            })}
          >
            {pre}
            {item.icon && (
              <span className='menu-icon'>
                <i className={theme.getIcon(item.icon)}></i>
              </span>
            )}
            <span className='menu-text'>
              {item.title}
              {badges.map((badge, i) => (
                <Badge key={i} type={badge.type} className='ms-1'>
                  {badge.text}
                </Badge>
              ))}
            </span>
            {post}
            {hasChildren && <i className={theme.getIcon("caret-right")}></i>}
          </Link>
          {/* Sotto-menu */}
          {hasChildren && (
            <div className="collapse" id={"collapse" + index}>
              <ul className="nav flex-column ms-4">
                {renderMenu(item.children)}
              </ul>
            </div>
          )}
        </li>
      );

      return item.path
        ? <ItemLI key={index} />
        : <HeaderLI key={index} />;
    });
  };

  return (
    <Wrapper className={wrapClass}>
      <Type className={className || theme.Menu.className}>
        {renderMenu(menu)}
      </Type>
    </Wrapper>
  );
}


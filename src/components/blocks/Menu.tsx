import React, { useEffect, useState } from 'react';
import { useMenu } from '../../App';
import { useTheme } from '../../Theme';
import { Link } from 'react-router-dom';
import { Wrapper } from '../ui/GridSystem';
import Badge, { BadgeProps } from '../ui/Badge';

interface MenuProps {
  context: string;
  Type?: 'ul' | 'ol';
  badges?: { type?: BadgeProps["type"], text: string }[];
  pre?: React.ReactNode;
  post?: React.ReactNode;
  wrapClass?: string;
  className?: string;
  headerClass?: string;
  itemClass?: string;
  linkClass?: string;
  textClass?: string;
  iconClass?: string;
  submenuClass?: string;
}

export const Menu = ({
  context,
  Type          = 'ul',
  badges        = [],
  pre           = undefined,
  post          = undefined,
  wrapClass     = undefined,
  className     = undefined,
  headerClass   = undefined,
  itemClass     = undefined,
  linkClass     = undefined,
  textClass     = undefined,
  iconClass     = undefined,
  submenuClass  = undefined,
}: MenuProps) => {
  const menu = useMenu(context);
  const theme = useTheme('menu');

  const MenuItem = ({ item, index }: { item: any; index: number }) => {
    const [isOpen, setIsOpen] = useState<boolean>(item.active);

    useEffect(() => {
      setIsOpen(item.active);
    }, [item]);

    const hasChildren = item.children?.length > 0;
    const id = `${item.title}-${index}`;
    const Icon = () => (
      <span className={iconClass || theme.Menu.iconClass}>
        <i className={theme.getIcon(item.icon)}></i>
      </span>
    );

    if (!item.path) {
      return (
        <li key={index} className={headerClass || theme.Menu.headerClass}>
          {item.icon && <Icon />}
          <span>{item.title}</span>
        </li>
      );
    }

    return (
      <li className={`${itemClass || theme.Menu.itemClass} ${item.active ? 'active' : ''}`}>
        <Link
          to={item.path}
          className={linkClass || theme.Menu.linkClass}
          {...(hasChildren && {
            'data-bs-toggle': 'collapse',
            'data-bs-target': `#${id}`,
          })}
          onClick={() => setIsOpen(prev => !prev)}
        >
          {pre}
          {item.icon && <Icon />}
          <span className={textClass || theme.Menu.textClass}>
            {item.title}
            {badges.map((badge, i) => (
              <Badge key={i} type={badge.type} className="ms-1">
                {badge.text}
              </Badge>
            ))}
          </span>
          {post}
          {hasChildren && <i className={theme.getIcon(isOpen ? 'caret-down' : 'caret-right')}></i>}
        </Link>
        {hasChildren && (
          <div className={`collapse ${isOpen ? 'show' : ''}`} id={id}>
            <Type className={submenuClass || theme.Menu.submenuClass}>
              {item.children.map((child: any, idx: number) => (
                <MenuItem key={idx} item={child} index={idx} />
              ))}
            </Type>
          </div>
        )}
      </li>
    );
  };

  return (
    <Wrapper className={wrapClass}>
      <Type className={className || theme.Menu.className}>
        {menu.map((item, index) => (
          <MenuItem key={index} item={item} index={index} />
        ))}
      </Type>
    </Wrapper>
  );
};

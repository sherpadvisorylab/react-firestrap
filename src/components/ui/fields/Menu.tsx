import React from 'react'
import { Select } from './Select';
import { getContextMenu, useMenu } from '../../../App';
import { useTheme } from 'Theme';

/* component/block/menu -> component/model -> [pages/pageHelper, dindex/pages/section/topBar] */

interface MenuProps {
  context: string;
}

export const Menu = ({
  context
}: MenuProps) => {
  const menu = useMenu(context);
  const theme = useTheme('menu');
  
  return (
    <ul>
      {menu.map((item, index) => (
        <li key={index}><a href={item.href}>
          {item.icon && <i className={theme.getIcon(item.icon)}></i>}
          {item.label}</a></li>
      ))}
    </ul>
  );
}


export function Menu2() {
  return (
    <div>Menu</div>
  )
}

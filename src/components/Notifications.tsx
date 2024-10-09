import React from "react";
import {Dropdown, DropdownLink} from "./Dropdown";
import {useTheme} from "../Theme";
import {Wrapper} from "./GridSystem";

function Notifications({children = [], badge = null, wrapClass = null}) {
  const theme = useTheme("notifications");

  return (
      <Wrapper className={wrapClass || theme.Notifications.wrapClass}>
          <Dropdown
              className={theme.Notifications.Dropdown.className}
              buttonClass={theme.Notifications.Dropdown.buttonClass}
              menuClass={theme.Notifications.Dropdown.menuClass}
              icon={"bell"}
              badge={badge}
              header="NOTIFICATIONS"
              footer="SEE ALL"
          >
              {(children || []).map((notify, index) => {
                  let addClass = " w-20px";
                  if (index === 0) addClass = "";
                  return (
                      <DropdownLink
                          className="py-10px text-wrap"
                          url={notify.url}
                          key={index}
                      >
                          <div className={"fs-20px" + addClass}>
                              <i className={`${theme.getIcon(notify.icon)} text-theme`}/>
                          </div>
                          <div className="flex-1 flex-wrap ps-3">
                              <div className="mb-1 text-white">{notify.title}</div>
                              <div className="small">{notify.time}</div>
                          </div>
                          <div className="ps-2 fs-16px">
                              <i className={`${theme.getIcon("chevron-right")}`}/>
                          </div>
                      </DropdownLink>
                  );
              })}
          </Dropdown>
      </Wrapper>
  );
}

export default Notifications;
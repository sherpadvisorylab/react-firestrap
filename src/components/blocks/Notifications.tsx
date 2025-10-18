import React from "react";
import {Dropdown, DropdownItem} from "./Dropdown";
import {useTheme} from "../../Theme";
import {Wrapper} from "../ui/GridSystem";

interface NotificationItem {
    title: string;
    url: string;
    time: string;
    icon: string;
}

interface NotificationsProps {
    children?: NotificationItem[];
    badge?: React.ReactNode;
    wrapClass?: string;
}

function Notifications({
                           children     = [],
                           badge        = undefined,
                           wrapClass    = undefined
}: NotificationsProps) {
  const theme = useTheme("notifications");

  return (
      <Wrapper className={wrapClass || theme.Notifications.wrapClass}>
          <Dropdown
              toggleButton={{
                icon: "bell",
              }}
              className={"d-flex align-items-center " + theme.Notifications.Dropdown.className}
              buttonClass={"fs-20px " + theme.Notifications.Dropdown.buttonClass}
              menuClass={theme.Notifications.Dropdown.menuClass}
              badge={badge}
              header="NOTIFICATIONS"
              footer="SEE ALL"
          >
              {(children || []).map((notify, index) => {
                  const iconClass = index === 0 ? "fs-20px" : "fs-20px w-20px";

                  return (
                      <DropdownItem
                          key={index}
                          className="py-10px text-wrap"
                          url={notify.url}
                      >
                          <div className={iconClass}>
                              <i className={`${theme.getIcon(notify.icon)} text-theme`}/>
                          </div>
                          <div className="flex-1 flex-wrap ps-3">
                              <div className="mb-1 text-white">{notify.title}</div>
                              <div className="small">{notify.time}</div>
                          </div>
                          <div className="ps-2 fs-16px">
                              <i className={theme.getIcon("chevron-right")}/>
                          </div>
                      </DropdownItem>
                  );
              })}
          </Dropdown>
      </Wrapper>
  );
}

export default Notifications;
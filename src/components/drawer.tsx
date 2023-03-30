import React from "react";

type DrawerProps = {
  visible: boolean;
  toggleVisibility: () => void;
};

const Drawer = ({ visible, toggleVisibility }: DrawerProps): JSX.Element => {
  const linkItems = [
    {
      icon: "face",
      text: "Dashboard",
      link: "/dashboard",
    },
    {
      icon: "library_add",
      text: "Create a Proposal",
      link: "/proposals/draft",
    },
    {
      icon: "search",
      text: "Discover Proposals",
      link: "/proposals",
    },
    {
      icon: "money",
      text: "Transfer Funds",
      link: "",
    },
    {
      icon: "logout",
      text: "Log out",
      link: "",
    },
  ];
  return (
    <div className={`drawer ${visible ? "open" : ""}`} id="right-drawer">
      <nav id="nav">
        <ul id="menu">
          {linkItems.map((item, index: number) => {
            return (
              <li
                key={`drawer-item-${index}`}
                className="menu-item"
                id="menu-item__account-dashboard"
              >
                <a title={item?.text} href={item.link}>
                  <i className="material-icons" aria-hidden="true">
                    {item?.icon}
                  </i>
                  <span>{item?.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Drawer;

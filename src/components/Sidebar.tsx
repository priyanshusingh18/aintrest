import Link from "next/link";
import Image from "next/image";
import { LibrarySquare, Files, ListChecks, ClipboardList } from "lucide-react";

const menuItems = [
  {
    icons: <LibrarySquare />,
    link: "/subjects",
    name: "Books",
  },
  {
    icons: <Files />,
    link: "/dashboard",
    name: "Files",
  },
  {
    icons: <ClipboardList />,
    link: "/answer-writing",
    name: "Question List",
  },
  {
    icons: <ListChecks />,
    link: "/answer-writing/new",
    name: "New Question",
  },
];
const Sidebar = () => {
  return (
    <div className="app-navigation fixed  ">
      <div className="app-navigation-header">
        <div className="app-navigation-logo">
          <a href="/">
            <div id="style-EWRra" className="style-EWRra">
              <Image
                src="/out (1).png"
                alt="Product preview"
                width={35}
                height={35}
                quality={100}
              />
            </div>
          </a>
        </div>{" "}
      </div>

      <div className="app-navigation-menu">
        {menuItems.map((el, i) => {
          return (
            <Link key={i} className="app-navigation-menu-item" href={el.link}>
              <div className="app-navigation-menu-item-icon">{el.icons}</div>
              <div className="app-navigation-menu-item-label">{el.name}</div>
            </Link>
          );
        })}
      </div>
      {/* <div className="app-navigation-footer">
        <div className="app-navigation-menu-item">
          <div className="app-navigation-menu-item-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M5 3a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4.793a1 1 0 0 1-.293.707l-6 6a1 1 0 0 1-1.414 0l-6-6A1 1 0 0 1 5 7.793V3ZM3 8a2 2 0 0 1 2-2h.586a1 1 0 0 1 .707.293l6.707 6.707 6.707-6.707a1 1 0 0 1 .707-.293H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8ZM4 8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H4Z"
              ></path>
            </svg>
          </div>
          <div className="app-navigation-menu-item-text">Downloads</div>
        </div>

      </div> 
      */}
    </div>
  );
};

export default Sidebar;

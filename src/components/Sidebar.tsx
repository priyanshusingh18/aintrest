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
    name: "Notes",
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
              {/* <svg width="" height="24px" viewBox="140 140 520 520">
                <path
                  d="m617.24 354a126.36 126.36 0 0 0 -10.86-103.79 127.8 127.8 0 0 0 -137.65-61.32 126.36 126.36 0 0 0 -95.31-42.49 127.81 127.81 0 0 0 -121.92 88.49 126.4 126.4 0 0 0 -84.5 61.3 127.82 127.82 0 0 0 15.72 149.86 126.36 126.36 0 0 0 10.86 103.79 127.81 127.81 0 0 0 137.65 61.32 126.36 126.36 0 0 0 95.31 42.49 127.81 127.81 0 0 0 121.96-88.54 126.4 126.4 0 0 0 84.5-61.3 127.82 127.82 0 0 0 -15.76-149.81zm-190.66 266.49a94.79 94.79 0 0 1 -60.85-22c.77-.42 2.12-1.16 3-1.7l101-58.34a16.42 16.42 0 0 0 8.3-14.37v-142.39l42.69 24.65a1.52 1.52 0 0 1 .83 1.17v117.92a95.18 95.18 0 0 1 -94.97 95.06zm-204.24-87.23a94.74 94.74 0 0 1 -11.34-63.7c.75.45 2.06 1.25 3 1.79l101 58.34a16.44 16.44 0 0 0 16.59 0l123.31-71.2v49.3a1.53 1.53 0 0 1 -.61 1.31l-102.1 58.95a95.16 95.16 0 0 1 -129.85-34.79zm-26.57-220.49a94.71 94.71 0 0 1 49.48-41.68c0 .87-.05 2.41-.05 3.48v116.68a16.41 16.41 0 0 0 8.29 14.36l123.31 71.19-42.69 24.65a1.53 1.53 0 0 1 -1.44.13l-102.11-59a95.16 95.16 0 0 1 -34.79-129.81zm350.74 81.62-123.31-71.2 42.69-24.64a1.53 1.53 0 0 1 1.44-.13l102.11 58.95a95.08 95.08 0 0 1 -14.69 171.55c0-.88 0-2.42 0-3.49v-116.68a16.4 16.4 0 0 0 -8.24-14.36zm42.49-63.95c-.75-.46-2.06-1.25-3-1.79l-101-58.34a16.46 16.46 0 0 0 -16.59 0l-123.31 71.2v-49.3a1.53 1.53 0 0 1 .61-1.31l102.1-58.9a95.07 95.07 0 0 1 141.19 98.44zm-267.11 87.87-42.7-24.65a1.52 1.52 0 0 1 -.83-1.17v-117.92a95.07 95.07 0 0 1 155.9-73c-.77.42-2.11 1.16-3 1.7l-101 58.34a16.41 16.41 0 0 0 -8.3 14.36zm23.19-50 54.92-31.72 54.92 31.7v63.42l-54.92 31.7-54.92-31.7Z"
                  fill="currentColor"
                ></path>
              </svg> */}
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
      <div className="app-navigation-footer">
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
        {/* ... (rest of the footer content) ... */}
      </div>
    </div>
  );
};

export default Sidebar;

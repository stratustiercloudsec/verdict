import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import Logo from '../../images/logo/verdict_logo_white.png';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen]);

  // Close on ESC key
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/">
          <img src={Logo} alt="Verdict AI Logo" />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg className="fill-current" width="20" height="18" viewBox="0 0 20 18" fill="none">
            <path d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z" />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2 uppercase tracking-widest">Menu</h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* DASHBOARD GROUP */}
              <SidebarLinkGroup activeCondition={pathname === '/' || pathname.includes('dashboard')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <NavLink
                      to="#"
                      className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                        (pathname === '/' || pathname.includes('dashboard')) && 'bg-graydark dark:bg-meta-4'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                      }}
                    >
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299ZM6.60947 6.30005C6.60947 6.5813 6.38447 6.8063 6.10322 6.8063H2.53135C2.2501 6.8063 2.0251 6.5813 2.0251 6.30005V2.72817C2.0251 2.44692 2.2501 2.22192 2.53135 2.22192H6.10322C6.38447 2.22192 6.60947 2.44692 6.60947 2.72817V6.30005Z" />
                        <path d="M15.4689 0.956299H11.8971C10.9408 0.956299 10.1533 1.7438 10.1533 2.70005V6.27192C10.1533 7.22817 10.9408 8.01567 11.8971 8.01567H15.4689C16.4252 8.01567 17.2127 7.22817 17.2127 6.27192V2.72817C17.2127 1.7438 16.4252 0.956299 15.4689 0.956299ZM15.9752 6.30005C15.9752 6.5813 15.7502 6.8063 15.4689 6.8063H11.8971C11.6158 6.8063 11.3908 6.5813 11.3908 6.30005V2.72817C11.3908 2.44692 11.6158 2.22192 11.8971 2.22192H15.4689C15.7502 2.22192 15.9752 2.44692 15.9752 2.72817V6.30005Z" />
                        <path d="M6.10322 9.92822H2.53135C1.5751 9.92822 0.787598 10.7157 0.787598 11.672V15.2438C0.787598 16.2001 1.5751 16.9876 2.53135 16.9876H6.10322C7.05947 16.9876 7.84697 16.2001 7.84697 15.2438V11.7001C7.8751 10.7157 7.0876 9.92822 6.10322 9.92822ZM6.60947 15.272C6.60947 15.5532 6.38447 15.7782 6.10322 15.7782H2.53135C2.2501 15.7782 2.0251 15.5532 2.0251 15.272V11.7001C2.0251 11.4188 2.2501 11.1938 2.53135 11.1938H6.10322C6.38447 11.1938 6.60947 11.4188 6.60947 11.7001V15.272Z" />
                        <path d="M15.4689 9.92822H11.8971C10.9408 9.92822 10.1533 10.7157 10.1533 11.672V15.2438C10.1533 16.2001 10.9408 16.9876 11.8971 16.9876H15.4689C16.4252 16.9876 17.2127 16.2001 17.2127 15.2438V11.7001C17.2127 10.7157 16.4252 9.92822 15.4689 9.92822ZM15.9752 15.272C15.9752 15.5532 15.7502 15.7782 15.4689 15.7782H11.8971C11.6158 15.7782 11.3908 15.5532 11.3908 15.272V11.7001C11.3908 11.4188 11.6158 11.1938 11.8971 11.1938H15.4689C15.7502 11.1938 15.9752 11.4188 15.9752 11.7001V15.272Z" />
                      </svg>
                      Dashboard
                      <svg className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-180'}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z" />
                      </svg>
                    </NavLink>
                    <div className={`translate transform overflow-hidden ${!open && 'hidden'}`}>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                        <li>
                          <NavLink to="/" className={({ isActive }) => `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${isActive && '!text-white'}`}>
                            eCommerce
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>

              {/* INTELLIGENCE TOOLS DROPDOWN (Replaced 'Forms' with fixed links) */}
              <SidebarLinkGroup activeCondition={pathname.includes('forms') || pathname.includes('portfolio')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <NavLink
                      to="#"
                      className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                        (pathname.includes('forms') || pathname.includes('portfolio')) && 'bg-graydark dark:bg-meta-4'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                      }}
                    >
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M16.875 16.1156H1.77187C1.43438 16.1156 1.125 16.3969 1.125 16.7625C1.125 17.1281 1.40625 17.4094 1.77187 17.4094H16.875C17.2125 17.4094 17.5219 17.1281 17.5219 16.7625C17.5219 16.3969 17.2125 16.1156 16.875 16.1156Z" fill="white"/>
                        <path d="M1.43425 7.5093H7.453C7.76237 7.48118 7.87487 7.25618 7.76237 7.03118L5.428 1.4343C5.37175 1.26555 5.14675 1.23743 5.14675 1.23743H3.88112C3.76862 1.23743 3.57175 1.4343L1.153 7.08743C1.0405 7.2843 1.20925 7.5093 1.43425 7.5093ZM4.47175 2.98118L5.3155 5.17493H3.59987L4.47175 2.98118Z" />
                      </svg>
                      Success Intelligence
                      <svg className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && 'rotate-180'}`} width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z" />
                      </svg>
                    </NavLink>
                    <div className={`translate transform overflow-hidden ${!open && 'hidden'}`}>
                      <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                        {/* Success Estimator Link */}
                        <li>
                          <NavLink to="/forms/production-success-estimator" className={({ isActive }) => `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${isActive && '!text-white'}`}>
                            <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M16.1111 2.22223H3.88889C2.22223 3.88889V16.1111C17.7778 16.1111V3.88889C16.1111 2.22223Z M3.88889 3.88889H16.1111V16.1111H3.88889V3.88889Z" /><path d="M12.7778 7.22223L10.5556 9.44445L8.88889 7.77778L5.55556 11.1111L6.66667 12.2222L8.88889 10L10.5556 11.6667L13.8889 8.33334L12.7778 7.22223Z" /></svg>
                            Success Estimator
                          </NavLink>
                        </li>
                        {/* Coverage Report Link */}
                        <li>
                          <NavLink to="/forms/coverage-report" className={({ isActive }) => `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${isActive && '!text-white'}`}>
                            <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15.8333 2.5H4.16667V15.8333H15.8333V2.5Z M4.16667 4.16667H15.8333V15.8333H4.16667V4.16667Z" /><path d="M11.6667 7.5H5.83333V9.16667H11.6667V7.5ZM14.1667 10.8333H5.83333V12.5H14.1667V10.8333Z" /></svg>
                            Coverage Report
                          </NavLink>
                        </li>
                        {/* Coverage Portfolio Link */}
                        <li>
                          <NavLink to="/forms/coverage-portfolio" className={({ isActive }) => `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${isActive && '!text-white'}`}>
                            <svg className="fill-current" width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M8.33333 3.33334H3.33333V8.33334H8.33333V3.33334Z" /><path d="M16.6667 3.33334H11.6667V8.33334H16.6667V3.33334Z" /><path d="M8.33333 11.6667H3.33333V16.6667H8.33333V11.6667Z" /><path d="M16.6667 11.6667H11.6667V16.6667H16.6667V11.6667Z" /></svg>
                            Coverage Portfolio
                          </NavLink>
                        </li>
                        {/* Estimator Portfolio Link */}
                        <li>
                          <NavLink to="/success-estimator-portfolio" className={({ isActive }) => `group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${isActive && '!text-white'}`}>
                            <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 3.89543 3.89543 3 5 3H19C21 5V19H5C3 19V5ZM5 5V7H19V5H5ZM19 9H5V11H19V9ZM5 13H19V15H5V13ZM19 17H5V19H19V17Z" /></svg>
                            Estimator Portfolio
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>

              {/* CALENDAR */}
              <li>
                <NavLink to="/calendar" className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('calendar') && 'bg-graydark dark:bg-meta-4'}`}>
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M15.7499 2.9812H14.2874V2.36245V2.9812H4.97803V2.36245V2.9812H2.2499V14.5406C17.5218 14.5406V4.72495C17.5218 2.9812ZM1.77178 8.21245H4.1624V10.9968H1.77178V8.21245ZM5.42803 8.21245H8.38115V10.9968H5.42803V8.21245ZM8.38115 12.2625V15.0187H5.42803V12.2625H8.38115ZM13.8374 8.21245H16.228V10.9968H13.8374V8.21245Z" />
                  </svg>
                  Calendar
                </NavLink>
              </li>

              {/* PROFILE */}
              <li>
                <NavLink to="/profile" className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('profile') && 'bg-graydark dark:bg-meta-4'}`}>
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344ZM9.0002 1.7719C10.3783 1.7719 11.5033 2.84065 11.5033 4.16252C7.62207 1.7719 9.0002 1.7719Z" />
                    <path d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5313 1.71582 14.5406V16.875H3.00957V14.5406C3.00957 12.2344 4.89394 10.3219 7.22832 10.3219H10.8564C13.1627 10.3219 15.0752 12.2063 15.0752 14.5406V16.875H16.3689V14.5406C16.2846 11.5313 13.8377 9.05627 10.8283 9.05627Z" />
                  </svg>
                  Profile
                </NavLink>
              </li>
            </ul>
          </div>

          {/* OTHERS SECTION */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2 uppercase tracking-widest">Others</h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <NavLink to="/settings" className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${pathname.includes('settings') && 'bg-graydark dark:bg-meta-4'}`}>
                  <svg className="fill-current" width="18" height="19" viewBox="0 0 18 19" fill="none">
                    <path d="M17.0721 7.30835C16.7909 6.99897 16.3971 6.83022 15.9752 6.83022H15.8909V6.63335C15.4971 6.32397 15.4409 6.21147 15.5815 6.0146L15.6377 5.95835C16.1159 4.86147 16.1159 4.86147 15.6659 3.73647L14.569 2.61147C12.3471 2.58335L12.2627 2.6396C11.3065 2.27397 11.3065 2.13335 11.3065 2.13335H8.15648C6.6096 2.10522V2.21772H6.6096V2.21772C5.5971 2.10522 4.78148 1.93647 3.65648 2.38647L2.53148 3.48335C2.50335 5.70522L2.5596 5.7896C2.19398 6.5771 2.1096 8.12397 0.478354 8.12397L0.478354 9.69897C2.02523 11.3021H2.1096V11.3021V12.1458C1.91273 13.2427 2.36273 14.3677L3.4596 15.4927C5.68148 15.5208L5.76585 15.4646V15.9427H8.2971 9.8721V15.9427V15.549L12.1784 15.6333C14.4002 15.6615L15.5252 14.5646C15.5534 12.3427L15.4971 12.2583C17.5784 8.34897 17.0721 7.30835Z" />
                  </svg>
                  Settings
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
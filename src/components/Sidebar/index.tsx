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

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen]);

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

  // ── Icons ─────────────────────────────────────────────────────────────────

  const IconHome = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 18 18">
      <path d="M16.1438 7.22812L9.64688 1.43438C9.28125 1.125 8.71875 1.125 8.35312 1.43438L1.85625 7.22812C1.63125 7.425 1.5 7.70625 1.5 8.01562V15.1875C1.5 15.8906 2.0625 16.4813 2.78437 16.4813H6.1875C6.525 16.4813 6.80625 16.2 6.80625 15.8625V11.2219C6.80625 10.8844 7.0875 10.6031 7.425 10.6031H10.575C10.9125 10.6031 11.1938 10.8844 11.1938 11.2219V15.8625C11.1938 16.2 11.475 16.4813 11.8125 16.4813H15.2156C15.9375 16.4813 16.5 15.8906 16.5 15.1875V8.01562C16.5 7.70625 16.3688 7.425 16.1438 7.22812Z" />
    </svg>
  );

  const IconScript = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 24 24">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15H16V17H8V15ZM8 11H16V13H8V11Z" />
    </svg>
  );

  const IconChart = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 24 24">
      <path d="M5 9.2H8V19H5V9.2ZM10.6 5H13.4V19H10.6V5ZM16.2 13H19V19H16.2V13Z" />
    </svg>
  );

  const IconTrend = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 24 24">
      <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" />
    </svg>
  );

  const IconStar = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
    </svg>
  );

  const IconPipeline = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 24 24">
      <path d="M20 3H4V7L9 12V19L15 21V12L20 7V3ZM18 6.5L13.5 11H10.5L6 6.5V5H18V6.5Z" />
    </svg>
  );

  const IconTeam = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 24 24">
      <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" />
    </svg>
  );

  const IconSettings = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 24 24">
      <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.01 5.25 4.76 5.33 4.64 5.55L2.72 8.87C2.6 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.24 18.67L7.63 17.71C8.13 18.09 8.66 18.41 9.25 18.65L9.61 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.08 16.37 17.71L18.76 18.67C18.99 18.75 19.24 18.67 19.36 18.45L21.28 15.13C21.4 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" />
    </svg>
  );

  const IconHelp = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z" />
    </svg>
  );

  const IconMail = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 24 24">
      <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z" />
    </svg>
  );

  const IconUpgrade = () => (
    <svg className="fill-current shrink-0" width="18" height="18" viewBox="0 0 24 24">
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" />
    </svg>
  );

  const IconGrid = () => (
    <svg className="fill-current shrink-0" width="16" height="16" viewBox="0 0 20 20">
      <path d="M8.33333 3.33334H3.33333V8.33334H8.33333V3.33334Z" />
      <path d="M16.6667 3.33334H11.6667V8.33334H16.6667V3.33334Z" />
      <path d="M8.33333 11.6667H3.33333V16.6667H8.33333V11.6667Z" />
      <path d="M16.6667 11.6667H11.6667V16.6667H16.6667V11.6667Z" />
    </svg>
  );

  const IconPlus = () => (
    <svg className="fill-current shrink-0" width="16" height="16" viewBox="0 0 24 24">
      <path d="M19 11H13V5C13 4.45 12.55 4 12 4C11.45 4 11 4.45 11 5V11H5C4.45 11 4 11.45 4 12C4 12.55 4.45 13 5 13H11V19C11 19.55 11.45 20 12 20C12.55 20 13 19.55 13 19V13H19C19.55 13 20 12.55 20 12C20 11.45 19.55 11 19 11Z" />
    </svg>
  );

  const IconChevron = ({ open }: { open: boolean }) => (
    <svg
      className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      width="16" height="16" viewBox="0 0 20 20"
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z" />
    </svg>
  );

  // ── Reusable components ───────────────────────────────────────────────────

  const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
    <h3 className="mb-3 ml-4 text-[9px] font-black uppercase text-white/30 tracking-[0.25em]">
      {label}
    </h3>
  );

  const TopLink: React.FC<{ to: string; icon: React.ReactNode; label: string; match?: string; badge?: string }> = ({ to, icon, label, match, badge }) => (
    <li>
      <NavLink
        to={to}
        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
          (match ? pathname.includes(match) : pathname === to) ? 'bg-graydark dark:bg-meta-4' : ''
        }`}
      >
        {icon}
        <span>{label}</span>
        {badge && (
          <span className="ml-auto text-[8px] font-black uppercase tracking-widest bg-meta-3 text-white px-1.5 py-0.5 rounded-sm">
            {badge}
          </span>
        )}
      </NavLink>
    </li>
  );

  const SubLink: React.FC<{ to: string; icon: React.ReactNode; label: string; badge?: string; comingSoon?: boolean }> = ({ to, icon, label, badge, comingSoon }) => (
    <li>
      <NavLink
        to={comingSoon ? '#' : to}
        onClick={comingSoon ? (e) => e.preventDefault() : undefined}
        className={({ isActive }) =>
          `group relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium duration-300 ease-in-out
          ${comingSoon
            ? 'text-white/25 cursor-not-allowed'
            : `text-bodydark2 hover:text-white ${isActive ? '!text-white' : ''}`
          }`
        }
      >
        {icon}
        <span>{label}</span>
        {badge && !comingSoon && (
          <span className="ml-auto text-[8px] font-black uppercase tracking-widest bg-meta-3 text-white px-1.5 py-0.5 rounded-sm">
            {badge}
          </span>
        )}
        {comingSoon && (
          <span className="ml-auto text-[7px] font-black uppercase tracking-widest border border-white/20 text-white/30 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
            Soon
          </span>
        )}
      </NavLink>
    </li>
  );

  const Divider = () => <div className="my-4 mx-4 border-t border-white/10" />;

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-6 py-6 lg:py-8 border-b border-white/10">
        <NavLink to="/" className="flex items-center">
          {/* ↑ Logo size increased: was h-10, now h-16 */}
          <img src={Logo} alt="Verdict AI" className="h-16 w-auto object-contain" />
        </NavLink>
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden text-white/50 hover:text-white transition"
        >
          <svg className="fill-current" width="20" height="18" viewBox="0 0 20 18">
            <path d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z" />
          </svg>
        </button>
      </div>

      {/* ── Scrollable nav body ───────────────────────────────────────────── */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-1">
        <nav className="mt-5 py-4 px-4 lg:mt-6 lg:px-6 flex flex-col h-full">
          <div className="flex-1 space-y-1">

            {/* ════════════════════════════════
                WORKSPACE
            ════════════════════════════════ */}
            <SectionLabel label="Workspace" />
            <ul className="mb-5 flex flex-col gap-1.5">
              <TopLink to="/" icon={<IconHome />} label="The Slate" />

              {/* Script Coverage */}
              <SidebarLinkGroup activeCondition={pathname.includes('coverage') || pathname.includes('audit')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <NavLink
                      to="#"
                      className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                        (pathname.includes('coverage') || pathname.includes('audit')) ? 'bg-graydark dark:bg-meta-4' : ''
                      }`}
                      onClick={(e) => { e.preventDefault(); sidebarExpanded ? handleClick() : setSidebarExpanded(true); }}
                    >
                      <IconScript />
                      Script Coverage
                      <IconChevron open={open} />
                    </NavLink>
                    <div className={`translate transform overflow-hidden ${!open && 'hidden'}`}>
                      <ul className="mt-2 mb-4 flex flex-col gap-1 pl-6">
                        <SubLink to="/forms/coverage-report"    icon={<IconPlus />} label="New Coverage"       badge="AI" />
                        <SubLink to="/forms/coverage-portfolio" icon={<IconGrid />} label="Coverage Portfolio"            />
                      </ul>
                    </div>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>

              {/* Success Estimator */}
              <SidebarLinkGroup activeCondition={pathname.includes('estimator') || pathname.includes('success')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <NavLink
                      to="#"
                      className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                        (pathname.includes('estimator') || pathname.includes('success')) ? 'bg-graydark dark:bg-meta-4' : ''
                      }`}
                      onClick={(e) => { e.preventDefault(); sidebarExpanded ? handleClick() : setSidebarExpanded(true); }}
                    >
                      <IconChart />
                      Success Estimator
                      <IconChevron open={open} />
                    </NavLink>
                    <div className={`translate transform overflow-hidden ${!open && 'hidden'}`}>
                      <ul className="mt-2 mb-4 flex flex-col gap-1 pl-6">
                        <SubLink to="/forms/production-success-estimator" icon={<IconPlus />} label="New Estimate"        badge="AI" />
                        <SubLink to="/success-estimator-portfolio"        icon={<IconGrid />} label="Estimator Portfolio"            />
                      </ul>
                    </div>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>
            </ul>

            <Divider />

            {/* ════════════════════════════════
                INTELLIGENCE
                Competitive differentiator —
                Cinelytic / ScriptBook parity
            ════════════════════════════════ */}
            <SectionLabel label="Intelligence" />
            <ul className="mb-5 flex flex-col gap-1.5">
              <TopLink
                to="/market-trends"
                icon={<IconTrend />}
                label="Market Trends"
                match="market-trends"
                badge="NEW"
              />
              <TopLink
                to="/talent-intelligence"
                icon={<IconStar />}
                label="Talent Intelligence"
                match="talent-intelligence"
              />
              <TopLink
                to="/deal-tracker"
                icon={<IconPipeline />}
                label="Deal Tracker"
                match="deal-tracker"
              />
            </ul>

            <Divider />

            {/* ════════════════════════════════
                TEAM
                Enterprise GTM — multi-user
                workflows unlock B2B pricing
            ════════════════════════════════ */}
            <SectionLabel label="Team" />
            <ul className="mb-5 flex flex-col gap-1.5">
              <SidebarLinkGroup activeCondition={pathname.includes('team')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <NavLink
                      to="#"
                      className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                        pathname.includes('team') ? 'bg-graydark dark:bg-meta-4' : ''
                      }`}
                      onClick={(e) => { e.preventDefault(); sidebarExpanded ? handleClick() : setSidebarExpanded(true); }}
                    >
                      <IconTeam />
                      Collaboration
                      <IconChevron open={open} />
                    </NavLink>
                    <div className={`translate transform overflow-hidden ${!open && 'hidden'}`}>
                      <ul className="mt-2 mb-4 flex flex-col gap-1 pl-6">
                        <SubLink to="/team/members"       icon={<IconTeam />}   label="Team Members"   comingSoon />
                        <SubLink to="/team/shared-reports"icon={<IconScript />} label="Shared Reports" comingSoon />
                        <SubLink to="/team/activity"      icon={<IconTrend />}  label="Activity Feed"  comingSoon />
                      </ul>
                    </div>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>
            </ul>

            <Divider />

            {/* ════════════════════════════════
                PLATFORM
            ════════════════════════════════ */}
            <SectionLabel label="Platform" />
            <ul className="flex flex-col gap-1.5">
              <TopLink to="/contact"  icon={<IconMail />}     label="Contact & Sales" match="contact"  />
              <TopLink to="/settings" icon={<IconSettings />} label="Settings"        match="settings" />
              <TopLink to="/help"     icon={<IconHelp />}     label="Help & Docs"     match="help"     />
            </ul>

          </div>

          {/* ── Upgrade CTA — persistent upsell surface ─────────────────── */}
          <div className="mt-6 mx-1 mb-2 rounded-lg bg-gradient-to-br from-meta-3/20 to-meta-3/5 border border-meta-3/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconUpgrade />
              <span className="text-[10px] font-black uppercase tracking-widest text-meta-3">Pro Plan</span>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed mb-3">
              Unlock unlimited reports, team seats, and full API access.
            </p>
            <NavLink
              to="/contact"
              className="block w-full text-center bg-meta-3 hover:bg-opacity-90 text-white text-[9px] font-black uppercase tracking-widest py-2 rounded-sm transition"
            >
              Upgrade Now
            </NavLink>
          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="pt-4 border-t border-white/10">
            <NavLink
              to="/product-vision"
              className={`group flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-white/30 hover:text-white/60 duration-300 ease-in-out text-xs ${
                pathname.includes('product-vision') ? 'text-white/60' : ''
              }`}
            >
              <svg className="fill-current shrink-0" width="12" height="12" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              <span className="uppercase tracking-widest text-[8px] font-black">Product Vision</span>
            </NavLink>
            <p className="px-4 pb-2 text-[8px] text-white/20 uppercase tracking-widest font-bold">
              © 2026 Verdict AI
            </p>
          </div>

        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
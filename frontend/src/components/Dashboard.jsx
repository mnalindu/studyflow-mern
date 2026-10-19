
import { useState } from "react";

import {
  Leaf,
  GraduationCap,
  LayoutDashboard,
  SquareCheck,
  Timer,
  CalendarDays,
  BarChart3,
  NotebookPen,
  Users,
  Settings,
  Bell,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Search,
  Menu,
  X,
  Sun,
  Play,
  ArrowRight,
  Check,
  Plus,
  Sparkles,
} from "lucide-react";

import DashboardOverview from "./DashboardOverview";
import DashboardProductivity from "./DashboardProductivity";
import DashboardAnalytics from "./DashboardAnalytics";
import DashboardFinishing from "./DashboardFinishing";
import MyTasksPage from "./MyTasksPage";

import { useStudyTasks } from "./StudyTasksContext";

import "./Dashboard.css";

const studentName = "Alex";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My tasks",
    icon: SquareCheck,
  },
  {
    name: "Focus timer",
    icon: Timer,
  },
  {
    name: "Calendar",
    icon: CalendarDays,
  },
  {
    name: "Analytics",
    icon: BarChart3,
  },
  {
    name: "Notes",
    icon: NotebookPen,
  },
  {
    name: "Study rooms",
    icon: Users,
  },
];

// =====================================
// Sidebar
// =====================================

function DashboardSidebar({
  mobileOpen,
  closeMobile,
  showNotice,
  activePage,
}) {
  const { pendingCount } = useStudyTasks();

  function openSection(section) {
    closeMobile();

    if (section === "Dashboard") {
      window.location.hash = "#dashboard";
      return;
    }

    if (section === "My tasks") {
      window.location.hash = "#tasks";
      return;
    }

    showNotice(
      `${section} will be added in an upcoming development step.`
    );
  }

  return (
    <aside
      className={`sf-dash-sidebar ${
        mobileOpen
          ? "sf-dash-sidebar--open"
          : ""
      }`}
    >
      {/* Brand */}
      <a
        href="#dashboard"
        className="sf-dash-sidebar__brand"
        onClick={closeMobile}
      >
        <span className="sf-dash-sidebar__logo">
          <Leaf
            size={27}
            strokeWidth={1.8}
          />
        </span>

        <span>
          StudyFlow
          <span className="sf-dash-sidebar__dot">
            .
          </span>
        </span>
      </a>

      {/* Workspace Card */}
      <button
        type="button"
        className="sf-dash-sidebar__workspace"
        onClick={() =>
          showNotice(
            "Workspace settings will be available soon."
          )
        }
      >
        <span className="sf-dash-sidebar__workspace-icon">
          <GraduationCap size={23} />
        </span>

        <span className="sf-dash-sidebar__workspace-text">
          <strong>
            {studentName}'s workspace
          </strong>

          <small>
            Your learning headquarters
          </small>
        </span>

        <ChevronRight size={17} />
      </button>

      <div className="sf-dash-sidebar__section-title">
        WORKSPACE
      </div>

      {/* Navigation */}
      <nav
        className="sf-dash-sidebar__navigation"
        aria-label="Dashboard navigation"
      >
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = item.name === activePage;

          return (
            <button
              type="button"
              key={item.name}
              className={`sf-dash-sidebar__nav-item ${
                isActive
                  ? "sf-dash-sidebar__nav-item--active"
                  : ""
              }`}
              aria-current={
                isActive ? "page" : undefined
              }
              onClick={() =>
                openSection(item.name)
              }
            >
              <Icon
                size={21}
                strokeWidth={1.9}
              />

              <span>{item.name}</span>

              {item.name === "My tasks" && (
                <span className="sf-dash-sidebar__count">
                  {pendingCount}
                </span>
              )}

              {item.name === "Study rooms" && (
                <span className="sf-dash-sidebar__new">
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="sf-dash-sidebar__bottom">
        <a
          href="#home"
          className="sf-dash-sidebar__bottom-item"
          onClick={closeMobile}
        >
          <ArrowUpRight size={20} />
          Back to website
        </a>

        <button
          type="button"
          className="sf-dash-sidebar__bottom-item"
          onClick={() =>
            showNotice(
              "Preferences will be available soon."
            )
          }
        >
          <Settings size={21} />
          Preferences
        </button>
      </div>
    </aside>
  );
}

// =====================================
// Dashboard Header
// =====================================

function DashboardHeader({
  openMobile,
  showNotice,
  pageName,
}) {
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function handleSearch(event) {
    event.preventDefault();

    if (search.trim()) {
      showNotice(
        "Full task search will be connected in a later step."
      );
    }
  }

  return (
    <header className="sf-dash-header">
      <div className="sf-dash-header__left">

        <button
          type="button"
          className="sf-dash-header__mobile-menu"
          aria-label="Open sidebar"
          onClick={openMobile}
        >
          <Menu size={23} />
        </button>

        <div className="sf-dash-header__breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={16} />
          <strong>{pageName}</strong>
        </div>
      </div>

      <div className="sf-dash-header__right">

        {/* Search */}
        <form
          className="sf-dash-header__search"
          onSubmit={handleSearch}
          role="search"
        >
          <Search size={20} />

          <input
            type="search"
            placeholder="Search your tasks..."
            aria-label="Search tasks"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <span className="sf-dash-header__shortcut">
            ⌘ K
          </span>
        </form>

        {/* Notifications */}
        <div className="sf-dash-header__popup">
          <button
            type="button"
            className="sf-dash-header__icon-button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen(
                !notificationsOpen
              );
              setProfileOpen(false);
            }}
          >
            <Bell size={21} />
          </button>

          {notificationsOpen && (
            <div className="sf-dash-header__dropdown">
              <strong>Notifications</strong>
              <p>No new notifications yet.</p>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="sf-dash-header__popup">
          <button
            type="button"
            className="sf-dash-header__profile"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
          >
            <span className="sf-dash-header__avatar">
              {studentName.charAt(0)}
            </span>

            <span className="sf-dash-header__username">
              {studentName}
            </span>

            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="sf-dash-header__dropdown">
              <strong>{studentName}</strong>
              <p>
                Account settings will be available soon.
              </p>

              <a href="#home">
                Back to website
              </a>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

// =====================================
// Welcome Banner Illustration
// =====================================

function WelcomeIllustration() {
  return (
    <div
      className="sf-dash-illustration"
      aria-hidden="true"
    >
      <div className="sf-dash-illustration__circle" />

      <span className="sf-dash-illustration__star one">
        ✦
      </span>

      <span className="sf-dash-illustration__star two">
        ✧
      </span>

      {/* Planner */}
      <div className="sf-dash-illustration__planner">
        <div className="sf-dash-illustration__planner-heading">
          <span />
          MY STUDY PLAN
        </div>

        <div className="sf-dash-illustration__planner-row">
          <Check size={13} />
          <span />
        </div>

        <div className="sf-dash-illustration__planner-row">
          <Check size={13} />
          <span />
        </div>

        <div className="sf-dash-illustration__planner-row">
          <span className="sf-dash-illustration__empty-check" />
          <span />
        </div>

        <div className="sf-dash-illustration__planner-lines">
          <span />
          <span />
        </div>
      </div>

      {/* Books */}
      <div className="sf-dash-illustration__book sf-dash-illustration__book--one">
        little steps
      </div>

      <div className="sf-dash-illustration__book sf-dash-illustration__book--two">
        BIG IDEAS
      </div>

      {/* Pencil */}
      <div className="sf-dash-illustration__pencil" />

      {/* Floating Note */}
      <div className="sf-dash-illustration__note">
        <Sparkles size={16} />
        In my focus era
      </div>

      {/* Floating Progress */}
      <div className="sf-dash-illustration__progress">
        <ArrowUpRight size={19} />

        <div>
          <strong>
            Keep showing up
          </strong>

          <small>
            Progress looks good on you
          </small>
        </div>
      </div>
    </div>
  );
}

// =====================================
// Dashboard Welcome Section
// =====================================

function DashboardWelcome({ showNotice }) {
  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  function navigateToTasks() {
    window.location.hash = "#tasks";
  }

  function goToFocus() {
    const focus = document.querySelector(
      ".sf-focus-card"
    );

    if (focus) {
      focus.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      showNotice(
        "Focus Timer is not available yet."
      );
    }
  }

  return (
    <>
      <div className="sf-dash-welcome">
        <div className="sf-dash-welcome__heading">
          <div>
            <p className="sf-dash-welcome__eyebrow">
              <Sun size={17} />
              A GOOD DAY TO MAKE PROGRESS
            </p>

            <h1>
              Welcome back, {studentName}.
            </h1>

            <p className="sf-dash-welcome__description">
              Here's what's happening with your
              studies today. Let's make it count.
            </p>
          </div>

          <button
            type="button"
            className="sf-dash-welcome__add"
            onClick={navigateToTasks}
          >
            <Plus size={20} />
            Add task
          </button>
        </div>

        <div className="sf-dash-welcome__date-row">
          <span>
            <CalendarDays size={16} />
            {today}
          </span>

          <span>
            One focused session can change your day.
          </span>
        </div>
      </div>

      {/* Welcome Hero Banner */}
      <section className="sf-dash-banner">
        <div className="sf-dash-banner__copy">
          <p className="sf-dash-banner__eyebrow">
            <Sparkles size={14} />
            YOUR NEXT CHAPTER STARTS HERE
          </p>

          <h2>
            Less overwhelm.
            <br />
            <span>
              More "I've got this."
            </span>
          </h2>

          <p className="sf-dash-banner__description">
            You don't need to do it all at once.
            Pick one task, find your focus,
            and let's get started.
          </p>

          <div className="sf-dash-banner__actions">
            <button
              type="button"
              className="sf-dash-banner__start"
              onClick={goToFocus}
            >
              <Play size={17} />
              Start focusing
            </button>

            <button
              type="button"
              className="sf-dash-banner__plan"
              onClick={navigateToTasks}
            >
              Plan my day
              <ArrowRight size={18} />
            </button>
          </div>

          <p className="sf-dash-banner__reassurance">
            <Check size={16} />
            Your space. Your pace. Your progress.
          </p>
        </div>

        <WelcomeIllustration />
      </section>
    </>
  );
}

// =====================================
// Main Dashboard Layout
// =====================================

export default function Dashboard({
  view = "dashboard",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const isTasksPage = view === "tasks";

  const pageName = isTasksPage
    ? "My tasks"
    : "Dashboard";

  return (
    <div className="sf-dashboard">

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="sf-dashboard__overlay"
          aria-label="Close sidebar"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        mobileOpen={mobileOpen}
        closeMobile={() =>
          setMobileOpen(false)
        }
        showNotice={setNotice}
        activePage={pageName}
      />

      {/* Dashboard Main */}
      <div className="sf-dashboard__main">

        {/* Top Header */}
        <DashboardHeader
          openMobile={() =>
            setMobileOpen(true)
          }
          showNotice={setNotice}
          pageName={pageName}
        />

        <main className="sf-dashboard__content">

          {/* Notice */}
          {notice && (
            <div
              className="sf-dashboard__notice"
              role="status"
            >
              <span>{notice}</span>

              <button
                type="button"
                onClick={() =>
                  setNotice("")
                }
                aria-label="Dismiss message"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Page Content */}
          {isTasksPage ? (
            <MyTasksPage />
          ) : (
            <>
              <DashboardWelcome
                showNotice={setNotice}
              />

              <DashboardOverview
                showNotice={setNotice}
              />

              <DashboardProductivity
                showNotice={setNotice}
              />

              <DashboardAnalytics />

              <DashboardFinishing
                showNotice={setNotice}
              />
            </>
          )}

        </main>
      </div>
    </div>
  );
}


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

// Dashboard Overview Components
import DashboardOverview from "./DashboardOverview";
import DashboardProductivity from "./DashboardProductivity";
import DashboardAnalytics from "./DashboardAnalytics";
import DashboardFinishing from "./DashboardFinishing";

// Workspace Pages
import MyTasksPage from "./MyTasksPage";
import FocusTimerPage from "./FocusTimerPage";
import CalendarPage from "./CalendarPage";
import AnalyticsPage from "./AnalyticsPage";
import NotesPage from "./NotesPage";

// NEW: Study Rooms Page
import StudyRoomsPage from "./StudyRoomsPage";

// Shared Task Context
import { useStudyTasks } from "./StudyTasksContext";

// Existing Dashboard Styles
import "./Dashboard.css";

const studentName = "Alex";

// =====================================
// Sidebar Navigation
// =====================================

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    route: "#dashboard",
  },
  {
    name: "My tasks",
    icon: SquareCheck,
    route: "#tasks",
  },
  {
    name: "Focus timer",
    icon: Timer,
    route: "#focus",
  },
  {
    name: "Calendar",
    icon: CalendarDays,
    route: "#calendar",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    route: "#analytics",
  },
  {
    name: "Notes",
    icon: NotebookPen,
    route: "#notes",
  },
  {
    name: "Study rooms",
    icon: Users,
    route: "#study-rooms",
  },
];

// =====================================
// Sidebar Component
// =====================================

function DashboardSidebar({
  mobileOpen,
  closeMobile,
  showNotice,
  activePage,
}) {
  const { pendingCount } = useStudyTasks();

  function openSection(item) {
    closeMobile();

    if (item.route) {
      window.location.hash = item.route;
      return;
    }

    showNotice(
      `${item.name} will be available soon.`
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
      {/* Logo */}
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

      {/* Sidebar Section */}
      <div className="sf-dash-sidebar__section-title">
        WORKSPACE
      </div>

      {/* Navigation Links */}
      <nav
        className="sf-dash-sidebar__navigation"
        aria-label="Dashboard navigation"
      >
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.name === activePage;

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
                openSection(item)
              }
            >
              <Icon
                size={21}
                strokeWidth={1.9}
              />

              <span>{item.name}</span>

              {/* Pending Task Count */}
              {item.name === "My tasks" && (
                <span className="sf-dash-sidebar__count">
                  {pendingCount}
                </span>
              )}

              {/* Study Rooms NEW Badge */}
              {item.name === "Study rooms" && (
                <span className="sf-dash-sidebar__new">
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Bottom Links */}
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
// Dashboard Top Header
// =====================================

function DashboardHeader({
  openMobile,
  showNotice,
  pageName,
}) {
  const [search, setSearch] = useState("");

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

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

      {/* Header Left */}
      <div className="sf-dash-header__left">

        {/* Mobile Sidebar Button */}
        <button
          type="button"
          className="sf-dash-header__mobile-menu"
          aria-label="Open sidebar"
          onClick={openMobile}
        >
          <Menu size={23} />
        </button>

        {/* Breadcrumb */}
        <div className="sf-dash-header__breadcrumb">
          <span>Workspace</span>

          <ChevronRight size={16} />

          <strong>{pageName}</strong>
        </div>
      </div>

      {/* Header Right */}
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
                (current) => !current
              );

              setProfileOpen(false);
            }}
          >
            <Bell size={21} />
          </button>

          {notificationsOpen && (
            <div className="sf-dash-header__dropdown">
              <strong>Notifications</strong>

              <p>
                No new notifications yet.
              </p>
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
              setProfileOpen(
                (current) => !current
              );

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
// Dashboard Illustration
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

      {/* Study Planner */}
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

      {/* Decorative Note */}
      <div className="sf-dash-illustration__note">
        <Sparkles size={16} />
        In my focus era
      </div>

      {/* Progress Label */}
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

function DashboardWelcome() {
  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  function goToTasks() {
    window.location.hash = "#tasks";
  }

  function goToFocus() {
    window.location.hash = "#focus";
  }

  return (
    <>
      {/* Welcome Heading */}
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
            onClick={goToTasks}
          >
            <Plus size={20} />
            Add task
          </button>
        </div>

        {/* Current Date */}
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

      {/* Welcome Banner */}
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
              onClick={goToTasks}
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
// Main Dashboard / Workspace
// =====================================

export default function Dashboard({
  view = "dashboard",
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [notice, setNotice] =
    useState("");

  // Workspace Page Names
  const pageNames = {
    dashboard: "Dashboard",
    tasks: "My tasks",
    focus: "Focus timer",
    calendar: "Calendar",
    analytics: "Analytics",
    notes: "Notes",
    rooms: "Study rooms",
  };

  const pageName =
    pageNames[view] || "Dashboard";

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

      {/* Shared Sidebar */}
      <DashboardSidebar
        mobileOpen={mobileOpen}
        closeMobile={() =>
          setMobileOpen(false)
        }
        showNotice={setNotice}
        activePage={pageName}
      />

      {/* Workspace Main */}
      <div className="sf-dashboard__main">

        {/* Shared Top Header */}
        <DashboardHeader
          openMobile={() =>
            setMobileOpen(true)
          }
          showNotice={setNotice}
          pageName={pageName}
        />

        <main className="sf-dashboard__content">

          {/* Notification */}
          {notice && (
            <div
              className="sf-dashboard__notice"
              role="status"
            >
              <span>{notice}</span>

              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() =>
                  setNotice("")
                }
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Workspace Routing */}
          {view === "tasks" ? (
            <MyTasksPage />
          ) : view === "focus" ? (
            <FocusTimerPage />
          ) : view === "calendar" ? (
            <CalendarPage />
          ) : view === "analytics" ? (
            <AnalyticsPage />
          ) : view === "notes" ? (
            <NotesPage />
          ) : view === "rooms" ? (
            <StudyRoomsPage />
          ) : (
            <>
              {/* Dashboard Overview */}
              <DashboardWelcome />

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

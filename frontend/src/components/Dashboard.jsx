
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

// =====================================
// Dashboard Overview Components
// =====================================

import DashboardOverview from "./DashboardOverview";
import DashboardProductivity from "./DashboardProductivity";
import DashboardAnalytics from "./DashboardAnalytics";
import DashboardFinishing from "./DashboardFinishing";

// =====================================
// Workspace Pages
// =====================================

import MyTasksPage from "./MyTasksPage";
import FocusTimerPage from "./FocusTimerPage";
import CalendarPage from "./CalendarPage";
import AnalyticsPage from "./AnalyticsPage";
import NotesPage from "./NotesPage";
import StudyRoomsPage from "./StudyRoomsPage";

// =====================================
// Preferences Modal
// =====================================

import PreferencesModal, {
  getDailyStudyGoal,
} from "./PreferencesModal";

// =====================================
// Shared Tasks Context
// =====================================

import { useStudyTasks } from "./StudyTasksContext";

// =====================================
// Dashboard Styles
// =====================================

import "./Dashboard.css";

const studentName = "Alex";

// =====================================
// Sidebar Navigation Items
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
// Dashboard Sidebar
// =====================================

function DashboardSidebar({
  mobileOpen,
  closeMobile,
  activePage,
  onOpenPreferences,
}) {
  const { pendingCount } = useStudyTasks();

  // Navigate between workspace pages
  function openSection(item) {
    closeMobile();

    if (item.route) {
      window.location.hash = item.route;
    }
  }

  // Open Preferences Modal
  function handlePreferences() {
    closeMobile();
    onOpenPreferences();
  }

  return (
    <aside
      className={`sf-dash-sidebar ${
        mobileOpen
          ? "sf-dash-sidebar--open"
          : ""
      }`}
    >
      {/* =================================
          StudyFlow Logo
      ================================= */}

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

      {/* =================================
          Workspace Card
      ================================= */}

      <button
        type="button"
        className="sf-dash-sidebar__workspace"
        onClick={handlePreferences}
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

      {/* =================================
          Workspace Section Label
      ================================= */}

      <div className="sf-dash-sidebar__section-title">
        WORKSPACE
      </div>

      {/* =================================
          Sidebar Navigation
      ================================= */}

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
              onClick={() => openSection(item)}
            >
              <Icon
                size={21}
                strokeWidth={1.9}
              />

              <span>{item.name}</span>

              {/* Pending Tasks Count */}

              {item.name === "My tasks" && (
                <span className="sf-dash-sidebar__count">
                  {pendingCount}
                </span>
              )}

              {/* Study Rooms Badge */}

              {item.name === "Study rooms" && (
                <span className="sf-dash-sidebar__new">
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* =================================
          Sidebar Bottom Navigation
      ================================= */}

      <div className="sf-dash-sidebar__bottom">

        {/* Back to Website */}

        <a
          href="#home"
          className="sf-dash-sidebar__bottom-item"
          onClick={closeMobile}
        >
          <ArrowUpRight size={20} />
          Back to website
        </a>

        {/* Preferences Button */}

        <button
          type="button"
          className="sf-dash-sidebar__bottom-item"
          onClick={handlePreferences}
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
  onOpenPreferences,
}) {
  const [search, setSearch] = useState("");

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  // =====================================
  // Search Handler
  // =====================================

  function handleSearch(event) {
    event.preventDefault();

    if (search.trim()) {
      showNotice(
        "Full task search will be available soon."
      );
    }
  }

  // =====================================
  // Profile Button Handler
  // IMPORTANT: Opens Preferences directly
  // =====================================

  function handleProfileClick() {
    // Close notification popup if open
    setNotificationsOpen(false);

    // Open Preferences Modal directly
    onOpenPreferences();
  }

  return (
    <header className="sf-dash-header">

      {/* =================================
          Header Left
      ================================= */}

      <div className="sf-dash-header__left">

        {/* Mobile Menu */}

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

          <span>
            Workspace
          </span>

          <ChevronRight size={16} />

          <strong>
            {pageName}
          </strong>

        </div>
      </div>

      {/* =================================
          Header Right
      ================================= */}

      <div className="sf-dash-header__right">

        {/* =================================
            Search Bar
        ================================= */}

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

        {/* =================================
            Notifications
        ================================= */}

        <div className="sf-dash-header__popup">

          <button
            type="button"
            className="sf-dash-header__icon-button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() =>
              setNotificationsOpen(
                (current) => !current
              )
            }
          >
            <Bell size={21} />
          </button>

          {notificationsOpen && (
            <div className="sf-dash-header__dropdown">

              <strong>
                Notifications
              </strong>

              <p>
                No new notifications yet.
              </p>

            </div>
          )}

        </div>

        {/* =================================
            USER PROFILE BUTTON
            CLICK -> OPEN PREFERENCES MODAL
        ================================= */}

        <div className="sf-dash-header__popup">

          <button
            type="button"
            className="sf-dash-header__profile"
            aria-label="Open preferences"
            aria-haspopup="dialog"
            onClick={handleProfileClick}
          >
            {/* Profile Avatar */}

            <span className="sf-dash-header__avatar">
              {studentName.charAt(0)}
            </span>

            {/* Username */}

            <span className="sf-dash-header__username">
              {studentName}
            </span>

            {/* Dropdown Arrow */}

            <ChevronDown size={16} />

          </button>

        </div>

      </div>
    </header>
  );
}

// =====================================
// Dashboard Welcome Illustration
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

      {/* =================================
          Study Planner
      ================================= */}

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

      {/* =================================
          Books
      ================================= */}

      <div className="sf-dash-illustration__book sf-dash-illustration__book--one">
        little steps
      </div>

      <div className="sf-dash-illustration__book sf-dash-illustration__book--two">
        BIG IDEAS
      </div>

      {/* =================================
          Pencil
      ================================= */}

      <div className="sf-dash-illustration__pencil" />

      {/* =================================
          Floating Note
      ================================= */}

      <div className="sf-dash-illustration__note">
        <Sparkles size={16} />
        In my focus era
      </div>

      {/* =================================
          Progress Label
      ================================= */}

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

  // Navigate to My Tasks
  function goToTasks() {
    window.location.hash = "#tasks";
  }

  // Navigate to Focus Timer
  function goToFocus() {
    window.location.hash = "#focus";
  }

  return (
    <>
      {/* =================================
          Welcome Heading
      ================================= */}

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

          {/* Add Task Button */}

          <button
            type="button"
            className="sf-dash-welcome__add"
            onClick={goToTasks}
          >
            <Plus size={20} />
            Add task
          </button>

        </div>

        {/* =================================
            Current Date
        ================================= */}

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

      {/* =================================
          Dashboard Welcome Banner
      ================================= */}

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

          {/* Action Buttons */}

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

          {/* Reassurance Text */}

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
// Main Dashboard Component
// =====================================

export default function Dashboard({
  view = "dashboard",
}) {
  // =====================================
  // Sidebar State
  // =====================================

  const [mobileOpen, setMobileOpen] =
    useState(false);

  // =====================================
  // Notification State
  // =====================================

  const [notice, setNotice] =
    useState("");

  // =====================================
  // Preferences Modal State
  // =====================================

  const [
    preferencesOpen,
    setPreferencesOpen,
  ] = useState(false);

  // =====================================
  // Daily Study Goal State
  // =====================================

  const [
    dailyGoalMinutes,
    setDailyGoalMinutes,
  ] = useState(getDailyStudyGoal);

  // =====================================
  // Workspace Page Names
  // =====================================

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

  // =====================================
  // Open Preferences Modal
  // =====================================

  function handleOpenPreferences() {
    setMobileOpen(false);
    setPreferencesOpen(true);
  }

  // =====================================
  // Close Preferences Modal
  // =====================================

  function handleClosePreferences() {
    setPreferencesOpen(false);
  }

  // =====================================
  // Save Preferences
  // =====================================

  function handleSavedPreferences(goal) {
    // Update daily goal
    setDailyGoalMinutes(goal);

    // Close modal
    setPreferencesOpen(false);

    // Show confirmation
    setNotice(
      `Preferences saved. Your daily study goal is ${goal} minutes.`
    );
  }

  return (
    <div className="sf-dashboard">

      {/* =================================
          Mobile Sidebar Overlay
      ================================= */}

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

      {/* =================================
          Shared Sidebar
      ================================= */}

      <DashboardSidebar
        mobileOpen={mobileOpen}
        closeMobile={() =>
          setMobileOpen(false)
        }
        activePage={pageName}
        onOpenPreferences={handleOpenPreferences}
      />

      {/* =================================
          Main Workspace
      ================================= */}

      <div className="sf-dashboard__main">

        {/* Top Header */}

        <DashboardHeader
          openMobile={() =>
            setMobileOpen(true)
          }
          showNotice={setNotice}
          pageName={pageName}
          onOpenPreferences={handleOpenPreferences}
        />

        {/* =================================
            Page Content
        ================================= */}

        <main className="sf-dashboard__content">

          {/* Notice */}

          {notice && (
            <div
              className="sf-dashboard__notice"
              role="status"
            >
              <span>
                {notice}
              </span>

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

          {/* =================================
              Workspace Routing
          ================================= */}

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
              {/* Dashboard Welcome */}

              <DashboardWelcome />

              {/* Quick Actions + Statistics */}

              <DashboardOverview
                showNotice={setNotice}
                dailyGoalMinutes={dailyGoalMinutes}
              />

              {/* Tasks + Focus Timer */}

              <DashboardProductivity
                showNotice={setNotice}
              />

              {/* Weekly Analytics */}

              <DashboardAnalytics />

              {/* Final Dashboard Sections */}

              <DashboardFinishing
                showNotice={setNotice}
              />
            </>

          )}

        </main>

      </div>

      {/* =================================
          Preferences Modal
          Both profile and sidebar open this
      ================================= */}

      {preferencesOpen && (
        <PreferencesModal
          studentName={studentName}
          onClose={handleClosePreferences}
          onSaved={handleSavedPreferences}
        />
      )}

    </div>
  );
}

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useProfile, calcTax } from "../context/UserProfileContext";
import { formatZAR } from "../utils/finance";
import "./Navbar.css";

// NavLink handles active state automatically which is nice
// spent way too long trying to do this manually before i figured that out
// Last year this was such a tedious process adding it manually into each page :( Booo static websites and not knowing JS yet

const CITIES = ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Other"];

const TRACKS = [
  { id: "global-citizen", emoji: "✈", name: "Global Citizen" },
  { id: "homeowner", emoji: "🏠", name: "Homeowner" },
  { id: "balanced", emoji: "⚖", name: "Balanced Wealth" },
];

// ── Profile Edit Modal ──
function ProfileModal({ onClose }) {
  const { profile, updateProfile, clearProfile } = useProfile();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: profile.name || "",
    age: profile.age || "",
    location: profile.location || "Cape Town",
    grossMonthly: profile.grossMonthly || 45000,
    selectedTrack: profile.selectedTrack || "global-citizen",
  });
  const [showEndSession, setShowEndSession] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  function handleSave() {
    updateProfile({
      name: form.name.trim() || profile.name,
      age: Number(form.age) || profile.age,
      location: form.location,
      grossMonthly: Number(form.grossMonthly) || profile.grossMonthly,
      selectedTrack: form.selectedTrack,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  }

  function handleEndSession() {
    // Clear everything — profile, milestones, nudge dismissals, onboarding flag
    clearProfile();
    localStorage.removeItem("absa_onboarded");
    localStorage.removeItem("absa_dismissed_nudges");
    // Clear milestone keys
    ["global-citizen", "homeowner", "balanced"].forEach((track) => {
      [1, 2, 3, 4, 5].forEach((year) => {
        localStorage.removeItem(`gc_milestone_${year}`);
        localStorage.removeItem(`homeowner_milestone_${year}`);
        localStorage.removeItem(`balanced_milestone_${year}`);
      });
    });
    onClose();
    navigate("/onboarding");
  }

  const previewTax = calcTax(form.grossMonthly);
  const previewTakeHome = form.grossMonthly - previewTax;
  const activeTrack = TRACKS.find((t) => t.id === form.selectedTrack);

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Edit Profile"
      >
        <div className="profile-modal-header">
          <div>
            <div className="profile-modal-eyebrow hand-note">Your Profile</div>
            <h3 className="profile-modal-title">Edit your details</h3>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close profile"
          >
            ×
          </button>
        </div>

        <div className="profile-modal-body">
          {/* Name */}
          <div className="pm-field">
            <label className="pm-label" htmlFor="pm-name">
              First name
            </label>
            <input
              id="pm-name"
              type="text"
              className="pm-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Age */}
          <div className="pm-field">
            <label className="pm-label" htmlFor="pm-age">
              Age
            </label>
            <input
              id="pm-age"
              type="number"
              className="pm-input"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              min={18}
              max={60}
            />
          </div>

          {/* City */}
          <div className="pm-field">
            <label className="pm-label">City</label>
            <div className="pm-pill-group">
              {CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`pm-pill ${form.location === city ? "pm-pill-active" : ""}`}
                  onClick={() => set("location", city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Salary */}
          <div className="pm-field">
            <label className="pm-label" htmlFor="pm-salary">
              Monthly gross salary
              <span className="pm-label-hint">Before tax</span>
            </label>
            <div className="pm-salary-wrap">
              <span className="pm-currency">R</span>
              <input
                id="pm-salary"
                type="number"
                className="pm-input pm-input-currency"
                value={form.grossMonthly}
                onChange={(e) => set("grossMonthly", Number(e.target.value))}
                min={5000}
                step={1000}
              />
            </div>
            {/* Live PAYE preview */}
            <div className="pm-tax-preview">
              <span className="pm-tax-item">
                PAYE:{" "}
                <strong style={{ color: "var(--absa-red)" }}>
                  −{formatZAR(previewTax)}
                </strong>
              </span>
              <span className="pm-tax-divider">·</span>
              <span className="pm-tax-item">
                Take-home:{" "}
                <strong style={{ color: "var(--sage)" }}>
                  {formatZAR(previewTakeHome)}
                </strong>
              </span>
            </div>
          </div>

          {/* Vision Track */}
          <div className="pm-field">
            <label className="pm-label">Active Vision Track</label>
            <div className="pm-track-group">
              {TRACKS.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  className={`pm-track-btn ${form.selectedTrack === track.id ? "pm-track-active" : ""}`}
                  onClick={() => set("selectedTrack", track.id)}
                  aria-pressed={form.selectedTrack === track.id}
                >
                  <span>{track.emoji}</span>
                  <span>{track.name}</span>
                  {form.selectedTrack === track.id && (
                    <span className="pm-track-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="profile-modal-footer">
          <button
            className="btn btn-ghost pm-end-btn"
            onClick={() => setShowEndSession(true)}
          >
            End Session
          </button>
          <button
            className={`btn btn-primary ${saved ? "btn-saved" : ""}`}
            onClick={handleSave}
          >
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>

        {/* End session confirmation */}
        {showEndSession && (
          <div className="pm-confirm-overlay">
            <div className="pm-confirm-box">
              <h4>End your session?</h4>
              <p>
                This clears all your profile data, milestone progress, and
                settings. You'll go back to the onboarding screen. This cannot
                be undone.
              </p>
              <div className="pm-confirm-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowEndSession(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleEndSession}>
                  Yes, clear everything
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Main Navbar ──
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { profile } = useProfile();

  const navLinks = [
    { to: "/", label: "Home", icon: "⌂" },
    { to: "/snapshot", label: "My Snapshot", icon: "◎" },
    { to: "/tracks", label: "Vision Tracks", icon: "◈" },
    { to: "/studio", label: "Studio", icon: "⚗" },
    { to: "/learn", label: "Learn", icon: "✦" },
  ];

  const activeTrack =
    ["global-citizen", "homeowner", "balanced"].find(
      (t) => t === profile.selectedTrack,
    ) || "global-citizen";
  const trackLabel = {
    "global-citizen": "✈ Global Citizen",
    homeowner: "🏠 Homeowner",
    balanced: "⚖ Balanced",
  }[activeTrack];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner container">
          {/* Logo */}
          <Link
            to="/"
            className="navbar-logo"
            onClick={() => setMenuOpen(false)}
          >
            <div className="logo-mark">
              <img src="./absa-logo.png" alt="ABSA LOGO" className="logo-img" />
            </div>
            <div className="logo-text">
              <span className="logo-tagline">NextGen Wealth Studio</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="navbar-links hide-mobile">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* User chip — clickable to open modal */}
          <div className="navbar-user hide-mobile">
            <button
              className="user-chip"
              onClick={() => setProfileOpen(true)}
              aria-label="Edit profile"
              title="Edit your profile"
            >
              <div className="user-avatar">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="user-chip-text">
                <span className="user-name">
                  {profile.name || "Set up profile"}
                </span>
                <span className="user-track">{trackLabel}</span>
              </div>
              <span className="user-chip-caret" aria-hidden="true">
                ✎
              </span>
            </button>
          </div>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={menuOpen ? "ham-open" : ""} />
            <span className={menuOpen ? "ham-open" : ""} />
            <span className={menuOpen ? "ham-open" : ""} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu">
            {/* Mobile user row — clickable */}
            <button
              className="mobile-user mobile-user-btn"
              onClick={() => {
                setProfileOpen(true);
                setMenuOpen(false);
              }}
              aria-label="Edit profile"
            >
              <div className="user-avatar">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <div className="user-name">
                  {profile.name || "Set up profile"}
                </div>
                <div className="user-sub">{trackLabel} · Tap to edit</div>
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                ✎
              </span>
            </button>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? "mobile-nav-active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                <span className="mobile-nav-icon">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}

            {/* Mobile end session */}
            <button
              className="mobile-end-session"
              onClick={() => {
                setProfileOpen(true);
                setMenuOpen(false);
              }}
            >
              ✎ Edit Profile / End Session
            </button>
          </div>
        )}
      </nav>

      {/* Profile modal — rendered outside nav so z-index works */}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}

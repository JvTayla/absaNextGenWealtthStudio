import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useProfile, calcTax } from "../context/UserProfileContext";
import { formatZAR } from "../utils/finance";
import {
  Home,
  BarChart2,
  Map,
  FlaskConical,
  BookOpen,
  Plane,
  Building2,
  Scale,
  Edit2,
  Check,
  X,
  Menu,
} from "lucide-react";
import "./Navbar.css";

const CITIES = ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Other"];

const TRACKS = [
  { id: "global-citizen", icon: <Plane size={14} />, name: "Global Citizen" },
  { id: "homeowner", icon: <Building2 size={14} />, name: "Homeowner" },
  { id: "balanced", icon: <Scale size={14} />, name: "Balanced Wealth" },
];

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
    clearProfile();
    localStorage.removeItem("absa_onboarded");
    localStorage.removeItem("absa_dismissed_nudges");
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

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
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
            <X size={18} />
          </button>
        </div>

        <div className="profile-modal-body">
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
          <div className="pm-field">
            <label className="pm-label">City</label>
            <div
              className="pm-pill-group"
              role="group"
              aria-label="Select city"
            >
              {CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`pm-pill ${form.location === city ? "pm-pill-active" : ""}`}
                  onClick={() => set("location", city)}
                  aria-pressed={form.location === city}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
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
          <div className="pm-field">
            <label className="pm-label">Active Vision Track</label>
            <div
              className="pm-track-group"
              role="group"
              aria-label="Select vision track"
            >
              {TRACKS.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  className={`pm-track-btn ${form.selectedTrack === track.id ? "pm-track-active" : ""}`}
                  onClick={() => set("selectedTrack", track.id)}
                  aria-pressed={form.selectedTrack === track.id}
                >
                  <span>{track.icon}</span>
                  <span>{track.name}</span>
                  {form.selectedTrack === track.id && (
                    <Check size={14} className="pm-track-check" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

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
            {saved ? (
              <>
                <Check size={14} /> Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

        {showEndSession && (
          <div className="pm-confirm-overlay">
            <div className="pm-confirm-box">
              <h4>End your session?</h4>
              <p>
                This clears all your profile data, milestone progress, and
                settings. You'll return to onboarding. This cannot be undone.
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

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { profile } = useProfile();

  const navLinks = [
    { to: "/", label: "Home", icon: <Home size={15} /> },
    { to: "/snapshot", label: "My Snapshot", icon: <BarChart2 size={15} /> },
    { to: "/tracks", label: "Vision Tracks", icon: <Map size={15} /> },
    { to: "/studio", label: "Studio", icon: <FlaskConical size={15} /> },
    { to: "/learn", label: "Learn", icon: <BookOpen size={15} /> },
  ];

  const activeTrack =
    ["global-citizen", "homeowner", "balanced"].find(
      (t) => t === profile.selectedTrack,
    ) || "global-citizen";

  const trackLabel = {
    "global-citizen": "Global Citizen",
    homeowner: "Homeowner",
    balanced: "Balanced",
  }[activeTrack];

  const trackIcon = {
    "global-citizen": <Plane size={12} />,
    homeowner: <Building2 size={12} />,
    balanced: <Scale size={12} />,
  }[activeTrack];

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner container">
          <Link
            to="/"
            className="navbar-logo"
            onClick={() => setMenuOpen(false)}
            aria-label="ABSA NextGen Wealth Studio home"
          >
            <div className="logo-mark">
              <img src="./absa-logo.png" alt="ABSA" className="logo-img" />
            </div>
            <div className="logo-text">
              <span className="logo-tagline">NextGen Wealth Studio</span>
            </div>
          </Link>

          <div className="navbar-links hide-mobile" role="list">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-link-active" : ""}`
                }
                role="listitem"
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar-user hide-mobile">
            <button
              className="user-chip"
              onClick={() => setProfileOpen(true)}
              aria-label={`Edit profile for ${profile.name || "user"}`}
              title="Edit your profile"
            >
              <div className="user-avatar" aria-hidden="true">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="user-chip-text">
                <span className="user-name">
                  {profile.name || "Set up profile"}
                </span>
                <span className="user-track">
                  {trackIcon} {trackLabel}
                </span>
              </div>
              <Edit2 size={13} className="user-chip-caret" aria-hidden="true" />
            </button>
          </div>

          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div
            className="mobile-menu"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <button
              className="mobile-user mobile-user-btn"
              onClick={() => {
                setProfileOpen(true);
                setMenuOpen(false);
              }}
              aria-label="Edit profile"
            >
              <div className="user-avatar" aria-hidden="true">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <div className="user-name">
                  {profile.name || "Set up profile"}
                </div>
                <div className="user-sub">{trackLabel} · Tap to edit</div>
              </div>
              <Edit2
                size={14}
                style={{ marginLeft: "auto", color: "var(--text-muted)" }}
                aria-hidden="true"
              />
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
                <span className="mobile-nav-icon" aria-hidden="true">
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            ))}

            <button
              className="mobile-end-session"
              onClick={() => {
                setProfileOpen(true);
                setMenuOpen(false);
              }}
            >
              <Edit2 size={14} aria-hidden="true" /> Edit Profile / End Session
            </button>
          </div>
        )}
      </nav>

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}

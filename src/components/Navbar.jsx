import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useProfile } from "../context/UserProfileContext";
import "./Navbar.css";

// NavLink handles active state automatically which is nice
// spent way too long trying to do this manually before i figured that out
// Last year this was such a tedious process adding it manually into each page :( Booo static websites and not knowing JS yet

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile } = useProfile();

  const navLinks = [
    { to: "/", label: "Home", icon: "⌂" },
    { to: "/snapshot", label: "My Snapshot", icon: "◎" },
    { to: "/tracks", label: "Vision Tracks", icon: "◈" },
    { to: "/studio", label: "Studio", icon: "⚗" },
    { to: "/learn", label: "Learn", icon: "✦" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
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

        {/* User chip */}
        <div className="navbar-user hide-mobile">
          <div className="user-chip">
            <div className="user-avatar">{profile.name.charAt(0)}</div>
            <span className="user-name">{profile.name}</span>
          </div>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={menuOpen ? "ham-open" : ""} />
          <span className={menuOpen ? "ham-open" : ""} />
          <span className={menuOpen ? "ham-open" : ""} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-user">
            <div className="user-avatar">{profile.name.charAt(0)}</div>
            <div>
              <div className="user-name">{profile.name}</div>
              <div className="user-sub">Global Citizen Vision</div>
            </div>
          </div>
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
        </div>
      )}
    </nav>
  );
}

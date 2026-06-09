import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile, calcTax } from "../context/UserProfileContext";
import { formatZAR } from "../utils/finance";
import "./Onboarding.css";

const TOTAL_STEPS = 5;

// Inline SVG Icons
const Icons = {
  House: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  Car: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 11l1.5-4.5h11L19 11" />
      <rect x="2" y="11" width="20" height="7" rx="2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  ),
  Shopping: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  CreditCard: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
      <line x1="6" y1="15" x2="10" y2="15" />
    </svg>
  ),
  TrendingUp: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  User: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Salary: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  Globe: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  MapPin: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

const TRACKS = [
  {
    id: "global-citizen",
    icon: "Globe",
    name: "Global Citizen",
    tagline: "Build offshore wealth. Location-independent income.",
    color: "var(--dusty-blue)",
    bg: "#E8F2FA",
    border: "#7A9CB8",
  },
  {
    id: "homeowner",
    icon: "House",
    name: "Homeowner",
    tagline: "Own your first home within 3–5 years.",
    color: "var(--absa-red)",
    bg: "#FAE8EA",
    border: "var(--absa-red-muted)",
  },
  {
    id: "balanced",
    icon: "TrendingUp",
    name: "Balanced Wealth",
    tagline: "Pay debt, build security, start investing.",
    color: "var(--sage)",
    bg: "#E8F5E4",
    border: "var(--sage)",
  },
];

const CITIES = ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Other"];

const SPENDING_CATEGORIES = [
  {
    key: "housing",
    icon: "House",
    label: "Housing",
    placeholder: "12 000",
    tooltip: "Rent, bond, levies, utilities.",
    color: "var(--absa-red)",
  },
  {
    key: "transport",
    icon: "Car",
    label: "Transport",
    placeholder: "5 000",
    tooltip: "Car repayment, fuel, Uber, insurance.",
    color: "var(--dusty-blue)",
  },
  {
    key: "lifestyle",
    icon: "Shopping",
    label: "Lifestyle",
    placeholder: "8 000",
    tooltip: "Dining, entertainment, shopping, gym.",
    color: "var(--gold)",
  },
  {
    key: "debt",
    icon: "CreditCard",
    label: "Debt Repayments",
    placeholder: "3 000",
    tooltip: "Student loans, credit cards, personal loans.",
    color: "var(--terracotta)",
  },
  {
    key: "savings",
    icon: "TrendingUp",
    label: "Savings & Investments",
    placeholder: "5 000",
    tooltip: "TFSA, RA debit orders, ETFs, savings.",
    color: "var(--sage)",
  },
];

const SEG_COLORS = {
  housing: "var(--absa-red)",
  transport: "var(--dusty-blue)",
  lifestyle: "var(--gold)",
  debt: "var(--terracotta)",
  savings: "var(--sage)",
};

const STEP_LABELS = ["You", "Income", "Spending", "Vision", "Ready"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useProfile();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    location: "Cape Town",
    grossMonthly: 45000,
    housing: "",
    transport: "",
    lifestyle: "",
    debt: "",
    savings: "",
    selectedTrack: "global-citizen",
  });

  // Derived values
  const tax = calcTax(form.grossMonthly);
  const takeHome = form.grossMonthly - tax;
  const spending = SPENDING_CATEGORIES.reduce(
    (t, c) => t + (Number(form[c.key]) || 0),
    0,
  );
  const disposable = takeHome - spending;
  const activeTrack = TRACKS.find((t) => t.id === form.selectedTrack);

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate() {
    const e = {};
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = "Please enter your first name";
      if (!form.lastName.trim()) e.lastName = "Please enter your surname";
      if (!form.age || Number(form.age) < 18 || Number(form.age) > 60)
        e.age = "Age must be 18–60";
    }
    if (step === 2 && (!form.grossMonthly || form.grossMonthly < 5000)) {
      e.grossMonthly = "Enter a salary of at least R5,000";
    }
    if (
      step === 3 &&
      !SPENDING_CATEGORIES.some((c) => Number(form[c.key]) > 0)
    ) {
      e.spending = "Fill in at least one category to continue";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate()) setStep((s) => s + 1);
  }
  function back() {
    setStep((s) => s - 1);
  }

  function finish() {
    updateProfile({
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      age: Number(form.age),
      location: form.location,
      grossMonthly: Number(form.grossMonthly),
      selectedTrack: form.selectedTrack,
      fixedCosts: {
        rent: Number(form.housing) || 0,
        medicalAid: 0,
        insurance: 0,
        studentLoan: Number(form.debt) || 0,
        subscriptions: 0,
      },
      variableSpending: {
        groceries: 0,
        diningOut: Number(form.lifestyle) || 0,
        transport: Number(form.transport) || 0,
        entertainment: 0,
        shopping: 0,
      },
      savings: {
        emergencyFund: Number(form.savings) || 0,
        tfsa: 0,
        ra: 0,
        offshore: 0,
        localInvestments: 0,
      },
    });
    localStorage.setItem("absa_onboarded", "true");
    navigate("/snapshot");
  }

  const TrackIcon = activeTrack ? Icons[activeTrack.icon] : null;

  return (
    <div className="ob-page">
      {/* ── Card ── */}
      <div className="ob-card">
        {/* Logo */}
        <div className="ob-logo-row">
          <img src="./absa-logo.png" alt="ABSA" className="ob-logo-img" />
          <span className="ob-logo-name hand-note">NextGen Wealth Studio</span>
        </div>

        {/* Step dots */}
        <div
          className="ob-dots"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
        >
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={label} className="ob-dot-item">
                <div
                  className={`ob-dot ${done ? "ob-dot-done" : ""} ${active ? "ob-dot-active" : ""}`}
                >
                  {done ? <Icons.Check /> : n}
                </div>
                <span className="ob-dot-label">{label}</span>
                {i < TOTAL_STEPS - 1 && <div className="ob-dot-line" />}
              </div>
            );
          })}
        </div>

        {/*  STEP 1  */}
        {step === 1 && (
          <div className="ob-step">
            <span className="ob-eyebrow hand-note">
              Step 1 of {TOTAL_STEPS}
            </span>
            <h2 className="ob-title">Let's start with you</h2>
            <p className="ob-desc">
              Your name personalises every screen from your Snapshot header to
              track recommendations.
            </p>

            <div className="ob-row-2">
              <div className="ob-field">
                <label htmlFor="ob-fn" className="ob-label">
                  <span className="ob-licon">
                    <Icons.User />
                  </span>{" "}
                  First name
                </label>
                <input
                  id="ob-fn"
                  type="text"
                  className={`ob-input ${errors.firstName ? "ob-err-input" : ""}`}
                  placeholder="Lebo"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  autoFocus
                />
                {errors.firstName && (
                  <span className="ob-err">{errors.firstName}</span>
                )}
              </div>
              <div className="ob-field">
                <label htmlFor="ob-ln" className="ob-label">
                  Surname
                </label>
                <input
                  id="ob-ln"
                  type="text"
                  className={`ob-input ${errors.lastName ? "ob-err-input" : ""}`}
                  placeholder="Dlamini"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
                {errors.lastName && (
                  <span className="ob-err">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="ob-field" style={{ maxWidth: 160 }}>
              <label htmlFor="ob-age" className="ob-label">
                Age
              </label>
              <input
                id="ob-age"
                type="number"
                className={`ob-input ${errors.age ? "ob-err-input" : ""}`}
                placeholder="27"
                value={form.age}
                min={18}
                max={60}
                onChange={(e) => set("age", e.target.value)}
              />
              {errors.age && <span className="ob-err">{errors.age}</span>}
            </div>

            <div className="ob-field">
              <label className="ob-label">
                <span className="ob-licon">
                  <Icons.MapPin />
                </span>{" "}
                City
              </label>
              <div className="ob-pills">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`ob-pill ${form.location === c ? "ob-pill-on" : ""}`}
                    onClick={() => set("location", c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/*  STEP 2  */}
        {step === 2 && (
          <div className="ob-step">
            <span className="ob-eyebrow hand-note">
              Step 2 of {TOTAL_STEPS}
            </span>
            <h2 className="ob-title">
              {form.firstName
                ? `Hey ${form.firstName} 👋`
                : "What do you earn?"}
            </h2>
            <p className="ob-desc">
              Your gross monthly salary drives every calculation including PAYE,
              disposable income, and all studio defaults.
            </p>

            <div className="ob-field">
              <label htmlFor="ob-sal" className="ob-label">
                <span className="ob-licon">
                  <Icons.Salary />
                </span>
                Monthly gross salary
                <span className="ob-label-sub">before tax</span>
              </label>
              <div className="ob-money-wrap">
                <span className="ob-money-pfx">R</span>
                <input
                  id="ob-sal"
                  type="number"
                  className={`ob-input ob-input-money ${errors.grossMonthly ? "ob-err-input" : ""}`}
                  value={form.grossMonthly}
                  min={5000}
                  max={500000}
                  step={1000}
                  onChange={(e) => set("grossMonthly", Number(e.target.value))}
                />
              </div>
              {errors.grossMonthly && (
                <span className="ob-err">{errors.grossMonthly}</span>
              )}
            </div>

            <input
              type="range"
              className="ob-range"
              min={10000}
              max={200000}
              step={1000}
              value={form.grossMonthly}
              onChange={(e) => set("grossMonthly", Number(e.target.value))}
              aria-label="Salary slider"
            />
            <div className="ob-range-labels">
              <span>R10k</span>
              <span>R100k</span>
              <span>R200k</span>
            </div>

            {/* PAYE breakdown plain table, no bubble */}
            <div className="ob-paye-table">
              <div className="ob-paye-head hand-note">
                SARS 2024/25 estimate
              </div>
              <div className="ob-paye-row">
                <span>Gross salary</span>
                <strong>{formatZAR(form.grossMonthly)}</strong>
              </div>
              <div className="ob-paye-row">
                <span>PAYE + UIF</span>
                <strong className="ob-red">− {formatZAR(tax)}</strong>
              </div>
              <div className="ob-paye-divider" />
              <div className="ob-paye-row ob-paye-total">
                <span>Take-home pay</span>
                <strong className="ob-green">{formatZAR(takeHome)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="ob-step">
            <span className="ob-eyebrow hand-note">
              Step 3 of {TOTAL_STEPS}
            </span>
            <h2 className="ob-title">Monthly spending</h2>
            <p className="ob-desc">
              Best estimates are fine! You'll refine these in your Snapshot.
              Your take-home is <strong>{formatZAR(takeHome)}/month</strong>.
            </p>

            {errors.spending && (
              <div className="ob-err-block">{errors.spending}</div>
            )}

            <div className="ob-spend-list">
              {SPENDING_CATEGORIES.map((cat) => {
                const Ic = Icons[cat.icon];
                return (
                  <div key={cat.key} className="ob-spend-row">
                    <div className="ob-spend-ic" style={{ color: cat.color }}>
                      <Ic />
                    </div>
                    <div className="ob-spend-meta">
                      <label
                        htmlFor={`ob-${cat.key}`}
                        className="ob-spend-name"
                      >
                        {cat.label}
                      </label>
                      <span className="ob-spend-hint">{cat.tooltip}</span>
                    </div>
                    <div className="ob-spend-input-wrap">
                      <span className="ob-spend-pfx">R</span>
                      <input
                        id={`ob-${cat.key}`}
                        type="number"
                        className="ob-input ob-spend-input"
                        placeholder={cat.placeholder}
                        value={form[cat.key]}
                        onChange={(e) => set(cat.key, e.target.value)}
                        min={0}
                        step={100}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live bar */}
            {spending > 0 && (
              <div className="ob-live-bar-wrap">
                <div className="ob-live-bar">
                  {SPENDING_CATEGORIES.map((cat) => {
                    const v = Number(form[cat.key]) || 0;
                    const pct = takeHome > 0 ? (v / takeHome) * 100 : 0;
                    return pct > 0 ? (
                      <div
                        key={cat.key}
                        className="ob-bar-seg"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: SEG_COLORS[cat.key],
                        }}
                      />
                    ) : null;
                  })}
                  {disposable > 0 && (
                    <div
                      className="ob-bar-seg ob-bar-rem"
                      style={{
                        width: `${Math.min((disposable / takeHome) * 100, 100)}%`,
                      }}
                    />
                  )}
                </div>
                <div className="ob-live-bar-row">
                  <span>
                    {formatZAR(spending)} / {formatZAR(takeHome)}
                  </span>
                  <span
                    style={{
                      color:
                        disposable >= 0 ? "var(--sage)" : "var(--absa-red)",
                      fontWeight: 700,
                    }}
                  >
                    {disposable >= 0
                      ? `${formatZAR(disposable)} remaining`
                      : `${formatZAR(Math.abs(disposable))} over budget`}
                  </span>
                </div>
                {disposable < 0 && (
                  <p className="ob-over-warn">
                    Spending exceeds take-home... adjust this in the Snapshot
                    later.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="ob-step">
            <span className="ob-eyebrow hand-note">
              Step 4 of {TOTAL_STEPS}
            </span>
            <h2 className="ob-title">Which path calls you?</h2>
            <p className="ob-desc">
              Choose the track that matches your primary goal for the next 5
              years. You can switch any time from the Navbar.
            </p>

            <div className="ob-track-list">
              {TRACKS.map((track) => {
                const Ic = Icons[track.icon];
                const active = form.selectedTrack === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    className={`ob-track-row ${active ? "ob-track-on" : ""}`}
                    style={{
                      "--tc": track.color,
                      "--tb": track.border,
                      background: active ? track.bg : "var(--bg-card)",
                    }}
                    onClick={() => set("selectedTrack", track.id)}
                    aria-pressed={active}
                  >
                    <div className="ob-track-ic" style={{ color: track.color }}>
                      <Ic />
                    </div>
                    <div className="ob-track-body">
                      <div
                        className="ob-track-name"
                        style={{ color: track.color }}
                      >
                        {track.name}
                      </div>
                      <div className="ob-track-tag">{track.tagline}</div>
                    </div>
                    {active && (
                      <div
                        className="ob-track-check"
                        style={{ color: track.color }}
                      >
                        <Icons.Check />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5 Summary with mini Money Snapshot */}
        {step === 5 && (
          <div className="ob-step">
            <span className="ob-eyebrow hand-note">
              You're set{form.firstName ? `, ${form.firstName}` : ""}
            </span>
            <h2 className="ob-title">Here's your picture.</h2>
            <p className="ob-desc">
              Review your details. Everything is editable in your Snapshot at
              any time.
            </p>

            {/* Track strip */}
            <div
              className="ob-summary-track"
              style={{
                borderLeftColor: activeTrack?.color,
                background: activeTrack?.bg,
              }}
            >
              <div
                className="ob-summary-track-ic"
                style={{ color: activeTrack?.color }}
              >
                {TrackIcon && <TrackIcon />}
              </div>
              <div>
                <div className="ob-summary-track-sub hand-note">
                  Vision Track
                </div>
                <div
                  className="ob-summary-track-name"
                  style={{ color: activeTrack?.color }}
                >
                  {activeTrack?.name}
                </div>
              </div>
            </div>

            {/* ── Mini Money Snapshot ── */}
            <div className="ob-mini-snapshot">
              <div className="ob-mini-snap-head hand-note">
                Money Snapshot preview
              </div>

              {/* Income row */}
              <div className="ob-mini-row ob-mini-income">
                <div className="ob-mini-item">
                  <span className="ob-mini-label">Gross salary</span>
                  <span className="ob-mini-val">
                    {formatZAR(form.grossMonthly)}
                  </span>
                </div>
                <div className="ob-mini-arrow">→</div>
                <div className="ob-mini-item">
                  <span className="ob-mini-label">PAYE + UIF</span>
                  <span className="ob-mini-val ob-red">−{formatZAR(tax)}</span>
                </div>
                <div className="ob-mini-arrow">→</div>
                <div className="ob-mini-item ob-mini-takehome">
                  <span className="ob-mini-label">Take-home</span>
                  <span className="ob-mini-val ob-green">
                    {formatZAR(takeHome)}
                  </span>
                </div>
              </div>

              {/* Spending bar */}
              <div className="ob-mini-bar-wrap">
                <div className="ob-mini-bar">
                  {SPENDING_CATEGORIES.map((cat) => {
                    const v = Number(form[cat.key]) || 0;
                    const pct = takeHome > 0 ? (v / takeHome) * 100 : 0;
                    return pct > 0 ? (
                      <div
                        key={cat.key}
                        className="ob-bar-seg"
                        title={cat.label}
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: SEG_COLORS[cat.key],
                        }}
                      />
                    ) : null;
                  })}
                  {disposable > 0 && (
                    <div
                      className="ob-bar-seg ob-bar-rem"
                      style={{
                        width: `${Math.min((disposable / takeHome) * 100, 100)}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Spending legend grid */}
              <div className="ob-mini-legend">
                {SPENDING_CATEGORIES.map((cat) => {
                  const v = Number(form[cat.key]) || 0;
                  if (!v) return null;
                  const Ic = Icons[cat.icon];
                  return (
                    <div key={cat.key} className="ob-mini-legend-item">
                      <span
                        className="ob-mini-legend-dot"
                        style={{ background: SEG_COLORS[cat.key] }}
                      />
                      <span
                        className="ob-mini-legend-ic"
                        style={{ color: cat.color }}
                      >
                        <Ic />
                      </span>
                      <span className="ob-mini-legend-name">{cat.label}</span>
                      <span className="ob-mini-legend-amt">{formatZAR(v)}</span>
                    </div>
                  );
                })}
                {disposable > 0 && (
                  <div className="ob-mini-legend-item">
                    <span
                      className="ob-mini-legend-dot"
                      style={{ background: "var(--sage)", opacity: 0.4 }}
                    />
                    <span
                      className="ob-mini-legend-ic"
                      style={{ color: "var(--sage)" }}
                    >
                      <Icons.TrendingUp />
                    </span>
                    <span className="ob-mini-legend-name">
                      To invest / disposable
                    </span>
                    <span className="ob-mini-legend-amt ob-green">
                      {formatZAR(disposable)}
                    </span>
                  </div>
                )}
              </div>

              {/* Profile summary line */}
              <div className="ob-mini-profile-row">
                <span>
                  {form.firstName} {form.lastName}
                </span>
                <span className="ob-mini-sep">·</span>
                <span>Age {form.age}</span>
                <span className="ob-mini-sep">·</span>
                <span>{form.location}</span>
              </div>

              {disposable < 0 && (
                <p className="ob-over-warn">
                  Spending over take-home by {formatZAR(Math.abs(disposable))}.
                  Adjust in Snapshot.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Nav ── */}
        <div className={`ob-nav ${step === 5 ? "ob-nav-end" : ""}`}>
          {step > 1 && step < 5 && (
            <button type="button" className="btn btn-ghost" onClick={back}>
              ← Back
            </button>
          )}
          {step === 1 && <div />}

          {step < 5 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={step < 5 ? next : finish}
            >
              {step === 4 ? "Looks good" : "Continue"} <Icons.ArrowRight />
            </button>
          )}
          {step === 5 && (
            <button
              type="button"
              className="btn btn-primary btn-lg ob-finish-btn"
              onClick={finish}
            >
              Enter My Studio <Icons.ArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

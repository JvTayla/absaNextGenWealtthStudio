import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile, calcTax } from "../context/UserProfileContext";
import { formatZAR } from "../utils/finance";
import "./Onboarding.css";

// Step config
const TOTAL_STEPS = 4;

const TRACKS = [
  {
    id: "global-citizen",
    emoji: "✈",
    name: "Global Citizen",
    tagline: "Build offshore wealth. Create location-independent income.",
    color: "var(--dusty-blue)",
    bg: "linear-gradient(135deg, #E8F2FA 0%, #C8DFF0 100%)",
    border: "#7A9CB8",
  },
  {
    id: "homeowner",
    emoji: "🏠",
    name: "Homeowner",
    tagline: "Own your first home within 3–5 years.",
    color: "var(--absa-red)",
    bg: "linear-gradient(135deg, #FAE8EA 0%, #F2C4CC 100%)",
    border: "var(--absa-red-muted)",
  },
  {
    id: "balanced",
    emoji: "⚖",
    name: "Balanced Wealth",
    tagline: "Pay debt, build security, start investing.",
    color: "var(--sage)",
    bg: "linear-gradient(135deg, #E8F5E4 0%, #C8E8C0 100%)",
    border: "var(--sage)",
  },
];

const CITIES = ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Other"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useProfile();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    age: "",
    location: "Cape Town",
    grossMonthly: 45000,
    selectedTrack: "global-citizen",
  });
  const [errors, setErrors] = useState({});

  // Derived preview
  const tax = calcTax(form.grossMonthly);
  const takeHome = form.grossMonthly - tax;

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validateStep() {
    const errs = {};
    if (step === 1) {
      if (!form.name.trim()) errs.name = "Please enter your name";
      if (!form.age || Number(form.age) < 18 || Number(form.age) > 45)
        errs.age = "Enter an age between 18 and 45";
    }
    if (step === 2) {
      if (!form.grossMonthly || form.grossMonthly < 10000)
        errs.grossMonthly = "Enter a salary of at least R10,000";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
  }

  function finish() {
    updateProfile({
      name: form.name.trim(),
      age: Number(form.age),
      location: form.location,
      grossMonthly: Number(form.grossMonthly),
      selectedTrack: form.selectedTrack,
    });
    localStorage.setItem("absa_onboarded", "true");
    navigate("/snapshot");
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  const activeTrackData = TRACKS.find((t) => t.id === form.selectedTrack);

  return (
    <div className="onboarding-page">
      {/* Background decoration */}
      <div className="onboarding-bg-decor" aria-hidden="true">
        <div className="ob-decor-circle ob-decor-1" />
        <div className="ob-decor-circle ob-decor-2" />
        <div className="ob-decor-circle ob-decor-3" />
      </div>

      <div className="onboarding-card">
        {/* Logo */}
        <div className="ob-logo">
          <div className="ob-logo-mark">
            <img src="./absa-logo.png" alt="ABSA" className="ob-logo-img" />
          </div>
          <span className="ob-logo-text hand-note">NextGen Wealth Studio</span>
        </div>

        {/* Progress bar */}
        <div
          className="ob-progress-wrap"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
        >
          <div className="ob-progress-track">
            <div
              className="ob-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="ob-step-dots">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`ob-step-dot ${i + 1 < step ? "ob-dot-done" : ""} ${i + 1 === step ? "ob-dot-active" : ""}`}
              >
                {i + 1 < step ? "✓" : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 1: Who are you? ── */}
        {step === 1 && (
          <div className="ob-step">
            <div className="ob-step-eyebrow hand-note">Step 1 of 4</div>
            <h1 className="ob-step-title">Let's start with you</h1>
            <p className="ob-step-desc">
              This helps us personalise your financial roadmap and studio
              defaults.
            </p>

            <div className="ob-field">
              <label htmlFor="ob-name" className="ob-label">
                Your first name
              </label>
              <input
                id="ob-name"
                type="text"
                className={`ob-input ${errors.name ? "ob-input-error" : ""}`}
                placeholder="e.g. Lebo"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                autoFocus
              />
              {errors.name && <span className="ob-error">{errors.name}</span>}
            </div>

            <div className="ob-field">
              <label htmlFor="ob-age" className="ob-label">
                Your age
              </label>
              <input
                id="ob-age"
                type="number"
                className={`ob-input ${errors.age ? "ob-input-error" : ""}`}
                placeholder="e.g. 27"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                min={18}
                max={45}
              />
              {errors.age && <span className="ob-error">{errors.age}</span>}
            </div>

            <div className="ob-field">
              <label className="ob-label">City</label>
              <div
                className="ob-pill-group"
                role="group"
                aria-label="Select your city"
              >
                {CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className={`ob-pill ${form.location === city ? "ob-pill-active" : ""}`}
                    onClick={() => set("location", city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Income ── */}
        {step === 2 && (
          <div className="ob-step">
            <div className="ob-step-eyebrow hand-note">Step 2 of 4</div>
            <h1 className="ob-step-title">
              {form.name ? `Hey ${form.name} 👋` : "Your income"}
            </h1>
            <p className="ob-step-desc">
              Your gross monthly salary powers all the financial calculations in
              the app.
            </p>

            <div className="ob-field">
              <label htmlFor="ob-salary" className="ob-label">
                Monthly gross salary
                <span className="ob-label-hint">Before tax</span>
              </label>
              <div className="ob-salary-input-wrap">
                <span className="ob-currency-prefix">R</span>
                <input
                  id="ob-salary"
                  type="number"
                  className={`ob-input ob-input-currency ${errors.grossMonthly ? "ob-input-error" : ""}`}
                  value={form.grossMonthly}
                  onChange={(e) => set("grossMonthly", Number(e.target.value))}
                  min={10000}
                  max={500000}
                  step={1000}
                />
              </div>
              {errors.grossMonthly && (
                <span className="ob-error">{errors.grossMonthly}</span>
              )}
            </div>

            {/* Slider */}
            <input
              type="range"
              className="ob-slider"
              min={10000}
              max={200000}
              step={1000}
              value={form.grossMonthly}
              onChange={(e) => set("grossMonthly", Number(e.target.value))}
              aria-label="Monthly gross salary slider"
            />
            <div className="ob-slider-labels">
              <span>R10k</span>
              <span>R100k</span>
              <span>R200k</span>
            </div>

            {/* Live PAYE preview */}
            <div className="ob-tax-preview">
              <div className="ob-tax-row">
                <span className="ob-tax-label">Gross salary</span>
                <span className="ob-tax-value">
                  {formatZAR(form.grossMonthly)}
                </span>
              </div>
              <div className="ob-tax-row">
                <span className="ob-tax-label">PAYE + UIF</span>
                <span className="ob-tax-value ob-tax-deduction">
                  − {formatZAR(tax)}
                </span>
              </div>
              <div className="ob-tax-divider" />
              <div className="ob-tax-row ob-tax-takehome">
                <span className="ob-tax-label">
                  <strong>Take-home pay</strong>
                </span>
                <span className="ob-tax-value ob-tax-green">
                  <strong>{formatZAR(takeHome)}</strong>
                </span>
              </div>
              <p className="ob-tax-note">
                Based on SARS 2024/25 tax brackets, including primary rebate and
                UIF.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Track selection ── */}
        {step === 3 && (
          <div className="ob-step">
            <div className="ob-step-eyebrow hand-note">Step 3 of 4</div>
            <h1 className="ob-step-title">Which vision excites you?</h1>
            <p className="ob-step-desc">
              Choose the track that matches your primary goal for the next 5
              years. You can always switch later.
            </p>

            <div className="ob-track-cards">
              {TRACKS.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  className={`ob-track-card ${form.selectedTrack === track.id ? "ob-track-selected" : ""}`}
                  style={{
                    "--ob-track-color": track.color,
                    "--ob-track-border": track.border,
                    background:
                      form.selectedTrack === track.id
                        ? track.bg
                        : "var(--bg-card)",
                  }}
                  onClick={() => set("selectedTrack", track.id)}
                  aria-pressed={form.selectedTrack === track.id}
                >
                  <div className="ob-track-top">
                    <span className="ob-track-emoji">{track.emoji}</span>
                    {form.selectedTrack === track.id && (
                      <span className="ob-track-check" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="ob-track-name" style={{ color: track.color }}>
                    {track.name}
                  </div>
                  <div className="ob-track-tagline">{track.tagline}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 4: Ready ── */}
        {step === 4 && (
          <div className="ob-step ob-step-final">
            <div className="ob-confetti" aria-hidden="true">
              ✦ ✦ ✦
            </div>
            <h1 className="ob-step-title ob-title-large">
              Your studio is ready{form.name ? `, ${form.name}` : ""}. 🎉
            </h1>
            <p className="ob-step-desc">
              Here's your financial picture. You can update any of this in your
              Snapshot at any time.
            </p>

            {/* Summary card */}
            <div className="ob-summary-card">
              <div
                className="ob-summary-header"
                style={{ background: activeTrackData?.bg }}
              >
                <span className="ob-summary-emoji">
                  {activeTrackData?.emoji}
                </span>
                <div>
                  <div className="ob-summary-track-label">
                    Your Vision Track
                  </div>
                  <div
                    className="ob-summary-track-name"
                    style={{ color: activeTrackData?.color }}
                  >
                    {activeTrackData?.name}
                  </div>
                </div>
              </div>

              <div className="ob-summary-rows">
                <div className="ob-summary-row">
                  <span className="ob-summary-key">Name</span>
                  <span className="ob-summary-val">{form.name || "—"}</span>
                </div>
                <div className="ob-summary-row">
                  <span className="ob-summary-key">Age</span>
                  <span className="ob-summary-val">{form.age || "—"}</span>
                </div>
                <div className="ob-summary-row">
                  <span className="ob-summary-key">City</span>
                  <span className="ob-summary-val">{form.location}</span>
                </div>
                <div className="ob-summary-row">
                  <span className="ob-summary-key">Gross salary</span>
                  <span className="ob-summary-val">
                    {formatZAR(form.grossMonthly)}/month
                  </span>
                </div>
                <div className="ob-summary-row ob-summary-highlight">
                  <span className="ob-summary-key">
                    <strong>Take-home pay</strong>
                  </span>
                  <span className="ob-summary-val ob-summary-green">
                    <strong>{formatZAR(takeHome)}/month</strong>
                  </span>
                </div>
              </div>

              <p className="ob-summary-note">
                Complete your full Money Snapshot next to add spending, savings,
                and set your goals.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="ob-nav">
          {step > 1 && step < 4 && (
            <button type="button" className="btn btn-ghost" onClick={back}>
              ← Back
            </button>
          )}
          {step === 1 && <div />}

          {step < 3 && (
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue →
            </button>
          )}
          {step === 3 && (
            <button type="button" className="btn btn-primary" onClick={next}>
              Looks good →
            </button>
          )}
          {step === 4 && (
            <button
              type="button"
              className="btn btn-primary btn-lg ob-cta"
              onClick={finish}
            >
              Enter My Studio →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

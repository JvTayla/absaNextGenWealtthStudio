import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, calcTax } from '../context/UserProfileContext';
import { formatZAR } from '../utils/finance';
import './Onboarding.css';

const TOTAL_STEPS = 5;

const TRACKS = [
  {
    id: 'global-citizen',
    emoji: '✈',
    name: 'Global Citizen',
    tagline: 'Build offshore wealth. Create location-independent income.',
    color: 'var(--dusty-blue)',
    bg: 'linear-gradient(135deg, #E8F2FA 0%, #C8DFF0 100%)',
    border: '#7A9CB8',
  },
  {
    id: 'homeowner',
    emoji: '🏠',
    name: 'Homeowner',
    tagline: 'Own your first home within 3–5 years.',
    color: 'var(--absa-red)',
    bg: 'linear-gradient(135deg, #FAE8EA 0%, #F2C4CC 100%)',
    border: 'var(--absa-red-muted)',
  },
  {
    id: 'balanced',
    emoji: '⚖',
    name: 'Balanced Wealth',
    tagline: 'Pay debt, build security, start investing.',
    color: 'var(--sage)',
    bg: 'linear-gradient(135deg, #E8F5E4 0%, #C8E8C0 100%)',
    border: 'var(--sage)',
  },
];

const CITIES = ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Other'];

// Spending categories with icons, labels, placeholders, and tooltips
const SPENDING_CATEGORIES = [
  {
    key: 'housing',
    icon: '🏠',
    label: 'Housing',
    placeholder: 'e.g. 12000',
    tooltip: 'Rent or bond repayment, levies, rates, and utilities.',
    field: 'fixedCosts',
    profileKey: 'rent',
    color: 'var(--absa-red)',
  },
  {
    key: 'transport',
    icon: '🚗',
    label: 'Transport',
    placeholder: 'e.g. 5000',
    tooltip: 'Car repayment, insurance, fuel, or Uber / public transport.',
    field: 'variableSpending',
    profileKey: 'transport',
    color: 'var(--dusty-blue)',
  },
  {
    key: 'lifestyle',
    icon: '🛍',
    label: 'Lifestyle',
    placeholder: 'e.g. 8000',
    tooltip: 'Dining out, entertainment, shopping, subscriptions, gym.',
    field: 'variableSpending',
    profileKey: 'diningOut',
    color: 'var(--gold)',
  },
  {
    key: 'debt',
    icon: '💳',
    label: 'Debt Repayments',
    placeholder: 'e.g. 3000',
    tooltip: 'Student loans, credit cards, personal loans, store accounts.',
    field: 'fixedCosts',
    profileKey: 'studentLoan',
    color: 'var(--terracotta)',
  },
  {
    key: 'savings',
    icon: '📈',
    label: 'Monthly Savings & Investments',
    placeholder: 'e.g. 5000',
    tooltip: 'TFSA contributions, RA debit orders, ETF stokvels, savings account transfers.',
    field: 'savings',
    profileKey: 'emergencyFund',
    color: 'var(--sage)',
  },
];

// Summary colours for step 5
const SUMMARY_COLORS = {
  housing: 'var(--absa-red)',
  transport: 'var(--dusty-blue)',
  lifestyle: 'var(--gold)',
  debt: 'var(--terracotta)',
  savings: 'var(--sage)',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile, updateNested } = useProfile();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1
    firstName: '',
    lastName: '',
    age: '',
    location: 'Cape Town',
    // Step 2
    grossMonthly: 45000,
    // Step 3 — spending
    housing: '',
    transport: '',
    lifestyle: '',
    debt: '',
    savings: '',
    // Step 4
    selectedTrack: 'global-citizen',
  });

  // Derived
  const tax = calcTax(form.grossMonthly);
  const takeHome = form.grossMonthly - tax;
  const totalSpending =
    (Number(form.housing) || 0) +
    (Number(form.transport) || 0) +
    (Number(form.lifestyle) || 0) +
    (Number(form.debt) || 0);
  const monthlySavings = Number(form.savings) || 0;
  const disposable = takeHome - totalSpending - monthlySavings;
  const activeTrack = TRACKS.find(t => t.id === form.selectedTrack);

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  }

  function validateStep() {
    const errs = {};
    if (step === 1) {
      if (!form.firstName.trim()) errs.firstName = 'Please enter your first name';
      if (!form.lastName.trim()) errs.lastName = 'Please enter your surname';
      if (!form.age || Number(form.age) < 18 || Number(form.age) > 60)
        errs.age = 'Enter an age between 18 and 60';
    }
    if (step === 2) {
      if (!form.grossMonthly || form.grossMonthly < 5000)
        errs.grossMonthly = 'Enter a salary of at least R5,000';
    }
    if (step === 3) {
      if (!form.housing && !form.transport && !form.lifestyle && !form.debt && !form.savings)
        errs.spending = 'Please fill in at least one spending category';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    setStep(s => s + 1);
  }

  function back() {
    setStep(s => s - 1);
  }

  function finish() {
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;

    // Update profile with all collected data
    updateProfile({
      name: fullName,
      age: Number(form.age),
      location: form.location,
      grossMonthly: Number(form.grossMonthly),
      selectedTrack: form.selectedTrack,
      // Reset fixed costs and variable spending to real user values
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

    localStorage.setItem('absa_onboarded', 'true');
    navigate('/snapshot');
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const spendingPct = takeHome > 0
    ? Math.round(((totalSpending + monthlySavings) / takeHome) * 100)
    : 0;

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
        <div className="ob-progress-wrap" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          <div className="ob-progress-track">
            <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="ob-step-dots">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`ob-step-dot ${i + 1 < step ? 'ob-dot-done' : ''} ${i + 1 === step ? 'ob-dot-active' : ''}`}
              >
                {i + 1 < step ? '✓' : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 1: Who are you? ── */}
        {step === 1 && (
          <div className="ob-step">
            <div className="ob-step-eyebrow hand-note">Step 1 of {TOTAL_STEPS}</div>
            <h1 className="ob-step-title">Let's start with you</h1>
            <p className="ob-step-desc">This personalises your financial roadmap, studio defaults, and all recommendations throughout the app.</p>

            {/* Name row */}
            <div className="ob-field-row">
              <div className="ob-field">
                <label htmlFor="ob-firstname" className="ob-label">First name</label>
                <input
                  id="ob-firstname"
                  type="text"
                  className={`ob-input ${errors.firstName ? 'ob-input-error' : ''}`}
                  placeholder="e.g. Lebo"
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  autoFocus
                />
                {errors.firstName && <span className="ob-error">{errors.firstName}</span>}
              </div>
              <div className="ob-field">
                <label htmlFor="ob-lastname" className="ob-label">Surname</label>
                <input
                  id="ob-lastname"
                  type="text"
                  className={`ob-input ${errors.lastName ? 'ob-input-error' : ''}`}
                  placeholder="e.g. Dlamini"
                  value={form.lastName}
                  onChange={e => set('lastName', e.target.value)}
                />
                {errors.lastName && <span className="ob-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="ob-field">
              <label htmlFor="ob-age" className="ob-label">Age</label>
              <input
                id="ob-age"
                type="number"
                className={`ob-input ${errors.age ? 'ob-input-error' : ''}`}
                placeholder="e.g. 27"
                value={form.age}
                onChange={e => set('age', e.target.value)}
                min={18}
                max={60}
              />
              {errors.age && <span className="ob-error">{errors.age}</span>}
            </div>

            <div className="ob-field">
              <label className="ob-label">City</label>
              <div className="ob-pill-group" role="group" aria-label="Select your city">
                {CITIES.map(city => (
                  <button
                    key={city}
                    type="button"
                    className={`ob-pill ${form.location === city ? 'ob-pill-active' : ''}`}
                    onClick={() => set('location', city)}
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
            <div className="ob-step-eyebrow hand-note">Step 2 of {TOTAL_STEPS}</div>
            <h1 className="ob-step-title">
              {form.firstName ? `Hey ${form.firstName} 👋` : 'Your income'}
            </h1>
            <p className="ob-step-desc">Your gross monthly salary powers every calculation in the app — PAYE, disposable income, and all recommendations.</p>

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
                  className={`ob-input ob-input-currency ${errors.grossMonthly ? 'ob-input-error' : ''}`}
                  value={form.grossMonthly}
                  onChange={e => set('grossMonthly', Number(e.target.value))}
                  min={5000}
                  max={500000}
                  step={1000}
                />
              </div>
              {errors.grossMonthly && <span className="ob-error">{errors.grossMonthly}</span>}
            </div>

            {/* Slider */}
            <input
              type="range"
              className="ob-slider"
              min={10000}
              max={200000}
              step={1000}
              value={form.grossMonthly}
              onChange={e => set('grossMonthly', Number(e.target.value))}
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
                <span className="ob-tax-value">{formatZAR(form.grossMonthly)}</span>
              </div>
              <div className="ob-tax-row">
                <span className="ob-tax-label">PAYE + UIF</span>
                <span className="ob-tax-value ob-tax-deduction">− {formatZAR(tax)}</span>
              </div>
              <div className="ob-tax-divider" />
              <div className="ob-tax-row ob-tax-takehome">
                <span className="ob-tax-label"><strong>Take-home pay</strong></span>
                <span className="ob-tax-value ob-tax-green"><strong>{formatZAR(takeHome)}</strong></span>
              </div>
              <p className="ob-tax-note">Based on SARS 2024/25 tax brackets, including primary rebate and UIF.</p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Spending ── */}
        {step === 3 && (
          <div className="ob-step">
            <div className="ob-step-eyebrow hand-note">Step 3 of {TOTAL_STEPS}</div>
            <h1 className="ob-step-title">Your monthly spending</h1>
            <p className="ob-step-desc">
              Give us your best estimates — you can always refine these in your Snapshot.
              Your take-home is <strong>{formatZAR(takeHome)}/month</strong>.
            </p>

            {errors.spending && (
              <div className="ob-error ob-error-block">{errors.spending}</div>
            )}

            <div className="ob-spending-grid">
              {SPENDING_CATEGORIES.map(cat => (
                <div key={cat.key} className="ob-spend-field">
                  <label className="ob-spend-label" htmlFor={`ob-${cat.key}`}>
                    <span className="ob-spend-icon">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </label>
                  <div className="ob-spend-input-wrap">
                    <span className="ob-currency-prefix ob-spend-prefix">R</span>
                    <input
                      id={`ob-${cat.key}`}
                      type="number"
                      className="ob-input ob-input-currency ob-spend-input"
                      placeholder={cat.placeholder}
                      value={form[cat.key]}
                      onChange={e => set(cat.key, e.target.value)}
                      min={0}
                      step={100}
                    />
                  </div>
                  <p className="ob-spend-tooltip">{cat.tooltip}</p>
                </div>
              ))}
            </div>

            {/* Live spending summary bar */}
            {(totalSpending + monthlySavings) > 0 && (
              <div className="ob-spend-summary">
                <div className="ob-spend-summary-bar">
                  {SPENDING_CATEGORIES.map(cat => {
                    const val = Number(form[cat.key]) || 0;
                    const pct = takeHome > 0 ? (val / takeHome) * 100 : 0;
                    return pct > 0 ? (
                      <div
                        key={cat.key}
                        className="ob-spend-bar-seg"
                        style={{ width: `${Math.min(pct, 100)}%`, background: SUMMARY_COLORS[cat.key] }}
                        title={`${cat.label}: ${formatZAR(val)}`}
                      />
                    ) : null;
                  })}
                </div>
                <div className="ob-spend-summary-row">
                  <span className="ob-spend-summary-label">Total allocated</span>
                  <span className="ob-spend-summary-val">
                    {formatZAR(totalSpending + monthlySavings)} / {formatZAR(takeHome)}
                    <span style={{ color: disposable >= 0 ? 'var(--sage)' : 'var(--absa-red)', marginLeft: '0.5rem', fontWeight: 700 }}>
                      ({disposable >= 0 ? `${formatZAR(disposable)} left` : `${formatZAR(Math.abs(disposable))} over`})
                    </span>
                  </span>
                </div>
                {disposable < 0 && (
                  <p className="ob-spend-warning">
                    ⚠ Your spending exceeds take-home pay. You can adjust this now or refine it in the Snapshot.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Track selection ── */}
        {step === 4 && (
          <div className="ob-step">
            <div className="ob-step-eyebrow hand-note">Step 4 of {TOTAL_STEPS}</div>
            <h1 className="ob-step-title">Which vision excites you?</h1>
            <p className="ob-step-desc">Choose the track that matches your primary goal for the next 5 years. You can switch at any time.</p>

            <div className="ob-track-cards">
              {TRACKS.map(track => (
                <button
                  key={track.id}
                  type="button"
                  className={`ob-track-card ${form.selectedTrack === track.id ? 'ob-track-selected' : ''}`}
                  style={{
                    '--ob-track-color': track.color,
                    '--ob-track-border': track.border,
                    background: form.selectedTrack === track.id ? track.bg : 'var(--bg-card)',
                  }}
                  onClick={() => set('selectedTrack', track.id)}
                  aria-pressed={form.selectedTrack === track.id}
                >
                  <div className="ob-track-top">
                    <span className="ob-track-emoji">{track.emoji}</span>
                    {form.selectedTrack === track.id && (
                      <span className="ob-track-check" aria-hidden="true">✓</span>
                    )}
                  </div>
                  <div className="ob-track-name" style={{ color: track.color }}>{track.name}</div>
                  <div className="ob-track-tagline">{track.tagline}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 5: Summary ── */}
        {step === 5 && (
          <div className="ob-step ob-step-final">
            <div className="ob-confetti" aria-hidden="true">✦ ✦ ✦</div>
            <h1 className="ob-step-title ob-title-large">
              Your studio is ready, {form.firstName}. 🎉
            </h1>
            <p className="ob-step-desc">Here's your financial picture. You can update any of this in your Snapshot at any time.</p>

            {/* Summary card */}
            <div className="ob-summary-card">

              {/* Track header */}
              <div className="ob-summary-header" style={{ background: activeTrack?.bg }}>
                <span className="ob-summary-emoji">{activeTrack?.emoji}</span>
                <div>
                  <div className="ob-summary-track-label">Your Vision Track</div>
                  <div className="ob-summary-track-name" style={{ color: activeTrack?.color }}>
                    {activeTrack?.name}
                  </div>
                </div>
              </div>

              {/* Personal details */}
              <div className="ob-summary-rows">
                <div className="ob-summary-row">
                  <span className="ob-summary-key">Full name</span>
                  <span className="ob-summary-val">{form.firstName} {form.lastName}</span>
                </div>
                <div className="ob-summary-row">
                  <span className="ob-summary-key">Age · City</span>
                  <span className="ob-summary-val">{form.age} · {form.location}</span>
                </div>
                <div className="ob-summary-row">
                  <span className="ob-summary-key">Gross salary</span>
                  <span className="ob-summary-val">{formatZAR(form.grossMonthly)}/month</span>
                </div>
                <div className="ob-summary-row ob-summary-highlight">
                  <span className="ob-summary-key"><strong>Take-home pay</strong></span>
                  <span className="ob-summary-val ob-summary-green"><strong>{formatZAR(takeHome)}/month</strong></span>
                </div>
              </div>

              {/* Spending breakdown */}
              <div className="ob-summary-spending">
                <div className="ob-summary-spend-title">Monthly Spending Snapshot</div>

                {/* Visual bar */}
                <div className="ob-summary-bar">
                  {SPENDING_CATEGORIES.map(cat => {
                    const val = Number(form[cat.key]) || 0;
                    const pct = takeHome > 0 ? (val / takeHome) * 100 : 0;
                    return pct > 0 ? (
                      <div
                        key={cat.key}
                        className="ob-spend-bar-seg"
                        style={{ width: `${Math.min(pct, 100)}%`, background: SUMMARY_COLORS[cat.key] }}
                        title={`${cat.label}: ${formatZAR(val)}`}
                      />
                    ) : null;
                  })}
                  {/* Disposable remainder */}
                  {disposable > 0 && (
                    <div
                      className="ob-spend-bar-seg ob-spend-bar-disposable"
                      style={{ width: `${Math.min((disposable / takeHome) * 100, 100)}%` }}
                      title={`Disposable: ${formatZAR(disposable)}`}
                    />
                  )}
                </div>

                {/* Legend */}
                <div className="ob-summary-spend-legend">
                  {SPENDING_CATEGORIES.map(cat => {
                    const val = Number(form[cat.key]) || 0;
                    if (!val) return null;
                    return (
                      <div key={cat.key} className="ob-summary-spend-item">
                        <span className="ob-legend-dot" style={{ background: SUMMARY_COLORS[cat.key] }} />
                        <span className="ob-legend-label">{cat.icon} {cat.label}</span>
                        <span className="ob-legend-val">{formatZAR(val)}</span>
                      </div>
                    );
                  })}
                  {disposable > 0 && (
                    <div className="ob-summary-spend-item">
                      <span className="ob-legend-dot" style={{ background: 'var(--border)' }} />
                      <span className="ob-legend-label">💰 Disposable / to invest</span>
                      <span className="ob-legend-val ob-summary-green">{formatZAR(disposable)}</span>
                    </div>
                  )}
                </div>

                {disposable < 0 && (
                  <p className="ob-spend-warning" style={{ margin: '0.75rem 0 0' }}>
                    ⚠ Spending exceeds take-home by {formatZAR(Math.abs(disposable))}. Head to Snapshot to review and adjust.
                  </p>
                )}
              </div>

              <p className="ob-summary-note">
                Complete your full Money Snapshot to add savings, investments, and set your goals.
                All numbers update in real time.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={`ob-nav ${step === 5 ? 'ob-nav-center' : ''}`}>
          {step > 1 && step < 5 && (
            <button type="button" className="btn btn-ghost" onClick={back}>
              ← Back
            </button>
          )}
          {step === 1 && <div />}

          {step < 4 && (
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue →
            </button>
          )}
          {step === 4 && (
            <button type="button" className="btn btn-primary" onClick={next}>
              Looks good →
            </button>
          )}
          {step === 5 && (
            <button type="button" className="btn btn-primary btn-lg ob-cta" onClick={finish}>
              Enter My Studio →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
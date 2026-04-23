import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfile, SARS_BRACKETS } from "../context/UserProfileContext";
import { formatZAR, formatZARShort } from "../utils/finance";
import "./Snapshot.css";

// effective tax rate is just tax/gross * 100, took me a bit to figure out the right way to display this
// TODO: maybe add a graph here later if i have time

// The use of this page is to give the user a clear picture of their current financial situation, 
// with a focus on their income, tax, and spending patterns. 
// I  Tried to make it as readable as possible, but im considering adding extra Graphs and information , 
// Im just a bit biased becasue its hard to find a reliable credit checker that isnt scammy

// anyway im really happy with how this page turned out, it was a bit of a struggle to figure out how to present the information in a way that is engaging and not overwhelming, 
// but i think the use of cards, colors, and tooltips helps make it more digestible.

// Tooltip helper
function Tooltip({ text }) {
  return (
    <span className="tooltip-wrapper">
      <span className="tooltip-icon">i</span>
      <span className="tooltip-box">{text}</span>
    </span>
  );
}

// Spending bar segment
function SpendBar({ categories, total }) {
  const colors = [
    "var(--absa-red)",
    "var(--gold)",
    "var(--dusty-blue)",
    "var(--sage)",
    "var(--terracotta)",
    "var(--caramel)",
    "var(--mid-brown)",
  ];

  return (
    <div>
      <div className="spend-bar-track">
        {Object.entries(categories).map(([key, val], i) => (
          <div
            key={key}
            className="spend-bar-segment"
            style={{
              width: `${(val / total) * 100}%`,
              background: colors[i % colors.length],
            }}
            title={`${key}: ${formatZAR(val)}`}
          />
        ))}
      </div>
      <div className="spend-bar-legend">
        {Object.entries(categories).map(([key, val], i) => (
          <div key={key} className="spend-legend-item">
            <span
              className="legend-dot"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="legend-label">{formatKey(key)}</span>
            <span className="legend-val">{formatZAR(val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

// Editable amount input
function AmountInput({ label, value, onChange, tooltip }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="form-input-prefix">
        <span>R</span>
        <input
          type="number"
          className="form-input"
          value={value}
          min={0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

export default function Snapshot() {
  const {
    profile,
    updateProfile,
    updateNested,
    monthlyTax,
    takeHome,
    totalFixed,
    totalVariable,
    totalSpending,
    disposable,
    goalProgress,
    totalSavings,
  } = useProfile();

  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Which SARS bracket?
  const annual = profile.grossMonthly * 12;
  const bracket = SARS_BRACKETS.find((b) => annual >= b.min && annual <= b.max);
  const effectiveRate = Math.round((monthlyTax / profile.grossMonthly) * 100);

  const monthsToGoal =
    disposable > 0
      ? Math.ceil(
          (profile.primaryGoal.target - profile.primaryGoal.current) /
            disposable,
        )
      : null;

  return (
    <div className="snapshot-page">
      <div className="container">
        {/*    PAGE HEADER    */}
        <div className="snapshot-header">
          <div>
            <span className="hand-note">📋 Your reality check</span>
            <h1>Money Snapshot</h1>
            <p>
              Your financial baseline is where you stand today against where you
              want to be.
            </p>
          </div>
          <button
            className={`btn ${editMode ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setEditMode((e) => !e)}
          >
            {editMode ? "✓ Save Changes" : "✎ Edit My Numbers"}
          </button>
        </div>

        {/*    VISION BANNER    */}
        <div className="vision-banner card-feature">
          <div className="vision-banner-inner">
            <div>
              <span
                style={{
                  opacity: 0.8,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Your Active Vision
              </span>
              <div className="vision-title">✈ Global Citizen Vision</div>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "0.9rem",
                  marginTop: "0.25rem",
                }}
              >
                Building offshore wealth, maximising TFSA & RA, creating
                location-independent income.
              </p>
            </div>
            <div className="vision-goal-progress">
              <div className="goal-ring-wrapper">
                <svg viewBox="0 0 100 100" className="goal-ring-svg">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${goalProgress * 2.639} 263.9`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="goal-ring-label">
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      fontFamily: "var(--font-serif)",
                    }}
                  >
                    {goalProgress}%
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      opacity: 0.8,
                      textTransform: "uppercase",
                    }}
                  >
                    of goal
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  {profile.primaryGoal.name}
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  {formatZAR(profile.primaryGoal.current)}{" "}
                  <span style={{ opacity: 0.6, fontSize: "0.8rem" }}>
                    / {formatZAR(profile.primaryGoal.target)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*    TABS    */}
        <div className="snapshot-tabs">
          {["overview", "income", "spending", "savings"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/*    OVERVIEW TAB    */}
        {activeTab === "overview" && (
          <div className="tab-content">
            {/* Key metrics row */}
            <div className="metrics-grid">
              {[
                {
                  label: "Gross Monthly Income",
                  value: formatZAR(profile.grossMonthly),
                  sub: `R${((profile.grossMonthly * 12) / 1000).toFixed(0)}k per year`,
                  color: "var(--text-primary)",
                  tooltip: "Your salary before any deductions or tax.",
                },
                {
                  label: "Estimated PAYE Tax",
                  value: formatZAR(monthlyTax),
                  sub: `${effectiveRate}% effective rate`,
                  color: "var(--absa-red)",
                  tooltip: `Calculated using SARS 2024/25 tax brackets. Annual income of ${formatZAR(annual)} puts you in the ${bracket ? Math.round(bracket.rate * 100) : 0}% marginal bracket.`,
                },
                {
                  label: "Take-Home Pay",
                  value: formatZAR(takeHome),
                  sub: "After tax & UIF",
                  color: "var(--gold)",
                  tooltip:
                    "Your gross income minus PAYE tax and UIF contributions (1% up to monthly ceiling).",
                },
                {
                  label: "Monthly Disposable",
                  value: formatZAR(disposable),
                  sub: "After all spending",
                  color: disposable > 0 ? "var(--sage)" : "var(--absa-red)",
                  tooltip:
                    "Take-home pay minus all your fixed and variable costs. This is what you have left to save and invest.",
                },
              ].map((m) => (
                <div key={m.label} className="metric-card card-pinned">
                  <div className="metric-label">
                    {m.label}
                    <Tooltip text={m.tooltip} />
                  </div>
                  <div className="metric-value" style={{ color: m.color }}>
                    {m.value}
                  </div>
                  <div className="metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Income flow visual */}
            <div className="income-flow card">
              <h4 style={{ marginBottom: "1.25rem" }}>
                Where your income goes
              </h4>
              <div className="flow-bar">
                {[
                  {
                    label: "Tax & UIF",
                    val: monthlyTax,
                    color: "var(--absa-red)",
                  },
                  {
                    label: "Fixed Costs",
                    val: totalFixed,
                    color: "var(--mid-brown)",
                  },
                  {
                    label: "Variable",
                    val: totalVariable,
                    color: "var(--gold)",
                  },
                  {
                    label: "Disposable",
                    val: Math.max(0, disposable),
                    color: "var(--sage)",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flow-segment"
                    style={{
                      flex: item.val / profile.grossMonthly,
                      background: item.color,
                    }}
                    title={`${item.label}: ${formatZAR(item.val)}`}
                  />
                ))}
              </div>
              <div className="flow-legend">
                {[
                  {
                    label: "Tax & UIF",
                    val: monthlyTax,
                    color: "var(--absa-red)",
                  },
                  {
                    label: "Fixed Costs",
                    val: totalFixed,
                    color: "var(--mid-brown)",
                  },
                  {
                    label: "Variable Spending",
                    val: totalVariable,
                    color: "var(--gold)",
                  },
                  {
                    label: "Disposable",
                    val: Math.max(0, disposable),
                    color: "var(--sage)",
                  },
                ].map((item) => (
                  <div key={item.label} className="flow-legend-item">
                    <span
                      className="legend-dot"
                      style={{ background: item.color }}
                    />
                    <span className="legend-label">{item.label}</span>
                    <span className="legend-val">{formatZAR(item.val)}</span>
                    <span className="legend-pct">
                      ({Math.round((item.val / profile.grossMonthly) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Snapshot insights */}
            <div className="insights-grid">
              <div className="card-gold insight-card">
                <div className="insight-icon">💡</div>
                <div>
                  <h4>Vision Timeline</h4>
                  <p style={{ marginTop: "0.3rem" }}>
                    {monthsToGoal !== null && monthsToGoal > 0
                      ? `At your current disposable income of ${formatZAR(disposable)}/month, you could reach your ${profile.primaryGoal.name} in approximately ${monthsToGoal} months (${Math.ceil(monthsToGoal / 12)} years).`
                      : "Adjust your spending to free up more disposable income toward your goal."}
                  </p>
                </div>
              </div>
              <div className="card-torn insight-card">
                <div className="insight-icon">📊</div>
                <div>
                  <h4>SARS Tax Bracket</h4>
                  <p style={{ marginTop: "0.3rem" }}>
                    Your annual income of {formatZAR(annual)} places you in the{" "}
                    <strong>
                      {bracket ? Math.round(bracket.rate * 100) : 0}% marginal
                      tax bracket
                    </strong>
                    . Consider maximising your RA contributions (up to 27.5% of
                    taxable income) to reduce this.
                  </p>
                </div>
              </div>
              <div className="card-torn insight-card">
                <div className="insight-icon">🎯</div>
                <div>
                  <h4>Spending Ratio</h4>
                  <p style={{ marginTop: "0.3rem" }}>
                    You are spending{" "}
                    <strong>
                      {Math.round((totalSpending / takeHome) * 100)}% of your
                      take-home pay
                    </strong>
                    . Financial planners recommend keeping total spending below
                    80% to build meaningful wealth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*    INCOME TAB    */}
        {activeTab === "income" && (
          <div className="tab-content">
            <div className="grid-2">
              <div className="card">
                <h4 style={{ marginBottom: "1.25rem" }}>
                  Income Inputs
                  {!editMode && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ marginLeft: "0.75rem" }}
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </button>
                  )}
                </h4>
                <AmountInput
                  label="Gross Monthly Salary"
                  value={profile.grossMonthly}
                  onChange={(v) => updateProfile({ grossMonthly: v })}
                  tooltip="Your total salary before any deductions."
                />
                <AmountInput
                  label="Current Offshore Savings"
                  value={profile.savings.offshore}
                  onChange={(v) => updateNested("savings", "offshore", v)}
                  tooltip="Money you currently have in offshore investment accounts."
                />
                <AmountInput
                  label="Local Investments"
                  value={profile.savings.localInvestments}
                  onChange={(v) =>
                    updateNested("savings", "localInvestments", v)
                  }
                  tooltip="JSE unit trusts, ETFs, or similar local investments."
                />
              </div>

              <div className="card">
                <h4 style={{ marginBottom: "1.25rem" }}>SARS Tax Breakdown</h4>
                <div className="tax-breakdown">
                  <div className="tax-row">
                    <span>Gross Annual Income</span>
                    <strong>{formatZAR(profile.grossMonthly * 12)}</strong>
                  </div>
                  <div className="tax-row">
                    <span>Marginal Tax Rate</span>
                    <strong>
                      {bracket ? Math.round(bracket.rate * 100) : 0}%
                    </strong>
                  </div>
                  <div className="tax-row">
                    <span>Annual PAYE (before rebate)</span>
                    <strong>
                      {formatZAR(
                        (monthlyTax -
                          Math.min(profile.grossMonthly, 17712) * 0.01) *
                          12,
                      )}
                    </strong>
                  </div>
                  <div className="tax-row">
                    <span>Primary Rebate (2024/25)</span>
                    <strong>− R 17,235</strong>
                  </div>
                  <div className="tax-row">
                    <span>UIF Contribution (1%)</span>
                    <strong>
                      {formatZAR(Math.min(profile.grossMonthly, 17712) * 0.01)}
                      /mo
                    </strong>
                  </div>
                  <div className="tax-row tax-row-total">
                    <span>Monthly Tax + UIF Deduction</span>
                    <strong style={{ color: "var(--absa-red)" }}>
                      {formatZAR(monthlyTax)}
                    </strong>
                  </div>
                  <div className="tax-row tax-row-total">
                    <span>Monthly Take-Home Pay</span>
                    <strong style={{ color: "var(--sage)" }}>
                      {formatZAR(takeHome)}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "var(--cream-dark)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <p style={{ fontSize: "0.82rem", lineHeight: "1.6" }}>
                    <strong>RA Tax Tip:</strong> Contributing to a Retirement
                    Annuity reduces your taxable income. At your bracket, every
                    R1,000 you contribute saves approximately{" "}
                    <strong>
                      R{bracket ? Math.round(bracket.rate * 1000) : 0} in tax
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*    SPENDING TAB    */}
        {activeTab === "spending" && (
          <div className="tab-content">
            <div className="grid-2">
              <div className="card">
                <h4 style={{ marginBottom: "1.25rem" }}>
                  Fixed Monthly Costs
                  <Tooltip text="Fixed costs are amounts that stay roughly the same every month such as: rent, insurance, loan repayments." />
                </h4>
                {Object.entries(profile.fixedCosts).map(([key, val]) => (
                  <AmountInput
                    key={key}
                    label={formatKey(key)}
                    value={val}
                    onChange={(v) => updateNested("fixedCosts", key, v)}
                  />
                ))}
                <div className="spend-total">
                  <span>Total Fixed</span>
                  <strong>{formatZAR(totalFixed)}</strong>
                </div>
              </div>

              <div className="card">
                <h4 style={{ marginBottom: "1.25rem" }}>
                  Variable Monthly Spending
                  <Tooltip text="Variable costs change month to month such as: dining, shopping, entertainment. These are where most wealth-leakage happens." />
                </h4>
                {Object.entries(profile.variableSpending).map(([key, val]) => (
                  <AmountInput
                    key={key}
                    label={formatKey(key)}
                    value={val}
                    onChange={(v) => updateNested("variableSpending", key, v)}
                  />
                ))}
                <div className="spend-total">
                  <span>Total Variable</span>
                  <strong>{formatZAR(totalVariable)}</strong>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: "1.5rem" }}>
              <h4 style={{ marginBottom: "1.25rem" }}>Spending Breakdown</h4>
              <SpendBar
                categories={{
                  ...profile.fixedCosts,
                  ...profile.variableSpending,
                }}
                total={totalSpending}
              />
              <div className="spend-summary">
                <div className="spend-summary-item">
                  <span>Total Spending</span>
                  <strong>{formatZAR(totalSpending)}</strong>
                </div>
                <div className="spend-summary-item">
                  <span>% of Take-Home</span>
                  <strong
                    style={{
                      color:
                        totalSpending / takeHome > 0.8
                          ? "var(--absa-red)"
                          : "var(--sage)",
                    }}
                  >
                    {Math.round((totalSpending / takeHome) * 100)}%
                  </strong>
                </div>
                <div className="spend-summary-item">
                  <span>Remaining (Disposable)</span>
                  <strong
                    style={{
                      color: disposable > 0 ? "var(--sage)" : "var(--absa-red)",
                    }}
                  >
                    {formatZAR(disposable)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*    SAVINGS TAB    */}
        {activeTab === "savings" && (
          <div className="tab-content">
            <div className="grid-2">
              <div className="card">
                <h4 style={{ marginBottom: "1.25rem" }}>
                  Current Savings & Investments
                </h4>
                {[
                  {
                    key: "emergencyFund",
                    label: "Emergency Fund",
                    tooltip:
                      "3–6 months of expenses saved in a liquid account. This is your financial safety net.",
                  },
                  {
                    key: "tfsa",
                    label: "Tax-Free Savings Account (TFSA)",
                    tooltip:
                      "Annual contribution limit: R46,000 (from 1 March 2026). Lifetime limit: R500,000. All growth, interest and dividends are tax-free.",
                  },
                  {
                    key: "ra",
                    label: "Retirement Annuity (RA)",
                    tooltip:
                      "Contributions up to 27.5% of taxable income are tax-deductible. Accessible from age 55.",
                  },
                  {
                    key: "offshore",
                    label: "Offshore Investments",
                    tooltip:
                      "South Africans can invest up to R1.1 million offshore per year via the discretionary allowance, or R10 million with SARB approval.",
                  },
                  {
                    key: "localInvestments",
                    label: "Local Investments (ETFs/Unit Trusts)",
                    tooltip:
                      "JSE-listed investments including ETFs tracking the All Share Index or specific sectors.",
                  },
                ].map(({ key, label, tooltip }) => (
                  <AmountInput
                    key={key}
                    label={label}
                    value={profile.savings[key]}
                    onChange={(v) => updateNested("savings", key, v)}
                    tooltip={tooltip}
                  />
                ))}
              </div>

              <div>
                <div
                  className="card-gold"
                  style={{
                    padding: "1.5rem",
                    borderRadius: "var(--radius-lg)",
                    marginBottom: "1rem",
                  }}
                >
                  <h4 style={{ marginBottom: "1rem" }}>
                    Total Net Worth Snapshot
                  </h4>
                  <div className="networth-total">
                    {formatZARShort(totalSavings)}
                  </div>
                  <p style={{ fontSize: "0.82rem", marginTop: "0.5rem" }}>
                    Total across all savings vehicles. This excludes property
                    equity and retirement fund employer contributions.
                  </p>
                  <div className="savings-breakdown">
                    {Object.entries(profile.savings).map(([key, val]) => (
                      <div key={key} className="savings-row">
                        <span>{formatKey(key)}</span>
                        <span>{formatZAR(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="card-torn"
                  style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <h4 style={{ marginBottom: "0.75rem" }}>TFSA Status</h4>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <div
                      className="flex-between"
                      style={{ marginBottom: "0.3rem" }}
                    >
                      <span
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Annual limit used
                      </span>
                      <span style={{ fontSize: "0.82rem", fontWeight: "600" }}>
                        {formatZAR(profile.savings.tfsa)} / R 46,000
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(100, (profile.savings.tfsa / 46000) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: "0.8rem", marginTop: "0.75rem" }}>
                    {profile.savings.tfsa < 46000
                      ? `You have R${formatZAR(46000 - profile.savings.tfsa)} left in TFSA contributions this tax year. Any unused allowance is lost. You should consider topping up before 28 February.`
                      : `You have maxed out your TFSA for this tax year. Well done!`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*    NEXT STEPS    */}
        <div className="snapshot-next">
          <h4>Next steps based on your snapshot</h4>
          <div className="next-steps-grid">
            <Link to="/tracks/global-citizen" className="next-card card-pinned">
              <span className="next-icon">◈</span>
              <div>
                <div className="next-title">View Your Vision Track</div>
                <div className="next-sub">
                  See your Global Citizen milestones & progress
                </div>
              </div>
              <span className="next-arrow">→</span>
            </Link>
            <Link to="/studio/car-comparison" className="next-card card-pinned">
              <span className="next-icon">⚗</span>
              <div>
                <div className="next-title">Try the Car Studio</div>
                <div className="next-sub">
                  See how your car decision impacts your wealth
                </div>
              </div>
              <span className="next-arrow">→</span>
            </Link>
            <Link to="/learn" className="next-card card-pinned">
              <span className="next-icon">✦</span>
              <div>
                <div className="next-title">Learn: TFSA vs RA</div>
                <div className="next-sub">
                  Understand which to prioritise first
                </div>
              </div>
              <span className="next-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

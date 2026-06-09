import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/UserProfileContext";
import { formatZAR, formatZARShort, futureValue } from "../utils/finance";
import "./OffshoreStudio.css";

// Local vs Offshore Allocation Studio
// Models the impact of different portfolio splits on 5-year wealth
// Accounts for Rand depreciation, local vs global returns, and SA tax context
// Uses exact same Slider + tab pattern as CarStudio and RentVsBuyStudio

const DEFAULTS = {
  monthlyInvestment: 5000,
  currentPortfolio: 50000,
  offshorePct: 40, // % allocated offshore, rest is local
  localReturn: 0.1, // JSE average ~10% p.a.
  offshoreReturnUSD: 0.11, // S&P 500 USD ~11% p.a. long-term
  randDepreciation: 0.07, // ZAR weakens ~7% p.a. vs USD historically
  zarPerUSD: 18.5, // starting exchange rate
  inflationSA: 0.055, // SA CPI ~5.5%
  timeHorizon: 5,
};

// Reuse exact Slider from CarStudio / RentVsBuyStudio
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  tooltip,
}) {
  return (
    <div className="studio-slider-group">
      <div className="studio-slider-header">
        <label className="form-label">{label}</label>
        <span className="studio-slider-val">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        className="range-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
      <div className="studio-slider-range">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
      {tooltip && <p className="studio-tooltip-text">{tooltip}</p>}
    </div>
  );
}

// Currency risk label based on offshore %
function riskLabel(pct) {
  if (pct <= 20)
    return {
      label: "Low Currency Diversification",
      color: "var(--absa-red)",
      icon: "🔴",
    };
  if (pct <= 45)
    return { label: "Balanced Allocation", color: "var(--sage)", icon: "🟢" };
  if (pct <= 65)
    return {
      label: "Offshore-Leaning",
      color: "var(--dusty-blue)",
      icon: "🔵",
    };
  return {
    label: "High Offshore Concentration",
    color: "var(--gold)",
    icon: "🟡",
  };
}

export default function OffshoreStudio() {
  const { profile, takeHome } = useProfile();
  const [inputs, setInputs] = useState({
    ...DEFAULTS,
    // Pre-fill from profile if they have investments
    currentPortfolio: Math.max(
      DEFAULTS.currentPortfolio,
      (profile.savings.localInvestments || 0) + (profile.savings.tfsa || 0),
    ),
    monthlyInvestment: Math.max(2000, Math.round(takeHome * 0.1)),
  });
  const [activeTab, setActiveTab] = useState("allocation");

  function set(key) {
    return (v) => setInputs((prev) => ({ ...prev, [key]: v }));
  }

  //      ALL CALCULATIONS     
  const results = useMemo(() => {
    const {
      monthlyInvestment,
      currentPortfolio,
      offshorePct,
      localReturn,
      offshoreReturnUSD,
      randDepreciation,
      zarPerUSD,
      inflationSA,
      timeHorizon,
    } = inputs;

    const localPct = 100 - offshorePct;
    const years = timeHorizon;

    // Split current portfolio and monthly contributions
    const localPrincipal = currentPortfolio * (localPct / 100);
    const offshorePrincipal = currentPortfolio * (offshorePct / 100);
    const localMonthly = monthlyInvestment * (localPct / 100);
    const offshoreMonthly = monthlyInvestment * (offshorePct / 100);

    //      LOCAL PORTFOLIO     
    // Grows at localReturn in ZAR
    const localFV = futureValue(
      localPrincipal,
      localMonthly,
      localReturn,
      years,
    );

    //      OFFSHORE PORTFOLIO     
    // Grows at offshoreReturnUSD in USD
    // Convert contributions to USD at current rate
    const offshorePrincipalUSD = offshorePrincipal / zarPerUSD;
    const offshoreMonthlyUSD = offshoreMonthly / zarPerUSD;
    const offshoreFV_USD = futureValue(
      offshorePrincipalUSD,
      offshoreMonthlyUSD,
      offshoreReturnUSD,
      years,
    );

    // Convert back to ZAR at depreciated rate
    const zarPerUSDEnd = zarPerUSD * Math.pow(1 + randDepreciation, years);
    const offshoreFV_ZAR = offshoreFV_USD * zarPerUSDEnd;

    // Total portfolio value in ZAR
    const totalFV = localFV + offshoreFV_ZAR;

    //      COMPARISONS: 100% local vs 100% offshore     
    const fullyLocalFV = futureValue(
      currentPortfolio,
      monthlyInvestment,
      localReturn,
      years,
    );
    const fullyOffshoreUSD = futureValue(
      currentPortfolio / zarPerUSD,
      monthlyInvestment / zarPerUSD,
      offshoreReturnUSD,
      years,
    );
    const fullyOffshoreFV = fullyOffshoreUSD * zarPerUSDEnd;

    // Real value (inflation-adjusted)
    const realValue = totalFV / Math.pow(1 + inflationSA, years);
    const realLocalFV = fullyLocalFV / Math.pow(1 + inflationSA, years);

    // Total contributed
    const totalContributed = currentPortfolio + monthlyInvestment * 12 * years;
    const totalGrowth = totalFV - totalContributed;

    // Rand depreciation impact how much extra ZAR the offshore portion gives
    const offshoreWithoutDepreciation = futureValue(
      offshorePrincipal,
      offshoreMonthly,
      offshoreReturnUSD,
      years,
    );
    const randBoost = offshoreFV_ZAR - offshoreWithoutDepreciation;

    // Year-by-year data for the timeline chart (simplified every year)
    const yearData = Array.from({ length: years + 1 }, (_, y) => {
      const zarEnd_y = zarPerUSD * Math.pow(1 + randDepreciation, y);
      const loc = futureValue(localPrincipal, localMonthly, localReturn, y);
      const offUSD = futureValue(
        offshorePrincipalUSD,
        offshoreMonthlyUSD,
        offshoreReturnUSD,
        y,
      );
      const off = offUSD * zarEnd_y;
      const fullLoc = futureValue(
        currentPortfolio,
        monthlyInvestment,
        localReturn,
        y,
      );
      const fullOffUSD = futureValue(
        currentPortfolio / zarPerUSD,
        monthlyInvestment / zarPerUSD,
        offshoreReturnUSD,
        y,
      );
      const fullOff = fullOffUSD * zarEnd_y;
      return {
        year: y,
        local: loc,
        offshore: off,
        total: loc + off,
        fullyLocal: fullLoc,
        fullyOffshore: fullOff,
      };
    });

    // Optimal offshore % (brute force 0–100 to find max total FV)
    let optimalPct = 0;
    let optimalFV = 0;
    for (let pct = 0; pct <= 100; pct += 5) {
      const lp = currentPortfolio * ((100 - pct) / 100);
      const op = currentPortfolio * (pct / 100);
      const lm = monthlyInvestment * ((100 - pct) / 100);
      const om = monthlyInvestment * (pct / 100);
      const lFV = futureValue(lp, lm, localReturn, years);
      const oFV =
        futureValue(op / zarPerUSD, om / zarPerUSD, offshoreReturnUSD, years) *
        zarPerUSDEnd;
      const tFV = lFV + oFV;
      if (tFV > optimalFV) {
        optimalFV = tFV;
        optimalPct = pct;
      }
    }

    return {
      localFV,
      offshoreFV_ZAR,
      offshoreFV_USD,
      totalFV,
      fullyLocalFV,
      fullyOffshoreFV,
      realValue,
      realLocalFV,
      totalContributed,
      totalGrowth,
      zarPerUSDEnd,
      randBoost,
      yearData,
      optimalPct,
      optimalFV,
      localPct,
      offshorePct,
    };
  }, [inputs]);

  const risk = riskLabel(inputs.offshorePct);

  // Max value for the bar chart
  const maxBarValue = Math.max(
    results.fullyLocalFV,
    results.fullyOffshoreFV,
    results.totalFV,
    1,
  );

  // Verdict
  const mixBeatsLocal = results.totalFV > results.fullyLocalFV;
  const mixBeatsOffshore = results.totalFV > results.fullyOffshoreFV;

  let verdictLabel, verdictColor, verdictText;
  if (inputs.offshorePct === results.optimalPct) {
    verdictLabel = "🎯 Optimal Allocation";
    verdictColor = "var(--sage)";
    verdictText = `Your current ${inputs.offshorePct}% offshore split is the optimal allocation for these assumptions, producing ${formatZARShort(results.totalFV)} after ${inputs.timeHorizon} years.`;
  } else if (inputs.offshorePct < 20) {
    verdictLabel = "Too Local, Add Offshore Exposure";
    verdictColor = "var(--absa-red)";
    verdictText = `With only ${inputs.offshorePct}% offshore, you have almost no protection against Rand depreciation. The Rand has weakened ~7% p.a. vs USD over the last decade. Moving to ${results.optimalPct}% offshore could add ${formatZARShort(results.optimalFV - results.totalFV)} to your portfolio over ${inputs.timeHorizon} years.`;
  } else if (inputs.offshorePct > 75) {
    verdictLabel = "Heavy Offshore Concentration";
    verdictColor = "var(--gold)";
    verdictText = `At ${inputs.offshorePct}% offshore, you have significant USD exposure. This maximises Rand depreciation gains but concentrates political and currency risk. The SA R1.1M annual discretionary allowance may also limit how quickly you can build this position.`;
  } else {
    verdictLabel = mixBeatsLocal ? "✓ Healthy Mix" : "Adjust Your Split";
    verdictColor = mixBeatsLocal ? "var(--dusty-blue)" : "var(--gold)";
    verdictText = mixBeatsLocal
      ? `Your ${inputs.offshorePct}/${100 - inputs.offshorePct} offshore/local split produces ${formatZARShort(results.totalFV - results.fullyLocalFV)} more than a fully local portfolio over ${inputs.timeHorizon} years. The Rand depreciation of ${Math.round(inputs.randDepreciation * 100)}% p.a. is doing meaningful work here.`
      : `Your current split produces ${formatZARShort(results.totalFV)}. Try moving toward ${results.optimalPct}% offshore to maximise returns given these market assumptions.`;
  }

  return (
    <div className="offshore-studio-page">
      <div className="container">
        {/*      HEADER      */}
        <div className="studio-header">
          <Link to="/studio" className="back-link">
            ← All Studios
          </Link>
          <div className="studio-title-row">
            <div>
              <span className="hand-note">⚗ Simulation Studio</span>
              <h1>Local vs Offshore Allocation</h1>
              <p className="studio-subtitle">
                How much of your portfolio should be offshore? The Rand has
                depreciated ~7% p.a. against the USD over the last decade. This
                studio shows you exactly how different local/offshore splits
                affect your real wealth and finds your optimal allocation.
              </p>
            </div>
            <div className="studio-badge">
              <div className="badge badge-red">🇿🇦 SA Currency Context</div>
            </div>
          </div>
        </div>

        {/* ALLOCATION CONTROL  the hero of this studio!*/}
        <div className="offshore-hero-control card">
          <div className="offshore-hero-top">
            <div>
              <div className="offshore-hero-label hand-note">
                Your Allocation Split
              </div>
              <div className="offshore-split-display">
                <span
                  className="offshore-local-pct"
                  style={{ color: "var(--absa-red)" }}
                >
                  {100 - inputs.offshorePct}% Local
                </span>
                <span className="offshore-divider">/</span>
                <span
                  className="offshore-pct"
                  style={{ color: "var(--dusty-blue)" }}
                >
                  {inputs.offshorePct}% Offshore
                </span>
              </div>
            </div>
            <div
              className={`risk-badge risk-badge-inline`}
              style={{ background: risk.color, color: "white" }}
            >
              {risk.icon} {risk.label}
            </div>
          </div>

          {/* Big allocation slider */}
          <div className="offshore-alloc-slider-wrap">
            <div className="offshore-alloc-labels">
              <span>100% Local (JSE only)</span>
              <span>Optimal: {results.optimalPct}% offshore</span>
              <span>100% Offshore (USD)</span>
            </div>
            <div className="offshore-alloc-track-wrap">
              {/* Optimal zone highlight */}
              <div
                className="offshore-optimal-zone"
                style={{
                  left: `${Math.max(25, results.optimalPct - 15)}%`,
                  width: "16%",
                }}
                aria-hidden="true"
              />
              <input
                type="range"
                className="range-slider offshore-main-slider"
                min={0}
                max={100}
                step={5}
                value={inputs.offshorePct}
                onChange={(e) => set("offshorePct")(Number(e.target.value))}
                aria-label="Offshore allocation percentage"
              />
            </div>
          </div>

          {/* Live result cards */}
          <div className="offshore-live-results">
            <div className="offshore-live-card">
              <div className="offshore-live-label">
                Local portfolio ({100 - inputs.offshorePct}%)
              </div>
              <div
                className="offshore-live-value"
                style={{ color: "var(--absa-red)" }}
              >
                {formatZARShort(results.localFV)}
              </div>
              <div className="offshore-live-sub">
                JSE at {Math.round(inputs.localReturn * 100)}% p.a.
              </div>
            </div>
            <div className="offshore-live-card">
              <div className="offshore-live-label">
                Offshore portion ({inputs.offshorePct}%)
              </div>
              <div
                className="offshore-live-value"
                style={{ color: "var(--dusty-blue)" }}
              >
                {formatZARShort(results.offshoreFV_ZAR)}
              </div>
              <div className="offshore-live-sub">
                USD at {Math.round(inputs.offshoreReturnUSD * 100)}% + Rand
                boost
              </div>
            </div>
            <div className="offshore-live-card offshore-live-total">
              <div className="offshore-live-label">Total portfolio value</div>
              <div
                className="offshore-live-value"
                style={{ color: "var(--gold)" }}
              >
                {formatZARShort(results.totalFV)}
              </div>
              <div className="offshore-live-sub">
                After {inputs.timeHorizon} years in ZAR
              </div>
            </div>
            <div className="offshore-live-card">
              <div className="offshore-live-label">Rand depreciation boost</div>
              <div
                className="offshore-live-value"
                style={{ color: "var(--sage)" }}
              >
                +{formatZARShort(Math.max(0, results.randBoost))}
              </div>
              <div className="offshore-live-sub">
                Extra ZAR from weaker Rand
              </div>
            </div>
          </div>
        </div>

        <div className="studio-layout">
          {/*      LEFT: INPUTS      */}
          <div className="studio-inputs">
            <div className="input-tabs">
              {["allocation", "returns", "currency"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "tab-active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "allocation"
                    ? "📊 Portfolio"
                    : tab === "returns"
                      ? "📈 Returns"
                      : "💱 Currency"}
                </button>
              ))}
            </div>

            {activeTab === "allocation" && (
              <div className="input-panel card">
                <h4 style={{ marginBottom: "1.25rem" }}>📊 Your Portfolio</h4>
                <Slider
                  label="Monthly Investment"
                  value={inputs.monthlyInvestment}
                  min={500}
                  max={50000}
                  step={500}
                  onChange={set("monthlyInvestment")}
                  format={formatZAR}
                  tooltip="How much you invest each month across both local and offshore. This is split according to your allocation percentage above."
                />
                <Slider
                  label="Current Portfolio Value"
                  value={inputs.currentPortfolio}
                  min={0}
                  max={2000000}
                  step={10000}
                  onChange={set("currentPortfolio")}
                  format={(v) => formatZARShort(v)}
                  tooltip="Your current total invested assets including: TFSA, RA, ETFs, offshore investments. Pre-filled from your Snapshot if available."
                />
                <Slider
                  label="Offshore Allocation"
                  value={inputs.offshorePct}
                  min={0}
                  max={100}
                  step={5}
                  onChange={set("offshorePct")}
                  format={(v) => `${v}%`}
                  tooltip="What % of your monthly investment goes offshore (USD-denominated). 40–60% is commonly recommended for SA investors."
                />
                <Slider
                  label="Time Horizon"
                  value={inputs.timeHorizon}
                  min={1}
                  max={20}
                  step={1}
                  onChange={set("timeHorizon")}
                  format={(v) => `${v} years`}
                  tooltip="How many years to project. The Rand depreciation effect compounds significantly over longer periods."
                />
              </div>
            )}

            {activeTab === "returns" && (
              <div className="input-panel card">
                <h4 style={{ marginBottom: "1.25rem" }}>
                  📈 Return Assumptions
                </h4>
                <Slider
                  label="Local Return (JSE) p.a."
                  value={Math.round(inputs.localReturn * 100)}
                  min={4}
                  max={18}
                  step={1}
                  onChange={(v) => set("localReturn")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="JSE All Share has returned approximately 10–12% p.a. over 20 years in nominal ZAR terms. After inflation (~5.5%), real return is ~5–6%."
                />
                <Slider
                  label="Offshore Return (USD) p.a."
                  value={Math.round(inputs.offshoreReturnUSD * 100)}
                  min={4}
                  max={18}
                  step={1}
                  onChange={(v) => set("offshoreReturnUSD")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="S&P 500 has returned ~11% p.a. in USD over 30 years. Global ETF (MSCI World): ~9–10% p.a. Conservative global assumption: 8% p.a."
                />
                <Slider
                  label="SA Inflation (p.a.)"
                  value={Math.round(inputs.inflationSA * 100)}
                  min={3}
                  max={12}
                  step={0.5}
                  onChange={(v) => set("inflationSA")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="SA CPI has averaged 5–6% p.a. recently. Used to calculate the real (inflation-adjusted) value of your portfolio at the end."
                />

                <div
                  className="card-torn"
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    marginTop: "1rem",
                  }}
                >
                  <h4 style={{ fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                    Real vs Nominal Returns
                  </h4>
                  <p
                    style={{
                      fontSize: "0.79rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    At {Math.round(inputs.localReturn * 100)}% nominal local
                    return and {Math.round(inputs.inflationSA * 100)}%
                    inflation, your real local return is approximately{" "}
                    <strong>
                      {Math.round(
                        (inputs.localReturn - inputs.inflationSA) * 100,
                      )}
                      % p.a.
                    </strong>{" "}
                    Your portfolio value of {formatZARShort(results.totalFV)} in{" "}
                    {inputs.timeHorizon} years has a real purchasing power of
                    approximately{" "}
                    <strong>{formatZARShort(results.realValue)}</strong> in
                    today's Rands.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "currency" && (
              <div className="input-panel card">
                <h4 style={{ marginBottom: "1.25rem" }}>💱 Rand / USD</h4>
                <Slider
                  label="Current ZAR/USD Rate"
                  value={inputs.zarPerUSD}
                  min={10}
                  max={30}
                  step={0.5}
                  onChange={set("zarPerUSD")}
                  format={(v) => `R${v}`}
                  tooltip="Current exchange rate (ZAR per 1 USD). Approximate current rate: R18.50–R19.50. Adjust to match the rate when you start investing."
                />
                <Slider
                  label="Annual Rand Depreciation"
                  value={Math.round(inputs.randDepreciation * 100)}
                  min={0}
                  max={15}
                  step={1}
                  onChange={(v) => set("randDepreciation")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="The Rand has weakened approximately 7% p.a. against the USD over the past 10 years. Set to 0% to see pure investment return difference without currency effect."
                />

                <div
                  className="offshore-currency-preview card-torn"
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                    Projected Exchange Rate
                  </h4>
                  <div className="offshore-fx-timeline">
                    {[0, 1, 2, 3, inputs.timeHorizon]
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .map((y) => (
                        <div key={y} className="offshore-fx-row">
                          <span className="offshore-fx-year">Year {y}</span>
                          <div
                            className="progress-bar-track"
                            style={{ flex: 1 }}
                          >
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${Math.min(100, ((inputs.zarPerUSD * Math.pow(1 + inputs.randDepreciation, y)) / (inputs.zarPerUSD * Math.pow(1 + inputs.randDepreciation, inputs.timeHorizon))) * 100)}%`,
                                background: "var(--dusty-blue)",
                              }}
                            />
                          </div>
                          <span className="offshore-fx-rate">
                            R
                            {(
                              inputs.zarPerUSD *
                              Math.pow(1 + inputs.randDepreciation, y)
                            ).toFixed(1)}
                          </span>
                        </div>
                      ))}
                  </div>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      marginTop: "0.75rem",
                    }}
                  >
                    At {Math.round(inputs.randDepreciation * 100)}% p.a.
                    depreciation, R1 USD = R
                    {(
                      inputs.zarPerUSD *
                      Math.pow(1 + inputs.randDepreciation, inputs.timeHorizon)
                    ).toFixed(1)}{" "}
                    in {inputs.timeHorizon} years. Your offshore ZAR returns are
                    boosted by this weakening.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/*      RIGHT: OUTPUTS      */}
          <div className="studio-outputs">
            {/* Comparison bars: this split vs 100% local vs 100% offshore */}
            <div className="card" style={{ padding: "1.25rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "1rem",
                }}
              >
                Portfolio value after {inputs.timeHorizon} years - scenario
                comparison
              </div>
              <div className="output-bar-group">
                <div className="output-bar-row">
                  <span className="output-bar-label">🇿🇦 100% Local</span>
                  <div className="output-bar-track">
                    <div
                      className="output-bar-fill"
                      style={{
                        width: `${(results.fullyLocalFV / maxBarValue) * 100}%`,
                        background: "var(--absa-red)",
                      }}
                    />
                  </div>
                  <span className="output-bar-val">
                    {formatZARShort(results.fullyLocalFV)}
                  </span>
                </div>
                <div className="output-bar-row">
                  <span className="output-bar-label">
                    ⚖ {100 - inputs.offshorePct}/{inputs.offshorePct} split
                  </span>
                  <div className="output-bar-track">
                    <div
                      className="output-bar-fill"
                      style={{
                        width: `${(results.totalFV / maxBarValue) * 100}%`,
                        background: "var(--gold)",
                      }}
                    />
                  </div>
                  <span className="output-bar-val">
                    {formatZARShort(results.totalFV)}
                  </span>
                </div>
                <div className="output-bar-row">
                  <span className="output-bar-label">🌍 100% Offshore</span>
                  <div className="output-bar-track">
                    <div
                      className="output-bar-fill"
                      style={{
                        width: `${(results.fullyOffshoreFV / maxBarValue) * 100}%`,
                        background: "var(--dusty-blue)",
                      }}
                    />
                  </div>
                  <span className="output-bar-val">
                    {formatZARShort(results.fullyOffshoreFV)}
                  </span>
                </div>
              </div>
            </div>

            {/* Year-by-year mini table */}
            <div
              className="card offshore-year-table"
              style={{ padding: "1.25rem", marginTop: "1rem" }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.75rem",
                }}
              >
                Year-by-year portfolio growth
              </div>
              <div className="offshore-table-header">
                <span>Year</span>
                <span>Local portion</span>
                <span>Offshore (ZAR)</span>
                <span>Total</span>
              </div>
              {results.yearData
                .filter((d) => d.year > 0)
                .map((d) => (
                  <div
                    key={d.year}
                    className={`offshore-table-row ${d.year === inputs.timeHorizon ? "offshore-table-final" : ""}`}
                  >
                    <span>Year {d.year}</span>
                    <span style={{ color: "var(--absa-red)" }}>
                      {formatZARShort(d.local)}
                    </span>
                    <span style={{ color: "var(--dusty-blue)" }}>
                      {formatZARShort(d.offshore)}
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--gold)" }}>
                      {formatZARShort(d.total)}
                    </span>
                  </div>
                ))}
            </div>

            {/* Portfolio summary card */}
            <div
              className="card-gold"
              style={{
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                marginTop: "1rem",
              }}
            >
              <div className="monthly-saving-inner">
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Total contributed over {inputs.timeHorizon} years
                  </div>
                  <div className="zar-large">
                    {formatZARShort(results.totalContributed)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Total growth (investment returns)
                  </div>
                  <div
                    className="zar-large"
                    style={{ color: "var(--deep-brown)" }}
                  >
                    +{formatZARShort(results.totalGrowth)}
                  </div>
                </div>
              </div>
              <div className="output-bar-group" style={{ marginTop: "1rem" }}>
                <div className="output-bar-row">
                  <span className="output-bar-label">Contributed</span>
                  <div className="output-bar-track">
                    <div
                      className="output-bar-fill"
                      style={{
                        width: `${(results.totalContributed / results.totalFV) * 100}%`,
                        background: "var(--terracotta)",
                      }}
                    />
                  </div>
                  <span className="output-bar-val">
                    {formatZARShort(results.totalContributed)}
                  </span>
                </div>
                <div className="output-bar-row">
                  <span className="output-bar-label">Growth</span>
                  <div className="output-bar-track">
                    <div
                      className="output-bar-fill"
                      style={{
                        width: `${(results.totalGrowth / results.totalFV) * 100}%`,
                        background: "var(--sage)",
                      }}
                    />
                  </div>
                  <span className="output-bar-val">
                    {formatZARShort(results.totalGrowth)}
                  </span>
                </div>
              </div>
            </div>

            {/* Studio Verdict */}
            <div
              className="studio-verdict card-feature"
              style={{ marginTop: "1rem", borderRadius: "var(--radius-xl)" }}
            >
              <div
                className="verdict-badge"
                style={{ background: verdictColor, color: "white" }}
              >
                Studio Verdict
              </div>
              <h3 style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
                {verdictLabel}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }}>
                {verdictText}
              </p>

              <div
                className="verdict-impact"
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.8,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.5rem",
                  }}
                >
                  Real Value (Inflation-Adjusted)
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "0.88rem",
                  }}
                >
                  In today's purchasing power, your{" "}
                  {formatZARShort(results.totalFV)} portfolio is worth
                  approximately{" "}
                  <strong>{formatZARShort(results.realValue)}</strong> after
                  accounting for {Math.round(inputs.inflationSA * 100)}% SA
                  inflation over {inputs.timeHorizon} years. Always plan in
                  real, not nominal, terms.
                </p>
              </div>
            </div>

            {/* SA Context note */}
            <div
              className="card-torn studio-sa-note offshore-sa-note"
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                marginTop: "1rem",
              }}
            >
              <h4 style={{ fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                🇿🇦 SA Offshore Investment Rules
              </h4>
              <p style={{ fontSize: "0.8rem" }}>
                South African residents have a{" "}
                <strong>
                  R1 million annual single discretionary allowance
                </strong>{" "}
                for offshore investments (no tax clearance required). An
                additional{" "}
                <strong>R10 million foreign capital allowance</strong> is
                available annually with SARS tax clearance. Platforms like
                EasyEquities USD, Sygnia Itrix, and Satrix allow you to invest
                in global ETFs in ZAR with underlying USD exposure.
              </p>
            </div>
          </div>
        </div>

        {/*      KEY CONCEPTS      */}
        <div className="studio-concepts">
          <h3 style={{ marginBottom: "1.25rem" }}>Key Concepts Explained</h3>
          <div className="concepts-grid">
            {[
              {
                icon: "💱",
                title: "Rand Depreciation",
                text: 'The South African Rand has weakened approximately 7% p.a. against the USD over the past 10 years. This means offshore investments earn a ZAR "currency bonus" every year on top of their USD returns. A USD investment returning 11% in a year where the Rand weakens 7% delivers ~18% in ZAR terms.',
              },
              {
                icon: "🌍",
                title: "Discretionary Allowance",
                text: "Every South African adult can send R1 million offshore per year without tax clearance (the single discretionary allowance). An additional R10 million is available with a SARS tax clearance certificate. These limits are annual and reset each calendar year.",
              },
              {
                icon: "⚖",
                title: "Portfolio Diversification",
                text: "Putting all investments in SA concentrates your wealth in a single economy and currency. SA makes up less than 1% of global market capitalisation. A globally diversified portfolio reduces single-country risk and gives exposure to the world's largest companies.",
              },
              {
                icon: "📉",
                title: "Currency Risk",
                text: "Going 100% offshore isn't risk-free either. If the Rand strengthens (as it occasionally does), your offshore returns in ZAR terms can be negative even if the USD investment grew. A balanced local/offshore split smooths out this currency volatility.",
              },
            ].map((c) => (
              <div key={c.title} className="concept-card card-pinned">
                <div className="concept-icon">{c.icon}</div>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                  {c.title}
                </h4>
                <p style={{ fontSize: "0.82rem" }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

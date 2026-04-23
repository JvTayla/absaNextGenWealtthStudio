import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { formatZAR, formatZARShort, futureValue } from "../utils/finance";
import "./CarStudio.css";

// struggled with this at first - the monthly diff was always positive even when used car was more expensive
// fixed by checking monthlyDiff < 0 separately

// useMemo here so it doesnt recalculate on every single render
// learned this the hard way when the sliders were lagging

// SA vehicle finance defaults
const DEFAULTS = {
  luxuryPrice: 620000,
  luxuryDeposit: 10, // % of price
  luxuryFinanceTerm: 60, // months
  luxuryFinanceRate: 0.135, // 11.5% prime + 2% = ~13.5%
  luxuryInsurance: 0.045, // 4.5% of car value p.a.
  luxuryFuelMonthly: 3800,
  luxuryServiceMonthly: 900,

  usedPrice: 185000,
  usedDeposit: 20,
  usedFinanceTerm: 48,
  usedFinanceRate: 0.125, // slightly lower on used
  usedInsurance: 0.035, // 3.5% of car value
  usedFuelMonthly: 2500,
  usedServiceMonthly: 1200, // slightly higher maintenance
  usedMaintenanceMonthly: 1800,
  usedRepairSavings: 800, // monthly amount set aside for repairs (windscreen, bumps, etc.)

  // driver profile
  driverAge: 26,
  yearsLicensed: 3,

  investmentRate: 0.09, // 9% p.a. (realistic SA ETF)
  timeHorizon: 5,
};

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
      />
      <div className="studio-slider-range">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
      {tooltip && <p className="studio-tooltip-text">{tooltip}</p>}
    </div>
  );
}

export default function CarStudio() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [activeTab, setActiveTab] = useState("luxury");

  function set(key) {
    return (v) => setInputs((prev) => ({ ...prev, [key]: v }));
  }

  //    CALCULATIONS
  const results = useMemo(() => {
    // LUXURY CAR
    const luxDeposit = (inputs.luxuryPrice * inputs.luxuryDeposit) / 100;
    const luxLoanAmt = inputs.luxuryPrice - luxDeposit;
    const luxR = inputs.luxuryFinanceRate / 12;
    const luxN = inputs.luxuryFinanceTerm;
    const luxMonthlyPayment =
      luxR === 0
        ? luxLoanAmt / luxN
        : (luxLoanAmt * (luxR * Math.pow(1 + luxR, luxN))) /
          (Math.pow(1 + luxR, luxN) - 1);

    const luxInsuranceMonthly =
      (inputs.luxuryPrice * inputs.luxuryInsurance) / 12;
    const luxTotalMonthly =
      luxMonthlyPayment +
      luxInsuranceMonthly +
      inputs.luxuryFuelMonthly +
      inputs.luxuryServiceMonthly;
    const luxTotalCost =
      luxDeposit +
      luxMonthlyPayment * luxN +
      luxInsuranceMonthly * inputs.timeHorizon * 12 +
      inputs.luxuryFuelMonthly * inputs.timeHorizon * 12 +
      inputs.luxuryServiceMonthly * inputs.timeHorizon * 12;

    // Depreciation: ~40% over 5 years (SA luxury cars lose value fast)
    const luxResaleValue = inputs.luxuryPrice * 0.6;
    const luxNetCost = luxTotalCost - luxResaleValue;

    // USED CAR
    const usedDeposit = (inputs.usedPrice * inputs.usedDeposit) / 100;
    const usedLoanAmt = inputs.usedPrice - usedDeposit;
    const usedR = inputs.usedFinanceRate / 12;
    const usedN = inputs.usedFinanceTerm;
    const usedMonthlyPayment =
      usedR === 0
        ? usedLoanAmt / usedN
        : (usedLoanAmt * (usedR * Math.pow(1 + usedR, usedN))) /
          (Math.pow(1 + usedR, usedN) - 1);

    const usedInsuranceMonthly = (inputs.usedPrice * inputs.usedInsurance) / 12;
    const usedTotalMonthly =
      usedMonthlyPayment +
      usedInsuranceMonthly +
      inputs.usedFuelMonthly +
      inputs.usedServiceMonthly +
      inputs.usedMaintenanceMonthly +
      inputs.usedRepairSavings;

    const usedTotalCost =
      usedDeposit +
      usedMonthlyPayment * usedN +
      usedInsuranceMonthly * inputs.timeHorizon * 12 +
      inputs.usedFuelMonthly * inputs.timeHorizon * 12 +
      inputs.usedServiceMonthly * inputs.timeHorizon * 12;

    const usedResaleValue = inputs.usedPrice * 0.5; // used cars depreciate faster %
    const usedNetCost = usedTotalCost - usedResaleValue;

    // INVESTMENT DIFFERENCE
    const monthlyDiff = luxTotalMonthly - usedTotalMonthly;
    const investmentValue = futureValue(
      0,
      monthlyDiff,
      inputs.investmentRate,
      inputs.timeHorizon,
    );
    const depositDiff = luxDeposit - usedDeposit;
    const totalInvestmentValue = futureValue(
      depositDiff,
      monthlyDiff,
      inputs.investmentRate,
      inputs.timeHorizon,
    );

    const netWorthDiff = totalInvestmentValue - (luxNetCost - usedNetCost);

    return {
      luxMonthlyPayment,
      luxInsuranceMonthly,
      luxTotalMonthly,
      luxTotalCost,
      luxResaleValue,
      luxNetCost,
      luxDeposit,

      usedMonthlyPayment,
      usedInsuranceMonthly,
      usedTotalMonthly,
      usedTotalCost,
      usedResaleValue,
      usedNetCost,
      usedDeposit,

      monthlyDiff,
      investmentValue,
      totalInvestmentValue,
      netWorthDiff,
    };
  }, [inputs]);

  const highMaintenance =
    inputs.usedMaintenanceMonthly > 2000 ||
    inputs.usedMaintenanceMonthly + inputs.usedRepairSavings > 2500;

  const verdict =
    results.monthlyDiff < 0
      ? {
          label: "Get the Luxury Car",
          color: "var(--absa-red)",
          text: `With your inputs, the used car actually costs ${formatZAR(Math.abs(results.monthlyDiff))}/month MORE than the luxury car due to high maintenance and running costs. The luxury car is the smarter financial choice here  ,  newer vehicle, warranty coverage, and lower repair risk.`,
        }
      : results.monthlyDiff < 2000
        ? {
            label: highMaintenance
              ? "Get the Luxury Car"
              : "Luxury Car is Worth Considering",
            color: highMaintenance ? "var(--absa-red)" : "var(--gold)",
            text: highMaintenance
              ? `Your used car maintenance is set at ${formatZAR(inputs.usedMaintenanceMonthly)}/month  - that's high. At this level the luxury car's warranty and lower repair risk make it the more sensible choice financially.`
              : `The monthly saving is only ${formatZAR(results.monthlyDiff)}  ,  a relatively small difference. The luxury car comes with a manufacturer warranty, lower repair risk, and fewer unexpected bills. The peace of mind may be worth the small premium.`,
          }
        : {
            label: "Invest the Difference",
            color: "var(--sage)",
            text: `By choosing the used car and investing the monthly saving of ${formatZAR(results.monthlyDiff)}, you could build ${formatZARShort(results.totalInvestmentValue)} over ${inputs.timeHorizon} years  ,  money that works directly toward your Global Citizen vision.`,
          };
  return (
    <div className="car-studio-page">
      <div className="container">
        {/*    HEADER    */}
        <div className="studio-header">
          <Link to="/studio" className="back-link">
            ← All Studios
          </Link>
          <div className="studio-title-row">
            <div>
              <span className="hand-note">⚗ Simulation Studio</span>
              <h1>Luxury Car vs Affordable Used Car</h1>
              <p className="studio-subtitle">
                One of the most common wealth-destroying decisions young
                professionals make is financing a luxury car too early. This
                studio shows you exactly what each choice costs and what the
                difference could become if invested instead.
              </p>
            </div>
            <div className="studio-badge">
              <div className="badge badge-red">🇿🇦 SA Finance Rates</div>
            </div>
          </div>
        </div>

        <div className="studio-layout">
          {/*    LEFT: INPUTS    */}
          <div className="studio-inputs">
            <div className="input-tabs">
              <button
                className={`tab-btn ${activeTab === "luxury" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("luxury")}
              >
                Luxury Car
              </button>
              <button
                className={`tab-btn ${activeTab === "used" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("used")}
              >
                Used Car
              </button>
              <button
                className={`tab-btn ${activeTab === "invest" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("invest")}
              >
                Investment
              </button>
            </div>

            {activeTab === "luxury" && (
              <div className="input-panel card">
                <h4 style={{ marginBottom: "1.25rem" }}>🚗 Luxury Vehicle</h4>
                <Slider
                  label="Vehicle Price"
                  value={inputs.luxuryPrice}
                  min={400000}
                  max={1200000}
                  step={10000}
                  onChange={set("luxuryPrice")}
                  format={(v) => formatZARShort(v)}
                  tooltip="BMW 3 Series (R620k), Mercedes C-Class (R750k), Audi A4 (R680k) which are all common in this range."
                />
                <Slider
                  label="Deposit"
                  value={inputs.luxuryDeposit}
                  min={0}
                  max={30}
                  step={5}
                  onChange={set("luxuryDeposit")}
                  format={(v) => `${v}%`}
                  tooltip="Finance banks often require 10% deposit on new vehicles."
                />
                <Slider
                  label="Finance Term"
                  value={inputs.luxuryFinanceTerm}
                  min={36}
                  max={72}
                  step={12}
                  onChange={set("luxuryFinanceTerm")}
                  format={(v) => `${v} months`}
                  tooltip="Most SA car finance is structured over 48–72 months."
                />
                <Slider
                  label="Interest Rate (p.a.)"
                  value={Math.round(inputs.luxuryFinanceRate * 100 * 10) / 10}
                  min={11}
                  max={18}
                  step={0.5}
                  onChange={(v) => set("luxuryFinanceRate")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="SA prime rate is currently ~11.25%. Vehicle finance is typically prime + 1.5–3%. Total: ~12.75–14.25%."
                />
                <Slider
                  label="Monthly Fuel"
                  value={inputs.luxuryFuelMonthly}
                  min={1500}
                  max={6000}
                  step={100}
                  onChange={set("luxuryFuelMonthly")}
                  format={formatZAR}
                  tooltip="Larger engine = more fuel. JHB commuter average: R2,500–R4,500/month."
                />
                <div
                  className="driver-profile card-torn"
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    marginTop: "1rem",
                  }}
                >
                  <h4 style={{ fontSize: "0.88rem", marginBottom: "0.75rem" }}>
                    Driver Profile & Insurance Impact
                  </h4>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Your Age</label>
                      <input
                        type="number"
                        className="form-input"
                        value={inputs.driverAge}
                        min={18}
                        max={70}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            driverAge: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Years Licensed</label>
                      <input
                        type="number"
                        className="form-input"
                        value={inputs.yearsLicensed}
                        min={0}
                        max={50}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            yearsLicensed: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div
                    className="insurance-age-note"
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.6rem 0.75rem",
                      background:
                        inputs.driverAge >= 25
                          ? "var(--cream-dark)"
                          : "var(--absa-red-light)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.8rem",
                      color:
                        inputs.driverAge >= 25
                          ? "var(--text-secondary)"
                          : "var(--absa-red-dark)",
                    }}
                  >
                    {inputs.driverAge >= 25
                      ? `✓ At ${inputs.driverAge}, you qualify for lower premiums. Insurers consider under-25s higher risk  - you're past that threshold.`
                      : `⚠ Under 25: expect significantly higher premiums. SA insurers charge 20–40% more for drivers under 25 regardless of license history.`}
                    {inputs.yearsLicensed < 2 && (
                      <div style={{ marginTop: "0.4rem" }}>
                        ⚠ Less than 2 years licensed: insurers will add a
                        further loading to your premium. Consider this in your
                        insurance estimate above.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "used" && (
              <div className="input-panel card">
                <h4 style={{ marginBottom: "1.25rem" }}>
                  🚙 Affordable Used Car
                </h4>
                <Slider
                  label="Vehicle Price"
                  value={inputs.usedPrice}
                  min={80000}
                  max={350000}
                  step={5000}
                  onChange={set("usedPrice")}
                  format={(v) => formatZARShort(v)}
                  tooltip="Well-maintained Toyota Corolla (R150k), VW Polo (R160k), Suzuki Swift (R130k) which are all reliable, affordable options."
                />
                <Slider
                  label="Deposit"
                  value={inputs.usedDeposit}
                  min={10}
                  max={50}
                  step={5}
                  onChange={set("usedDeposit")}
                  format={(v) => `${v}%`}
                  tooltip="A larger deposit on a used car reduces your monthly commitment significantly."
                />
                <Slider
                  label="Finance Term"
                  value={inputs.usedFinanceTerm}
                  min={24}
                  max={60}
                  step={12}
                  onChange={set("usedFinanceTerm")}
                  format={(v) => `${v} months`}
                />
                <Slider
                  label="Monthly Fuel"
                  value={inputs.usedFuelMonthly}
                  min={1000}
                  max={4000}
                  step={100}
                  onChange={set("usedFuelMonthly")}
                  format={formatZAR}
                />
                <Slider
                  label="Monthly Repair Savings Fund"
                  value={inputs.usedRepairSavings}
                  min={200}
                  max={3000}
                  step={100}
                  onChange={set("usedRepairSavings")}
                  format={formatZAR}
                  tooltip="Money set aside monthly for unexpected repairs  ,  windscreen chips, bumper scuffs, wipers, tyre punctures. Think of it as your own insurance against surprise bills."
                />
                <div
                  className="driver-profile card-torn"
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    marginTop: "1rem",
                  }}
                >
                  <h4 style={{ fontSize: "0.88rem", marginBottom: "0.75rem" }}>
                    Driver Profile & Insurance Impact
                  </h4>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Your Age</label>
                      <input
                        type="number"
                        className="form-input"
                        value={inputs.driverAge}
                        min={18}
                        max={70}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            driverAge: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Years Licensed</label>
                      <input
                        type="number"
                        className="form-input"
                        value={inputs.yearsLicensed}
                        min={0}
                        max={50}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            yearsLicensed: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div
                    className="insurance-age-note"
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.6rem 0.75rem",
                      background:
                        inputs.driverAge >= 25
                          ? "var(--cream-dark)"
                          : "var(--absa-red-light)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.8rem",
                      color:
                        inputs.driverAge >= 25
                          ? "var(--text-secondary)"
                          : "var(--absa-red-dark)",
                    }}
                  >
                    {inputs.driverAge >= 25
                      ? `✓ At ${inputs.driverAge}, you qualify for lower premiums. Insurers consider under-25s higher risk  - you're past that threshold.`
                      : `⚠ Under 25: expect significantly higher premiums. SA insurers charge 20–40% more for drivers under 25 regardless of license history.`}
                    {inputs.yearsLicensed < 2 && (
                      <div style={{ marginTop: "0.4rem" }}>
                        ⚠ Less than 2 years licensed: insurers will add a
                        further loading to your premium. Consider this in your
                        insurance estimate above.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "invest" && (
              <div className="input-panel card">
                <h4 style={{ marginBottom: "1.25rem" }}>
                  📈 Investment Parameters
                </h4>
                <Slider
                  label="Expected Annual Return"
                  value={Math.round(inputs.investmentRate * 100 * 10) / 10}
                  min={5}
                  max={15}
                  step={0.5}
                  onChange={(v) => set("investmentRate")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="Long-term JSE average: ~10–12% p.a. Global ETF (USD): ~8–10% p.a. Conservative: 7%. We use 9% as a balanced estimate."
                />
                <Slider
                  label="Time Horizon"
                  value={inputs.timeHorizon}
                  min={1}
                  max={10}
                  step={1}
                  onChange={set("timeHorizon")}
                  format={(v) => `${v} years`}
                  tooltip="How many years to compare the two scenarios over. 5 years aligns with your current Vision Track."
                />

                <div
                  className="invest-explainer card-torn"
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <h4 style={{ fontSize: "0.88rem", marginBottom: "0.5rem" }}>
                    How we calculate this
                  </h4>
                  <p style={{ fontSize: "0.80rem" }}>
                    The monthly saving (luxury total monthly − used total
                    monthly) is invested at your chosen rate using the future
                    value formula: <em>FV = PMT × [((1+r)^n − 1) / r]</em>. The
                    deposit difference is also assumed to be invested from month
                    1.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/*    RIGHT: OUTPUTS    */}
          <div className="studio-outputs">
            {/* Summary cards */}
            <div className="output-comparison">
              <div className="output-car card">
                <div className="output-car-label">🚗 Luxury</div>
                <div className="output-car-price">
                  {formatZAR(inputs.luxuryPrice)}
                </div>
                <div className="output-car-stats">
                  <div className="output-stat">
                    <span>Finance payment</span>
                    <strong>{formatZAR(results.luxMonthlyPayment)}/mo</strong>
                  </div>
                  <div className="output-stat">
                    <span>Insurance</span>
                    <strong>{formatZAR(results.luxInsuranceMonthly)}/mo</strong>
                  </div>
                  <div className="output-stat">
                    <span>Fuel + service</span>
                    <strong>
                      {formatZAR(
                        inputs.luxuryFuelMonthly + inputs.luxuryServiceMonthly,
                      )}
                      /mo
                    </strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Total monthly</span>
                    <strong style={{ color: "var(--absa-red)" }}>
                      {formatZAR(results.luxTotalMonthly)}/mo
                    </strong>
                  </div>
                  <div className="output-stat">
                    <span>Resale ({inputs.timeHorizon}yr)</span>
                    <strong>{formatZAR(results.luxResaleValue)}</strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Net cost ({inputs.timeHorizon}yr)</span>
                    <strong style={{ color: "var(--absa-red)" }}>
                      {formatZARShort(results.luxNetCost)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="output-vs">VS</div>

              <div className="output-car card">
                <div className="output-car-label">🚙 Used</div>
                <div className="output-car-price">
                  {formatZAR(inputs.usedPrice)}
                </div>
                <div className="output-car-stats">
                  <div className="output-stat">
                    <span>Finance payment</span>
                    <strong>{formatZAR(results.usedMonthlyPayment)}/mo</strong>
                  </div>
                  <div className="output-stat">
                    <span>Insurance</span>
                    <strong>
                      {formatZAR(results.usedInsuranceMonthly)}/mo
                    </strong>
                  </div>
                  <div className="output-stat">
                    <span>Fuel + service</span>
                    <strong>
                      {formatZAR(
                        inputs.usedFuelMonthly + inputs.usedServiceMonthly,
                      )}
                      /mo
                    </strong>
                  </div>
                  <div className="output-stat">
                    <span>Repair savings fund</span>
                    <strong>{formatZAR(inputs.usedRepairSavings)}/mo</strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Total monthly</span>
                    <strong style={{ color: "var(--sage)" }}>
                      {formatZAR(results.usedTotalMonthly)}/mo
                    </strong>
                  </div>
                  <div className="output-stat">
                    <span>Resale ({inputs.timeHorizon}yr)</span>
                    <strong>{formatZAR(results.usedResaleValue)}</strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Net cost ({inputs.timeHorizon}yr)</span>
                    <strong style={{ color: "var(--sage)" }}>
                      {formatZARShort(results.usedNetCost)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly saving */}
            <div
              className="monthly-saving card-gold"
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
                    Monthly saving if you choose the used car
                  </div>
                  <div className="zar-large">
                    {formatZAR(results.monthlyDiff)}
                  </div>
                  <div
                    style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                  >
                    per month to invest
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
                    After {inputs.timeHorizon} years invested at{" "}
                    {Math.round(inputs.investmentRate * 100)}%
                  </div>
                  <div
                    className="zar-large"
                    style={{ color: "var(--deep-brown)" }}
                  >
                    {formatZARShort(results.totalInvestmentValue)}
                  </div>
                  <div
                    style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                  >
                    potential portfolio value
                  </div>
                </div>
              </div>

              {/* Visual progress comparison */}
              <div style={{ marginTop: "1rem" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.4rem",
                  }}
                >
                  Luxury car net cost vs investment value
                </div>
                <div className="output-bar-group">
                  <div className="output-bar-row">
                    <span className="output-bar-label">
                      🚗 Net cost (luxury)
                    </span>
                    <div className="output-bar-track">
                      <div
                        className="output-bar-fill"
                        style={{
                          width: `${Math.min(100, (results.luxNetCost / Math.max(results.luxNetCost, results.totalInvestmentValue)) * 100)}%`,
                          background: "var(--absa-red)",
                        }}
                      />
                    </div>
                    <span className="output-bar-val">
                      {formatZARShort(results.luxNetCost)}
                    </span>
                  </div>
                  <div className="output-bar-row">
                    <span className="output-bar-label">
                      📈 Invested difference
                    </span>
                    <div className="output-bar-track">
                      <div
                        className="output-bar-fill"
                        style={{
                          width: `${Math.min(100, (results.totalInvestmentValue / Math.max(results.luxNetCost, results.totalInvestmentValue)) * 100)}%`,
                          background: "var(--sage)",
                        }}
                      />
                    </div>
                    <span className="output-bar-val">
                      {formatZARShort(results.totalInvestmentValue)}
                    </span>
                  </div>
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
                style={{ background: verdict.color, color: "white" }}
              >
                Studio Verdict
              </div>
              <h3 style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
                {verdict.label}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }}>
                {verdict.text}
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
                  Vision Impact
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "0.88rem",
                  }}
                >
                  {results.totalInvestmentValue > 200000
                    ? `This decision could fund a significant portion of your offshore portfolio target. The used car + invested difference could represent ${Math.round((results.totalInvestmentValue / 500000) * 100)}% of your R500k Global Citizen Vision goal.`
                    : `Even a modest investment difference adds meaningfully to your offshore portfolio over time. Small monthly decisions compound dramatically.`}
                </p>
              </div>
            </div>

            {/* SA Context note */}
            <div
              className="card-torn studio-sa-note"
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                marginTop: "1rem",
              }}
            >
              <h4 style={{ fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                🇿🇦 South African Car Finance Context
              </h4>
              <p style={{ fontSize: "0.8rem" }}>
                SA prime lending rate is currently ~11.25%. Vehicle finance is
                offered at prime + 1.5-3% depending on your credit profile. A
                luxury car at R620,000 over 60 months at 13.5% means you pay
                approximately R75,000 in interest alone, and that's before
                insurance, fuel or maintenance. Vehicle depreciation in South
                Africa averages 15–20% in year one.
              </p>
            </div>
          </div>
        </div>

        {/*    KEY CONCEPTS    */}
        <div className="studio-concepts">
          <h3 style={{ marginBottom: "1.25rem" }}>Key Concepts Explained</h3>
          <div className="concepts-grid">
            {[
              {
                title: "Vehicle Depreciation",
                icon: "📉",
                text: "New cars in SA lose approximately 15–20% of their value in the first year, and 40-50% over 5 years. A R620,000 car may be worth R370,000 in 5 years - this is called depreciation. Used cars have already absorbed this initial drop.",
              },
              {
                title: "Compound Growth",
                icon: "📈",
                text: "When you invest R8,000/month at 9% p.a., each month's contribution earns returns, and those returns earn further returns. After 5 years, R480,000 in contributions can grow to over R560,000. This is the power of compound interest working for you.",
              },
              {
                title: "Total Cost of Ownership",
                icon: "🧾",
                text: "The sticker price of a car is only the beginning. Total cost of ownership (TCO) includes: finance interest, comprehensive insurance (~4-5% of car value/year), fuel, tyres, services, and licensing. A R620k car can cost over R1.1 million over 5 years.",
              },
              {
                title: "Opportunity Cost",
                icon: "⚖",
                text: 'Every rand you spend on car payments is a rand that cannot be invested. This is called opportunity cost. The question isn\'t just "can I afford the luxury car?" it\'s "what am I giving up by choosing it?" This studio helps you see that number clearly.',
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

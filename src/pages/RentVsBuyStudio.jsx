import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/UserProfileContext";
import {
  formatZAR,
  formatZARShort,
  futureValue,
  monthlyRepayment,
} from "../utils/finance";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Home,
  Key,
  BarChart2,
  MapPin,
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  Info,
  Layers,
} from "lucide-react";
import "./RentVsBuyStudio.css";

// SA Transfer Duty SARS 2024/25
function calcTransferDuty(price) {
  if (price <= 1100000) return 0;
  if (price <= 1512500) return (price - 1100000) * 0.03;
  if (price <= 2117500) return 12375 + (price - 1512500) * 0.06;
  if (price <= 2722500) return 48675 + (price - 2117500) * 0.08;
  if (price <= 12100000) return 97475 + (price - 2722500) * 0.11;
  return 1128600 + (price - 12100000) * 0.13;
}

const DEFAULTS = {
  propertyPrice: 1800000,
  deposit: 300000,
  bondRate: 0.115,
  bondTermYears: 20,
  propertyGrowthRate: 0.06,
  leviesMonthly: 2500,
  ratesMonthly: 1800,
  maintenancePct: 0.01,
  attorneyFees: 35000,
  monthlyRent: 16000,
  rentIncreaseAnnual: 0.07,
  depositInvestRate: 0.09,
  timeHorizon: 5,
  investmentRate: 0.09,
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

// Custom recharts tooltip
function WealthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rvb-chart-tooltip">
      <div className="rvb-chart-tooltip-year">Year {label}</div>
      {payload.map((p) => (
        <div key={p.name} className="rvb-chart-tooltip-row">
          <span style={{ color: p.color }}>●</span>
          <span>{p.name}:</span>
          <strong>{formatZARShort(p.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export default function RentVsBuyStudio() {
  const { profile } = useProfile();
  const [inputs, setInputs] = useState({
    ...DEFAULTS,
    deposit: Math.max(
      DEFAULTS.deposit,
      Object.values(profile.savings).reduce((a, b) => a + b, 0),
    ),
  });
  const [activeTab, setActiveTab] = useState("buying");

  function set(key) {
    return (v) => setInputs((prev) => ({ ...prev, [key]: v }));
  }

  const results = useMemo(() => {
    const {
      propertyPrice,
      deposit,
      bondRate,
      bondTermYears,
      propertyGrowthRate,
      leviesMonthly,
      ratesMonthly,
      maintenancePct,
      attorneyFees,
      monthlyRent,
      rentIncreaseAnnual,
      depositInvestRate,
      timeHorizon,
      investmentRate,
    } = inputs;

    const years = timeHorizon;
    const months = years * 12;

    const transferDuty = calcTransferDuty(propertyPrice);
    const totalUpfront = deposit + transferDuty + attorneyFees;
    const bondAmount = propertyPrice - deposit;
    const monthlyBond = monthlyRepayment(
      bondAmount,
      bondRate,
      bondTermYears * 12,
    );
    const maintenanceMonthly = (propertyPrice * maintenancePct) / 12;
    const totalMonthlyBuying =
      monthlyBond + leviesMonthly + ratesMonthly + maintenanceMonthly;

    const totalBondPaid = monthlyBond * months;
    const totalRunningCosts =
      (leviesMonthly + ratesMonthly + maintenanceMonthly) * months;
    const totalCashOutBuying = totalUpfront + totalBondPaid + totalRunningCosts;

    const propertyValueEnd =
      propertyPrice * Math.pow(1 + propertyGrowthRate, years);

    const r = bondRate / 12;
    const n = bondTermYears * 12;
    const bondPaidMonths = months;
    const remainingBond =
      (bondAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, bondPaidMonths))) /
      (Math.pow(1 + r, n) - 1);
    const equity = propertyValueEnd - remainingBond;
    const netWealthBuying =
      equity -
      (totalBondPaid + totalRunningCosts + transferDuty + attorneyFees);

    let totalRentPaid = 0;
    let currentRent = monthlyRent;
    for (let y = 0; y < years; y++) {
      totalRentPaid += currentRent * 12;
      currentRent *= 1 + rentIncreaseAnnual;
    }

    const rentVsBondMonthly = Math.max(0, totalMonthlyBuying - monthlyRent);
    const depositGrowth = futureValue(deposit, 0, depositInvestRate, years);
    const savedUpfrontGrowth = futureValue(
      transferDuty + attorneyFees,
      0,
      investmentRate,
      years,
    );
    const monthlyDiffInvested = futureValue(
      0,
      rentVsBondMonthly,
      investmentRate,
      years,
    );
    const totalInvestedWealth =
      depositGrowth + savedUpfrontGrowth + monthlyDiffInvested;
    const netWealthRenting = totalInvestedWealth - totalRentPaid;

    // Year-by-year data for chart (up to 30 years)
    const chartData = [];
    let breakEvenYear = null;
    for (let y = 1; y <= 30; y++) {
      const propVal = propertyPrice * Math.pow(1 + propertyGrowthRate, y);
      const remBond =
        (bondAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, y * 12))) /
        (Math.pow(1 + r, n) - 1);
      const buyEquity =
        propVal -
        remBond -
        ((monthlyBond + leviesMonthly + ratesMonthly + maintenanceMonthly) *
          y *
          12 +
          transferDuty +
          attorneyFees);

      let rentTotal = 0;
      let rent = monthlyRent;
      for (let i = 0; i < y; i++) {
        rentTotal += rent * 12;
        rent *= 1 + rentIncreaseAnnual;
      }
      const rentWealth =
        futureValue(
          deposit + transferDuty + attorneyFees,
          rentVsBondMonthly,
          investmentRate,
          y,
        ) - rentTotal;

      if (buyEquity > rentWealth && breakEvenYear === null) {
        breakEvenYear = y;
      }

      chartData.push({
        year: y,
        "Buying (equity)": Math.round(buyEquity),
        "Renting + Investing": Math.round(rentWealth),
      });
    }

    const buyingWins = netWealthBuying > netWealthRenting;
    const difference = Math.abs(netWealthBuying - netWealthRenting);

    return {
      transferDuty,
      totalUpfront,
      bondAmount,
      monthlyBond,
      maintenanceMonthly,
      totalMonthlyBuying,
      totalBondPaid,
      totalRunningCosts,
      totalCashOutBuying,
      propertyValueEnd,
      remainingBond,
      equity,
      netWealthBuying,
      totalRentPaid,
      rentVsBondMonthly,
      depositGrowth,
      savedUpfrontGrowth,
      monthlyDiffInvested,
      totalInvestedWealth,
      netWealthRenting,
      breakEvenYear,
      buyingWins,
      difference,
      chartData,
    };
  }, [inputs]);

  const verdict = results.buyingWins
    ? {
        label: "Buying Comes Out Ahead",
        color: "var(--absa-red)",
        icon: <Home size={18} />,
        text: `Over ${inputs.timeHorizon} years, buying this property builds ${formatZARShort(results.difference)} more wealth than renting and investing. Property growth of ${Math.round(inputs.propertyGrowthRate * 100)}% p.a. on a ${formatZARShort(inputs.propertyPrice)} asset outpaces the returns on your invested deposit.`,
        sub: results.breakEvenYear
          ? `Buying overtakes renting at approximately Year ${results.breakEvenYear}. Before that point, renting holds a stronger financial position.`
          : `Buying outperforms throughout this time horizon.`,
      }
    : {
        label: "Renting + Investing Wins",
        color: "var(--dusty-blue)",
        icon: <TrendingUp size={18} />,
        text: `Over ${inputs.timeHorizon} years, renting and investing your deposit builds ${formatZARShort(results.difference)} more wealth than buying. The high upfront costs  transfer duty ${formatZARShort(results.transferDuty)} plus fees  haven't been recovered through property growth in this timeframe.`,
        sub: results.breakEvenYear
          ? `Buying becomes the stronger choice at approximately Year ${results.breakEvenYear}. If you plan to stay for ${results.breakEvenYear}+ years, the calculus changes significantly.`
          : `Consider extending the time horizon  property typically outperforms over 10–15 year periods.`,
      };

  const TABS = [
    { id: "buying", label: "Buying", icon: <Home size={14} /> },
    { id: "renting", label: "Renting", icon: <Key size={14} /> },
    { id: "market", label: "Market", icon: <BarChart2 size={14} /> },
  ];

  const CONCEPTS = [
    {
      icon: <Layers size={20} />,
      title: "Transfer Duty",
      text: "Transfer duty is a government tax paid to SARS on all property purchases above R1.1 million. Calculated on a sliding scale from 3% to 13% depending on price. It is paid upfront in cash, not included in your bond, and is non-negotiable.",
    },
    {
      icon: <BarChart2 size={20} />,
      title: "Bond Amortisation",
      text: "In the early years of a bond, most of your repayment goes toward interest, not capital. On a R1.5M bond at 11.5%, roughly 78% of your first repayment is interest. This is why buying only starts making sense over longer time horizons.",
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Opportunity Cost of Deposit",
      text: "Your deposit is not free money just because you own it. Invested in an ETF at 9–10% p.a., R300,000 becomes approximately R462,000 after 5 years. When placed into a property instead, you forgo this growth  the model accounts for this explicitly.",
    },
    {
      icon: <Key size={20} />,
      title: "Rental Inflation",
      text: "South African landlords typically increase rent 6–10% annually. Rent that looks affordable today can become expensive quickly. A R15,000 rent at 7% annual increase costs R21,000 in 5 years and R29,500 in 10 years  a key argument for buying long-term.",
    },
  ];

  return (
    <main className="rvb-studio-page">
      <div className="container">
        {/* HEADER */}
        <header className="studio-header">
          <Link
            to="/studio"
            className="back-link"
            aria-label="Back to all studios"
          >
            <ArrowLeft size={16} /> All Studios
          </Link>
          <div className="studio-title-row">
            <div>
              <span className="hand-note">Simulation Studio</span>
              <h1>Rent vs Buy in South Africa</h1>
              <p className="studio-subtitle">
                One of the biggest financial decisions you'll ever make. This
                studio runs the real SA numbers  transfer duty, bond rates,
                levies, rental inflation  and tells you which position builds
                more wealth over your chosen horizon.
              </p>
            </div>
            <div className="studio-badge">
              <div className="badge badge-red">
                <MapPin size={12} /> SA Finance Rates
              </div>
            </div>
          </div>
        </header>

        {/* KEY METRICS BAR */}
        <section className="rvb-metrics-bar" aria-label="Key financial metrics">
          {[
            {
              label: "Bond repayment",
              value: formatZAR(results.monthlyBond),
              sub: "/month",
              color: "var(--absa-red)",
            },
            {
              label: "Total monthly (buying)",
              value: formatZAR(results.totalMonthlyBuying),
              sub: "/month",
              color: "var(--absa-red)",
            },
            {
              label: "Transfer duty",
              value: formatZAR(results.transferDuty),
              sub: "upfront",
              color: "var(--gold)",
            },
            {
              label: "Total upfront cash",
              value: formatZARShort(results.totalUpfront),
              sub: "needed",
              color: "var(--terracotta)",
            },
            {
              label: "Property value (end)",
              value: formatZARShort(results.propertyValueEnd),
              sub: `in ${inputs.timeHorizon} yrs`,
              color: "var(--sage)",
            },
          ].map((m) => (
            <div key={m.label} className="rvb-metric-card card">
              <div className="rvb-metric-value" style={{ color: m.color }}>
                {m.value}
              </div>
              <div className="rvb-metric-sub">{m.sub}</div>
              <div className="rvb-metric-label">{m.label}</div>
            </div>
          ))}
        </section>

        <div className="studio-layout">
          {/* LEFT: INPUTS */}
          <aside className="studio-inputs" aria-label="Input controls">
            <nav className="input-tabs" aria-label="Input categories">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? "tab-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>

            {activeTab === "buying" && (
              <section className="input-panel card" aria-label="Buying inputs">
                <h4
                  style={{
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Home size={16} /> Property &amp; Bond
                </h4>
                <Slider
                  label="Property Price"
                  value={inputs.propertyPrice}
                  min={800000}
                  max={5000000}
                  step={50000}
                  onChange={set("propertyPrice")}
                  format={(v) => formatZARShort(v)}
                  tooltip="Cape Town median: ~R2.1M. Johannesburg: ~R1.4M. Durban: ~R1.1M (2024 data)."
                />
                <Slider
                  label="Deposit"
                  value={inputs.deposit}
                  min={50000}
                  max={1000000}
                  step={10000}
                  onChange={set("deposit")}
                  format={formatZAR}
                  tooltip="A 20% deposit (R360,000) removes transfer duty risk and typically improves your bond rate."
                />
                <Slider
                  label="Bond Interest Rate (p.a.)"
                  value={Math.round(inputs.bondRate * 1000) / 10}
                  min={9}
                  max={16}
                  step={0.25}
                  onChange={(v) => set("bondRate")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="SA prime rate is 11.5% (2024/25). Banks offer prime −0.5% to prime +2% depending on credit profile."
                />
                <Slider
                  label="Bond Term"
                  value={inputs.bondTermYears}
                  min={10}
                  max={30}
                  step={5}
                  onChange={set("bondTermYears")}
                  format={(v) => `${v} years`}
                  tooltip="20-year term is standard in SA. A 30-year term lowers monthly payments but costs significantly more in total interest."
                />
                <Slider
                  label="Monthly Levies (sectional title)"
                  value={inputs.leviesMonthly}
                  min={0}
                  max={8000}
                  step={100}
                  onChange={set("leviesMonthly")}
                  format={formatZAR}
                  tooltip="Sectional title complexes charge R2,000–R6,000/month for security, maintenance, and building insurance."
                />
                <Slider
                  label="Monthly Rates & Taxes"
                  value={inputs.ratesMonthly}
                  min={500}
                  max={6000}
                  step={100}
                  onChange={set("ratesMonthly")}
                  format={formatZAR}
                  tooltip="Municipal rates and taxes. Budget R1,500–R3,500/month for most urban properties."
                />
                <Slider
                  label="Attorney & Registration Fees"
                  value={inputs.attorneyFees}
                  min={20000}
                  max={80000}
                  step={1000}
                  onChange={set("attorneyFees")}
                  format={formatZAR}
                  tooltip="Conveyancing + bond registration fees. Typically R30,000–R50,000 on a R1.8M property."
                />
              </section>
            )}

            {activeTab === "renting" && (
              <section className="input-panel card" aria-label="Renting inputs">
                <h4
                  style={{
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Key size={16} /> Renting
                </h4>
                <Slider
                  label="Monthly Rent"
                  value={inputs.monthlyRent}
                  min={5000}
                  max={50000}
                  step={500}
                  onChange={set("monthlyRent")}
                  format={formatZAR}
                  tooltip="Compare to a similar property to what you'd buy. What would a comparable unit rent for?"
                />
                <Slider
                  label="Annual Rent Increase"
                  value={Math.round(inputs.rentIncreaseAnnual * 100)}
                  min={3}
                  max={15}
                  step={1}
                  onChange={(v) => set("rentIncreaseAnnual")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="SA rental inflation averages 6–8% p.a. Budget for annual increases."
                />
                <Slider
                  label="Investment Return on Deposit (p.a.)"
                  value={Math.round(inputs.depositInvestRate * 100)}
                  min={5}
                  max={15}
                  step={1}
                  onChange={(v) => set("depositInvestRate")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="JSE ETF: ~10% p.a. Global ETF: ~9–12% p.a. Money Market: 8.5% p.a."
                />
                <div
                  className="rvb-rent-note card-torn"
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.85rem",
                      marginBottom: "0.4rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Info size={14} /> What Renting Includes
                  </h4>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    The renting scenario assumes you invest your deposit, the
                    transfer duty and attorney fees you saved, and the monthly
                    difference between bond costs and rent. Total rent paid is
                    deducted to show net wealth.
                  </p>
                </div>
              </section>
            )}

            {activeTab === "market" && (
              <section
                className="input-panel card"
                aria-label="Market assumption inputs"
              >
                <h4
                  style={{
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <BarChart2 size={16} /> Market Assumptions
                </h4>
                <Slider
                  label="Property Growth Rate (p.a.)"
                  value={Math.round(inputs.propertyGrowthRate * 100)}
                  min={2}
                  max={12}
                  step={1}
                  onChange={(v) => set("propertyGrowthRate")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="SA residential property has averaged ~5–7% p.a. Cape Town has outperformed at ~8–10%. Johannesburg: ~5–6%."
                />
                <Slider
                  label="Investment Return (p.a.)"
                  value={Math.round(inputs.investmentRate * 100)}
                  min={5}
                  max={15}
                  step={1}
                  onChange={(v) => set("investmentRate")(v / 100)}
                  format={(v) => `${v}%`}
                  tooltip="Return on the invested difference. JSE ETF: ~10%. Global ETF: ~9–12%."
                />
                <Slider
                  label="Time Horizon"
                  value={inputs.timeHorizon}
                  min={1}
                  max={20}
                  step={1}
                  onChange={set("timeHorizon")}
                  format={(v) => `${v} years`}
                  tooltip="Property typically needs 8–12 years to outperform renting + investing in most SA cities."
                />
                <div
                  className="rvb-assumptions card-torn"
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                    Model Assumptions
                  </h4>
                  <ul
                    style={{
                      fontSize: "0.79rem",
                      color: "var(--text-secondary)",
                      paddingLeft: "1rem",
                      lineHeight: 1.8,
                    }}
                  >
                    <li>
                      Maintenance budgeted at 1% of property value per year
                    </li>
                    <li>Bond balance uses standard amortisation schedule</li>
                    <li>Rental inflation applied annually (not monthly)</li>
                    <li>Investment returns are pre-tax nominal returns</li>
                    <li>No capital gains tax applied on property sale</li>
                    <li>Transfer duty based on SARS 2024/25 table</li>
                  </ul>
                </div>
              </section>
            )}
          </aside>

          {/* RIGHT: OUTPUTS */}
          <div className="studio-outputs">
            {/* Head-to-head */}
            <div className="output-comparison">
              <div className="output-car card">
                <div className="output-car-label">
                  <Home size={14} /> Buying
                </div>
                <div className="output-car-price">
                  {formatZAR(inputs.propertyPrice)}
                </div>
                <div className="output-car-stats">
                  <div className="output-stat">
                    <span>Deposit + duty + fees</span>
                    <strong>{formatZARShort(results.totalUpfront)}</strong>
                  </div>
                  <div className="output-stat">
                    <span>Bond repayment</span>
                    <strong>{formatZAR(results.monthlyBond)}/mo</strong>
                  </div>
                  <div className="output-stat">
                    <span>Levies + rates</span>
                    <strong>
                      {formatZAR(inputs.leviesMonthly + inputs.ratesMonthly)}/mo
                    </strong>
                  </div>
                  <div className="output-stat">
                    <span>Maintenance</span>
                    <strong>{formatZAR(results.maintenanceMonthly)}/mo</strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Total monthly</span>
                    <strong style={{ color: "var(--absa-red)" }}>
                      {formatZAR(results.totalMonthlyBuying)}/mo
                    </strong>
                  </div>
                  <div className="output-stat">
                    <span>Property value ({inputs.timeHorizon}yr)</span>
                    <strong style={{ color: "var(--sage)" }}>
                      {formatZARShort(results.propertyValueEnd)}
                    </strong>
                  </div>
                  <div className="output-stat">
                    <span>Remaining bond</span>
                    <strong>{formatZARShort(results.remainingBond)}</strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Equity built</span>
                    <strong style={{ color: "var(--sage)" }}>
                      {formatZARShort(results.equity)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="output-vs" aria-hidden="true">
                VS
              </div>

              <div className="output-car card">
                <div className="output-car-label">
                  <Key size={14} /> Renting
                </div>
                <div className="output-car-price">
                  {formatZAR(inputs.monthlyRent)}/mo
                </div>
                <div className="output-car-stats">
                  <div className="output-stat">
                    <span>Deposit invested instead</span>
                    <strong>{formatZAR(inputs.deposit)}</strong>
                  </div>
                  <div className="output-stat">
                    <span>Current rent</span>
                    <strong>{formatZAR(inputs.monthlyRent)}/mo</strong>
                  </div>
                  <div className="output-stat">
                    <span>Monthly saving vs buying</span>
                    <strong style={{ color: "var(--sage)" }}>
                      {formatZAR(results.rentVsBondMonthly)}/mo
                    </strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Total rent paid ({inputs.timeHorizon}yr)</span>
                    <strong style={{ color: "var(--absa-red)" }}>
                      {formatZARShort(results.totalRentPaid)}
                    </strong>
                  </div>
                  <div className="output-stat">
                    <span>Deposit growth</span>
                    <strong style={{ color: "var(--sage)" }}>
                      {formatZARShort(results.depositGrowth)}
                    </strong>
                  </div>
                  <div className="output-stat">
                    <span>Monthly diff invested</span>
                    <strong style={{ color: "var(--sage)" }}>
                      {formatZARShort(results.monthlyDiffInvested)}
                    </strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Total invested wealth</span>
                    <strong style={{ color: "var(--dusty-blue)" }}>
                      {formatZARShort(results.totalInvestedWealth)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Net wealth bars */}
            <div
              className="card rvb-wealth-compare"
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
                Net wealth position after {inputs.timeHorizon} years
              </div>
              <div className="output-bar-group">
                <div className="output-bar-row">
                  <span className="output-bar-label">
                    <Home size={13} /> Buying (equity)
                  </span>
                  <div className="output-bar-track">
                    <div
                      className="output-bar-fill"
                      style={{
                        width: `${Math.min(100, (Math.max(0, results.netWealthBuying) / Math.max(Math.abs(results.netWealthBuying), Math.abs(results.netWealthRenting), 1)) * 100)}%`,
                        background: results.buyingWins
                          ? "var(--absa-red)"
                          : "var(--border)",
                      }}
                    />
                  </div>
                  <span className="output-bar-val">
                    {formatZARShort(results.netWealthBuying)}
                  </span>
                </div>
                <div className="output-bar-row">
                  <span className="output-bar-label">
                    <Key size={13} /> Renting (invested)
                  </span>
                  <div className="output-bar-track">
                    <div
                      className="output-bar-fill"
                      style={{
                        width: `${Math.min(100, (Math.max(0, results.netWealthRenting) / Math.max(Math.abs(results.netWealthBuying), Math.abs(results.netWealthRenting), 1)) * 100)}%`,
                        background: !results.buyingWins
                          ? "var(--dusty-blue)"
                          : "var(--border)",
                      }}
                    />
                  </div>
                  <span className="output-bar-val">
                    {formatZARShort(results.netWealthRenting)}
                  </span>
                </div>
              </div>
              {results.breakEvenYear && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    marginTop: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <AlertTriangle size={13} />
                  Break-even point: buying overtakes renting at approximately{" "}
                  <strong>Year {results.breakEvenYear}</strong>.
                </p>
              )}
            </div>

            {/*  WEALTH PROJECTION CHART  */}
            <section
              className="card rvb-chart-section"
              style={{ padding: "1.5rem", marginTop: "1rem" }}
            >
              <h3 className="rvb-chart-title">
                <TrendingUp size={18} />
                30-Year Wealth Projection
              </h3>
              <p className="rvb-chart-subtitle">
                Net wealth position year-by-year. The crossover point is where
                buying becomes the stronger financial position.
              </p>
              <div
                className="rvb-chart-wrap"
                role="img"
                aria-label="Line chart showing buying vs renting wealth over 30 years"
              >
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={results.chartData}
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-light)"
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      tickFormatter={(v) => `Yr ${v}`}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      tickFormatter={(v) => formatZARShort(v)}
                      width={68}
                    />
                    <Tooltip content={<WealthTooltip />} />
                    <Legend
                      wrapperStyle={{
                        fontSize: "0.8rem",
                        paddingTop: "0.5rem",
                      }}
                    />
                    <ReferenceLine
                      x={inputs.timeHorizon}
                      stroke="var(--gold)"
                      strokeDasharray="4 3"
                      label={{
                        value: `Your horizon`,
                        position: "insideTopRight",
                        fontSize: 10,
                        fill: "var(--gold)",
                      }}
                    />
                    {results.breakEvenYear && (
                      <ReferenceLine
                        x={results.breakEvenYear}
                        stroke="var(--sage)"
                        strokeDasharray="4 3"
                        label={{
                          value: `Break-even`,
                          position: "insideTopLeft",
                          fontSize: 10,
                          fill: "var(--sage)",
                        }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="Buying (equity)"
                      stroke="var(--absa-red)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Renting + Investing"
                      stroke="var(--dusty-blue)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginTop: "0.5rem",
                }}
              >
                The gold dashed line marks your selected time horizon. The green
                dashed line marks the break-even year.
              </p>
            </section>

            {/* Studio Verdict */}
            <div
              className="studio-verdict card-feature"
              style={{ marginTop: "1rem", borderRadius: "var(--radius-xl)" }}
            >
              <div
                className="verdict-badge"
                style={{ background: verdict.color, color: "white" }}
              >
                {verdict.icon} Studio Verdict
              </div>
              <h3 style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
                {verdict.label}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }}>
                {verdict.text}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "0.85rem",
                  marginTop: "0.75rem",
                  lineHeight: 1.6,
                }}
              >
                {verdict.sub}
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
                  Key Insight
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "0.88rem",
                  }}
                >
                  Transfer duty of {formatZAR(results.transferDuty)} + attorney
                  fees of {formatZAR(inputs.attorneyFees)} means you need{" "}
                  {formatZARShort(results.totalUpfront)} in cash before you can
                  start. That is{" "}
                  {formatZARShort(results.totalUpfront - inputs.deposit)} above
                  your deposit alone. Plan for this.
                </p>
              </div>
            </div>

            {/* SA context */}
            <div
              className="card-torn studio-sa-note"
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                marginTop: "1rem",
              }}
            >
              <h4
                style={{
                  fontSize: "0.85rem",
                  marginBottom: "0.4rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <MapPin size={14} /> South African Property Context
              </h4>
              <p style={{ fontSize: "0.8rem" }}>
                SA bond rates are prime-linked (currently 11.5%). Property has
                grown 5–7% p.a. nationally, with Cape Town outperforming at
                8–10% in recent years. Transfer duty on a R1.8M property is
                R26,900  one of the largest hidden costs first-time buyers
                overlook. Always model the full upfront cash requirement before
                making an offer.
              </p>
            </div>
          </div>
        </div>

        {/* KEY CONCEPTS */}
        <section className="studio-concepts">
          <h3 style={{ marginBottom: "1.25rem" }}>Key Concepts Explained</h3>
          <div className="concepts-grid">
            {CONCEPTS.map((c) => (
              <div key={c.title} className="concept-card card-pinned">
                <div className="concept-icon">{c.icon}</div>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "0.4rem" }}>
                  {c.title}
                </h4>
                <p style={{ fontSize: "0.82rem" }}>{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

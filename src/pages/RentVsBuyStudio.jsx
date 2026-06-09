import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/UserProfileContext';
import { formatZAR, formatZARShort, futureValue, monthlyRepayment } from '../utils/finance';
import './RentVsBuyStudio.css';

// Rent vs Buy Studio
// Uses real SA financial context: transfer duty (SARS 2024/25), bond rates, levies, rates & taxes
// Compares total wealth position of buying vs renting + investing the deposit over a chosen horizon

// SA Transfer Duty SARS 2024/25 table
function calcTransferDuty(price) {
  if (price <= 1100000) return 0;
  if (price <= 1512500) return (price - 1100000) * 0.03;
  if (price <= 2117500) return 12375 + (price - 1512500) * 0.06;
  if (price <= 2722500) return 48675 + (price - 2117500) * 0.08;
  if (price <= 12100000) return 97475 + (price - 2722500) * 0.11;
  return 1128600 + (price - 12100000) * 0.13;
}

const DEFAULTS = {
  // Property
  propertyPrice: 1800000,
  deposit: 300000,
  bondRate: 0.115,         // 11.5% which is a prime rate
  bondTermYears: 20,
  propertyGrowthRate: 0.06, // 6% p.a. SA historical average
  leviesMonthly: 2500,      // sectional title
  ratesMonthly: 1800,       // rates & taxes
  maintenancePct: 0.01,     // 1% of property value p.a.
  attorneyFees: 35000,      // bond registration + conveyancing

  // Renting
  monthlyRent: 16000,
  rentIncreaseAnnual: 0.07, // 7% rental inflation SA average
  depositInvestRate: 0.09,  // what you earn investing the deposit instead

  // Shared
  timeHorizon: 5,
  investmentRate: 0.09,
};

// Reuse Slider from CarStudio pattern
function Slider({ label, value, min, max, step = 1, onChange, format, tooltip }) {
  return (
    <div className="studio-slider-group">
      <div className="studio-slider-header">
        <label className="form-label">{label}</label>
        <span className="studio-slider-val">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        className="range-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
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

export default function RentVsBuyStudio() {
  const { profile } = useProfile();
  const [inputs, setInputs] = useState({
    ...DEFAULTS,
    // Pre-fill deposit from profile savings if available
    deposit: Math.max(DEFAULTS.deposit, Object.values(profile.savings).reduce((a, b) => a + b, 0)),
  });
  const [activeTab, setActiveTab] = useState('buying');

  function set(key) {
    return v => setInputs(prev => ({ ...prev, [key]: v }));
  }

  //      ALL CALCULATIONS     
  const results = useMemo(() => {
    const { propertyPrice, deposit, bondRate, bondTermYears, propertyGrowthRate,
      leviesMonthly, ratesMonthly, maintenancePct, attorneyFees,
      monthlyRent, rentIncreaseAnnual, depositInvestRate,
      timeHorizon, investmentRate } = inputs;

    const years = timeHorizon;
    const months = years * 12;

    //      BUYING SCENARIO     
    const transferDuty = calcTransferDuty(propertyPrice);
    const totalUpfront = deposit + transferDuty + attorneyFees;
    const bondAmount = propertyPrice - deposit;
    const monthlyBond = monthlyRepayment(bondAmount, bondRate, bondTermYears * 12);
    const maintenanceMonthly = (propertyPrice * maintenancePct) / 12;

    const totalMonthlyBuying = monthlyBond + leviesMonthly + ratesMonthly + maintenanceMonthly;

    // Total paid over time horizon (bond + running costs)
    const totalBondPaid = monthlyBond * months;
    const totalRunningCosts = (leviesMonthly + ratesMonthly + maintenanceMonthly) * months;
    const totalCashOutBuying = totalUpfront + totalBondPaid + totalRunningCosts;

    // Property value at end of horizon
    const propertyValueEnd = propertyPrice * Math.pow(1 + propertyGrowthRate, years);

    // Remaining bond balance at end of horizon (amortisation)
    const r = bondRate / 12;
    const n = bondTermYears * 12;
    const bondPaidMonths = months;
    const remainingBond = bondAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, bondPaidMonths)) / (Math.pow(1 + r, n) - 1);

    // Equity = property value - remaining bond
    const equity = propertyValueEnd - remainingBond;

    // Net wealth buying = equity - total cash out (excluding deposit which is in equity)
    const netWealthBuying = equity - (totalBondPaid + totalRunningCosts + transferDuty + attorneyFees);

    //      RENTING SCENARIO     
    // Total rent paid (increasing annually)
    let totalRentPaid = 0;
    let currentRent = monthlyRent;
    for (let y = 0; y < years; y++) {
      totalRentPaid += currentRent * 12;
      currentRent *= (1 + rentIncreaseAnnual);
    }

    // Invest the deposit + ongoing monthly savings from rent being cheaper
    const rentVsBondMonthly = Math.max(0, totalMonthlyBuying - monthlyRent);
    const depositGrowth = futureValue(deposit, 0, depositInvestRate, years);
    const depositGainFromInvesting = depositGrowth - deposit;

    // Invest the transfer duty + attorney fees that you didn't spend
    const savedUpfrontGrowth = futureValue(transferDuty + attorneyFees, 0, investmentRate, years);

    // Invest the monthly difference (bond costs vs rent)
    const monthlyDiffInvested = futureValue(0, rentVsBondMonthly, investmentRate, years);

    const totalInvestedWealth = depositGrowth + savedUpfrontGrowth + monthlyDiffInvested;
    const netWealthRenting = totalInvestedWealth - totalRentPaid;

    //      BREAK-EVEN     
    // Approximate year when buying starts to outperform renting
    let breakEvenYear = null;
    for (let y = 1; y <= 30; y++) {
      const propVal = propertyPrice * Math.pow(1 + propertyGrowthRate, y);
      const remBond = bondAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, y * 12)) / (Math.pow(1 + r, n) - 1);
      const buyEquity = propVal - remBond - ((monthlyBond + leviesMonthly + ratesMonthly + maintenanceMonthly) * y * 12 + transferDuty + attorneyFees);

      let rentTotal = 0;
      let rent = monthlyRent;
      for (let i = 0; i < y; i++) { rentTotal += rent * 12; rent *= (1 + rentIncreaseAnnual); }
      const rentWealth = futureValue(deposit + transferDuty + attorneyFees, rentVsBondMonthly, investmentRate, y) - rentTotal;

      if (buyEquity > rentWealth && breakEvenYear === null) {
        breakEvenYear = y;
      }
    }

    const buyingWins = netWealthBuying > netWealthRenting;
    const difference = Math.abs(netWealthBuying - netWealthRenting);

    return {
      transferDuty, totalUpfront, bondAmount, monthlyBond, maintenanceMonthly,
      totalMonthlyBuying, totalBondPaid, totalRunningCosts, totalCashOutBuying,
      propertyValueEnd, remainingBond, equity, netWealthBuying,
      totalRentPaid, rentVsBondMonthly, depositGrowth, depositGainFromInvesting,
      savedUpfrontGrowth, monthlyDiffInvested, totalInvestedWealth, netWealthRenting,
      breakEvenYear, buyingWins, difference,
    };
  }, [inputs]);

  // Verdict logic
  const verdict = results.buyingWins
    ? {
        label: 'Buying Comes Out Ahead',
        color: 'var(--absa-red)',
        emoji: '🏠',
        text: `Over ${inputs.timeHorizon} years, buying this property builds ${formatZARShort(results.difference)} more wealth than renting and investing. Property growth of ${Math.round(inputs.propertyGrowthRate * 100)}% p.a. on a ${formatZARShort(inputs.propertyPrice)} asset outpaces the returns on your invested deposit.`,
        sub: results.breakEvenYear
          ? `Property equity overtakes the renting+investing scenario at approximately Year ${results.breakEvenYear}. Before that point, renting is the better financial position.`
          : `Buying outperforms from the start of this time horizon.`,
      }
    : {
        label: 'Renting + Investing Wins',
        color: 'var(--dusty-blue)',
        emoji: '📈',
        text: `Over ${inputs.timeHorizon} years, renting and investing your deposit builds ${formatZARShort(results.difference)} more wealth than buying. The high upfront costs (transfer duty ${formatZARShort(results.transferDuty)} + fees) and running costs haven't been recovered through property growth in this timeframe.`,
        sub: results.breakEvenYear
          ? `Buying only becomes the better choice at approximately Year ${results.breakEvenYear}. If you plan to stay for ${results.breakEvenYear}+ years, buying improves significantly.`
          : `Try extending the time horizon, property typically outperforms over 10-15 year periods.`,
      };

  return (
    <div className="rvb-studio-page">
      <div className="container">

        {/*      HEADER      */}
        <div className="studio-header">
          <Link to="/studio" className="back-link">← All Studios</Link>
          <div className="studio-title-row">
            <div>
              <span className="hand-note">⚗ Simulation Studio</span>
              <h1>Rent vs Buy in South Africa</h1>
              <p className="studio-subtitle">
                One of the biggest financial decisions you'll ever make. This studio runs the
                real SA numbers including: transfer duty, bond rates, levies, rental inflation, and
                tells you which position builds more wealth over your chosen horizon.
              </p>
            </div>
            <div className="studio-badge">
              <div className="badge badge-red">🇿🇦 SA Finance Rates</div>
            </div>
          </div>
        </div>

        {/*      KEY METRICS BAR      */}
        <div className="rvb-metrics-bar">
          {[
            { label: 'Bond repayment', value: formatZAR(results.monthlyBond), sub: '/month', color: 'var(--absa-red)' },
            { label: 'Total monthly (buying)', value: formatZAR(results.totalMonthlyBuying), sub: '/month', color: 'var(--absa-red)' },
            { label: 'Transfer duty', value: formatZAR(results.transferDuty), sub: 'upfront', color: 'var(--gold)' },
            { label: 'Total upfront cash', value: formatZARShort(results.totalUpfront), sub: 'needed', color: 'var(--terracotta)' },
            { label: 'Property value (end)', value: formatZARShort(results.propertyValueEnd), sub: `in ${inputs.timeHorizon} yrs`, color: 'var(--sage)' },
          ].map(m => (
            <div key={m.label} className="rvb-metric-card card">
              <div className="rvb-metric-value" style={{ color: m.color }}>{m.value}</div>
              <div className="rvb-metric-sub">{m.sub}</div>
              <div className="rvb-metric-label">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="studio-layout">

          {/*      LEFT: INPUTS      */}
          <div className="studio-inputs">
            <div className="input-tabs">
              {['buying', 'renting', 'market'].map(tab => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'buying' ? '🏠 Buying' : tab === 'renting' ? '🔑 Renting' : '📊 Market'}
                </button>
              ))}
            </div>

            {activeTab === 'buying' && (
              <div className="input-panel card">
                <h4 style={{ marginBottom: '1.25rem' }}>🏠 Property & Bond</h4>
                <Slider label="Property Price" value={inputs.propertyPrice} min={800000} max={5000000} step={50000}
                  onChange={set('propertyPrice')} format={v => formatZARShort(v)}
                  tooltip="Cape Town median: ~R2.1M. Johannesburg median: ~R1.4M. Durban median: ~R1.1M (2024 data)." />
                <Slider label="Deposit" value={inputs.deposit} min={50000} max={1000000} step={10000}
                  onChange={set('deposit')} format={formatZAR}
                  tooltip="10% deposit on R1.8M = R180,000. A 20% deposit (R360,000) removes transfer duty risk and improves your bond rate." />
                <Slider label="Bond Interest Rate (p.a.)" value={Math.round(inputs.bondRate * 1000) / 10} min={9} max={16} step={0.25}
                  onChange={v => set('bondRate')(v / 100)} format={v => `${v}%`}
                  tooltip="SA prime rate is 11.5% (2024/25). Banks offer prime - 0.5% to prime + 2% depending on credit profile and deposit size." />
                <Slider label="Bond Term" value={inputs.bondTermYears} min={10} max={30} step={5}
                  onChange={set('bondTermYears')} format={v => `${v} years`}
                  tooltip="20-year term is standard in SA. A 30-year term lowers monthly payments but you pay significantly more total interest." />
                <Slider label="Monthly Levies (sectional title)" value={inputs.leviesMonthly} min={0} max={8000} step={100}
                  onChange={set('leviesMonthly')} format={formatZAR}
                  tooltip="Sectional title complexes charge R2,000–R6,000/month for security, maintenance, and building insurance. Freehold = R0 levies." />
                <Slider label="Monthly Rates & Taxes" value={inputs.ratesMonthly} min={500} max={6000} step={100}
                  onChange={set('ratesMonthly')} format={formatZAR}
                  tooltip="Municipal rates and taxes. Varies widely by municipality and property value. Budget R1,500–R3,500/month for most urban properties." />
                <Slider label="Attorney & Registration Fees" value={inputs.attorneyFees} min={20000} max={80000} step={1000}
                  onChange={set('attorneyFees')} format={formatZAR}
                  tooltip="Conveyancing attorney fees, bond registration, and deeds office fees. Get a quote typically R30,000-R50,000 on a R1.8M property." />
              </div>
            )}

            {activeTab === 'renting' && (
              <div className="input-panel card">
                <h4 style={{ marginBottom: '1.25rem' }}>🔑 Renting</h4>
                <Slider label="Monthly Rent" value={inputs.monthlyRent} min={5000} max={50000} step={500}
                  onChange={set('monthlyRent')} format={formatZAR}
                  tooltip="Compare to a similar property to what you'd buy. If you'd buy a R1.8M sectional title in Sandton, what would a similar unit rent for?" />
                <Slider label="Annual Rent Increase" value={Math.round(inputs.rentIncreaseAnnual * 100)} min={3} max={15} step={1}
                  onChange={v => set('rentIncreaseAnnual')(v / 100)} format={v => `${v}%`}
                  tooltip="SA rental inflation averages 6–8% p.a. Landlords typically increase rent annually. Budget for this in your renting scenario." />
                <Slider label="Investment Return on Deposit (p.a.)" value={Math.round(inputs.depositInvestRate * 100)} min={5} max={15} step={1}
                  onChange={v => set('depositInvestRate')(v / 100)} format={v => `${v}%`}
                  tooltip="Instead of putting R300k into a deposit, you invest it. JSE ETF: ~10% p.a. Global ETF: ~9–12% p.a. MoneyMarket: 8.5% p.a." />

                {/* Renting context note */}
                <div className="rvb-rent-note card-torn" style={{ marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '0.4rem' }}>🔑 What Renting Includes in This Model</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    The renting scenario assumes you invest your deposit (instead of using it to buy),
                    invest the transfer duty + attorney fees you saved, and invest the monthly
                    difference between bond costs and rent each month. All investments grow at your
                    chosen rate. Total rent paid is deducted to show net wealth.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="input-panel card">
                <h4 style={{ marginBottom: '1.25rem' }}>📊 Market Assumptions</h4>
                <Slider label="Property Growth Rate (p.a.)" value={Math.round(inputs.propertyGrowthRate * 100)} min={2} max={12} step={1}
                  onChange={v => set('propertyGrowthRate')(v / 100)} format={v => `${v}%`}
                  tooltip="SA residential property has averaged ~5–7% p.a. over the last decade. Cape Town has outperformed at ~8–10%. Johannesburg: ~5–6%." />
                <Slider label="Investment Return (p.a.)" value={Math.round(inputs.investmentRate * 100)} min={5} max={15} step={1}
                  onChange={v => set('investmentRate')(v / 100)} format={v => `${v}%`}
                  tooltip="Return on the invested difference between buying and renting costs. JSE ETF: ~10%. Global ETF: ~9–12%." />
                <Slider label="Time Horizon" value={inputs.timeHorizon} min={1} max={20} step={1}
                  onChange={set('timeHorizon')} format={v => `${v} years`}
                  tooltip="How many years to compare over. Property typically needs 8–12 years to outperform renting + investing in most SA cities." />

                <div className="rvb-assumptions card-torn" style={{ marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Model Assumptions</h4>
                  <ul style={{ fontSize: '0.79rem', color: 'var(--text-secondary)', paddingLeft: '1rem', lineHeight: 1.8 }}>
                    <li>Maintenance budgeted at 1% of property value per year</li>
                    <li>Bond balance uses standard amortisation schedule</li>
                    <li>Rental inflation applied annually (not monthly)</li>
                    <li>Investment returns are pre-tax nominal returns</li>
                    <li>No capital gains tax applied on property sale</li>
                    <li>Transfer duty based on SARS 2024/25 table</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/*      RIGHT: OUTPUTS      */}
          <div className="studio-outputs">

            {/* Head-to-head comparison */}
            <div className="output-comparison">
              <div className="output-car card">
                <div className="output-car-label">🏠 Buying</div>
                <div className="output-car-price">{formatZAR(inputs.propertyPrice)}</div>
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
                    <strong>{formatZAR(inputs.leviesMonthly + inputs.ratesMonthly)}/mo</strong>
                  </div>
                  <div className="output-stat">
                    <span>Maintenance</span>
                    <strong>{formatZAR(results.maintenanceMonthly)}/mo</strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Total monthly</span>
                    <strong style={{ color: 'var(--absa-red)' }}>{formatZAR(results.totalMonthlyBuying)}/mo</strong>
                  </div>
                  <div className="output-stat">
                    <span>Property value ({inputs.timeHorizon}yr)</span>
                    <strong style={{ color: 'var(--sage)' }}>{formatZARShort(results.propertyValueEnd)}</strong>
                  </div>
                  <div className="output-stat">
                    <span>Remaining bond</span>
                    <strong>{formatZARShort(results.remainingBond)}</strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Equity built</span>
                    <strong style={{ color: 'var(--sage)' }}>{formatZARShort(results.equity)}</strong>
                  </div>
                </div>
              </div>

              <div className="output-vs">VS</div>

              <div className="output-car card">
                <div className="output-car-label">🔑 Renting</div>
                <div className="output-car-price">{formatZAR(inputs.monthlyRent)}/mo</div>
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
                    <strong style={{ color: 'var(--sage)' }}>{formatZAR(results.rentVsBondMonthly)}/mo</strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Total rent paid ({inputs.timeHorizon}yr)</span>
                    <strong style={{ color: 'var(--absa-red)' }}>{formatZARShort(results.totalRentPaid)}</strong>
                  </div>
                  <div className="output-stat">
                    <span>Deposit growth</span>
                    <strong style={{ color: 'var(--sage)' }}>{formatZARShort(results.depositGrowth)}</strong>
                  </div>
                  <div className="output-stat">
                    <span>Monthly diff invested</span>
                    <strong style={{ color: 'var(--sage)' }}>{formatZARShort(results.monthlyDiffInvested)}</strong>
                  </div>
                  <div className="output-stat output-stat-total">
                    <span>Total invested wealth</span>
                    <strong style={{ color: 'var(--dusty-blue)' }}>{formatZARShort(results.totalInvestedWealth)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Net wealth comparison bars */}
            <div className="card rvb-wealth-compare" style={{ padding: '1.25rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Net wealth position after {inputs.timeHorizon} years
              </div>
              <div className="output-bar-group">
                <div className="output-bar-row">
                  <span className="output-bar-label">🏠 Buying (equity)</span>
                  <div className="output-bar-track">
                    <div className="output-bar-fill" style={{
                      width: `${Math.min(100, (Math.max(0, results.netWealthBuying) / Math.max(Math.abs(results.netWealthBuying), Math.abs(results.netWealthRenting), 1)) * 100)}%`,
                      background: results.buyingWins ? 'var(--absa-red)' : 'var(--border)',
                    }} />
                  </div>
                  <span className="output-bar-val">{formatZARShort(results.netWealthBuying)}</span>
                </div>
                <div className="output-bar-row">
                  <span className="output-bar-label">🔑 Renting (invested)</span>
                  <div className="output-bar-track">
                    <div className="output-bar-fill" style={{
                      width: `${Math.min(100, (Math.max(0, results.netWealthRenting) / Math.max(Math.abs(results.netWealthBuying), Math.abs(results.netWealthRenting), 1)) * 100)}%`,
                      background: !results.buyingWins ? 'var(--dusty-blue)' : 'var(--border)',
                    }} />
                  </div>
                  <span className="output-bar-val">{formatZARShort(results.netWealthRenting)}</span>
                </div>
              </div>
              {results.breakEvenYear && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  ⏱ Break-even point: buying overtakes renting at approximately <strong>Year {results.breakEvenYear}</strong>.
                </p>
              )}
            </div>

            {/* Studio Verdict */}
            <div className="studio-verdict card-feature" style={{ marginTop: '1rem', borderRadius: 'var(--radius-xl)' }}>
              <div className="verdict-badge" style={{ background: verdict.color, color: 'white' }}>
                {verdict.emoji} Studio Verdict
              </div>
              <h3 style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>{verdict.label}</h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.7 }}>{verdict.text}</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.6 }}>{verdict.sub}</p>

              <div className="verdict-impact" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Key Insight
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.88rem' }}>
                  Transfer duty of {formatZAR(results.transferDuty)} + attorney fees of {formatZAR(inputs.attorneyFees)} means you need {formatZARShort(results.totalUpfront)} in cash before you can even start. That's {formatZARShort(results.totalUpfront - inputs.deposit)} above your deposit. Plan for this.
                </p>
              </div>
            </div>

            {/* SA context note */}
            <div className="card-torn studio-sa-note" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.4rem' }}>🇿🇦 South African Property Context</h4>
              <p style={{ fontSize: '0.8rem' }}>
                SA bond rates are prime-linked (currently 11.5%). Property has grown 5–7% p.a. nationally, with
                Cape Town outperforming at 8-10% in recent years. Transfer duty on a R1.8M property is R26,900,
                this is one of the largest hidden costs first-time buyers overlook. Always model the full upfront
                cash requirement before making an offer.
              </p>
            </div>
          </div>
        </div>

        {/*      KEY CONCEPTS      */}
        <div className="studio-concepts">
          <h3 style={{ marginBottom: '1.25rem' }}>Key Concepts Explained</h3>
          <div className="concepts-grid">
            {[
              { icon: '💸', title: 'Transfer Duty', text: "Transfer duty is a government tax paid to SARS on all property purchases above R1.1 million. It is calculated on a sliding scale which is from 3% to 13% depending on price. It is paid upfront in cash, not included in your bond, and is non-negotiable." },
              { icon: '🏗', title: 'Bond Amortisation', text: "In the early years of your bond, most of your repayment goes toward interest, not capital. On a R1.5M bond at 11.5%, roughly 78% of your first repayment is interest. Capital repayment builds slowly this is why buying only starts making sense over longer time horizons." },
              { icon: '📈', title: 'Opportunity Cost of Deposit', text: "Your deposit is not free money just because you own it. Invested in an ETF at 9-10% p.a., R300,000 becomes approximately R462,000 after 5 years. When you put it into a property instead, you forgo this growth. The model accounts for this explicitly." },
              { icon: '🔑', title: 'Rental Inflation', text: "South African landlords typically increase rent by 6-10% annually. This means rent that looks cheap today can become expensive quickly. A R15,000 rent at 7% annual increase costs R21,000 in 5 years and R29,500 in 10 years this is a key argument for buying long-term." },
            ].map(c => (
              <div key={c.title} className="concept-card card-pinned">
                <div className="concept-icon">{c.icon}</div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>{c.title}</h4>
                <p style={{ fontSize: '0.82rem' }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}




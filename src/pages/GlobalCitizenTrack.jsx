import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/UserProfileContext';
import { formatZAR } from '../utils/finance';
import './GlobalCitizenTrack.css';

// progress tracked locally with useState - It resets on refresh which is fine for A2, Ill fix it to store locally in next Iteration
// would use localStorage in a real version

// Global Citizen Was my favourite track to design , thats why i used it for milestone 1, 
// it feels the most me and most aligned with my goals, and setting it up  has helped me start mapping out the other tracls


const MILESTONES = [
  {
    year: 1,
    title: "Build Your Foundation",
    subtitle: "Open TFSA · First offshore account · Emergency fund",
    goals: [
      { id: 'm1a', label: 'Open and contribute to TFSA (R46,000 annual limit)', detail: 'The Tax-Free Savings Account is the single best starting investment for most young South Africans. Every cent of growth, interest and dividends is completely tax-free for life. Open yours first.' },
      { id: 'm1b', label: 'Open first offshore investment account (EasyEquities USD or similar)', detail: 'Use your annual R1.1 million discretionary allowance to move money offshore without SARB approval. Start with an EasyEquities USD account or a platform like Sygnia.' },
      { id: 'm1c', label: 'Emergency fund: 3 months of expenses in high-yield account', detail: 'Before investing aggressively, you need a buffer. 3 months of expenses (roughly R80,000-R100,000 at your income level) should sit in a money market account earning above 8% p.a.' },
      { id: 'm1d', label: 'Close student loan / clear remaining debt', detail: 'Debt at prime + 3% (currently ~14%) destroys more wealth than investments build at 9%. Clear any high-interest debt before investing.' },
    ],
    color: 'var(--dusty-blue)',
    tip: 'Max out your TFSA before any other investment. The tax-free compounding over 10+ years is unbeatable.',
  },
  {
    year: 2,
    title: "Optimise for Tax",
    subtitle: "RA contributions · Offshore diversification · Income structuring",
    goals: [
      { id: 'm2a', label: 'Start Retirement Annuity (RA) - at least 10% of salary', detail: 'At your marginal tax bracket, every R1,000 in RA contributions saves you approximately R390 in tax (39% bracket). This is an immediate 39% return before the investment even grows.' },
      { id: 'm2b', label: 'Diversify offshore portfolio: add S&P 500 ETF + global bonds', detail: 'Once your USD account is open, add a broad S&P 500 ETF (like the Vanguard VOO or iShares IVV) plus a bond component for balance. Aim for 80/20 equities/bonds in your thirties.' },
      { id: 'm2c', label: 'Review employer provident fund - ensure adequate contribution', detail: 'Many employers offer matching contributions. Confirm you\'re taking full advantage of any employer match, it\'s free money!' },
      { id: 'm2d', label: 'Move emergency fund to money market earning 8%+', detail: 'Standard savings accounts earn 3-4%. Absa MoneyMarket or similar products earn 8-9%. Make your emergency fund work while it waits.' },
    ],
    color: 'var(--gold)',
    tip: 'At 39% tax bracket: R27,500/month in RA contributions can save you R128,700 in tax annually.',
  },
  {
    year: 3,
    title: "Scale Your Offshore Position",
    subtitle: "Maximise offshore allowance · Currency diversification · Portfolio rebalancing",
    goals: [
      { id: 'm3a', label: 'Use full R1.1M annual offshore discretionary allowance', detail: 'SARS allows South Africans to move R1.1 million offshore per year without a SARB tax clearance. At your income level you should aim to use this fully over 3–4 years to build meaningful currency diversification.' },
      { id: 'm3b', label: 'Add exposure to Emerging Markets and global REITs', detail: 'Broaden beyond US equities. Emerging market ETFs (like Vanguard VWO) and global REIT funds give you real estate exposure internationally without owning property in SA.' },
      { id: 'm3c', label: 'Consider ExpatConnect or Living Annuity for long-term offshore structuring', detail: 'If location independence is the goal, speak to a fee-based financial planner about the most tax-efficient vehicle for your offshore assets should you ever move abroad.' },
      { id: 'm3d', label: 'Annual rebalancing: ensure target allocation is maintained', detail: 'Set a rule: every January, rebalance your portfolio back to your target allocation (e.g. 40% local, 60% offshore). Markets drift; active rebalancing forces you to buy low and sell high.' },
    ],
    color: 'var(--sage)',
    tip: 'Rand has depreciated ~7% annually vs USD over 10 years. Offshore investing protects against this.',
  },
  {
    year: 4,
    title: "Build Passive Income",
    subtitle: "Dividend streams · Income ETFs · Tax structuring",
    goals: [
      { id: 'm4a', label: 'Add dividend-paying ETFs to offshore portfolio', detail: 'Dividend-focused ETFs like VYM (Vanguard High Dividend Yield) or SCHD start generating quarterly USD income. At R500,000 invested, this could produce R15,000–R25,000/year in dividends.' },
      { id: 'm4b', label: 'Review RA contributions: aim for 15–20% of income', detail: 'By year 4 your income may have grown. Ensure RA contributions scale with income to remain tax-efficient and maintain your retirement trajectory.' },
      { id: 'm4c', label: 'Consider second income stream (consulting, digital)', detail: 'Location independence relies on income that travels. Start building skills or side projects that could generate income independently of any single employer or location.' },
      { id: 'm4d', label: 'TFSA: review lifetime limit progress (R500,000 lifetime cap)', detail: 'After 4 years of R36k contributions you have used R144k of your R500k lifetime TFSA limit. Monitor this and plan to fully utilise it over your working lifetime.' },
    ],
    color: 'var(--terracotta)',
    tip: 'R500k invested in a 9% dividend ETF produces ~R45,000/year. That\'s your first passive income stream.',
  },
  {
    year: 5,
    title: "Location Independence",
    subtitle: "Review, rebalance, and set the next 5-year vision",
    goals: [
      { id: 'm5a', label: 'Portfolio review: net worth vs 5-year target', detail: 'Sit down with your full financial picture. How close are you to the R500,000 offshore target? What is your total net worth? Are you on track for early financial independence?' },
      { id: 'm5b', label: 'Model FIRE number (Financial Independence, Retire Early)', detail: 'Calculate your FIRE number: 25x your annual expenses. At R400,000/year in expenses, that\'s R10 million. How far are you? A fee-based advisor can help model this accurately.' },
      { id: 'm5c', label: 'Consider second property or structured product if goals exceeded', detail: 'If you\'ve hit your offshore and local targets ahead of schedule, this is the moment to consider whether property now makes sense as a diversification tool or to simply accelerate your existing plan.' },
      { id: 'm5d', label: 'Build your next 5-year Vision Board', detail: 'The first five years were about foundations. The next five are about acceleration. Revisit your Vision Board and set new, bolder targets.' },
    ],
    color: 'var(--absa-red)',
    tip: 'By year 5, you should have R500k+ offshore, TFSA near R180k, and a clear path to financial independence.',
  },
];

const NUDGES = [
  { icon: '💡', text: 'You have R35,000 in a standard savings account - moving this to a TFSA could save you tax on all future growth.' },
  { icon: '📊', text: 'Your RA contribution could reduce your taxable income by R24,000 this year, saving approximately R9,360 in PAYE.' },
  { icon: '🌍', text: 'Consider using your annual R1.1 million offshore discretionary allowance before the tax year ends on 28 February.' },
  { icon: '⚡', text: 'Investing R5,000/month in a global ETF at 9% p.a. gives you approximately R373,000 after 5 years - your first offshore milestone.' },
];

function MilestoneCard({ milestone, index }) {
  const [completions, setCompletions] = useState(() =>
    milestone.goals.reduce((acc, g) => ({ ...acc, [g.id]: false }), {})
  );
  const [expanded, setExpanded] = useState(null);
  const [open, setOpen] = useState(index === 0);

  const completedCount = Object.values(completions).filter(Boolean).length;
  const progress = Math.round((completedCount / milestone.goals.length) * 100);

  const toggleGoal = (id) => {
    setCompletions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const statusLabel =
    progress === 0 ? 'Not Started' :
    progress === 100 ? 'Complete ✓' :
    'In Progress';

  const statusColor =
    progress === 0 ? 'var(--text-muted)' :
    progress === 100 ? 'var(--sage)' :
    'var(--gold)';

  return (
    <div className={`milestone-card ${open ? 'milestone-open' : ''}`} style={{ '--m-color': milestone.color }}>
      <div className="milestone-header" onClick={() => setOpen(o => !o)}>
        <div className="milestone-year" style={{ background: milestone.color }}>
          Year {milestone.year}
        </div>
        <div className="milestone-summary">
          <div className="milestone-title">{milestone.title}</div>
          <div className="milestone-subtitle">{milestone.subtitle}</div>
        </div>
        <div className="milestone-right">
          <div className="milestone-progress-wrap">
            <div className="progress-bar-track" style={{ width: '80px' }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%`, background: milestone.color }} />
            </div>
            <span className="milestone-pct" style={{ color: statusColor }}>{statusLabel}</span>
          </div>
          <span className="milestone-toggle">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div className="milestone-body">
          {milestone.goals.map(goal => (
            <div key={goal.id} className={`goal-item ${completions[goal.id] ? 'goal-done' : ''}`}>
              <div className="goal-row" onClick={() => toggleGoal(goal.id)}>
                <div className={`goal-check ${completions[goal.id] ? 'goal-check-done' : ''}`}>
                  {completions[goal.id] ? '✓' : ''}
                </div>
                <span className="goal-label">{goal.label}</span>
                <button
                  className="goal-info-btn"
                  onClick={e => { e.stopPropagation(); setExpanded(expanded === goal.id ? null : goal.id); }}
                >i</button>
              </div>
              {expanded === goal.id && (
                <div className="goal-detail">
                  <p>{goal.detail}</p>
                </div>
              )}
            </div>
          ))}

          <div className="milestone-tip">
            <span className="milestone-tip-icon">✦</span>
            <p>{milestone.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GlobalCitizenTrack() {
  const { profile, disposable } = useProfile();

  return (
    <div className="track-detail-page">
      <div className="container">

        {/*    HERO    */}
        <div className="track-hero">
          <div className="track-hero-content">
            <Link to="/tracks" className="back-link">← All Vision Tracks</Link>
            <div className="track-badge-row">
              <span className="badge badge-blue">✈ Your Active Vision</span>
              <span className="badge badge-gold">Global Citizen</span>
            </div>
            <h1>The Global Citizen Vision</h1>
            <p className="track-hero-desc">
              Build offshore wealth. Maximise tax efficiency. Create income that travels with you.
              This is your 5-year roadmap to financial independence.
            </p>
            <div className="track-hero-stats">
              {[
                { label: 'Time Horizon', value: '5 Years' },
                { label: 'Primary Goal', value: 'R500k offshore' },
                { label: 'Key Tools', value: 'TFSA · RA · Offshore' },
                { label: 'Risk Profile', value: 'Moderate–Aggressive' },
              ].map(s => (
                <div key={s.label} className="track-stat">
                  <div className="track-stat-value">{s.value}</div>
                  <div className="track-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="track-hero-visual">
            <div className="moodboard">
              {['✈', '🌍', '📈', '💰', '🗺', '🏦'].map((e, i) => (
                <div key={i} className={`moodboard-tile moodboard-${i}`}>{e}</div>
              ))}
              <div className="moodboard-label hand-note">freedom</div>
            </div>
          </div>
        </div>

        {/*    PHILOSOPHY    */}
        <div className="philosophy-section card">
          <div className="philosophy-inner">
            <div>
              <h3>The Philosophy Behind This Track</h3>
              <p style={{ marginTop: '0.75rem' }}>
                The Global Citizen Vision is built on one core insight: <strong>the Rand has lost approximately
                7% of its value against the US Dollar every year for the past decade.</strong> If you earn in Rands
                but keep all your wealth in Rands, inflation and currency depreciation quietly erode your purchasing power.
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                This track deliberately moves money offshore, maximises tax-efficient vehicles (TFSA and RA),
                and builds a globally diversified portfolio that doesn't depend on the South African economy
                performing well. You don't need to emigrate to build global wealth.
              </p>
            </div>
            <div className="philosophy-pillars">
              {[
                { icon: '🛡', title: 'Currency Protection', desc: 'Offshore exposure protects against Rand depreciation. Even at lower base returns, USD assets often outperform in ZAR terms.' },
                { icon: '💳', title: 'Tax Efficiency First', desc: 'TFSA and RA contributions reduce your taxable income and grow tax-free. Use these fully before any taxable investment.' },
                { icon: '🔗', title: 'Location Independence', desc: 'Building income streams and assets that don\'t require you to be in one country gives you choices others won\'t have.' },
              ].map(p => (
                <div key={p.title} className="pillar-card card-torn">
                  <div className="pillar-icon">{p.icon}</div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*    PERSONAL RECOMMENDATION    */}
        <div className="card-gold personal-rec" style={{ borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>📋 Your Personal Recommendation</h4>
          <p>
            Based on your snapshot, you have <strong>{formatZAR(disposable)}/month disposable income</strong>.
            Here's how to allocate this for the Global Citizen Vision:
          </p>
          <div className="rec-allocation">
            {[
              { label: 'TFSA (R46k/year)', amount: 3833, color: 'var(--dusty-blue)', pct: Math.round(3833/disposable*100) },
              { label: 'RA contribution', amount: 5000, color: 'var(--gold)', pct: Math.round(5000/disposable*100) },
              { label: 'Offshore investment', amount: 8000, color: 'var(--sage)', pct: Math.round(8000/disposable*100) },
              { label: 'Emergency top-up', amount: 2000, color: 'var(--caramel)', pct: Math.round(2000/disposable*100) },
            ].map(r => (
              <div key={r.label} className="rec-item">
                <div className="rec-label">{r.label}</div>
                <div className="progress-bar-track" style={{ flex: 1 }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100,r.pct)}%`, background: r.color }} />
                </div>
                <div className="rec-amount">{formatZAR(r.amount)}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Total allocation: {formatZAR(18000)}/month. Remaining discretionary: {formatZAR(disposable - 18000)}/month.
          </p>
        </div>

        {/*    MILESTONES    */}
        <div className="milestones-section">
          <div className="section-header">
            <span className="eyebrow hand-note">Your 5-year roadmap</span>
            <h2>Milestones</h2>
            <p>Click each year to expand. Tick off goals as you complete them to track your progress.</p>
          </div>

          <div className="milestones-list">
            {MILESTONES.map((m, i) => (
              <MilestoneCard key={m.year} milestone={m} index={i} />
            ))}
          </div>
        </div>

        {/*    NUDGES    */}
        <div className="nudges-section">
          <h3 style={{ marginBottom: '1rem' }}>Your Vision Nudges</h3>
          <div className="nudges-grid">
            {NUDGES.map((n, i) => (
              <div key={i} className="nudge-card card-pinned">
                <span className="nudge-icon">{n.icon}</span>
                <p className="nudge-text">{n.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/*    SA CONTEXT BOX    */}
        <div className="sa-context-box card" style={{ marginTop: '2rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>🇿🇦 Key South African Context for This Track</h4>
          <div className="sa-context-grid">
            {[
              { title: 'TFSA Annual Limit', detail: 'R46,000 per tax year (from 1 March 2026). Lifetime limit: R500,000. Over-contributing results in a 40% penalty tax. New limit is confirmed by SARS annually.' },
              { title: 'RA Contribution Limit', detail: 'Up to 27.5% of the greater of taxable income or remuneration, capped at R430,000 annually (from 2026). Excess rolls over to future years.' },
              { title: 'Offshore Allowance', detail: 'Discretionary: R1.1 million per year (no SARB approval needed). Single Discretionary: R1 million for travel/gifts combined. Over R10M requires SARB approval.' },
              { title: 'Dividends Withholding Tax', detail: 'Local dividends: 20% withholding tax. TFSA dividends: tax-free. Offshore dividends depend on the country\'s double tax agreement with SA.' },
            ].map(item => (
              <div key={item.title} className="sa-context-item card-torn">
                <h4 style={{ fontSize: '0.88rem', marginBottom: '0.4rem' }}>{item.title}</h4>
                <p style={{ fontSize: '0.82rem' }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/*    CTA    */}
        <div className="track-cta">
          <div>
            <h3>Ready to simulate the big decisions?</h3>
            <p>See whether financing a luxury car now could delay your Vision by years.</p>
          </div>
          <Link to="/studio/car-comparison" className="btn btn-primary btn-lg">
            Try the Car Studio →
          </Link>
        </div>

      </div>
    </div>
  );
}

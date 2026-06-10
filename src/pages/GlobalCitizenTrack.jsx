import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/UserProfileContext";
import { formatZAR } from "../utils/finance";
import {
  Globe,
  Lightbulb,
  TrendingUp,
  Shield,
  CreditCard,
  Link2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  ArrowLeft,
  Plane,
  BarChart2,
  Banknote,
  Map,
  Building,
} from "lucide-react";
import "./GlobalCitizenTrack.css";

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
      {
        id: "m1a",
        label: "Open and contribute to TFSA (R46,000 annual limit)",
        detail:
          "The Tax-Free Savings Account is the single best starting investment for most young South Africans. Every cent of growth, interest and dividends is completely tax-free for life. Open yours first.",
      },
      {
        id: "m1b",
        label:
          "Open first offshore investment account (EasyEquities USD or similar)",
        detail:
          "Use your annual R1.1 million discretionary allowance to move money offshore without SARB approval. Start with an EasyEquities USD account or a platform like Sygnia.",
      },
      {
        id: "m1c",
        label: "Emergency fund: 3 months of expenses in high-yield account",
        detail:
          "Before investing aggressively, you need a buffer. 3 months of expenses (roughly R80,000-R100,000 at your income level) should sit in a money market account earning above 8% p.a.",
      },
      {
        id: "m1d",
        label: "Close student loan / clear remaining debt",
        detail:
          "Debt at prime + 3% (currently ~14%) destroys more wealth than investments build at 9%. Clear any high-interest debt before investing.",
      },
    ],
    color: "var(--dusty-blue)",
    tip: "Max out your TFSA before any other investment. The tax-free compounding over 10+ years is unbeatable.",
  },
  {
    year: 2,
    title: "Optimise for Tax",
    subtitle:
      "RA contributions · Offshore diversification · Income structuring",
    goals: [
      {
        id: "m2a",
        label: "Start Retirement Annuity (RA) - at least 10% of salary",
        detail:
          "At your marginal tax bracket, every R1,000 in RA contributions saves you approximately R390 in tax (39% bracket). This is an immediate 39% return before the investment even grows.",
      },
      {
        id: "m2b",
        label: "Diversify offshore portfolio: add S&P 500 ETF + global bonds",
        detail:
          "Once your USD account is open, add a broad S&P 500 ETF (like the Vanguard VOO or iShares IVV) plus a bond component for balance. Aim for 80/20 equities/bonds in your thirties.",
      },
      {
        id: "m2c",
        label: "Review employer provident fund - ensure adequate contribution",
        detail:
          "Many employers offer matching contributions. Confirm you're taking full advantage of any employer match, it's free money!",
      },
      {
        id: "m2d",
        label: "Move emergency fund to money market earning 8%+",
        detail:
          "Standard savings accounts earn 3-4%. Absa MoneyMarket or similar products earn 8-9%. Make your emergency fund work while it waits.",
      },
    ],
    color: "var(--gold)",
    tip: "At 39% tax bracket: R27,500/month in RA contributions can save you R128,700 in tax annually.",
  },
  {
    year: 3,
    title: "Scale Your Offshore Position",
    subtitle:
      "Maximise offshore allowance · Currency diversification · Portfolio rebalancing",
    goals: [
      {
        id: "m3a",
        label: "Use full R1.1M annual offshore discretionary allowance",
        detail:
          "SARS allows South Africans to move R1.1 million offshore per year without a SARB tax clearance. At your income level you should aim to use this fully over 3–4 years to build meaningful currency diversification.",
      },
      {
        id: "m3b",
        label: "Add exposure to Emerging Markets and global REITs",
        detail:
          "Broaden beyond US equities. Emerging market ETFs (like Vanguard VWO) and global REIT funds give you real estate exposure internationally without owning property in SA.",
      },
      {
        id: "m3c",
        label:
          "Consider ExpatConnect or Living Annuity for long-term offshore structuring",
        detail:
          "If location independence is the goal, speak to a fee-based financial planner about the most tax-efficient vehicle for your offshore assets should you ever move abroad.",
      },
      {
        id: "m3d",
        label: "Annual rebalancing: ensure target allocation is maintained",
        detail:
          "Set a rule: every January, rebalance your portfolio back to your target allocation (e.g. 40% local, 60% offshore). Markets drift; active rebalancing forces you to buy low and sell high.",
      },
    ],
    color: "var(--sage)",
    tip: "Rand has depreciated ~7% annually vs USD over 10 years. Offshore investing protects against this.",
  },
  {
    year: 4,
    title: "Build Passive Income",
    subtitle: "Dividend streams · Income ETFs · Tax structuring",
    goals: [
      {
        id: "m4a",
        label: "Add dividend-paying ETFs to offshore portfolio",
        detail:
          "Dividend-focused ETFs like VYM (Vanguard High Dividend Yield) or SCHD start generating quarterly USD income. At R500,000 invested, this could produce R15,000–R25,000/year in dividends.",
      },
      {
        id: "m4b",
        label: "Review RA contributions: aim for 15–20% of income",
        detail:
          "By year 4 your income may have grown. Ensure RA contributions scale with income to remain tax-efficient and maintain your retirement trajectory.",
      },
      {
        id: "m4c",
        label: "Consider second income stream (consulting, digital)",
        detail:
          "Location independence relies on income that travels. Start building skills or side projects that could generate income independently of any single employer or location.",
      },
      {
        id: "m4d",
        label: "TFSA: review lifetime limit progress (R500,000 lifetime cap)",
        detail:
          "After 4 years of R46k contributions you have used R184k of your R500k lifetime TFSA limit. Monitor this and plan to fully utilise it over your working lifetime.",
      },
    ],
    color: "var(--terracotta)",
    tip: "R500k invested in a 9% dividend ETF produces ~R45,000/year. That's your first passive income stream.",
  },
  {
    year: 5,
    title: "Location Independence",
    subtitle: "Review, rebalance, and set the next 5-year vision",
    goals: [
      {
        id: "m5a",
        label: "Portfolio review: net worth vs 5-year target",
        detail:
          "Sit down with your full financial picture. How close are you to the R500,000 offshore target? What is your total net worth? Are you on track for early financial independence?",
      },
      {
        id: "m5b",
        label: "Model FIRE number (Financial Independence, Retire Early)",
        detail:
          "Calculate your FIRE number: 25x your annual expenses. At R400,000/year in expenses, that's R10 million. How far are you? A fee-based advisor can help model this accurately.",
      },
      {
        id: "m5c",
        label:
          "Consider second property or structured product if goals exceeded",
        detail:
          "If you've hit your offshore and local targets ahead of schedule, this is the moment to consider whether property now makes sense as a diversification tool or to simply accelerate your existing plan.",
      },
      {
        id: "m5d",
        label: "Build your next 5-year Vision Board",
        detail:
          "The first five years were about foundations. The next five are about acceleration. Revisit your Vision Board and set new, bolder targets.",
      },
    ],
    color: "var(--absa-red)",
    tip: "By year 5, you should have R500k+ offshore, TFSA near R180k, and a clear path to financial independence.",
  },
];

//    5-YEAR TIMELINE STRIP   
const TIMELINE_MILESTONES = [
  {
    year: 1,
    label: "Foundation",
    color: "var(--dusty-blue)",
    icon: <Shield size={14} />,
  },
  {
    year: 2,
    label: "Tax Optimise",
    color: "var(--gold)",
    icon: <Banknote size={14} />,
  },
  {
    year: 3,
    label: "Go Offshore",
    color: "var(--sage)",
    icon: <Globe size={14} />,
  },
  {
    year: 4,
    label: "Passive Income",
    color: "var(--terracotta)",
    icon: <TrendingUp size={14} />,
  },
  {
    year: 5,
    label: "Independence",
    color: "var(--absa-red)",
    icon: <Plane size={14} />,
  },
];

function TimelineStrip({ completions }) {
  // completions: { 1: 0-100, 2: 0-100, ... } progress per year
  return (
    <section
      className="gc-timeline-strip"
      aria-label="5-year progress timeline"
    >
      <div className="gc-timeline-track">
        {TIMELINE_MILESTONES.map((m, i) => {
          const pct = completions[m.year] ?? 0;
          const done = pct === 100;
          const active = pct > 0 && pct < 100;
          return (
            <div key={m.year} className="gc-timeline-item">
              {/* connector line */}
              {i < TIMELINE_MILESTONES.length - 1 && (
                <div
                  className="gc-timeline-connector"
                  style={{
                    background: done ? m.color : "var(--border)",
                  }}
                  aria-hidden="true"
                />
              )}
              {/* dot */}
              <div
                className={`gc-timeline-dot ${done ? "gc-dot-done" : active ? "gc-dot-active" : "gc-dot-pending"}`}
                style={{
                  borderColor: m.color,
                  background: done
                    ? m.color
                    : active
                      ? `${m.color}33`
                      : "var(--bg-card)",
                }}
                aria-label={`Year ${m.year}: ${m.label}  ${pct}% complete`}
              >
                {done ? (
                  <CheckCircle size={16} color="white" />
                ) : (
                  <span style={{ color: done ? "white" : m.color }}>
                    {m.icon}
                  </span>
                )}
              </div>
              {/* label */}
              <div className="gc-timeline-label">
                <span className="gc-timeline-year" style={{ color: m.color }}>
                  Yr {m.year}
                </span>
                <span className="gc-timeline-name">{m.label}</span>
                <span
                  className="gc-timeline-pct"
                  style={{ color: done ? m.color : "var(--text-muted)" }}
                >
                  {done ? "✓ Done" : active ? `${pct}%` : "Not started"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function buildNudges(profile, takeHome, disposable) {
  const raMonthly = Math.round(takeHome * 0.1);
  const raTaxSave = Math.round(raMonthly * 0.39 * 12);
  const investAmount = Math.max(0, Math.round(disposable * 0.5));
  const fiveYearFV = Math.round(
    investAmount * ((Math.pow(1.0075, 60) - 1) / 0.0075),
  );

  return [
    {
      icon: <Lightbulb size={20} />,
      text: `You have ${formatZAR(profile.savings.emergencyFund)} in savings. Moving some into a TFSA shelters all future growth from tax permanently.`,
    },
    {
      icon: <BarChart2 size={20} />,
      text: `Contributing ${formatZAR(raMonthly)}/month to an RA could save approximately ${formatZAR(raTaxSave)} in PAYE annually at your marginal tax bracket.`,
    },
    {
      icon: <Globe size={20} />,
      text: `Consider using your annual R1.1 million offshore discretionary allowance before the SA tax year ends on 28 February.`,
    },
    {
      icon: <TrendingUp size={20} />,
      text: `Investing ${formatZAR(investAmount)}/month (50% of disposable income) in a global ETF at 9% p.a. could grow to approximately ${formatZAR(fiveYearFV)} after 5 years.`,
    },
  ];
}

function MilestoneCard({ milestone, index }) {
  const STORAGE_KEY = `gc_milestone_${milestone.year}`;

  const [completions, setCompletions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return milestone.goals.reduce((acc, g) => ({ ...acc, [g.id]: false }), {});
  });
  const [expanded, setExpanded] = useState(null);
  const [open, setOpen] = useState(index === 0);

  const completedCount = Object.values(completions).filter(Boolean).length;
  const progress = Math.round((completedCount / milestone.goals.length) * 100);

  const toggleGoal = (id) => {
    setCompletions((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const statusLabel =
    progress === 0
      ? "Not Started"
      : progress === 100
        ? "Complete ✓"
        : "In Progress";

  const statusColor =
    progress === 0
      ? "var(--text-muted)"
      : progress === 100
        ? "var(--sage)"
        : "var(--gold)";

  return (
    <div
      className={`milestone-card ${open ? "milestone-open" : ""}`}
      style={{ "--m-color": milestone.color }}
    >
      <div className="milestone-header" onClick={() => setOpen((o) => !o)}>
        <div className="milestone-year" style={{ background: milestone.color }}>
          Year {milestone.year}
        </div>
        <div className="milestone-summary">
          <div className="milestone-title">{milestone.title}</div>
          <div className="milestone-subtitle">{milestone.subtitle}</div>
        </div>
        <div className="milestone-right">
          <div className="milestone-progress-wrap">
            <div className="progress-bar-track" style={{ width: "80px" }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%`, background: milestone.color }}
              />
            </div>
            <span className="milestone-pct" style={{ color: statusColor }}>
              {statusLabel}
            </span>
          </div>
          <span className="milestone-toggle" aria-hidden="true">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {open && (
        <div className="milestone-body">
          {milestone.goals.map((goal) => (
            <div
              key={goal.id}
              className={`goal-item ${completions[goal.id] ? "goal-done" : ""}`}
            >
              <div className="goal-row" onClick={() => toggleGoal(goal.id)}>
                <div
                  className={`goal-check ${completions[goal.id] ? "goal-check-done" : ""}`}
                >
                  {completions[goal.id] ? "✓" : ""}
                </div>
                <span className="goal-label">{goal.label}</span>
                <button
                  className="goal-info-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(expanded === goal.id ? null : goal.id);
                  }}
                >
                  i
                </button>
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
  const { profile, takeHome, disposable, totalSavings, primaryGoalDerived } =
    useProfile();
  const NUDGES = buildNudges(profile, takeHome, disposable);

  // Per-year progress for timeline strip
  const yearProgress = Object.fromEntries(
    MILESTONES.map((m) => {
      try {
        const saved = localStorage.getItem(`gc_milestone_${m.year}`);
        if (saved) {
          const completions = JSON.parse(saved);
          const done = Object.values(completions).filter(Boolean).length;
          return [m.year, Math.round((done / m.goals.length) * 100)];
        }
      } catch {}
      return [m.year, 0];
    }),
  );

  const tfsaMonthly = Math.min(3833, Math.round(disposable * 0.25));
  const raMonthly = Math.min(
    Math.round(takeHome * 0.1),
    Math.round(disposable * 0.3),
  );
  const offshoreMonthly = Math.round(disposable * 0.35);
  const emergencyMonthly = Math.max(
    0,
    disposable - tfsaMonthly - raMonthly - offshoreMonthly,
  );
  const totalAllocated =
    tfsaMonthly + raMonthly + offshoreMonthly + emergencyMonthly;

  const PILLARS = [
    {
      icon: <Shield size={22} />,
      title: "Currency Protection",
      desc: "Offshore exposure protects against Rand depreciation. Even at lower base returns, USD assets often outperform in ZAR terms.",
    },
    {
      icon: <CreditCard size={22} />,
      title: "Tax Efficiency First",
      desc: "TFSA and RA contributions reduce your taxable income and grow tax-free. Use these fully before any taxable investment.",
    },
    {
      icon: <Link2 size={22} />,
      title: "Location Independence",
      desc: "Building income streams and assets that don't require you to be in one country gives you choices others won't have.",
    },
  ];

  const MOODBOARD_ICONS = [
    <Plane size={22} />,
    <Globe size={22} />,
    <TrendingUp size={22} />,
    <Banknote size={22} />,
    <Map size={22} />,
    <Building size={22} />,
  ];

  return (
    <main className="track-detail-page">
      <div className="container">
        {/* HERO */}
        <header className="track-hero">
          <div className="track-hero-content">
            <Link
              to="/tracks"
              className="back-link"
              aria-label="Back to all vision tracks"
            >
              <ArrowLeft size={16} /> All Vision Tracks
            </Link>
            <div className="track-badge-row">
              <span className="badge badge-blue">
                <Plane size={11} /> Your Active Vision
              </span>
              <span className="badge badge-gold">Global Citizen</span>
            </div>
            <h1>The Global Citizen Vision</h1>
            <p className="track-hero-desc">
              Build offshore wealth. Maximise tax efficiency. Create income that
              travels with you. This is your 5-year roadmap to financial
              independence.
            </p>
            <div className="track-hero-stats">
              {[
                { label: "Time Horizon", value: "5 Years" },
                { label: "Primary Goal", value: "R500k offshore" },
                { label: "Key Tools", value: "TFSA · RA · Offshore" },
                { label: "Risk Profile", value: "Moderate–Aggressive" },
              ].map((s) => (
                <div key={s.label} className="track-stat">
                  <div className="track-stat-value">{s.value}</div>
                  <div className="track-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="track-hero-visual" aria-hidden="true">
            <div className="moodboard">
              {MOODBOARD_ICONS.map((icon, i) => (
                <div key={i} className={`moodboard-tile moodboard-${i}`}>
                  {icon}
                </div>
              ))}
              <div className="moodboard-label hand-note">freedom</div>
            </div>
          </div>
        </header>

        {/* TIMELINE STRIP */}
        <TimelineStrip completions={yearProgress} />

        {/* PHILOSOPHY */}
        <section className="philosophy-section card">
          <div className="philosophy-inner">
            <div>
              <h3>The Philosophy Behind This Track</h3>
              <p style={{ marginTop: "0.75rem" }}>
                The Global Citizen Vision is built on one core insight:{" "}
                <strong>
                  the Rand has lost approximately 7% of its value against the US
                  Dollar every year for the past decade.
                </strong>{" "}
                If you earn in Rands but keep all your wealth in Rands,
                inflation and currency depreciation quietly erode your
                purchasing power.
              </p>
              <p style={{ marginTop: "0.75rem" }}>
                This track deliberately moves money offshore, maximises
                tax-efficient vehicles (TFSA and RA), and builds a globally
                diversified portfolio that doesn't depend on the South African
                economy performing well. You don't need to emigrate to build
                global wealth.
              </p>
            </div>
            <div className="philosophy-pillars">
              {PILLARS.map((p) => (
                <div key={p.title} className="pillar-card card-torn">
                  <div className="pillar-icon">{p.icon}</div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PERSONAL RECOMMENDATION */}
        <div
          className="card-gold personal-rec"
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "1.75rem",
            marginBottom: "2rem",
          }}
        >
          <h4 style={{ marginBottom: "0.75rem" }}>
            Your Personal Recommendation
          </h4>
          <p>
            Based on your snapshot, you have{" "}
            <strong>{formatZAR(disposable)}/month disposable income</strong>.
            Here's how to allocate this for the Global Citizen Vision:
          </p>
          <div className="rec-allocation">
            {[
              {
                label: "TFSA (R46k/year cap)",
                amount: tfsaMonthly,
                color: "var(--dusty-blue)",
                pct: Math.round((tfsaMonthly / Math.max(1, disposable)) * 100),
              },
              {
                label: "RA contribution (10% take-home)",
                amount: raMonthly,
                color: "var(--gold)",
                pct: Math.round((raMonthly / Math.max(1, disposable)) * 100),
              },
              {
                label: "Offshore investment",
                amount: offshoreMonthly,
                color: "var(--sage)",
                pct: Math.round(
                  (offshoreMonthly / Math.max(1, disposable)) * 100,
                ),
              },
              {
                label: "Emergency fund top-up",
                amount: emergencyMonthly,
                color: "var(--caramel)",
                pct: Math.round(
                  (emergencyMonthly / Math.max(1, disposable)) * 100,
                ),
              },
            ].map((r) => (
              <div key={r.label} className="rec-item">
                <div className="rec-label">{r.label}</div>
                <div className="progress-bar-track" style={{ flex: 1 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, r.pct)}%`,
                      background: r.color,
                    }}
                  />
                </div>
                <div className="rec-amount">{formatZAR(r.amount)}</div>
              </div>
            ))}
          </div>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
            }}
          >
            Total allocation: {formatZAR(totalAllocated)}/month. Remaining
            discretionary: {formatZAR(Math.max(0, disposable - totalAllocated))}
            /month.
          </p>
        </div>

        {/* LIVE SAVINGS PROGRESS */}
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h4 style={{ marginBottom: "1.25rem" }}>
            Your Progress Toward This Vision
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {[
              {
                label: "Offshore Portfolio",
                current: profile.savings.offshore,
                target: 500000,
                color: "var(--dusty-blue)",
              },
              {
                label: "TFSA (Lifetime R500k)",
                current: profile.savings.tfsa,
                target: 500000,
                color: "var(--gold)",
              },
              {
                label: "Retirement Annuity",
                current: profile.savings.ra,
                target: Math.round(takeHome * 0.1 * 60),
                color: "var(--sage)",
              },
              {
                label: "Emergency Fund (3–6 months)",
                current: profile.savings.emergencyFund,
                target: Math.round(takeHome * 3),
                color: "var(--caramel)",
              },
              {
                label: "Local Investments",
                current: profile.savings.localInvestments,
                target: 150000,
                color: "var(--terracotta)",
              },
            ].map((item) => {
              const pct = Math.min(
                100,
                Math.round((item.current / item.target) * 100),
              );
              return (
                <div key={item.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.3rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {formatZAR(item.current)} / {formatZAR(item.target)} (
                      {pct}%)
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: item.color,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            Update your savings in the{" "}
            <a
              href="/snapshot"
              style={{
                color: "var(--dusty-blue)",
                textDecoration: "underline",
              }}
            >
              Money Snapshot
            </a>{" "}
            and these bars update automatically.
          </p>
        </div>

        {/* MILESTONES */}
        <section className="milestones-section">
          <div className="section-header">
            <span className="eyebrow hand-note">Your 5-year roadmap</span>
            <h2>Milestones</h2>
            <p>
              Click each year to expand. Tick off goals as you complete them to
              track your progress.
            </p>
          </div>
          <div className="milestones-list">
            {MILESTONES.map((m, i) => (
              <MilestoneCard key={m.year} milestone={m} index={i} />
            ))}
          </div>
        </section>

        {/* NUDGES */}
        <section className="nudges-section">
          <h3 style={{ marginBottom: "1rem" }}>Your Vision Nudges</h3>
          <div className="nudges-grid">
            {NUDGES.map((n, i) => (
              <div key={i} className="nudge-card card-pinned">
                <span className="nudge-icon">{n.icon}</span>
                <p className="nudge-text">{n.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SA CONTEXT */}
        <div className="sa-context-box card" style={{ marginTop: "2rem" }}>
          <h4 style={{ marginBottom: "1rem" }}>
            Key South African Context for This Track
          </h4>
          <div className="sa-context-grid">
            {[
              {
                title: "TFSA Annual Limit",
                detail:
                  "R46,000 per tax year (from 1 March 2026). Lifetime limit: R500,000. Over-contributing results in a 40% penalty tax.",
              },
              {
                title: "RA Contribution Limit",
                detail:
                  "Up to 27.5% of the greater of taxable income or remuneration, capped at R430,000 annually (from 2026). Excess rolls over to future years.",
              },
              {
                title: "Offshore Allowance",
                detail:
                  "Discretionary: R1.1 million per year (no SARB approval needed). Over R10M requires SARB approval.",
              },
              {
                title: "Dividends Withholding Tax",
                detail:
                  "Local dividends: 20% withholding tax. TFSA dividends: tax-free. Offshore dividends depend on the country's double tax agreement with SA.",
              },
            ].map((item) => (
              <div key={item.title} className="sa-context-item card-torn">
                <h4 style={{ fontSize: "0.88rem", marginBottom: "0.4rem" }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: "0.82rem" }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="track-cta">
          <div>
            <h3>Ready to simulate the big decisions?</h3>
            <p>
              See whether financing a luxury car now could delay your Vision by
              years.
            </p>
          </div>
          <Link to="/studio/car-comparison" className="btn btn-primary btn-lg">
            Try the Car Studio →
          </Link>
        </div>
      </div>
    </main>
  );
}

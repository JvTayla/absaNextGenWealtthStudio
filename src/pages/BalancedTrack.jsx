import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/UserProfileContext";
import { formatZAR, futureValue } from "../utils/finance";
import "./BalancedTrack.css";

// Balanced Wealth Track helps users with debt elimination and then works toward an emergency fund and then toward investing
// Follows exact same MilestoneCard pattern as GlobalCitizenTrack + HomeownerTrack
// Color theme: sage green :D

const MILESTONES = [
  {
    year: 1,
    title: "Stop the Bleeding! Eliminate Debt",
    subtitle:
      "Avalanche method · Credit cards · Store accounts · Student loans",
    goals: [
      {
        id: "b1a",
        label:
          "List all debts by interest rate specifically highest rate first (avalanche method)",
        detail:
          "The debt avalanche: pay minimums on every debt, then throw every extra rand at the highest-interest debt until it is gone, then move to the next. Credit cards at 20-22% destroy wealth faster than any investment builds it. Write yours down now: card, personal loan, student loan, store accounts, and their exact rates.",
      },
      {
        id: "b1b",
        label: "Close all store credit accounts as you pay them off",
        detail:
          "Store credit (Woolworths, Edgars, Foschini) charges 20-24% interest and quietly trains impulsive spending habits. Close them permanently as you pay each off. The temporary credit score dip is worth the behavioural and financial benefit of removing the temptation entirely.",
      },
      {
        id: "b1c",
        label:
          "Build a R15,000 mini emergency fund before attacking debt aggressively",
        detail:
          "Before throwing every extra rand at debt, build a R15,000 buffer first. Without it, one unexpected car repair or medical expense sends you straight back to the credit card, undoing all your progress. This small fund breaks the debt cycle's reset mechanism.",
      },
      {
        id: "b1d",
        label:
          "Track every rand for 30 consecutive days using 22Seven or a spreadsheet",
        detail:
          "22Seven (South African, free, links to your bank automatically) categorises your spending without manual entry. Most people discover 10-15% of their monthly spending going to categories they would genuinely rather redirect. Awareness is the first and most powerful step.",
      },
    ],
    color: "var(--absa-red)",
    tip: "R5,000 in credit card debt at 21% costs R1,050/month in interest alone which is R12,600/year going nowhere. Eliminating it is an immediate 21% guaranteed return.",
  },
  {
    year: 2,
    title: "Build the Emergency Fund",
    subtitle: "3-6 months expenses · High-yield account · Automate everything",
    goals: [
      {
        id: "b2a",
        label: "Build a 6-month emergency fund (3-6 months of total expenses)",
        detail:
          "Six months of expenses is the gold standard. At R20,000-R30,000/month in total costs, that is R120,000-R180,000 sitting in a money market account earning 8.5%+. It is removing catastrophic financial risk from your life. This fund is what prevents debt from coming back.",
      },
      {
        id: "b2b",
        label: "Automate your savings via debit order on salary day",
        detail:
          "Pay yourself first. Set up an automatic transfer to your savings account the moment your salary arrives. What never lands in your current account never gets spent. Start at 10% of take-home and increase by 2% every six months until it feels tight then hold that amount.",
      },
      {
        id: "b2c",
        label:
          "Open a TFSA and make first contribution! Even R500/month counts",
        detail:
          "Even while building your emergency fund, open a TFSA and put something in. The R46,000 annual contribution limit is use-it-or-lose-it AKA you cannot backdate missed years. Starting with R500/month builds the habit and bank account, and you can scale up once the emergency fund is complete.",
      },
      {
        id: "b2d",
        label: "Audit your income: are you being paid market rate?",
        detail:
          "Debt elimination and emergency fund building go faster with more income. Use salary comparison tools (PayScale, Glassdoor, LinkedIn Salary Insights) to check your market rate. A 10% salary increase or a side income of R3,000/month cuts your emergency fund timeline by months.",
      },
    ],
    color: "var(--gold)",
    tip: "An emergency fund of R150,000 in an Absa MoneyMarket at 8.5% earns ~R12,750/year. Your safety net is also earning while it waits.",
  },
  {
    year: 3,
    title: "Start Investing Consistently",
    subtitle: "TFSA maximisation · RA basics · JSE ETFs · Net worth tracking",
    goals: [
      {
        id: "b3a",
        label: "Maximise TFSA contributions (R46,000/year = R3,833.33/month)",
        detail:
          "With debt gone and your emergency fund built, redirect all that freed-up cash into your TFSA first. R3,000/month maxes your annual limit. Invested at 10% p.a. in a broad ETF, after 5 years you have approximately R233,000 which is all completely tax-free, forever.",
      },
      {
        id: "b3b",
        label: "Start a Retirement Annuity at minimum 5% of income",
        detail:
          "The RA is the balanced track's tax weapon. At a 31% marginal tax rate, every R1,000 invested in an RA saves you R310 in tax immediately. That is a 31% return before the investment grows at all. Start at 5% and increase to 15% over time as your debt obligations disappear.",
      },
      {
        id: "b3c",
        label:
          "Invest in a broad JSE ETF outside your TFSA (Satrix 40 or similar)",
        detail:
          "The Satrix Top 40 ETF tracks South Africa's 40 largest companies. With a Total Expense Ratio under 0.15%, it is cheap, diversified across sectors, and liquid. Start with R500–R1,000/month in a taxable account outside your TFSA for additional market exposure.",
      },
      {
        id: "b3d",
        label: "Track your net worth quarterly in a spreadsheet",
        detail:
          "Net worth = total assets (savings, investments, property if owned) minus total liabilities (bond, debt, loans). Review it every quarter. The number going up is the signal that the system is working. The habit of tracking also catches drift early before small problems become big ones.",
      },
    ],
    color: "var(--sage)",
    tip: "R3,000/month in a TFSA at 10% p.a. = R233,000 after 5 years. After 10 years = R614,000. All tax-free. Start now, not when it feels comfortable.",
  },
  {
    year: 4,
    title: "Balance All Three Pillars",
    subtitle: "Property decision · Offshore exposure · Insurance · Scale RA",
    goals: [
      {
        id: "b4a",
        label:
          "Make an informed decision: buy property or continue renting + investing?",
        detail:
          "With your foundation built, this is the balanced track's key decision point. Run the numbers honestly: what is the total monthly cost of owning (bond + rates + levies + maintenance) vs renting + investing the deposit? In many SA cities right now, renting and investing the difference outperforms buying on a 5-year horizon.",
      },
      {
        id: "b4b",
        label:
          "Add offshore exposure which has a targetted 20-30% of new investments going offshore",
        detail:
          "Even the balanced track needs currency diversification. The Rand has depreciated approximately 7% per year against the USD over the past decade. Moving 20–30% of new monthly contributions into an offshore-based ETF (via EasyEquities USD or Sygnia) hedges this risk without abandoning local growth.",
      },
      {
        id: "b4c",
        label: "Review life insurance and income protection cover",
        detail:
          "If you have dependants, or a bond, life cover helps build infrastructure. Income protection (covering 75% of your salary if you cannot work due to illness or injury) is often overlooked but arguably more important than life cover for most young professionals. Compare quotes via Hippo or directly through ABSA.",
      },
      {
        id: "b4d",
        label: "Scale RA contributions to 10-15% of income",
        detail:
          "By year 4 your earlier debts are gone, the emergency fund is intact, and the habit of saving is established. Scale your RA contribution in line with your income growth. At 15%, you are using most of your tax-deductible allowance and building serious retirement capital at an early enough age for compounding to work.",
      },
    ],
    color: "var(--dusty-blue)",
    tip: "Debt freedom is the balanced track's secret weapon. The R8,000/month you were repaying on debt now becomes R8,000/month building wealth. That shift is transformational.",
  },
  {
    year: 5,
    title: "Review and Set the Next Vision",
    subtitle: "Net worth milestone · FIRE calculation · Next 5-year target",
    goals: [
      {
        id: "b5a",
        label: "Calculate your total net worth vs your 5-year target",
        detail:
          "By year 5 with discipline on this track: zero short-term debt, R120,000-R180,000 emergency fund, R150,000+ in TFSA, R80,000-R120,000 in RA, and R60,000-R100,000 in a taxable ETF portfolio. Total investable assets: R400,000-R500,000. That is the foundation most people in SA never build.",
      },
      {
        id: "b5b",
        label: "Model your FIRE number (Financial Independence, Retire Early)",
        detail:
          "Financial independence = 25 times your annual expenses (the 4% rule). At R25,000/month in costs, your FIRE number is R7.5 million. With R460,000 already invested and R6,000/month continuing at 10% returns, you reach it in approximately 22 years. That is entirely achievable from where you are now.",
      },
      {
        id: "b5c",
        label:
          "Decide your next track: Global Citizen, Homeowner, or accelerate Balanced?",
        detail:
          "With your foundation built, you are now qualified to layer in more aggressive strategies. The Balanced track gets you to the starting line with a clean balance sheet and growing investments. The Global Citizen or Homeowner tracks now become options that your financial foundation can actually support.",
      },
      {
        id: "b5d",
        label: "Celebrate the milestone meaningfully and within budget",
        detail:
          "Behavioural finance research consistently shows that celebrating meaningful financial milestones reinforces the positive feedback loop of saving and discipline. Book the trip. Buy the thing you have been wanting. You have earned it from a position of financial strength rather than debt.",
      },
    ],
    color: "var(--sage)",
    tip: "Balanced track Year 5 target: debt-free + 6-month emergency fund + R150k+ invested. That is the foundation that opens every other door.",
  },
];

function buildNudges(profile, takeHome, disposable, totalSavings) {
  const totalDebt = Object.values(profile.fixedCosts).reduce(
    (a, b) => a + b,
    0,
  );
  const savingsRate = Math.round((totalSavings / (takeHome * 12)) * 100);
  const tfsaContrib = profile.savings.tfsa || 0;
  const tfsaRemaining = Math.max(0, 46000 - tfsaContrib);

  // Projected TFSA after 5 years if they contribute R3k/month
  const tfsaFV = Math.round(futureValue(tfsaContrib, 3000, 0.1, 5));

  // Extra repayment impact (modelled at R1,000/month on a typical R400k debt)
  const debtMonthly = profile.fixedCosts.studentLoan || 0;

  return [
    {
      icon: "⚖️",
      text: `Your total savings represent approximately ${savingsRate}% of your annual take-home. The balanced track targets 25-35% so that there's room to grow with each debt you clear.`,
    },
    {
      icon: "📈",
      text: `Contributing R3,000/month to a TFSA from now at 10% p.a. grows to approximately ${formatZAR(tfsaFV)} in 5 years which is completely tax-free. You have ${formatZAR(tfsaRemaining)} of this year's limit still available.`,
    },
    {
      icon: "💳",
      text:
        debtMonthly > 0
          ? `Your R${debtMonthly.toLocaleString()}/month student loan repayment is costing you more than the interest rate suggests. Clearing it frees ${formatZAR(debtMonthly)}/month to redirect into TFSA or ETF investments.`
          : `No student loan detected in your profile this means you're ahead of most. Redirect that capacity straight into TFSA and RA contributions now.`,
    },
    {
      icon: "🛡",
      text: `Your emergency fund target is ${formatZAR(takeHome * 3)}–${formatZAR(takeHome * 6)} (3–6 months of take-home). You currently have ${formatZAR(profile.savings.emergencyFund || 0)} saved. ${(profile.savings.emergencyFund || 0) >= takeHome * 3 ? "You've hit the minimum let us try aim for 6 months." : "Keep building before investing aggressively."}`,
    },
  ];
}

function MilestoneCard({ milestone, index }) {
  const STORAGE_KEY = `balanced_milestone_${milestone.year}`;

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
          <span className="milestone-toggle">{open ? "▲" : "▼"}</span>
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
                  aria-label={`More info about: ${goal.label}`}
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

export default function BalancedTrack() {
  const { profile, takeHome, disposable, totalSavings } = useProfile();
  const NUDGES = buildNudges(profile, takeHome, disposable, totalSavings);

  // Dynamic allocation these are from the onboarding
  const debtExtra = Math.round(Math.max(0, disposable) * 0.5);
  const emergencyAlloc = Math.round(Math.max(0, disposable) * 0.25);
  const tfsaAlloc = Math.min(3000, Math.round(Math.max(0, disposable) * 0.15));
  const raAlloc = Math.round(Math.max(0, disposable) * 0.1);
  const totalAlloc = debtExtra + emergencyAlloc + tfsaAlloc + raAlloc;

  // 5-year projections for the outcomes section
  const tfsaFV5 = Math.round(
    futureValue(profile.savings.tfsa || 0, tfsaAlloc, 0.1, 5),
  );
  const raFV5 = Math.round(
    futureValue(profile.savings.ra || 0, raAlloc, 0.09, 5),
  );
  const emergencyTarget = Math.round(takeHome * 6);

  return (
    <div className="track-detail-page">
      <div className="container">
        {/*    HERO    */}
        <div className="track-hero">
          <div className="track-hero-content">
            <Link to="/tracks" className="back-link">
              ← All Vision Tracks
            </Link>
            <div className="track-badge-row">
              {profile.selectedTrack === "balanced" && (
                <span className="badge badge-sage">⚖ Your Active Vision</span>
              )}
              <span className="badge badge-gold">Balanced Wealth Track</span>
            </div>
            <h1>The Balanced Wealth Vision</h1>
            <p className="track-hero-desc">
              Do it all! ,but in the right order. Debt first, then security,
              then growth. This track sequences your financial goals so nothing
              falls through the cracks and every rand you free up goes directly
              to work.
            </p>
            <div className="track-hero-stats">
              {[
                { label: "Time Horizon", value: "5 Years" },
                { label: "Year 1 Goal", value: "Zero short-term debt" },
                { label: "Key Tools", value: "TFSA · RA · ETFs" },
                { label: "Risk Profile", value: "Conservative–Moderate" },
              ].map((s) => (
                <div key={s.label} className="track-stat">
                  <div className="track-stat-value bw-stat-value">
                    {s.value}
                  </div>
                  <div className="track-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="track-hero-visual">
            <div className="moodboard bw-moodboard">
              {["⚖", "💳", "🛡", "📈", "🌱", "🎯"].map((e, i) => (
                <div key={i} className={`moodboard-tile moodboard-${i}`}>
                  {e}
                </div>
              ))}
              <div className="moodboard-label hand-note">balance</div>
            </div>
          </div>
        </div>

        {/*    PHILOSOPHY    */}
        <div className="philosophy-section card">
          <div className="philosophy-inner">
            <div>
              <h3>The Philosophy Behind This Track</h3>
              <p style={{ marginTop: "0.75rem" }}>
                The Balanced Vision is built for people who have more than one
                financial priority and refuse to sacrifice one dream for
                another. The temptation is to start investing while carrying
                high-interest debt, but credit card debt at 21% destroys wealth
                faster than almost any investment builds it.
              </p>
              <p style={{ marginTop: "0.75rem" }}>
                This track sequences your goals deliberately:{" "}
                <strong>
                  clear debt first, build a safety net second, then invest
                </strong>
                . Each phase funds the next. By year 3 you are investing from a
                position of genuine financial strength This means no debt
                undermining your returns, no fragility waiting to reset your
                progress.
              </p>
            </div>
            <div className="philosophy-pillars">
              {[
                {
                  icon: "🔥",
                  title: "Sequence Matters",
                  desc: "Paying off 21% debt before investing at 10% is mathematically correct. The order of operations determines your outcome.",
                },
                {
                  icon: "🛡",
                  title: "Safety Net First",
                  desc: "A 6-month emergency fund is not conservative; it is the infrastructure that prevents one bad month from sending you back to debt.",
                },
                {
                  icon: "🌱",
                  title: "Invest From Strength",
                  desc: "When you invest from a debt-free position with a full emergency fund, compounding works uninterrupted. Every rand stays invested.",
                },
              ].map((p) => (
                <div key={p.title} className="pillar-card card-torn">
                  <div className="pillar-icon">{p.icon}</div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*    YEAR 1 ALLOCATION    */}
        <div
          className="card-gold personal-rec bw-rec"
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "1.75rem",
            marginBottom: "2rem",
          }}
        >
          <h4 style={{ marginBottom: "0.75rem" }}>
            📋 Your Year 1 Allocation (Debt Attack Mode)
          </h4>
          <p>
            You have <strong>{formatZAR(disposable)}/month</strong> disposable
            income. In Year 1, the priority is debt elimination. Here is how to
            split it:
          </p>
          <div className="rec-allocation">
            {[
              {
                label: "Extra debt repayment",
                amount: debtExtra,
                color: "var(--absa-red)",
                pct: Math.round((debtExtra / Math.max(disposable, 1)) * 100),
              },
              {
                label: "Emergency fund building",
                amount: emergencyAlloc,
                color: "var(--gold)",
                pct: Math.round(
                  (emergencyAlloc / Math.max(disposable, 1)) * 100,
                ),
              },
              {
                label: "TFSA starter contribution",
                amount: tfsaAlloc,
                color: "var(--sage)",
                pct: Math.round((tfsaAlloc / Math.max(disposable, 1)) * 100),
              },
              {
                label: "RA contribution (tax saving)",
                amount: raAlloc,
                color: "var(--dusty-blue)",
                pct: Math.round((raAlloc / Math.max(disposable, 1)) * 100),
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
            Total allocated: {formatZAR(totalAlloc)}/month. As each debt clears,
            redirect its repayment into the next phase.
          </p>
        </div>

        {/*    5-YEAR OUTCOMES PREVIEW    */}
        <div className="bw-outcomes card" style={{ marginBottom: "2rem" }}>
          <h4 style={{ marginBottom: "1rem" }}>
            Where You Could Be in 5 Years
          </h4>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "1.25rem",
            }}
          >
            Based on your current profile and consistent execution of the
            Balanced track:
          </p>
          <div className="bw-outcomes-grid">
            {[
              {
                icon: "💳",
                label: "Short-term debt",
                value: "R0",
                sub: "Cleared by Year 1–2",
                color: "var(--sage)",
              },
              {
                icon: "🛡",
                label: "Emergency fund",
                value: formatZAR(emergencyTarget),
                sub: "6 months expenses",
                color: "var(--gold)",
              },
              {
                icon: "📈",
                label: "TFSA balance",
                value: formatZAR(tfsaFV5),
                sub: "Tax-free at 10% p.a.",
                color: "var(--dusty-blue)",
              },
              {
                icon: "🏦",
                label: "RA balance",
                value: formatZAR(raFV5),
                sub: "Tax-deductible at 9% p.a.",
                color: "var(--terracotta)",
              },
            ].map((item) => (
              <div key={item.label} className="bw-outcome-card card-torn">
                <div className="bw-outcome-icon">{item.icon}</div>
                <div className="bw-outcome-value" style={{ color: item.color }}>
                  {item.value}
                </div>
                <div className="bw-outcome-label">{item.label}</div>
                <div className="bw-outcome-sub">{item.sub}</div>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              marginTop: "1rem",
            }}
          >
            * Projections assume consistent monthly contributions and investment
            returns of 9–10% p.a. Actual results will vary.
          </p>
        </div>

        {/*    MILESTONES    */}
        <div className="milestones-section">
          <div className="section-header">
            <span className="eyebrow hand-note">Your 5-year roadmap</span>
            <h2>Milestones</h2>
            <p>
              Click each year to expand. Tick off goals as you complete them
              (your progress saves automatically)
            </p>
          </div>
          <div className="milestones-list">
            {MILESTONES.map((m, i) => (
              <MilestoneCard key={m.year} milestone={m} index={i} />
            ))}
          </div>
        </div>

        {/*    NUDGES    */}
        <div className="nudges-section">
          <h3 style={{ marginBottom: "1rem" }}>Your Balance Nudges</h3>
          <div className="nudges-grid">
            {NUDGES.map((n, i) => (
              <div key={i} className="nudge-card card-pinned">
                <span className="nudge-icon">{n.icon}</span>
                <p className="nudge-text">{n.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/*    SA CONTEXT    */}
        <div className="sa-context-box card" style={{ marginBottom: "2rem" }}>
          <h4 style={{ marginBottom: "1rem" }}>
            🇿🇦 Key South African Context for This Track
          </h4>
          <div className="sa-context-grid">
            {[
              {
                title: "Credit Card Interest Rate",
                detail:
                  "South African credit cards charge between 18-22.5% interest (National Credit Act maximum). At 21%, a R30,000 balance costs R6,300/year in interest alone. No investment consistently beats paying off credit card debt as a guaranteed return.",
              },
              {
                title: "22Seven An SA Budgeting Tool",
                detail:
                  "22Seven is a free South African budgeting app that links directly to your bank account and automatically categorises all transactions. It is built for SA banking (ABSA, FNB, Nedbank, Standard Bank) and is the best free tool for the tracking phase of this track.",
              },
              {
                title: "TFSA Annual Limit",
                detail:
                  "R46,000 per tax year (from 1 March 2024). Lifetime limit R500,000. Over-contributing results in a 40% penalty tax on the excess. The limit cannot be backdated AKA each year you miss is gone permanently. Even R500/month is better than R0.",
              },
              {
                title: "RA Tax Deductibility",
                detail:
                  "RA contributions are deductible up to 27.5% of the greater of your taxable income or remuneration, capped at R350,000 per year. At a 31% marginal tax rate, R12,000/month in RA contributions saves R3,720/month in PAYE which is a meaningful immediate benefit.",
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

        {/*    CTA    */}
        <div className="track-cta">
          <div>
            <h3>See your debt-free timeline</h3>
            <p>
              Use the Simulation Studios to model exactly when your debts clear
              and what that frees up.
            </p>
          </div>
          <Link to="/studio" className="btn btn-primary btn-lg">
            Open the Studios →
          </Link>
        </div>
      </div>
    </div>
  );
}

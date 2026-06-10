import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../context/UserProfileContext";
import { formatZAR } from "../utils/finance";
import {
  Home,
  BarChart2,
  Banknote,
  Star,
  Key,
  ArrowLeft,
  Building2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import "./HomeownerTrack.css";

// Homeowner Track which outlines a 5-year roadmap to first property ownership in South Africa
// Follows same MilestoneCard pattern as GlobalCitizenTrack
// Color theme: ABSA red / warm tones

const MILESTONES = [
  {
    year: 1,
    title: "Fix Your Credit Foundation",
    subtitle: "Credit score · Clear debt · Open deposit savings",
    goals: [
      {
        id: "h1a",
        label:
          "Check your credit score via TransUnion or Experian (free annually)",
        detail:
          "South African banks require a minimum credit score of 600–650 for home loan approval, with significantly better rates above 700. You are entitled to one free credit report per year from TransUnion or Experian. Download it now and understand exactly where you stand before you start saving.",
      },
      {
        id: "h1b",
        label: "Reduce credit card balances below 30% of your limit",
        detail:
          "Credit utilisation above 30% meaningfully lowers your credit score. If your card limit is R50,000, keep balances under R15,000 and pay in full monthly where possible. Store credit accounts (Woolworths, Edgars) carry 20-24% interest so please close them as you pay them off.",
      },
      {
        id: "h1c",
        label: "Open a dedicated property deposit savings account",
        detail:
          'Open a separate high-yield savings account (Absa MoneyMarket, Capitec Save, or similar) and name it "Property Deposit." Automating a monthly debit order into it on salary day makes the saving non-negotiable. Keeping it separate prevents accidental spending.',
      },
      {
        id: "h1d",
        label:
          "Avoid new vehicle finance or major credit commitments this year",
        detail:
          "Banks assess your total monthly debt obligations when approving a home loan. A new car repayment of R5,000/month reduces the bond amount you qualify for by approximately R500,000 on a 20-year term. Delay any major financed purchase until after bond approval.",
      },
    ],
    color: "var(--absa-red)",
    tip: "A credit score above 700 can save 0.5–1% on your bond rate. On a R1.5M bond over 20 years, that's R75,000+ in interest saved.",
  },
  {
    year: 2,
    title: "Build Your Deposit",
    subtitle: "R200k–R400k target · Get pre-qualified · Clear short-term debt",
    goals: [
      {
        id: "h2a",
        label: "Target a R200,000–R400,000 deposit (10–20% of property price)",
        detail:
          "A 10% deposit on a R2M property is R200,000. A 20% deposit (R400,000) eliminates private mortgage insurance and significantly reduces your monthly repayment and total interest paid. Every extra rand in deposit directly reduces the interest you pay over 20 years.",
      },
      {
        id: "h2b",
        label:
          "Get a formal home loan pre-qualification from ABSA or BetterBond",
        detail:
          "Pre-qualification tells you exactly how much you can borrow before you start house-hunting! It takes 15 minutes online and gives you real negotiating power with sellers. BetterBond submits to multiple banks simultaneously and finds you the best rate. It costs nothing.",
      },
      {
        id: "h2c",
        label:
          "Clear all short-term debt: credit cards, personal loans, store accounts",
        detail:
          "Banks look at your total monthly debt repayments vs income (debt-to-income ratio). Clearing R5,000/month in existing debt repayments increases your bond affordability by approximately R500,000 on a 20-year bond at 11.5%. Debt freedom is directly translated into bond approval power.",
      },
      {
        id: "h2d",
        label: "Research your target area: compare sectional title vs freehold",
        detail:
          "Sectional title (apartments, townhouses) includes levies of R2,000–R6,000/month but less maintenance responsibility. Freehold (houses) has no levies but requires a maintenance budget of ~1% of property value per year. Understand the true monthly cost of each before you decide.",
      },
    ],
    color: "var(--gold)",
    tip: "Saving your deposit in an Absa MoneyMarket account at 8.5% p.a. earns ~R25,500/year on R300k. Make the deposit work while it waits.",
  },
  {
    year: 3,
    title: "Plan the Full Purchase Cost",
    subtitle:
      "Transfer duty · Bond costs · Attorney fees · True ownership costs",
    goals: [
      {
        id: "h3a",
        label:
          "Budget for transfer duty (charged on properties above R1,100,000)",
        detail:
          "Transfer duty is a government tax on property purchases above R1.1M. On a R1.6M property: R20,900. On a R2M property: R50,900. On a R2.5M property: R106,400. This is paid upfront and is NOT included in your bond so you will need this cash in addition to your deposit.",
      },
      {
        id: "h3b",
        label: "Budget R30,000–R50,000 for bond registration and attorney fees",
        detail:
          "Conveyancing attorney fees, bond registration costs, and deeds office fees add R30,000–R50,000 to your purchase. These are non-negotiable legal costs that happen every time property changes hands. Get a written estimate from a property attorney before you make an offer.",
      },
      {
        id: "h3c",
        label:
          "Model full monthly ownership cost: bond + rates + levies + maintenance",
        detail:
          "Budget R2,000–R3,500/month for rates and taxes (municipal charges). Sectional title levies R2,000–R6,000/month. Freehold maintenance ~1% of property value per year (R16,000/year on a R1.6M home = R1,333/month). Your real monthly cost is the bond repayment plus all of these.",
      },
      {
        id: "h3d",
        label: "View at least 15 properties before making an offer",
        detail:
          "First-time buyers frequently overpay by purchasing too quickly. Viewing 15+ properties in your target area calibrates your price expectations accurately, reveals what's overpriced, and gives you the confidence to walk away and negotiate. Knowledge is your most powerful tool in property.",
      },
    ],
    color: "var(--terracotta)",
    tip: "Total upfront costs beyond your deposit: budget R80,000–R120,000 for transfer duty, attorney fees, and moving costs on a R1.8M property.",
  },
  {
    year: 4,
    title: "Make Your Offer",
    subtitle: "OTP · Bond application · Property inspection · Negotiation",
    goals: [
      {
        id: "h4a",
        label: "Submit an Offer to Purchase (OTP) with the right conditions",
        detail:
          "An OTP is a legally binding contract. Always include a condition making it subject to bond approval and a satisfactory property inspection. Never sign an OTP without reading every clause. For your first property, ask a property attorney to review it , the R1,500 fee is worth it.",
      },
      {
        id: "h4b",
        label: "Apply to at least 3 banks simultaneously via BetterBond",
        detail:
          "Apply to ABSA, Nedbank, FNB, and Standard Bank simultaneously via BetterBond (free service) or directly. Banks compete for your business. Multiple offers give you negotiating power to ask for a lower rate. This single step routinely saves buyers 0.25-0.5% which is tens of thousands over the bond term.",
      },
      {
        id: "h4c",
        label: "Commission an independent property inspection (R1,500-R3,000)",
        detail:
          "A professional property inspector checks structural integrity, electrical compliance, plumbing, roof condition, and damp. Sellers are not always forthcoming about defects. A R2,500 inspection has saved buyers R50,000-R200,000 in hidden repair costs. It is non-negotiable on older properties.",
      },
      {
        id: "h4d",
        label:
          "Negotiate the purchase price! Most SA properties have 5-10% room",
        detail:
          "South African property listings typically have 5-10% negotiation room, especially in slower markets or when a property has been listed for 30+ days. Your deposit size, pre-qualification, and speed of closing are negotiating tools. Never accept the asking price without a counteroffer.",
      },
    ],
    color: "var(--absa-red)",
    tip: "Applying to 3+ banks simultaneously typically gets you 0.25-0.5% better rate. On a R1.5M bond, that is R37,000-R75,000 saved.",
  },
  {
    year: 5,
    title: "Own and Build Equity",
    subtitle:
      "Extra repayments · Rate negotiation · Maintenance fund · Next move",
    goals: [
      {
        id: "h5a",
        label:
          "Pay extra into your bond every month! Even R500-R1,000 makes a difference",
        detail:
          "Extra bond repayments reduce capital directly. On a R1.5M bond at 11.5% over 20 years: paying an extra R1,000/month saves R312,000 in total interest and cuts 4 years off your bond term. This is the highest guaranteed return available to a South African homeowner.",
      },
      {
        id: "h5b",
        label: "Renegotiate your bond rate annually with your bank",
        detail:
          "Your bond interest rate is not fixed permanently. Every 2-3 years, contact your bank and request a rate reduction based on your good payment history and improved credit score. Or refinance to a competitor offering a better rate. Banks will often match or beat a competitor quote rather than lose the client.",
      },
      {
        id: "h5c",
        label: "Build a maintenance fund of 1% of property value per year",
        detail:
          "A R1.6M property needs approximately R16,000/year (R1,333/month) set aside for maintenance. Underspending on maintenance leads to large sudden costs (roof replacement, geyser, plumbing) and reduces resale value. A dedicated maintenance savings account prevents financial shock.",
      },
      {
        id: "h5d",
        label: "Calculate your equity and plan your next financial move",
        detail:
          "By year 5 with extra repayments on a R1.6M property you could have R200,000-R350,000 in equity (property value appreciation + capital paid off). This equity can be accessed via an access bond for investments, used as a deposit on a second property, or left to compound.",
      },
    ],
    color: "var(--sage)",
    tip: "Paying R1,500/month extra on a R1.6M bond at 11.5% saves over R400,000 in interest and cuts 5 years off your bond term.",
  },
];

function buildNudges(profile, takeHome, disposable) {
  const currentSavings =
    (profile.savings.emergencyFund || 0) +
    (profile.savings.localInvestments || 0) +
    (profile.savings.tfsa || 0);
  const depositTarget = 300000;
  const monthlySavingCapacity = Math.max(0, Math.round(disposable * 0.6));
  const monthsToDeposit =
    monthlySavingCapacity > 0
      ? Math.ceil((depositTarget - currentSavings) / monthlySavingCapacity)
      : null;

  const totalDebt = Object.values(profile.fixedCosts).reduce(
    (a, b) => a + b,
    0,
  );
  const dtiRatio = Math.round((totalDebt / takeHome) * 100);

  const depositInterestPA = Math.round(
    Math.min(currentSavings, depositTarget) * 0.085,
  );

  return [
    {
      icon: <Home size={20} />,
      text: monthsToDeposit
        ? `Saving ${formatZAR(monthlySavingCapacity)}/month, you could reach a R300,000 deposit in approximately ${monthsToDeposit} months. This is your Year 2 target.`
        : `Build up your savings capacity first  your current disposable income is tight. Review your fixed costs in the Snapshot.`,
    },
    {
      icon: <BarChart2 size={20} />,
      text: `Your debt-to-income ratio is currently ${dtiRatio}%. Banks prefer under 35% for home loan approval. ${dtiRatio > 35 ? "Reducing your monthly debt obligations will directly increase the bond amount you qualify for." : "You're in good shape for bond qualification."}`,
    },
    {
      icon: <Banknote size={20} />,
      text: `Your current savings of ${formatZAR(currentSavings)} in a Money Market account at 8.5% p.a. earns approximately ${formatZAR(depositInterestPA)}/year in interest while you wait. Make your deposit work.`,
    },
    {
      icon: <Star size={20} />,
      text: `Transfer duty on a R1.8M property is R26,900. Add R35,000 in attorney fees and you need ${formatZAR(depositTarget + 61900)} total upfront  plan this into your savings target from Year 2.`,
    },
  ];
}

// Transfer duty calculation based on SARS Reports from 2024/25
function calcTransferDuty(price) {
  if (price <= 1100000) return 0;
  if (price <= 1512500) return (price - 1100000) * 0.03;
  if (price <= 2117500) return 12375 + (price - 1512500) * 0.06;
  if (price <= 2722500) return 48675 + (price - 2117500) * 0.08;
  if (price <= 12100000) return 97475 + (price - 2722500) * 0.11;
  return 1128600 + (price - 12100000) * 0.13;
}

function MilestoneCard({ milestone, index }) {
  const STORAGE_KEY = `homeowner_milestone_${milestone.year}`;

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

export default function HomeownerTrack() {
  const { profile, takeHome, disposable } = useProfile();
  const NUDGES = buildNudges(profile, takeHome, disposable);

  // Personalised recommendation amounts which is based on their Onboarding and personal finances!
  const depositMonthly = Math.round(Math.max(0, disposable) * 0.55);
  const emergencyTopUp = Math.round(Math.max(0, disposable) * 0.15);
  const raContrib = Math.round(Math.max(0, disposable) * 0.1);
  const tfsaMonthly = Math.min(
    3000,
    Math.round(Math.max(0, disposable) * 0.12),
  );
  const totalAlloc = depositMonthly + emergencyTopUp + raContrib + tfsaMonthly;

  // Transfer duty table for context
  const dutyExamples = [
    { price: 1200000, duty: calcTransferDuty(1200000) },
    { price: 1600000, duty: calcTransferDuty(1600000) },
    { price: 2000000, duty: calcTransferDuty(2000000) },
    { price: 2500000, duty: calcTransferDuty(2500000) },
  ];

  return (
    <div className="track-detail-page">
      <div className="container">
        {/*      HERO      */}
        <div className="track-hero">
          <div className="track-hero-content">
            <Link to="/tracks" className="back-link">
              ← All Vision Tracks
            </Link>
            <div className="track-badge-row">
              {profile.selectedTrack === "homeowner" && (
                <span className="badge badge-red">
                  <Home size={11} /> Your Active Vision
                </span>
              )}
              <span className="badge badge-gold">Homeowner Track</span>
            </div>
            <h1>The Homeowner's Vision</h1>
            <p className="track-hero-desc">
              Stop renting. Build equity. Own your first home within 3-5 years.
              This is your practical, step-by-step roadmap through the South
              African property buying process from credit score to transfer
              papers.
            </p>
            <div className="track-hero-stats">
              {[
                { label: "Time Horizon", value: "3-5 Years" },
                { label: "Deposit Target", value: "R200k-R400k" },
                { label: "Key Tools", value: "Bond · Transfer · Equity" },
                { label: "Risk Profile", value: "Conservative" },
              ].map((s) => (
                <div key={s.label} className="track-stat">
                  <div className="track-stat-value">{s.value}</div>
                  <div className="track-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="track-hero-visual">
            <div className="moodboard ho-moodboard">
              {[
                <Home size={22} />,
                <Key size={22} />,
                <BarChart2 size={22} />,
                <Building2 size={22} />,
                <TrendingUp size={22} />,
                <Star size={22} />,
              ].map((icon, i) => (
                <div key={i} className={`moodboard-tile moodboard-${i}`}>
                  {icon}
                </div>
              ))}
              <div className="moodboard-label hand-note">home</div>
            </div>
          </div>
        </div>

        {/*      PHILOSOPHY      */}
        <div className="philosophy-section card">
          <div className="philosophy-inner">
            <div>
              <h3>The Philosophy Behind This Track</h3>
              <p style={{ marginTop: "0.75rem" }}>
                Property is the single largest financial decision most South
                Africans will ever make. Done right, it builds equity, provides
                stability, and creates a tangible asset that compounds over
                decades. Done wrong specifically with too little deposit, the
                wrong credit profile, or hidden purchase costs it becomes a
                financial burden that takes years to recover from.
              </p>
              <p style={{ marginTop: "0.75rem" }}>
                This track is about doing it <strong>right</strong>. That means
                building your credit score, saving a meaningful deposit,
                understanding every rand of purchase cost before you sign, and
                negotiating aggressively on rate and price. The South African
                property market rewards prepared buyers.
              </p>
            </div>
            <div className="philosophy-pillars">
              {[
                {
                  icon: "🏗",
                  title: "Build Before You Buy",
                  desc: "Credit score, deposit, and debt clearance come before property searches. The foundation determines whether your bond gets approved and at what rate.",
                },
                {
                  icon: "💸",
                  title: "Know the True Cost",
                  desc: "Transfer duty, attorney fees, levies, rates, and maintenance add R100,000+ to purchase costs. Most first buyers underestimate this significantly.",
                },
                {
                  icon: "📉",
                  title: "Equity is the Goal",
                  desc: "Your bond repayment builds equity over time. Extra repayments accelerate this. After 5 years of extra payments, you'll have materially more equity than a standard repayment schedule.",
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

        {/*      PERSONAL RECOMMENDATION      */}
        <div
          className="card-gold personal-rec ho-rec"
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "1.75rem",
            marginBottom: "2rem",
          }}
        >
          <h4 style={{ marginBottom: "0.75rem" }}>
            📋 Your Personal Recommendation
          </h4>
          <p>
            Based on your take-home pay of{" "}
            <strong>{formatZAR(takeHome)}/month</strong>, here's how to
            structure your saving for the Homeowner Vision:
          </p>
          <div className="rec-allocation">
            {[
              {
                label: "Property deposit saving",
                amount: depositMonthly,
                color: "var(--absa-red)",
                pct: Math.round(
                  (depositMonthly / Math.max(disposable, 1)) * 100,
                ),
              },
              {
                label: "Emergency fund top-up",
                amount: emergencyTopUp,
                color: "var(--gold)",
                pct: Math.round(
                  (emergencyTopUp / Math.max(disposable, 1)) * 100,
                ),
              },
              {
                label: "RA contribution (tax saving)",
                amount: raContrib,
                color: "var(--sage)",
                pct: Math.round((raContrib / Math.max(disposable, 1)) * 100),
              },
              {
                label: "TFSA (R3,000/month max)",
                amount: tfsaMonthly,
                color: "var(--dusty-blue)",
                pct: Math.round((tfsaMonthly / Math.max(disposable, 1)) * 100),
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
            Total allocation: {formatZAR(totalAlloc)}/month from your{" "}
            {formatZAR(disposable)} disposable income.
          </p>
        </div>

        {/*      MILESTONES      */}
        <div className="milestones-section">
          <div className="section-header">
            <span className="eyebrow hand-note">Your 5-year roadmap</span>
            <h2>Milestones</h2>
            <p>
              Click each year to expand. Tick off goals as you complete them and
              your progress saves automatically.
            </p>
          </div>
          <div className="milestones-list">
            {MILESTONES.map((m, i) => (
              <MilestoneCard key={m.year} milestone={m} index={i} />
            ))}
          </div>
        </div>

        {/*      NUDGES      */}
        <div className="nudges-section">
          <h3 style={{ marginBottom: "1rem" }}>Your Homeowner Nudges</h3>
          <div className="nudges-grid">
            {NUDGES.map((n, i) => (
              <div key={i} className="nudge-card card-pinned">
                <span className="nudge-icon">{n.icon}</span>
                <p className="nudge-text">{n.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/*      TRANSFER DUTY TABLE      */}
        <div className="card ho-duty-table" style={{ marginBottom: "2rem" }}>
          <h4 style={{ marginBottom: "1rem" }}>
            🇿🇦 Transfer Duty Reference Table (SARS 2024/25)
          </h4>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "1rem",
            }}
          >
            Transfer duty is paid to SARS on property purchases above R1.1
            million. It is not included in your bond and you pay it upfront from
            cash.
          </p>
          <div className="ho-duty-grid">
            <div className="ho-duty-header">
              <span>Property Price</span>
              <span>Transfer Duty</span>
              <span>Total Upfront (+ R40k fees)</span>
            </div>
            {dutyExamples.map((ex) => (
              <div key={ex.price} className="ho-duty-row">
                <span>{formatZAR(ex.price)}</span>
                <span style={{ color: "var(--absa-red)", fontWeight: 600 }}>
                  {formatZAR(ex.duty)}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {formatZAR(ex.duty + 40000)}
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
            * Properties below R1.1M are exempt from transfer duty. Attorney and
            conveyancing fees (~R30,000–R50,000) are additional and vary by
            purchase price.
          </p>
        </div>

        {/*      SA CONTEXT      */}
        <div className="sa-context-box card" style={{ marginBottom: "2rem" }}>
          <h4 style={{ marginBottom: "1rem" }}>
            🇿🇦 Key South African Context for This Track
          </h4>
          <div className="sa-context-grid">
            {[
              {
                title: "Prime Interest Rate",
                detail:
                  "SA home loans are typically priced at Prime minus 0.5% to Prime plus 2%, depending on your credit score and deposit size. As of 2024/25, prime is 11.5%. A 0.5% difference on R1.5M over 20 years = R75,000 in interest.",
              },
              {
                title: "Bond Qualification Rule",
                detail:
                  "Most banks use a rule that your total monthly debt repayments (including the new bond) should not exceed 30–35% of your gross income. On a R68,000 gross salary, that is approximately R20,000–R23,800/month available for debt.",
              },
              {
                title: "FLISP Subsidy",
                detail:
                  "Finance Linked Individual Subsidy Programme (FLISP) provides government subsidies to first-time buyers earning R3,501–R22,000/month. If you earn above this, you do not qualify but your household may if you are buying jointly.",
              },
              {
                title: "Access Bond Feature",
                detail:
                  "An access bond (ABSA FlexiReserve or similar) allows you to withdraw extra repayments you have made. It combines the benefit of extra repayments (reducing interest) with the flexibility of accessing the funds if needed.",
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

        {/*      CTA      */}
        <div className="track-cta">
          <div>
            <h3>Should you buy or keep renting?</h3>
            <p>
              Run the numbers with real South African property costs, bond rates
              and transfer duty.
            </p>
          </div>
          <Link to="/studio" className="btn btn-primary btn-lg">
            Explore the Studios →
          </Link>
        </div>
      </div>
    </div>
  );
}

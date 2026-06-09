import { useState } from "react";
import { useProfile } from "../context/UserProfileContext";
import { formatZAR } from "../utils/finance";
import "./NudgeSystem.css";

// NudgeSystem which generates contextual financial nudges from the user's live profile data
// Nudges are dismissable and dismissals persist to localStorage
// Types: 'warning' (red), 'tip' (green), 'info' (blue), 'celebrate' (gold)

function generateNudges(
  profile,
  takeHome,
  disposable,
  totalSavings,
  monthlyTax,
) {
  const nudges = [];
  const totalFixed = Object.values(profile.fixedCosts).reduce(
    (a, b) => a + b,
    0,
  );
  const totalVariable = Object.values(profile.variableSpending).reduce(
    (a, b) => a + b,
    0,
  );
  const totalSpending = totalFixed + totalVariable;
  const savingsRate = takeHome > 0 ? totalSavings / (takeHome * 12) : 0;
  const spendingPct =
    takeHome > 0 ? Math.round((totalSpending / takeHome) * 100) : 0;
  const lifestyleSpend =
    (profile.variableSpending.diningOut || 0) +
    (profile.variableSpending.entertainment || 0) +
    (profile.variableSpending.shopping || 0);
  const lifestylePct =
    takeHome > 0 ? Math.round((lifestyleSpend / takeHome) * 100) : 0;
  const tfsaContrib = profile.savings.tfsa || 0;
  const tfsaRemaining = Math.max(0, 36000 - tfsaContrib);
  const emergencyFund = profile.savings.emergencyFund || 0;
  const emergencyTarget = takeHome * 3;
  const emergencyTargetFull = takeHome * 6;
  const raMonthly = Math.round(takeHome * 0.1);
  const raTaxSaving = Math.round(raMonthly * 0.31 * 12);
  const dtiRatio = takeHome > 0 ? Math.round((totalFixed / takeHome) * 100) : 0;

  // ── WARNING: Overspending ──
  if (disposable < 0) {
    nudges.push({
      id: "overspend",
      type: "warning",
      icon: "⚠️",
      title: "You're spending more than you earn",
      text: `Your spending exceeds your take-home pay by ${formatZAR(Math.abs(disposable))}/month. Review your variable spending like: dining, entertainment, and shopping are usually the quickest wins.`,
      action: null,
    });
  }

  // ── WARNING: Spending over 90% of take-home ──
  if (disposable >= 0 && spendingPct > 90) {
    nudges.push({
      id: "high_spend",
      type: "warning",
      icon: "🔴",
      title: `${spendingPct}% of take-home going to expenses`,
      text: `You're allocating ${spendingPct}% of your take-home to fixed and variable costs, leaving only ${formatZAR(disposable)} to save and invest. Financial planners recommend keeping total spending below 80%.`,
      action: null,
    });
  }

  // ── WARNING: High lifestyle spending ──
  if (lifestylePct > 25) {
    nudges.push({
      id: "lifestyle_high",
      type: "warning",
      icon: "🛍️",
      title: "Lifestyle spending is above average",
      text: `You're allocating ${lifestylePct}% of take-home to dining, entertainment, and shopping (${formatZAR(lifestyleSpend)}/month). Typical for your income band: 15–20%. Cutting R2,000/month here adds ${formatZAR(2000 * 12)}/year to invest.`,
      action: null,
    });
  }

  // ── WARNING: No emergency fund ──
  if (emergencyFund < 10000) {
    nudges.push({
      id: "no_emergency",
      type: "warning",
      icon: "🛡️",
      title: "No emergency fund detected",
      text: `You have ${formatZAR(emergencyFund)} in your emergency fund. Before investing aggressively, build at least ${formatZAR(emergencyTarget)} (3 months of take-home). Without it, one unexpected bill sends you back to credit cards.`,
      action: null,
    });
  }

  // ── TIP: Emergency fund partially built ──
  if (emergencyFund >= 10000 && emergencyFund < emergencyTarget) {
    const remaining = emergencyTarget - emergencyFund;
    const monthsToTarget =
      disposable > 0 ? Math.ceil(remaining / (disposable * 0.5)) : null;
    nudges.push({
      id: "emergency_partial",
      type: "tip",
      icon: "🛡️",
      title: "Emergency fund in progress",
      text: `You have ${formatZAR(emergencyFund)} of your ${formatZAR(emergencyTarget)} target (3 months). ${monthsToTarget ? `Saving 50% of your disposable income gets you there in ~${monthsToTarget} months.` : "Keep building before investing aggressively."}`,
      action: null,
    });
  }

  // ── CELEBRATE: Emergency fund complete ──
  if (emergencyFund >= emergencyTarget && emergencyFund < emergencyTargetFull) {
    nudges.push({
      id: "emergency_done",
      type: "celebrate",
      icon: "🎉",
      title: "3-month emergency fund achieved!",
      text: `You've hit your 3-month emergency target (${formatZAR(emergencyTarget)}). Consider building to 6 months (${formatZAR(emergencyTargetFull)}) for full security or redirect surplus toward TFSA and investments.`,
      action: null,
    });
  }

  // ── TIP: TFSA limit not maxed ──
  if (tfsaRemaining > 0) {
    nudges.push({
      id: "tfsa_room",
      type: "tip",
      icon: "📈",
      title: `${formatZAR(tfsaRemaining)} of TFSA limit still available`,
      text: `Your TFSA annual limit (R36,000) has ${formatZAR(tfsaRemaining)} remaining. Unused allowance is lost and you can't backdate missed years. Even ${formatZAR(Math.min(3000, tfsaRemaining))}/month would use it up before 28 February.`,
      action: null,
    });
  }

  // ── CELEBRATE: TFSA maxed ──
  if (tfsaContrib >= 36000) {
    nudges.push({
      id: "tfsa_maxed",
      type: "celebrate",
      icon: "⭐",
      title: "TFSA maxed for the year... well done!",
      text: `You've contributed R36,000 to your TFSA this year. All growth on this is permanently tax-free. Now look at topping up your RA for the additional tax deduction benefit.`,
      action: null,
    });
  }

  // ── INFO: RA tax saving opportunity ──
  if ((profile.savings.ra || 0) < takeHome * 0.05 * 12) {
    nudges.push({
      id: "ra_opportunity",
      type: "info",
      icon: "💡",
      title: "RA contribution could save you tax",
      text: `Contributing ${formatZAR(raMonthly)}/month to a Retirement Annuity at your income level could save approximately ${formatZAR(raTaxSaving)} in PAYE annually. That's an immediate 31% return before any investment growth.`,
      action: null,
    });
  }

  // ── INFO: High DTI ratio ──
  if (dtiRatio > 40) {
    nudges.push({
      id: "dti_high",
      type: "info",
      icon: "📊",
      title: `Debt-to-income ratio is ${dtiRatio}%`,
      text: `Your fixed costs are ${dtiRatio}% of take-home pay. Banks look for under 35% when approving home loans. If you're planning to buy property, reducing fixed commitments now directly increases your bond approval amount.`,
      action: null,
    });
  }

  // ── INFO: No offshore exposure ──
  if ((profile.savings.offshore || 0) === 0 && totalSavings > 50000) {
    nudges.push({
      id: "no_offshore",
      type: "info",
      icon: "🌍",
      title: "No offshore exposure detected",
      text: `You have ${formatZAR(totalSavings)} invested but none offshore. The Rand has weakened ~7% p.a. vs USD over 10 years. Consider moving 20–30% of new contributions to a global ETF via EasyEquities USD or Sygnia.`,
      action: null,
    });
  }

  // ── CELEBRATE: Strong savings rate ──
  if (savingsRate > 0.3 && totalSavings > 100000) {
    nudges.push({
      id: "great_savings",
      type: "celebrate",
      icon: "🏆",
      title: "Strong savings position!",
      text: `Your total savings of ${formatZAR(totalSavings)} represent a solid financial foundation. You're ahead of most South Africans your age. Keep compounding! The next milestone is ${formatZAR(Math.ceil(totalSavings / 100000) * 100000)}.`,
      action: null,
    });
  }

  return nudges;
}

export default function NudgeSystem() {
  const { profile, takeHome, disposable, totalSavings, monthlyTax } =
    useProfile();

  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("absa_dismissed_nudges") || "[]");
    } catch {
      return [];
    }
  });

  const [justDismissed, setJustDismissed] = useState([]);

  const allNudges = generateNudges(
    profile,
    takeHome,
    disposable,
    totalSavings,
    monthlyTax,
  );
  const visibleNudges = allNudges.filter((n) => !dismissed.includes(n.id));

  function dismiss(id) {
    setJustDismissed((prev) => [...prev, id]);
    // Small delay so the animation plays before removal
    setTimeout(() => {
      const next = [...dismissed, id];
      setDismissed(next);
      setJustDismissed((prev) => prev.filter((d) => d !== id));
      try {
        localStorage.setItem("absa_dismissed_nudges", JSON.stringify(next));
      } catch {}
    }, 300);
  }

  function resetNudges() {
    setDismissed([]);
    setJustDismissed([]);
    try {
      localStorage.removeItem("absa_dismissed_nudges");
    } catch {}
  }

  if (visibleNudges.length === 0) return null;

  return (
    <div className="nudge-system" role="region" aria-label="Financial nudges">
      <div className="nudge-header">
        <span className="nudge-system-title hand-note">
          ✦ {visibleNudges.length} insight
          {visibleNudges.length !== 1 ? "s" : ""} for you
        </span>
        {dismissed.length > 0 && (
          <button
            className="nudge-reset-btn"
            onClick={resetNudges}
            aria-label="Reset dismissed nudges"
          >
            Reset dismissed
          </button>
        )}
      </div>

      <div className="nudge-list">
        {visibleNudges.map((nudge) => (
          <div
            key={nudge.id}
            className={`nudge-card nudge-${nudge.type} ${justDismissed.includes(nudge.id) ? "nudge-dismissing" : ""}`}
            role="alert"
          >
            <span className="nudge-icon" aria-hidden="true">
              {nudge.icon}
            </span>
            <div className="nudge-content">
              <strong className="nudge-title">{nudge.title}</strong>
              <p className="nudge-text">{nudge.text}</p>
            </div>
            <button
              className="nudge-dismiss"
              onClick={() => dismiss(nudge.id)}
              aria-label={`Dismiss: ${nudge.title}`}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

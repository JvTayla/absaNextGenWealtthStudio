import { useState } from "react";
import "./Learn.css";

//I dont think this page was necessary for this assignment but in doing my research i wanted to help others learn about all these things,
// It feels like a foreign concept to actually be taught financial terms and Tax terms in a digestable and easy way. 
// I also linked a book ive been reading recently , I just founded my own company and learning finances and stuff has been a BIG Factor , so helping young people like myself is great. 


const CONCEPTS = [
  {
    id: "tfsa",
    category: "Savings Vehicles",
    icon: "💳",
    title: "Tax-Free Savings Account (TFSA)",
    badge: "badge-sage",
    tagline: "The best starting investment for most young South Africans.",
    quick:
      "Invest up to R46,000/year. All growth, interest and dividends are completely tax-free - forever.",
    full: `A Tax-Free Savings Account (TFSA) is one of the most powerful financial tools available to South Africans. Introduced by SARS in 2015, it allows you to invest money and pay zero tax on any growth - no income tax on interest, no capital gains tax, no dividends withholding tax.

The current annual contribution limit is R46,000 (from 1 March 2026), with a lifetime limit of R500,000. These limits are not "use it or lose it" in terms of the lifetime cap - but if you miss a year's contributions, you cannot "catch up" the following year. Each year you don't contribute R46,000, you lose that year's allowance permanently.

Over-contributing results in a 40% penalty tax on the excess, so track contributions carefully.

Best used for: long-term equity investments (ETFs, unit trusts). Avoid holding cash in a TFSA - the tax-free benefit is best exploited when the underlying investment grows significantly.`,
    numbers: [
      { label: "Annual Limit", value: "R46,000" },
      { label: "Lifetime Limit", value: "R500,000" },
      { label: "Tax on Growth", value: "0%" },
      { label: "Tax on Dividends", value: "0%" },
    ],
    tip: "At R3,000/month you hit the annual limit. Set a debit order on 1 March every year.",
    color: "var(--sage)",
  },
  {
    id: "ra",
    category: "Savings Vehicles",
    icon: "🏦",
    title: "Retirement Annuity (RA)",
    badge: "badge-blue",
    tagline: "Get a tax refund while saving for retirement.",
    quick:
      "Contributions reduce your taxable income. At 39% tax bracket, R10k contributed costs you only R6,100 in cash.",
    full: `A Retirement Annuity (RA) is a private pension product that lets you save for retirement while receiving a tax deduction today. SARS allows you to deduct up to 27.5% of your taxable income (or remuneration) from tax - capped at R430,000 per year (from 2026).

This makes an RA one of the most efficient tax structures for high-income earners. If you earn R816,000/year (R68,000/month) and fall in the 39% bracket, contributing R100,000 to an RA reduces your taxable income to R716,000 - saving you approximately R39,000 in income tax.

The money is locked in until age 55 (recently changed from 55 to 55 for all new RAs post-March 2021). At retirement, you can take one-third as a lump sum and the rest must be converted to a living or life annuity.

Best RA providers in SA: Allan Gray, Coronation, Ninety One (Investec), Sanlam and Discovery - all offer low-cost index-tracking options within their RA wrappers.`,
    numbers: [
      { label: "Tax Deduction Limit", value: "27.5% of income" },
      { label: "Annual Cap", value: "R430,000" },
      { label: "Access Age", value: "55 years" },
      { label: "Lump Sum at Retirement", value: "1/3 tax-free" },
    ],
    tip: "At 39% bracket: R1,000 RA contribution costs you only R610. The government pays R390.",
    color: "var(--dusty-blue)",
  },
  {
    id: "emergency-fund",
    category: "Foundations",
    icon: "🛡",
    title: "Emergency Fund",
    badge: "badge-red",
    tagline: "Your financial immune system.",
    quick:
      "3–6 months of expenses in a liquid, interest-bearing account. Non-negotiable before investing.",
    full: `An emergency fund is a cash reserve set aside specifically for unexpected expenses - job loss, medical emergency, urgent home repair - that allows you to cover life's surprises without going into debt or selling investments at the wrong time.

Financial planners recommend 3 months of total expenses as a minimum, and 6 months for higher-income earners or those with variable income (freelancers, commission earners, business owners).

For someone earning R68,000/month with expenses of R45,000/month, the target is:
- Minimum: R135,000 (3 months)
- Recommended: R270,000 (6 months)

Where to keep it: Not in a standard bank account (returns too low). Use a money market account or 32-day notice account earning 8–9% p.a. ABSA MoneyMarket, Investec 32-Day, or FNB Money Market all qualify.

Critical rule: Once used, replenish it before resuming investment contributions.`,
    numbers: [
      { label: "Minimum Target", value: "3 months expenses" },
      { label: "Recommended", value: "6 months expenses" },
      { label: "Where to Keep It", value: "Money market" },
      { label: "Typical Return", value: "8–9% p.a." },
    ],
    tip: "Set up a separate account you cannot see in your daily banking app. Out of sight, out of mind.",
    color: "var(--absa-red)",
  },
  {
    id: "offshore-allowance",
    category: "Offshore Investing",
    icon: "🌍",
    title: "South African Offshore Allowance",
    badge: "badge-gold",
    tagline:
      "Every SA resident can invest R1.1M offshore per year - no questions asked.",
    quick:
      "Discretionary allowance: R1.1 million per year, no SARB approval needed. A powerful currency diversification tool.",
    full: `South African residents are allowed to move money offshore without SARB (South African Reserve Bank) approval up to certain limits per tax year:

Discretionary Allowance: R1,000,000 per adult per calendar year. This can be used for any purpose - investment, travel, gifts, or keeping foreign currency abroad. No SARB tax clearance is required, but banks may request a declaration.

Single Discretionary Allowance: R1,000,000 combined for travel, gifts, and maintenance payments (often confused with the investment allowance - these are separate).

For amounts over R10,000,000, you need SARB approval and must pass a tax clearance process.

Why use it: The Rand has depreciated against the US Dollar at approximately 7% per year over the past decade. Keeping all your wealth in Rands means your purchasing power erodes in USD terms. Offshore investing provides a hedge against this.

How to do it: EasyEquities USD (simplest), Sygnia Itrix offshore ETFs, or directly through a bank's forex transfer to a platform like Interactive Brokers or Standard Bank's offshore investment service.`,
    numbers: [
      { label: "Discretionary Limit", value: "R1,100,000/year" },
      { label: "Approval Required", value: "No (under limit)" },
      { label: "Rand depreciation (10yr avg)", value: "~7% vs USD" },
      { label: "Over R10M?", value: "SARB approval needed" },
    ],
    tip: "You can use up to R1.1M per year. Even R200,000–R400,000 offshore starts building meaningful currency diversification.",
    color: "var(--gold)",
  },
  {
    id: "net-worth",
    category: "Foundations",
    icon: "📊",
    title: "Net Worth",
    badge: "badge-sage",
    tagline: "The only financial number that really matters.",
    quick:
      "Assets minus liabilities. It's what you own minus what you owe. Track it quarterly.",
    full: `Net worth is the single most important number in personal finance. It is calculated simply:

Net Worth = Total Assets − Total Liabilities

Assets include: bank balances, investments (TFSA, RA, shares, unit trusts), property value, vehicle value, business interests, and any other valuable items.

Liabilities include: home loan balance, car finance balance, credit card debt, personal loans, student debt, and any money you owe.

Why it matters: Your salary is income - it flows in and out. Net worth is the scorecard of whether your financial decisions are building lasting wealth or not. Someone earning R100,000/month with no savings and R2 million in debt has a negative net worth. Someone earning R35,000/month who saves consistently for 10 years can have a net worth exceeding R2 million.

Track it quarterly using a simple spreadsheet. Watch the trend over 12–24 months. The direction matters more than the number.`,
    numbers: [
      { label: "Formula", value: "Assets − Liabilities" },
      { label: "Review Frequency", value: "Quarterly" },
      { label: "Target at 30 (rule of thumb)", value: "1× annual salary" },
      { label: "Target at 40", value: "3× annual salary" },
    ],
    tip: "A growing net worth is the result of consistently spending less than you earn and investing the difference.",
    color: "var(--sage)",
  },
  {
    id: "compound-interest",
    category: "Investing",
    icon: "📈",
    title: "Compound Interest",
    badge: "badge-blue",
    tagline: "Einstein called it the eighth wonder of the world.",
    quick:
      "Returns on returns on returns. R10,000 at 9% p.a. becomes R15,386 in 5 years - without adding a cent.",
    full: `Compound interest is the process by which an investment earns returns not just on the original principal, but on the accumulated returns as well. It is the foundational concept behind long-term wealth building.

Simple example:
- You invest R100,000 at 9% per year.
- Year 1: R100,000 × 9% = R9,000 earned → balance R109,000
- Year 2: R109,000 × 9% = R9,810 earned → balance R118,810
- Year 5: balance R153,862 (53% growth on original investment)
- Year 10: balance R236,736 (136% growth)
- Year 20: balance R560,441 (460% growth)

The key insight: time is the most important variable. Starting at 25 versus starting at 35 makes an enormous difference. R3,000/month invested from age 25 to 65 at 9% p.a. grows to approximately R14 million. Starting at 35? Only R5.8 million. The 10-year head start is worth R8 million.

This is why the Global Citizen Vision starts investing in Year 1 - not Year 3. Every month matters.`,
    numbers: [
      { label: "R10k at 9% - 5 years", value: "R15,386" },
      { label: "R10k at 9% - 10 years", value: "R23,674" },
      { label: "R10k at 9% - 20 years", value: "R56,044" },
      { label: "R3k/mo from age 25", value: "~R14M by 65" },
    ],
    tip: "The best time to start investing was yesterday. The second best time is today.",
    color: "var(--dusty-blue)",
  },
  {
    id: "prime-rate",
    category: "Debt & Credit",
    icon: "🏛",
    title: "SA Prime Lending Rate",
    badge: "badge-red",
    tagline: "The rate everything else in SA finance is priced off.",
    quick:
      "Set by the SARB. Currently ~11.25%. Vehicle finance, home loans, and credit cards are priced as prime + a margin.",
    full: `The prime lending rate is the benchmark interest rate used by South African banks to price most lending products. It is set by commercial banks (typically prime = repo rate + 3.5%), and the repo rate is set by the South African Reserve Bank (SARB) Monetary Policy Committee (MPC), which meets 8 times per year.

As of mid-2024, the repo rate is approximately 8.25%, making prime approximately 11.75% (it has since adjusted slightly).

How it affects you:
- Home loan: typically prime − 1% to prime + 2% depending on your credit profile
- Vehicle finance: typically prime + 1.5% to prime + 3%
- Credit card: typically prime + 10–15%
- Personal loan: prime + 15–20%

When the SARB raises the repo rate, your variable-rate home loan and car finance costs increase. This is why fixed-rate debt (like a fixed-rate home loan) can be valuable in high-rate environments.

SA interest rates have been high by global standards since 2021 due to inflationary pressure. The MPC has indicated possible rate cuts in late 2024/2025 - watch SARB announcements.`,
    numbers: [
      { label: "Repo Rate (approx)", value: "~8.25%" },
      { label: "Prime Rate (approx)", value: "~11.75%" },
      { label: "Home Loan (good profile)", value: "Prime − 0.5%" },
      { label: "Vehicle Finance (avg)", value: "Prime + 2%" },
    ],
    tip: "Before taking any loan, calculate the total repayment (monthly payment × months). This is what the debt actually costs you.",
    color: "var(--absa-red)",
  },
  {
    id: "etf",
    category: "Investing",
    icon: "🧩",
    title: "Exchange-Traded Funds (ETFs)",
    badge: "badge-gold",
    tagline: "The simplest, lowest-cost way to invest in the stock market.",
    quick:
      "A single ETF can hold hundreds of companies. Buy the whole JSE or S&P 500 with one trade.",
    full: `An Exchange-Traded Fund (ETF) is a basket of securities - shares, bonds, or other assets - that trades on a stock exchange just like a single share. When you buy one ETF unit, you are effectively buying a small piece of every company in that basket.

Why ETFs are ideal for young South African investors:
1. Diversification: A single Satrix Top 40 ETF gives you exposure to South Africa's 40 largest companies simultaneously.
2. Low cost: Most passive ETFs charge 0.1%–0.4% annual fees (called TER - Total Expense Ratio), versus 1.5–2.5% for actively managed unit trusts.
3. Accessibility: Via EasyEquities, Satrix, or most bank platforms, you can start investing in ETFs from R50.
4. Transparency: You always know what you own.

Key SA-listed ETFs to know:
- Satrix Top 40: tracks JSE's 40 largest companies
- Satrix MSCI World: tracks ~1,600 global companies (rand-hedged)
- Ashburton Global 1200: S&P 500 + international
- Sygnia Itrix S&P 500: USD-denominated global exposure

For a TFSA: a simple 60% Satrix MSCI World + 40% Satrix Top 40 split is a strong starting portfolio for most young investors.`,
    numbers: [
      { label: "Typical TER (passive ETF)", value: "0.1–0.4%" },
      { label: "Active fund fees (avg)", value: "1.5–2.5%" },
      { label: "Minimum investment", value: "R50 (EasyEquities)" },
      { label: "SA ETF market size", value: "R100B+" },
    ],
    tip: "Fee difference matters enormously over time. 1% extra in fees costs you 20% of your final portfolio value over 30 years.",
    color: "var(--gold)",
  },
];

const CATEGORIES = ["All", ...new Set(CONCEPTS.map((c) => c.category))];

export default function Learn() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = CONCEPTS.filter((c) => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.quick.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="learn-page">
      <div className="container">
        {/* Header */}
        <div className="learn-header">
          <span className="hand-note">✦ Financial literacy for real life</span>
          <h1>Learn</h1>
          <p className="learn-subtitle">
            Plain-language explanations of every financial concept you'll
            encounter on your first five years of wealth-building - written for
            South African professionals, not textbooks.
          </p>
        </div>

        {/* Search + filter */}
        <div className="learn-controls">
          <div className="learn-search">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              className="form-input"
              placeholder="Search concepts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.2rem" }}
            />
          </div>
          <div className="learn-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-pill ${activeCategory === cat ? "filter-active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Concept cards grid */}
        <div className="concepts-list">
          {filtered.map((concept) => (
            <div
              key={concept.id}
              className={`concept-explainer-card card ${expanded === concept.id ? "concept-expanded" : ""}`}
              style={{ "--c-color": concept.color }}
            >
              <div
                className="concept-card-header"
                onClick={() =>
                  setExpanded(expanded === concept.id ? null : concept.id)
                }
              >
                <div className="concept-card-left">
                  <div
                    className="concept-emoji-wrap"
                    style={{ background: `${concept.color}22` }}
                  >
                    {concept.icon}
                  </div>
                  <div>
                    <div className="concept-category">{concept.category}</div>
                    <h4 className="concept-title">{concept.title}</h4>
                    <p
                      className="concept-tagline"
                      style={{ color: concept.color }}
                    >
                      {concept.tagline}
                    </p>
                  </div>
                </div>
                <div className="concept-card-right">
                  <span className={`badge ${concept.badge}`}>
                    {concept.category}
                  </span>
                  <span className="concept-toggle">
                    {expanded === concept.id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              <div className="concept-quick">{concept.quick}</div>

              {expanded === concept.id && (
                <div className="concept-full-content">
                  <div className="divider" />

                  {/* Numbers */}
                  <div className="concept-numbers">
                    {concept.numbers.map((n) => (
                      <div key={n.label} className="concept-num-item">
                        <div
                          className="concept-num-value"
                          style={{ color: concept.color }}
                        >
                          {n.value}
                        </div>
                        <div className="concept-num-label">{n.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="divider" />

                  {/* Full explanation */}
                  <div className="concept-full-text">
                    {concept.full.split("\n\n").map((para, i) => (
                      <p key={i} style={{ marginBottom: "0.75rem" }}>
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Tip */}
                  <div className="concept-tip">
                    <span className="concept-tip-icon">✦</span>
                    <p>
                      <strong>Pro tip: </strong>
                      {concept.tip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
              <p>
                No concepts found for "{search}". Try a different search term.
              </p>
            </div>
          )}
        </div>

        {/* Deeper learning callout */}
        <div
          className="learn-deeper card-feature"
          style={{ marginTop: "3rem", borderRadius: "var(--radius-xl)" }}
        >
          <div className="learn-deeper-inner">
            <div>
              <span
                className="hand-note"
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem" }}
              >
                🎓 Go deeper
              </span>
              <h3 style={{ color: "white", marginTop: "0.4rem" }}>
                Recommended South African Reading
              </h3>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  marginTop: "0.5rem",
                  maxWidth: "480px",
                }}
              >
                These resources are worth your time if you want to build on what
                you've learned here.
              </p>
            </div>
            <div className="learn-resources">
              {[
                {
                  title: "Just One Lap",
                  desc: "SA-focused personal finance blog. ETF picks, TFSA guides, SARS tax updates.",
                  type: "Website",
                  url: "https://justonelap.com",
                },
                {
                  title: "The Millionaire Teacher",
                  desc: "By Andrew Hallam. Global ETF investing made simple - very applicable to SA.",
                  type: "Book",
                  url: "https://www.google.co.za/books/edition/Millionaire_Teacher/hyl4DQAAQBAJ?hl=en&gbpv=1&dq=The+Millionaire+teacher&printsec=frontcover",
                },
                {
                  title: "SARS eFiling",
                  desc: "Your tax submissions, TFSA contribution tracking, and tax certificates all in one place.",
                  type: "Official",
                  url: "https://www.sars.gov.za/efiling",
                },
                {
                  title: "FPI (Financial Planning Institute)",
                  desc: "Find a certified CFP financial planner in South Africa.",
                  type: "Directory",
                  url: "https://www.fpi.co.za",
                },
              ].map((r) => (
                <a
                  key={r.title}
                  className="resource-card"
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="resource-type">{r.type}</div>
                  <div className="resource-title">{r.title}</div>
                  <div className="resource-desc">{r.desc}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

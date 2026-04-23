import { Link } from 'react-router-dom';
import './Studio.css';

// This page is the "Simulation Studio" where users can explore interactive financial scenarios.
// Each card represents a different scenario (e.g. Car Finance, Rent vs Buy) and links to a dedicated page with interactive sliders and real-time calculations.
// The scenarios are designed to be relevant to young South African professionals and use simplified models to illustrate the trade-offs of each decision.
// I struggled a lot with how to present the information in a way that is engaging and not overwhelming, so I added a "How it works" section at the top to guide users through the process.
// The cards also have a "coming soon" badge for scenarios that are not yet available, which helps set expectations and build anticipation for future releases.

// Alot of this is a basis and based on my own research , At first it was like Luxury Car vs Uber, which just felt kinda off considering the political climate and the issues with GBV and alck of security , 
// I also realised that with Ubering it will always be more beneficial in comparison to a car 
// however i realised that often times as a woman the security of driving your own car outweights the financial benefits of Ubering, 
// so i changed it to Luxury Car vs Used Car which is a more common dilemma and also more neutral in terms of personal circumstances and choices.

// Im really excited about the next Studios aswell, it will help me get a graft of my own finaces, adn im considering looking at apartments and stuff which is cool.


const STUDIOS = [
  {
    id: 'car-comparison',
    path: '/studio/car-comparison',
    emoji: '🚗',
    title: 'Luxury Car vs Used Car',
    subtitle: 'Finance a R600k luxury car or buy used and invest the difference?',
    description: 'One of the most common wealth-destroying decisions young professionals make. This studio compares the true total cost of ownership including: finance, insurance, fuel, depreciation, and shows what the monthly saving could become if invested.',
    tags: ['Vehicle Finance', 'Opportunity Cost', 'Compound Growth'],
    time: '5 min',
    available: true,
    color: 'var(--absa-red)',
    bg: 'linear-gradient(135deg, #FAE8EA 0%, #F2C4CC 100%)',
  },
  {
    id: 'rent-vs-buy',
    path: '/studio/rent-vs-buy',
    emoji: '🏠',
    title: 'Rent vs Buy in South Africa',
    subtitle: 'Is owning a home actually better than renting in Johannesburg or Cape Town?',
    description: 'Running the real numbers: bond repayments, transfer duty, rates & levies, versus rental costs and investing the deposit. The answer might surprise you.',
    tags: ['Bond Repayments', 'Transfer Duty', 'Property Growth'],
    time: '8 min',
    available: false,
    color: 'var(--gold)',
    bg: 'linear-gradient(135deg, #FDF5E0 0%, #FAE8B0 100%)',
  },
  {
    id: 'offshore-allocation',
    path: '/studio/offshore-allocation',
    emoji: '🌍',
    title: 'Local vs Offshore Allocation',
    subtitle: 'How much of your portfolio should be offshore? Model the Rand impact.',
    description: 'Simulate different local vs offshore portfolio splits and see how historical Rand depreciation affects real returns. Find your optimal allocation.',
    tags: ['Currency Risk', 'Portfolio Allocation', 'JSE vs Global'],
    time: '6 min',
    available: false,
    color: 'var(--dusty-blue)',
    bg: 'linear-gradient(135deg, #E8F2FA 0%, #C8DFF0 100%)',
  },
];

export default function Studio() {
  return (
    <div className="studio-page">
      <div className="container">

        <div className="studio-page-header">
          <span className="hand-note">⚗ Simulate before you decide</span>
          <h1>Simulation Studio</h1>
          <p className="studio-page-subtitle">
            Big financial decisions deserve a rehearsal. Each studio lets you adjust the real
            variables of a decision the prices, rates, time horizons and helps you see the impact before
            you commit. The numbers are simplified but the logic is real.
          </p>
        </div>

        {/* How it works */}
        <div className="how-it-works card" style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>How the Studio works</h4>
          <div className="hiw-steps">
            {[
              { step: '1', label: 'Choose a scenario', desc: 'Pick the financial decision you want to explore.' },
              { step: '2', label: 'Adjust the inputs', desc: 'Move sliders to match your real situation: price, income, rates, term.' },
              { step: '3', label: 'Read the verdict', desc: 'Get a plain-language summary of the trade-offs and long-term impact.' },
              { step: '4', label: 'Apply to your Vision', desc: 'See how the decision affects your Vision Track progress.' },
            ].map(s => (
              <div key={s.step} className="hiw-step">
                <div className="hiw-number">{s.step}</div>
                <div className="hiw-text">
                  <div className="hiw-label">{s.label}</div>
                  <div className="hiw-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Studio cards */}
        <div className="studios-list">
          {STUDIOS.map(studio => (
            <div key={studio.id} className={`studio-card card ${!studio.available ? 'studio-card-disabled' : ''}`}>
              <div className="studio-card-visual" style={{ background: studio.bg }}>
                <span className="studio-card-emoji">{studio.emoji}</span>
              </div>
              <div className="studio-card-body">
                <div className="studio-card-tags">
                  {studio.tags.map(t => (
                    <span key={t} className="badge badge-gold">{t}</span>
                  ))}
                  <span className="studio-time">⏱ {studio.time}</span>
                </div>
                <h3 className="studio-card-title">{studio.title}</h3>
                <p className="studio-card-subtitle" style={{ color: studio.color }}>{studio.subtitle}</p>
                <p className="studio-card-desc">{studio.description}</p>
                {studio.available ? (
                  <Link to={studio.path} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Enter Studio →
                  </Link>
                ) : (
                  <div className="studio-soon">
                    <span className="badge badge-gold">Coming in next release</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="studio-disclaimer">
          <p>
            <strong>Note:</strong> Studio calculations are simplified models designed to illustrate trade-offs and
            relative comparisons. They are not financial advice. For personalised advice, speak to a registered
            South African financial advisor (CFP). Numbers use approximate SA market rates as at 2024/25.
          </p>
        </div>

      </div>
    </div>
  );
}

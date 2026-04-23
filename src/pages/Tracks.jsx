import { Link } from 'react-router-dom';
import { useProfile } from '../context/UserProfileContext';
import './Tracks.css';

// Tracks omg , what a nightmare, trying to map this out on paper to make it seem coherant and make sense was really hard and actually made me question so many of my own financial and life decisions :( 
// Ya girl needs to get a job ASAPPP
// Need to add a Graph in A3 - it helps show growth, i might add a system that manually ticks them off as the person reaches their goals in the Money snapshot section to add more to the visual and overall site cohesion.

const TRACKS = [
  {
    id: 'global-citizen',
    name: "The Global Citizen Vision",
    emoji: '✈',
    tagline: "Build offshore wealth. Create location-independent income.",
    description: "For young professionals who value flexibility and global exposure. This track prioritises offshore investing, TFSA maximisation, RA tax efficiency, and building wealth that travels with you regardless of what the Rand does.",
    for: "Professionals who don't want to be tied to SA property. Building global, flexible wealth.",
    avoids: "SA property, excessive cash in local accounts, over-concentration in ZAR assets.",
    highlights: ['Offshore ETFs & USD exposure', 'TFSA R36k annual limit', 'RA tax deductions', 'Location independence'],
    color: 'var(--dusty-blue)',
    bg: 'linear-gradient(135deg, #E8F2FA 0%, #C8DFF0 100%)',
    border: '#7A9CB8',
    path: '/tracks/global-citizen',
    available: true,
  },
  {
    id: 'homeowner',
    name: "The Homeowner's Vision",
    emoji: '🏠',
    tagline: "Own your first home within 3–5 years.",
    description: "This track is built for young professionals who want to stop renting and build equity. It structures your first five years around deposit saving, credit improvement, and understanding the true costs of property ownership in South Africa.",
    for: "Professionals targeting a R1.6M–R2M first property. Willing to limit lifestyle spending for 3–5 years.",
    avoids: "Luxury vehicle finance, lifestyle inflation, new debt that affects affordability.",
    highlights: ['R300k–R400k deposit target', 'Bond pre-approval', 'Transfer duty planning', 'Credit score building'],
    color: 'var(--absa-red)',
    bg: 'linear-gradient(135deg, #FAE8EA 0%, #F2C4CC 100%)',
    border: 'var(--absa-red-muted)',
    path: '/tracks/homeowner',
    available: false,
  },
  {
    id: 'balanced',
    name: "The Balanced Wealth Vision",
    emoji: '⚖',
    tagline: "Do it all. Pay debt, build security, start investing.",
    description: "For professionals who have multiple financial priorities and don't want to sacrifice one dream for another. This track sequences goals : debt first, then emergency fund, then investing , so you build a resilient financial foundation.",
    for: "Those with credit card debt or existing bond. Want balance across debt, savings, and investing.",
    avoids: "Aggressive risk-taking, neglecting debt for speculative investments, lifestyle inflation.",
    highlights: ['Debt elimination first', '6-month emergency fund', 'TFSA entry investing', 'Bond vs RA prioritisation'],
    color: 'var(--sage)',
    bg: 'linear-gradient(135deg, #E8F5E4 0%, #C8E8C0 100%)',
    border: 'var(--sage)',
    path: '/tracks/balanced',
    available: false,
  },
];

export default function Tracks() {
  const { profile } = useProfile();
  const activeTrack = profile.selectedTrack;

  return (
    <div className="tracks-page">
      <div className="container">

        <div className="tracks-header">
          <span className="hand-note">◈ Your 5-year roadmap</span>
          <h1>Choose Your Vision</h1>
          <p className="tracks-subtitle">
            Your first five years matter. Each Vision Track is a curated roadmap designed around
            a specific life goal. Choose the one that excites you most! OR browse all three to understand the trade-offs.
          </p>
        </div>

        <div className="tracks-grid">
          {TRACKS.map(track => (
            <div
              key={track.id}
              className={`track-card ${activeTrack === track.id ? 'track-card-active' : ''}`}
              style={{ '--track-color': track.color, '--track-border': track.border }}
            >
              {activeTrack === track.id && (
                <div className="active-badge">
                  <span className="badge badge-red">✓ Your Current Vision</span>
                </div>
              )}

              <div className="track-header" style={{ background: track.bg }}>
                <div className="track-emoji">{track.emoji}</div>
                <h3 className="track-name">{track.name}</h3>
                <p className="track-tagline" style={{ color: track.color }}>{track.tagline}</p>
              </div>

              <div className="track-body">
                <p className="track-desc">{track.description}</p>

                <div className="track-section">
                  <div className="track-section-label">Best for</div>
                  <p className="track-section-text">{track.for}</p>
                </div>

                <div className="track-highlights">
                  {track.highlights.map(h => (
                    <span key={h} className="track-highlight-pill">{h}</span>
                  ))}
                </div>

                {track.available ? (
                  <Link to={track.path} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                    {activeTrack === track.id ? 'View My Progress →' : 'Explore This Track →'}
                  </Link>
                ) : (
                  <div className="track-coming-soon">
                    <span style={{ opacity: 0.5, fontSize: '0.82rem' }}>Coming soon in the next release</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Compare section */}
        <div className="tracks-compare card" style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Track Comparison</h3>
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>✈ Global Citizen</th>
                  <th>🏠 Homeowner</th>
                  <th>⚖ Balanced</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Primary Goal', 'Offshore wealth', 'Property deposit', 'Debt-free foundation'],
                  ['Year 1 Focus', 'Open TFSA + offshore account', 'Emergency fund + clear debt', 'Clear credit card debt'],
                  ['Property Ownership', '✗ Not in 5 years', '✓ Year 3–4', '✓ If already owned'],
                  ['Vehicle Finance', '✗ Avoid', '✗ Avoid', '~ Moderate'],
                  ['RA Contributions', '✓ Maximise for tax', '✓ Basic contributions', '✓ After debt cleared'],
                  ['Risk Appetite', 'Moderate–Aggressive', 'Conservative', 'Conservative–Moderate'],
                  ['Best Outcome (5yr)', 'R500k+ offshore portfolio', 'Own first property', 'Debt-free + R100k invested'],
                ].map(([cat, ...vals]) => (
                  <tr key={cat}>
                    <td className="compare-cat">{cat}</td>
                    {vals.map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

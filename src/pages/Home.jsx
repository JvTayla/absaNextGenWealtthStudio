import { Link } from 'react-router-dom';
import { useProfile } from '../context/UserProfileContext';
import { formatZAR, formatZARShort } from '../utils/finance';
import './Home.css';

// Admittedly this page doesnt match my wireframes exactly , i took some creatiev liberties, 
// but i thought that it would be betetr as a Introduction into what the site holds and a great way to allow 1st time users 
// to get excited about the possibilities of the site and what it can do for them, 
// rather than just dumping them into the snapshot which is more of a tool and less of a 
// "hook" if that makes sense.

// I really like the scrapbook look that i kept, Im thinking of adding more User Persona details into it correctly 
// and letting people add images ? Perchance so they can create a mock vision board. 


export default function Home() {
  const { profile, disposable, takeHome, goalProgress } = useProfile();

  return (
    <div className="home">

      {/*    HERO    */}
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <span className="hero-eyebrow hand-note">Your first five years start now ✦</span>
              <h1 className="hero-title">
                Design the life <br />
                <em>you actually want.</em>
              </h1>
              <p className="hero-subtitle">
                ABSA NextGen Wealth Studio turns financial planning into a vision board.
                See exactly where your money is going, choose a path that fits your dreams,
                and simulate the big decisions before you make them.
              </p>
              <div className="hero-ctas">
                <Link to="/snapshot" className="btn btn-primary btn-lg">
                  View My Snapshot →
                </Link>
                <Link to="/tracks" className="btn btn-secondary btn-lg">
                  Choose My Vision
                </Link>
              </div>
              <div className="hero-badges">
                <span className="badge badge-red">🇿🇦 Built for South Africa</span>
                <span className="badge badge-gold">SARS Tax-Aware</span>
                <span className="badge badge-sage">TFSA & RA Ready</span>
              </div>
            </div>

            {/* Floating snapshot card */}
            <div className="hero-card-stack">
              <div className="floating-card card-pinned">
                <div className="hand-label" style={{marginBottom:'0.5rem'}}>
                  👋 Welcome back, {profile.name}
                </div>
                <div className="fc-track-badge">
                  <span className="badge badge-blue">✈ Global Citizen Vision</span>
                </div>
                <div className="fc-goal-ring">
                  <svg viewBox="0 0 80 80" className="ring-svg">
                    <circle cx="40" cy="40" r="32" stroke="var(--parchment)" strokeWidth="8" fill="none" />
                    <circle
                      cx="40" cy="40" r="32"
                      stroke="var(--absa-red)" strokeWidth="8" fill="none"
                      strokeDasharray={`${goalProgress * 2.01} 201`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                    />
                  </svg>
                  <div className="ring-label">
                    <div className="ring-pct">{goalProgress}%</div>
                    <div className="ring-sub">to goal</div>
                  </div>
                </div>
                <div className="fc-stat">
                  <span className="fc-stat-label">Disposable monthly</span>
                  <span className="zar-amount">{formatZAR(disposable)}</span>
                </div>
                <div className="fc-stat">
                  <span className="fc-stat-label">Total savings</span>
                  <span className="zar-amount">{formatZARShort(
                    Object.values(profile.savings).reduce((a,b) => a+b,0)
                  )}</span>
                </div>
              </div>

              <div className="floating-card-back" />
            </div>
          </div>
        </div>
      </section>

      {/*    VALUE PROPS    */}
      <section className="section value-props">
        <div className="container">
          <div className="section-header" style={{textAlign:'center'}}>
            <span className="eyebrow">Why NextGen Wealth Studio?</span>
            <h2>Your bank finally works <em>for</em> your vision</h2>
            <p>Most banking apps tell you where your money went. We show you where your life is going.</p>
          </div>

          <div className="vp-grid">
            {[
              {
                icon: '◎',
                color: 'var(--absa-red)',
                title: 'Money Snapshot',
                desc: 'See your take-home pay after SARS tax, your spending breakdown, and exactly how much you have left to build wealth with every month.',
                link: '/snapshot',
                linkLabel: 'View Snapshot',
              },
              {
                icon: '◈',
                color: 'var(--gold)',
                title: 'Vision Tracks',
                desc: 'Choose a 5-year roadmap designed for your goals whether that\'s offshore investing, property ownership, or balanced wealth-building.',
                link: '/tracks',
                linkLabel: 'Choose a Track',
              },
              {
                icon: '⚗',
                color: 'var(--dusty-blue)',
                title: 'Simulation Studio',
                desc: 'Ask "what if" without real-world consequences. Compare financing a luxury car versus investing the difference. See the 5-year impact.',
                link: '/studio',
                linkLabel: 'Enter the Studio',
              },
              {
                icon: '✦',
                color: 'var(--sage)',
                title: 'Financial Education',
                desc: 'From TFSA limits to offshore allowance rules learn what every financial term means and why it matters for your specific situation.',
                link: '/learn',
                linkLabel: 'Start Learning',
              },
            ].map(vp => (
              <div key={vp.title} className="vp-card card-pinned">
                <div className="vp-icon" style={{color: vp.color}}>{vp.icon}</div>
                <h4>{vp.title}</h4>
                <p>{vp.desc}</p>
                <Link to={vp.link} className="vp-link" style={{color: vp.color}}>
                  {vp.linkLabel} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*    WHO IS THIS FOR    */}
      <section className="section who-section">
        <div className="container">
          <div className="who-inner">
            <div className="who-text">
              <span className="eyebrow hand-note">Designed for you</span>
              <h2>Made for South Africa's high-earning young professionals</h2>
              <p>
                You earn well which is R30,000 to R80,000 a month. But your money feels
                like it disappears. You're caught between lifestyle (the car, the
                apartment, the travel) and long-term goals you know matter.
              </p>
              <p style={{marginTop:'1rem'}}>
                NextGen Wealth Studio gives you the roadmap your salary deserves.
                SARS-aware, South African, and built around what <em>you</em> actually want.
              </p>

              <div className="who-stats">
                {[
                  { value: 'R30k–R80k', label: 'Target monthly income' },
                  { value: '5 Years', label: 'Planning horizon' },
                  { value: '3 Tracks', label: 'Curated vision paths' },
                ].map(s => (
                  <div key={s.label} className="who-stat">
                    <div className="who-stat-value">{s.value}</div>
                    <div className="who-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="who-personas">
              {[
                {
                  name: 'Thabo, 29',
                  role: 'Software Engineer, JHB',
                  track: 'Homeowner\'s Vision',
                  trackColor: 'badge-red',
                  quote: '"I want to stop renting and own a townhouse in Parkhurst within 3 years."',
                },
                {
                  name: 'Lebo, 27',
                  role: 'Strategy Consultant, CPT',
                  track: 'Global Citizen Vision',
                  trackColor: 'badge-blue',
                  quote: '"I want to build offshore wealth and create location-independent income."',
                },
                {
                  name: 'Priya, 32',
                  role: 'Medical Doctor, DBN',
                  track: 'Balanced Wealth Vision',
                  trackColor: 'badge-sage',
                  quote: '"I need to pay off debt, build security, and still enjoy the life I worked for."',
                },
              ].map(p => (
                <div key={p.name} className="persona-card card-torn">
                  <div className="persona-header">
                    <div className="persona-avatar">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="persona-name">{p.name}</div>
                      <div className="persona-role">{p.role}</div>
                    </div>
                  </div>
                  <p className="persona-quote">{p.quote}</p>
                  <span className={`badge ${p.trackColor}`}>{p.track}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*    SA CONTEXT CALLOUT    */}
      <section className="section sa-callout">
        <div className="container">
          <div className="card-feature sa-feature-card">
            <div className="sa-feature-inner">
              <div>
                <span className="hand-note" style={{color:'rgba(255,255,255,0.8)', fontSize:'1rem'}}>
                  🇿🇦 South African first
                </span>
                <h2 style={{color:'white', marginTop:'0.5rem'}}>
                  Real SA numbers. Real SA context.
                </h2>
                <p style={{color:'rgba(255,255,255,0.85)', marginTop:'0.75rem', maxWidth:'500px'}}>
                  Built around SARS tax brackets, South African prime lending rates,
                  TFSA annual limits (R46,000), RA contribution rules (27.5% of taxable income),
                  and offshore allowance limits. No generic calculators. This is designed for you.
                </p>
              </div>
              <div className="sa-pills">
                {[
                  '📊 SARS PAYE Calculator',
                  '🏠 SA Bond Rates',
                  '💰 TFSA & RA Rules',
                  '🌍 Offshore Allowance',
                  '🚗 Vehicle Finance Rates',
                  '📈 JSE & Global ETFs',
                ].map(pill => (
                  <span key={pill} className="sa-pill">{pill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*    CTA FOOTER    */}
      <section className="section home-cta">
        <div className="container" style={{textAlign:'center'}}>
          <span className="hand-note" style={{fontSize:'1.2rem'}}>Ready to design your life?</span>
          <h2 style={{marginTop:'0.5rem'}}>Your vision board starts here</h2>
          <p style={{maxWidth:'400px', margin:'0.75rem auto 1.5rem'}}>
            Begin with your Money Snapshot to see where you stand today.
          </p>
          <Link to="/snapshot" className="btn btn-primary btn-lg">
            Get My Snapshot →
          </Link>
        </div>
      </section>
    </div>
  );
}

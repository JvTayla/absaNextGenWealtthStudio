import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-logo">
          <img src="./absa-logo.png" alt="ABSA" className="footer-logo-img" />
          <span className="footer-logo-name">NextGen Wealth Studio</span>
        </div>
        <span className="footer-copy">
          © {year} Absa Bank Limited · Not financial advice
        </span>
      </div>
    </footer>
  );
}

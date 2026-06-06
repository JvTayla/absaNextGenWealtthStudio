import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { UserProfileProvider } from "./context/UserProfileContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Snapshot from "./pages/Snapshot";
import Tracks from "./pages/Tracks";
import GlobalCitizenTrack from "./pages/GlobalCitizenTrack";
import HomeownerTrack from "./pages/HomeownerTrack";
import BalancedTrack from "./pages/BalancedTrack";
import Studio from "./pages/Studio";
import CarStudio from "./pages/CarStudio";
import Learn from "./pages/Learn";
import Onboarding from "./pages/Onboarding";
import Footer from "./components/Footer";
import "./styles/global.css";

// Redirects first-time visitors to onboarding
// Skips onboarding if they've already completed it (localStorage flag)
function OnboardingGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onboarded = localStorage.getItem("absa_onboarded");
    if (!onboarded && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [location.pathname, navigate]);

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProfileProvider>
        <OnboardingGuard>
          {/* Hide navbar on onboarding screen */}
          <Routes>
            <Route path="/onboarding" element={null} />
            <Route path="*" element={<Navbar />} />
          </Routes>

          <div className="page-wrapper">
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<Home />} />
              <Route path="/snapshot" element={<Snapshot />} />
              <Route path="/tracks" element={<Tracks />} />
              <Route
                path="/tracks/global-citizen"
                element={<GlobalCitizenTrack />}
              />
              <Route path="/tracks/homeowner" element={<HomeownerTrack />} />
              <Route path="/tracks/balanced" element={<BalancedTrack />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/studio/car-comparison" element={<CarStudio />} />
              <Route path="/learn" element={<Learn />} />
            </Routes>
          </div>

          <Routes>
            <Route path="/onboarding" element={null} />
            <Route path="*" element={<Footer />} />
          </Routes>
        </OnboardingGuard>
      </UserProfileProvider>
    </BrowserRouter>
  );
}

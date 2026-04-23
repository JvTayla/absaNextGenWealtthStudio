import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProfileProvider } from './context/UserProfileContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Snapshot from './pages/Snapshot';
import Tracks from './pages/Tracks';
import GlobalCitizenTrack from './pages/GlobalCitizenTrack';
import Studio from './pages/Studio';
import CarStudio from './pages/CarStudio';
import Learn from './pages/Learn';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <UserProfileProvider>
        <Navbar />
        <div className="page-wrapper">
          <Routes>
            <Route path="/"                            element={<Home />} />
            <Route path="/snapshot"                    element={<Snapshot />} />
            <Route path="/tracks"                      element={<Tracks />} />
            <Route path="/tracks/global-citizen"       element={<GlobalCitizenTrack />} />
            <Route path="/studio"                      element={<Studio />} />
            <Route path="/studio/car-comparison"       element={<CarStudio />} />
            <Route path="/learn"                       element={<Learn />} />
          </Routes>
        </div>
      </UserProfileProvider>
    </BrowserRouter>
  );
}

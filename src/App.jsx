import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/SignUp';
import AcadeMateLanding from './components/Layout/LandingPage';
// import AcadeMateDashboard from './components/Dashboard';
import FeaturesPage from './components/Features';
import AboutPage from './components/About';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/about-us" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
      <Route path="/" element={<AcadeMateLanding />} /> {/* Default route to Login */}
      {/* <Route path="/dashboard" element={<AcadeMateDashboard />} /> */}
    </Routes>
  );
};

export default App;
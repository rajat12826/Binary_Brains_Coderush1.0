import React from "react";
import { Routes, Route } from "react-router-dom";
import SignInPage from "./(auth)/sign-in/SignInPage";

import AcadeMateLanding from "./components/Layout/LandingPage";
import FeaturesPage from "./components/Features";
import AboutPage from "./components/About";
// import AcadeMateDashboard from "./components/Dashboard";
import ProtectedRoute from "./ProtectedRoute"; // import your ProtectedRoute
import SignUpPage from "./(auth)/sign-up/SignUpPage";
import PLagioGuardDashboard from "./components/PlagDashboard";
import Signup from "./components/SignUp";
import LoginPage from "./components/Login";

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/about-us" element={<AboutPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/" element={<AcadeMateLanding />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
        //   <ProtectedRoute>
        //     
        // </ProtectedRoute>
        <PLagioGuardDashboard />
        }
      />
    </Routes>
  );
};

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { ResearcherPortal } from './components/researcher/ResearcherPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { HelpCentre } from './components/help/HelpCentre';
import { LoginPage } from './components/auth/LoginPage';
import { CitizenRegisterPage } from './components/auth/CitizenRegisterPage';
import { ResearcherApplyPage } from './components/auth/ResearcherApplyPage';
import { InitialSuperAdminSetupPage } from './components/auth/InitialSuperAdminSetupPage';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-theme-bg text-theme-text transition-colors">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/citizen" element={<CitizenPortal />} />
                  <Route path="/researcher" element={<ResearcherPortal />} />
                  <Route path="/admin" element={<AdminPortal />} />
                  <Route path="/help" element={<HelpCentre />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<CitizenRegisterPage />} />
                  <Route path="/apply-researcher" element={<ResearcherApplyPage />} />
                  <Route path="/setup-super-admin" element={<InitialSuperAdminSetupPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;


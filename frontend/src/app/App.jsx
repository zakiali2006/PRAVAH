import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  INITIAL_FACTORY_UNITS,
  INITIAL_COMPLIANCES,
  INITIAL_PAYMENTS,
  INITIAL_QUERIES,
  INITIAL_PUBLIC_CONSULTATIONS,
  INITIAL_SCHEMES,
  INITIAL_APPLICATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FRAUD_ALERTS,
  INITIAL_USERS
} from "../data/mockData";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ChatBot } from "../components/chatbot/ChatBot";
import { FONT, C } from "../constants/theme";
import { AuthProvider } from "../contexts/AuthContext";
import { TranslationProvider } from "../contexts/TranslationContext";
import { MockAppProvider } from "../contexts/MockAppContext";

import { Home } from "../features/home/pages/Home";
import { About } from "../pages/About";
import { ServicesAvailable } from "../features/services/pages/ServicesAvailable";
import { ServicesApplied } from "../features/applications/pages/ServicesApplied";
import { ApplyService } from "../features/applications/pages/ApplyService";
import { IncentiveCalculator } from "../features/incentives/pages/IncentiveCalculator";
import { Grievances } from "../features/grievances/pages/Grievances";
import { InvestorDashboard } from "../features/dashboard/pages/InvestorDashboard";
import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";
import { useAuth } from "../contexts/AuthContext";
import { Outlet, Navigate } from "react-router-dom";
import { Contact } from "../pages/Contact";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { MyBusiness } from "../features/business/pages/MyBusiness";
import { DocumentDrive } from "../features/documents/pages/DocumentDrive";
import { OfficerLayout } from "../features/officer/layout/OfficerLayout";
import { OfficerDashboard } from "../features/officer/pages/OfficerDashboard";
import { FactoryUnits } from "../features/business/pages/FactoryUnits";
import { InvestorWizard } from "../features/applications/pages/InvestorWizard";
import { PaymentsHistory } from "../features/dashboard/pages/PaymentsHistory";
import { DepartmentQueries } from "../features/grievances/pages/DepartmentQueries";
import { PublicConsultations } from "../features/home/pages/PublicConsultations";
import { AuditLogs } from "../features/dashboard/pages/AuditLogs";
import { FraudRadar } from "../features/officer/pages/FraudRadar";
import { Feedback } from "../features/dashboard/pages/Feedback";
// A wrapper to enforce authentication inline
function PrivateRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? <Outlet /> : <Login />;
}

// A layout for public pages
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

function PublicLayout({ a11y, setA11y }) {
  const location = useLocation();
  return (
    <>
      <Header a11y={a11y} setA11y={setA11y} />
      <motion.main 
        key={location.pathname}
        initial={{ opacity: 0.4, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex-1"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </>
  );
}

function AppRoutes() {
  const [a11y, setA11y] = useState({ font: 0, invert: false, links: false });

  useEffect(() => {
    const fs = a11y.font === 1 ? "17px" : a11y.font === 2 ? "18px" : "16px";
    document.documentElement.style.fontSize = fs;
  }, [a11y.font]);

  const a11yClass = `${a11y.invert ? "invert hue-rotate-180" : ""} ${a11y.links ? "underline-links" : ""}`;

  return (
    <BrowserRouter>
      <div 
        className={`min-h-screen flex flex-col font-sans antialiased ${a11yClass}`}
        style={{ fontFamily: FONT, background: C.white, color: C.ink }}
      >
        <Routes>
          {/* Public & Private Routes combined under PublicLayout */}
          <Route element={<PublicLayout a11y={a11y} setA11y={setA11y} />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<InvestorDashboard />} />
              <Route path="/business" element={<MyBusiness />} />
              <Route path="/drive" element={<DocumentDrive />} />
              <Route path="/services" element={<ServicesAvailable />} />
              <Route path="/apply" element={<ApplyService />} />
              <Route path="/track" element={<ServicesApplied />} />
              <Route path="/calc" element={<IncentiveCalculator />} />
              <Route path="/grievance" element={<Grievances />} />
              <Route path="/factory" element={<FactoryUnits />} />
              <Route path="/wizard" element={<InvestorWizard />} />
              <Route path="/payments" element={<PaymentsHistory />} />
              <Route path="/queries" element={<DepartmentQueries />} />
              <Route path="/consultations" element={<PublicConsultations />} />
              <Route path="/audit" element={<AuditLogs />} />
              <Route path="/feedback" element={<Feedback />} />
            </Route>
          </Route>

          {/* Officer Routes */}
          <Route path="/officer" element={<PrivateRoute><OfficerLayout /></PrivateRoute>}>
            <Route index element={<OfficerDashboard />} />
            <Route path="fraud" element={<FraudRadar alerts={INITIAL_FRAUD_ALERTS} />} />
          </Route>
        </Routes>
        <ChatBot />
      </div>
    </BrowserRouter>
  );
}


export function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <MockAppProvider>
          <AppRoutes />
        </MockAppProvider>
      </AuthProvider>
    </TranslationProvider>
  );
}

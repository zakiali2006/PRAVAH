import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";


import { UnderConstruction } from "../components/common/UnderConstruction";

import {
  INITIAL_FRAUD_ALERTS,
} from "../data/mockData";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ChatBot } from "../components/chatbot/ChatBot";
import { FONT, C } from "../constants/theme";
import { AuthProvider } from "../contexts/AuthContext";
import { TranslationProvider } from "../contexts/TranslationContext";
import { MockAppProvider } from "../contexts/MockAppContext";

// Auth & Guards
import { RoleGuard } from "../auth/RoleGuard";
import { ROLES } from "../config/roles";

// Layouts
import { AuthenticatedLayout } from "../components/layout/AuthenticatedLayout";

// Public Pages
import { Home } from "../features/home/pages/Home";
import { About } from "../pages/About";
import { Contact } from "../pages/Contact";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Unauthorized } from "../pages/Unauthorized";

// Feature Pages
import { ServicesAvailable } from "../features/services/pages/ServicesAvailable";
import { ServicesApplied } from "../features/applications/pages/ServicesApplied";
import { ApplyService } from "../features/applications/pages/ApplyService";
import { IncentiveCalculator } from "../features/incentives/pages/IncentiveCalculator";
import { Grievances } from "../features/grievances/pages/Grievances";
import { InvestorDashboard } from "../features/dashboard/pages/InvestorDashboard";
import { MyBusiness } from "../features/business/pages/MyBusiness";
import { DocumentDrive } from "../features/documents/pages/DocumentDrive";
import { OfficerDashboard } from "../features/officer/pages/OfficerDashboard";
import { OfficerQueue } from "../features/officer/pages/OfficerQueue";
import { FactoryUnits } from "../features/business/pages/FactoryUnits";
import { InvestorWizard } from "../features/applications/pages/InvestorWizard";
import { PaymentsHistory } from "../features/dashboard/pages/PaymentsHistory";
import { DepartmentQueries } from "../features/grievances/pages/DepartmentQueries";
import { PublicConsultations } from "../features/home/pages/PublicConsultations";
import { AuditLogs } from "../features/dashboard/pages/AuditLogs";
import { FraudRadar } from "../features/officer/pages/FraudRadar";
import { DocumentReview } from "../features/officer/pages/DocumentReview";
import { DuplicateAlerts } from "../features/officer/pages/DuplicateAlerts";
import { OfficerGrievances } from "../features/officer/pages/OfficerGrievances";
import { Feedback } from "../features/dashboard/pages/Feedback";

// Policy Admin Pages
import { PolicyDashboard } from "../features/policy/pages/PolicyDashboard";
import { ManageServices } from "../features/policy/pages/ManageServices";
import { ConfigureWorkflows } from "../features/policy/pages/ConfigureWorkflows";
import { RiskAlerts } from "../features/dashboard/pages/RiskAlerts";
import { 
  BottleneckAnalytics, 
  DistrictAnalysis, 
  SectorAnalysis, 
  DepartmentAnalysis, 
  RegulatoryImpact 
} from "../features/policy/pages/AnalyticsStubs";

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
          <Route element={<PublicLayout a11y={a11y} setA11y={setA11y} />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<ServicesAvailable />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          <Route element={<AuthenticatedLayout a11y={a11y} setA11y={setA11y} />}>
            {/* Investor Routes */}
            <Route path="/app" element={
              <RoleGuard allowedRoles={[ROLES.INVESTOR]}>
                <Outlet />
              </RoleGuard>
            }>
              <Route path="dashboard" element={<InvestorDashboard />} />
              <Route path="business" element={<MyBusiness />} />
              <Route path="drive" element={<DocumentDrive />} />
              <Route path="services" element={<ServicesAvailable />} />
              <Route path="apply" element={<ApplyService />} />
              <Route path="applications" element={<ServicesApplied />} />
              <Route path="calc" element={<IncentiveCalculator />} />
              <Route path="grievance" element={<Grievances />} />
              <Route path="factory" element={<FactoryUnits />} />
              <Route path="wizard" element={<InvestorWizard />} />
              <Route path="payments" element={<PaymentsHistory />} />
              <Route path="queries" element={<DepartmentQueries />} />
              <Route path="consultations" element={<PublicConsultations />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="documents" element={<DocumentDrive />} />
              <Route path="risk" element={<RiskAlerts />} />
            </Route>

            {/* Officer Routes */}
            <Route path="/officer" element={
              <RoleGuard allowedRoles={[ROLES.OFFICER]}>
                <Outlet />
              </RoleGuard>
            }>
              <Route path="dashboard" element={<OfficerDashboard />} />
              <Route path="fraud" element={<FraudRadar alerts={INITIAL_FRAUD_ALERTS} />} />
              <Route path="queue" element={<OfficerQueue />} />
              <Route path="documents" element={<DocumentReview />} />
              <Route path="duplicates" element={<DuplicateAlerts />} />
              <Route path="grievances" element={<OfficerGrievances />} />
            </Route>

            {/* Policy Admin Routes */}
            <Route path="/policy" element={
              <RoleGuard allowedRoles={[ROLES.POLICY_ADMIN]}>
                <Outlet />
              </RoleGuard>
            }>
              <Route path="dashboard" element={<PolicyDashboard />} />
              <Route path="services" element={<ManageServices />} />
              <Route path="workflows" element={<ConfigureWorkflows />} />
              <Route path="bottlenecks" element={<BottleneckAnalytics />} />
              <Route path="districts" element={<DistrictAnalysis />} />
              <Route path="sectors" element={<SectorAnalysis />} />
              <Route path="departments" element={<DepartmentAnalysis />} />
              <Route path="regulatory" element={<RegulatoryImpact />} />
            </Route>
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

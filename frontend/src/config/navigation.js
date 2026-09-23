import { ROLES } from "./roles";

export const NAVIGATION = {
  [ROLES.INVESTOR]: [
    { label: "Dashboard", path: "app/dashboard" },
    {
      label: "Applications",
      subLinks: [
        { label: "Clearance Roadmap", path: "app/wizard" },
        { label: "Apply for Services", path: "app/services" },
        { label: "My Applications", path: "app/applications" },
      ]
    },
    {
      label: "My Business",
      subLinks: [
        { label: "Business Profile", path: "app/business" },
        { label: "Factory Units", path: "app/factory" },
        { label: "Document Drive", path: "app/documents" },
        { label: "Payments History", path: "app/payments" },
      ]
    },
    {
      label: "Compliance & Tools",
      subLinks: [
        { label: "Risk Alerts", path: "app/risk" },
        { label: "Incentive Calculator", path: "app/calc" },
        { label: "Audit Logs", path: "app/audit" },
      ]
    },
    {
      label: "Helpdesk",
      subLinks: [
        { label: "Grievances", path: "app/grievance" },
        { label: "Department Queries", path: "app/queries" },
        { label: "Public Consultations", path: "app/consultations" },
        { label: "Feedback", path: "app/feedback" },
      ]
    }
  ],
  [ROLES.OFFICER]: [
    { label: "Dashboard", path: "officer/dashboard" },
    {
      label: "Processing",
      subLinks: [
        { label: "Application Queue", path: "officer/queue" },
        { label: "Document Review", path: "officer/documents" },
      ]
    },
    {
      label: "Security",
      subLinks: [
        { label: "Fraud Radar", path: "officer/fraud" },
        { label: "Duplicate Alerts", path: "officer/duplicates" },
      ]
    },
    {
      label: "Helpdesk",
      subLinks: [
        { label: "Grievances", path: "officer/grievances" },
      ]
    }
  ],
  [ROLES.POLICY_ADMIN]: [
    { label: "Dashboard", path: "policy/dashboard" },
    {
      label: "Analytics",
      subLinks: [
        { label: "Bottleneck Analytics", path: "policy/bottlenecks" },
        { label: "District Analysis", path: "policy/districts" },
        { label: "Sector Analysis", path: "policy/sectors" },
        { label: "Department Analysis", path: "policy/departments" },
      ]
    },
    {
      label: "Policy Review",
      subLinks: [
        { label: "Regulatory Impact", path: "policy/regulatory" }
      ]
    }
  ]
};

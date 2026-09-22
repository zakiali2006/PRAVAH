export const ROLES = {
  INVESTOR: "INVESTOR",
  OFFICER: "OFFICER",
  POLICY_ADMIN: "POLICY_ADMIN",
};

export const PERMISSIONS = {
  // Applications
  APP_READ: "applications.read",
  APP_CREATE: "applications.create",
  APP_REVIEW: "applications.review",
  APP_APPROVE: "applications.approve",
  APP_REJECT: "applications.reject",
  
  // Documents
  DOC_READ: "documents.read",
  DOC_UPLOAD: "documents.upload",
  DOC_REVIEW: "documents.review",
  
  // Roadmap & Risk
  ROADMAP_READ: "roadmap.read",
  RISK_READ: "risk.read",
  
  // Grievances
  GRIEVANCE_READ: "grievances.read",
  GRIEVANCE_CREATE: "grievances.create",
  GRIEVANCE_RESOLVE: "grievances.resolve",
};

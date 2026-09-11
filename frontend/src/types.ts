// TypeScript Definitions for PRAVAH & UdyogSetu Connected Platform

export type Language = 'en' | 'mr' | 'hi';

export type UserRole = 'citizen' | 'officer' | 'admin' | 'inspector';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserRole;
  industry?: string;
  panNumber?: string;
  gstin?: string;
  district?: string;
  investment?: string;
  employment?: number;
  department?: string;
  designation?: string;
  avatarUrl?: string;
}

export interface FactoryUnit {
  id: string;
  userId: string;
  unitName: string;
  midcArea: string;
  plotNumber: string;
  surveyNumber: string;
  taluka: string;
  district: string;
  category: 'Red' | 'Orange' | 'Green' | 'White'; // Pollution category
  powerSanctionedKva: number;
  waterDemandKl: number;
  builtUpAreaSqM: number;
  operationalStatus: 'Proposed' | 'Under Construction' | 'Operational' | 'Revocation';
}

export type ApplicationStatus = 
  | 'draft' 
  | 'submitted' 
  | 'scrutiny' 
  | 'inspection_scheduled' 
  | 'action_required' 
  | 'query_raised' 
  | 'approved' 
  | 'rejected' 
  | 'locked'
  | 'pending';

export interface ApplicationItem {
  id: string;
  userId: string;
  unitId?: string;
  name: string;
  serviceCode: string;
  department: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  approvedAt?: string | null;
  slaDays: number;
  dependencies: string[];
  parallelGroup: string;
  feeAmount: number;
  feePaid: boolean;
  assignedOfficerId?: string;
  assignedInspectorId?: string;
  rejectionReason?: string | null;
  queryText?: string | null;
  scrutinyNotes?: string[];
  inspectionDate?: string | null;
}

export interface DocumentItem {
  id: string;
  userId: string;
  type: string;
  category: 'Legal' | 'Environmental' | 'Technical' | 'Financial' | 'Safety';
  status: 'verified' | 'rejected' | 'pending_review' | 'expired';
  expiry?: string;
  uploadDate: string;
  fileSize: string;
  aiScore?: number;
  issues?: string[];
  readability?: string;
  digitalSignature?: string;
  addressMatch?: string;
  fixRecommendations?: string;
}

export interface ComplianceItem {
  id: string;
  userId: string;
  title: string;
  department: string;
  dueDate: string;
  status: 'upcoming' | 'overdue' | 'filed' | 'under_audit';
  category: string;
  penaltyClause: string;
  frequency: 'Annual' | 'Half-Yearly' | 'Quarterly' | 'Monthly';
}

export interface RegulatoryCircular {
  id: string;
  title: string;
  date: string;
  issuer: string;
  department: string;
  summary: string;
  affectsSectors: string[];
  requiredAction: string;
  circularUrl?: string;
}

export interface SchemeBenefit {
  id: string;
  title: string;
  category: string;
  benefit: string;
  matchScore: number;
  status: 'eligible' | 'conditionally_eligible' | 'not_applicable';
  reasons: string[];
  missingDocs: string[];
  estimatedIncentiveAmount?: string;
}

export interface GrievanceItem {
  id: string;
  userId: string;
  subject: string;
  appId: string;
  department: string;
  status: 'under_review' | 'escalated_to_collector' | 'resolved' | 'closed';
  urgencyScore: number;
  aiAnalysis: string;
  createdAt: string;
  assignedOfficer?: string;
  resolutionNote?: string;
}

export interface DepartmentQuery {
  id: string;
  appId: string;
  appName: string;
  department: string;
  officerName: string;
  queryDate: string;
  querySubject: string;
  queryDetail: string;
  status: 'pending_applicant' | 'answered' | 'closed';
  applicantResponse?: string;
  responseDate?: string;
}

export interface PaymentChallan {
  id: string;
  appId: string;
  serviceName: string;
  department: string;
  amount: number;
  challanNumber: string; // GRAS / MTRAC challan
  date: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  paymentMode: 'NetBanking' | 'UPI' | 'NEFT/RTGS' | 'Treasury Challan';
  receiptUrl?: string;
}

export interface FraudAlert {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Duplicate Submission' | 'Survey Number Conflict' | 'Signature Anomaly' | 'Capacity Mismatch';
  title: string;
  description: string;
  appId?: string;
  applicant: string;
  detectedAt: string;
  status: 'Investigating' | 'Flagged' | 'Resolved' | 'Cleared';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
}

export interface PublicConsultation {
  id: string;
  projectTitle: string;
  applicantName: string;
  location: string;
  hearingDate: string;
  venue: string;
  eiaSummary: string;
  status: 'Open For Comments' | 'Hearing Scheduled' | 'Report Submitted';
  commentsCount: number;
}

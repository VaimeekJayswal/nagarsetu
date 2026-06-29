export type SeverityType = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatusType = 'Reported' | 'In Progress' | 'Resolved';
export type ResolutionStatusType = 'Resolved' | 'Partially Resolved' | 'Not Resolved' | 'Unclear';

export interface Issue {
  id: string;
  short_title: string;
  description: string;
  issue_type: string;
  severity: SeverityType;
  risk_level: string;
  suggested_department: string;
  priority_score: number;
  recommended_action: string;
  duplicate_keywords: string[];
  location: string;
  latitude?: number;
  longitude?: number;
  user_note: string;
  image_url: string; // Before photo (base64 or URL)
  status: IssueStatusType;
  confirmations: number;
  duplicate_flags: number;
  createdAt: string;
  
  // After-repair resolution details
  after_image_url?: string;
  resolution_confidence?: number;
  resolution_status?: ResolutionStatusType;
  resolution_explanation?: string;
  resolution_next_action?: string;
  resolvedAt?: string;
}

export interface AdminStats {
  totalReports: number;
  criticalReports: number;
  verifiedReports: number;
  resolvedReports: number;
  duplicateReports: number;
}

export interface DepartmentCount {
  department: string;
  count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

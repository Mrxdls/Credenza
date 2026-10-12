export type ActivityType =
  | "journal_publication"
  | "conference_publication"
  | "patent"
  | "faculty_participation";


export type ActivityStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export type SubscriptionTier = "trial" | "basic" | "pro" | "enterprise";

export interface Tenant {
  id: string;
  name: string;
  code: string;
  slug: string;
  domain?: string | null;
  subscription_tier: SubscriptionTier;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  user_count?: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  tenant?: string | null;
}

export interface Designation {
  id: string;
  name: string;
  code?: string;
  priority: number;
  is_active: boolean;
  tenant?: string | null;
}

export interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  tenant?: string | null;
}

export interface RolePermission {
  id: string;
  module_code: string;
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  scope?: "organization" | "department" | "self";
  rank?: number;
  description?: string;
  tenant?: string | null;
  permissions?: RolePermission[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  employee_id?: string | null;
  department?: Department | null;
  designation?: Designation | null;
  role?: Role | null;
  role_code?: string;
  role_name?: string;
  scope?: string;
  rank?: number;
  department_name?: string | null;
  designation_name?: string | null;
  tenant?: Tenant | null;
  is_approved: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_department_head: boolean;
  is_coordinator: boolean;
  permissions?: Record<
    string,
    {
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
      can_approve: boolean;
      can_export: boolean;
    }
  >;
}

export interface ActivityDocument {
  id: string;
  activity: string;
  title: string;
  document_type: string;
  file?: string | null;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  r2_key?: string;
  is_verified: boolean;
  verified_at?: string | null;
  verified_by?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
  } | null;
  created_at: string;
  view_url?: string;
}

export interface ActivityMetadata {
  authors_text?: string;
  // Journal fields
  journal_name?: string;
  issn?: string;
  publication_date?: string;
  indexing?: string | string[];
  volume?: string;
  issue?: string;
  page_numbers?: string;
  doi?: string;
  impact_factor?: string;
  paper_url?: string;

  // Conference fields
  conference_name?: string;
  proceedings_title?: string;
  isbn?: string;
  conference_date?: string;
  location?: string;
  publisher?: string;

  // Patent fields
  patent_number?: string;
  patent_or_application_number?: string;
  filing_date?: string;
  patent_status?: "Filed" | "Published" | "Granted" | string;
  country?: string;
  grant_date?: string;
  ipc_classification?: string;

  // Faculty Participation (FDP / Workshop)
  program_title?: string;
  organizing_body?: string;
  start_date?: string;
  end_date?: string;
  participation_type?: "Attended" | "Conducted" | "Resource Person" | string;
  duration_days?: number | string;
  mode?: "Online" | "Offline" | "Hybrid" | string;
  certificate_number?: string;

  [key: string]: unknown;
}

export interface Activity {
  id: string;
  tenant?: string | Tenant;
  tenant_name?: string;
  tenant_code?: string;
  faculty?: string | User;
  faculty_name?: string;
  faculty_email?: string;
  faculty_employee_id?: string;
  faculty_designation?: string;
  faculty_department_name?: string;
  department_name?: string;
  department_code?: string;
  verified_by_name?: string;
  academic_session?: string | AcademicSession;
  academic_session_name?: string;
  session_name?: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  status: ActivityStatus;
  rejection_reason?: string;
  verification_notes?: string;
  metadata: ActivityMetadata;
  documents?: ActivityDocument[];
  has_proof?: boolean;
  proof_document?: string | null;
  activity_authors?: any[];
  verified_at?: string | null;
  verified_by?: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
  } | null;
  is_locked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface DashboardKPICard {
  title: string;
  metric: number | string;
  footer: string;
}

export interface DashboardProgressMetric {
  title: string;
  description: string;
  value: number;
}

export interface DashboardStats {
  kpi_cards: DashboardKPICard[];
  progress_metrics: DashboardProgressMetric[];
  type_breakdown?: {
    journals: number;
    conferences: number;
    patents: number;
    fdps: number;
  };
  is_faculty?: boolean;
  recent_activities?: Activity[];
}

export interface PresignedUploadResponse {
  upload_url: string;
  document_id: string;
  r2_key: string;
  expires_in: number;
}

export interface UserAchievementSummary {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  display_name: string;
  email: string;
  employee_id?: string;
  department?: {
    id: string | null;
    name: string;
    code: string;
  } | null;
  designation?: string;
  role: string;
  achievements_count: number;
  approved_count: number;
  can_view_details: boolean;
}


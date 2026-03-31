// ─── Database Types ─────────────────────────────────────────
// These interfaces mirror the Supabase schema for easy swap later

export interface Profile {
  id: string;
  full_name: string;
  student_id: string;
  email: string;
  department: 'ITT' | 'MTT' | 'EET' | 'FDT' | 'BPT';
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  amount_per_person: number;
  status: 'active' | 'closed' | 'cancelled';
  created_by: string;
  due_date: string;
  created_at: string;
}

export interface Contribution {
  id: string;
  collection_id: string;
  user_id: string;
  amount: number;
  paid_amount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  collection_id: string;
  receipt_url: string | null;
  created_by: string;
  created_at: string;
}

// ─── Enriched / Joined Types ────────────────────────────────
// These combine data from multiple tables for UI rendering

export interface ContributionWithUser extends Contribution {
  user: Pick<Profile, 'full_name' | 'student_id' | 'email' | 'department'>;
}

export interface ContributionWithCollection extends Contribution {
  collection: Pick<Collection, 'title' | 'amount_per_person' | 'due_date'>;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  running_balance: number;
  reference_name?: string; // Student name or vendor
  student_id?: string; // Student reg no
  department?: string; // Student department for filtering
  collection_id?: string; // Collection ID for filtering
}

// ─── Auth Types ─────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleRole: () => void; // Dev-only helper
}

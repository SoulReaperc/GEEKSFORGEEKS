// ============================================
// SUPABASE DATABASE TABLE TYPES
// ============================================

/**
 * profiles table
 */
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  total_points: number;
  ranking?: number;
  solved_problems?: number;
  created_at: string;
  updated_at?: string;
  is_blacklisted?: boolean;
}

/**
 * user_submissions table
 */
export interface UserSubmission {
  id: string;
  user_id: string;
  problem_slug: string;
  language: string;
  points_awarded: number;
  grading_result?: GradingResultRecord;
  submitted_at: string;
}

/**
 * Grading result stored in the grading_result JSONB column
 */
export interface GradingResultRecord {
  total_score: number;
  max_marks: number;
  details: {
    execution_speed?: { score: number; max: number };
    lines_of_code?: { score: number; max: number; max_value?: number };
    message?: string;
    error?: string;
  };
}

/**
 * newsletter_subscribers table
 */
export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  confirmed: boolean;
  unsubscribe_token?: string;
  created_at: string;
  confirmed_at?: string;
}

/**
 * blacklist table
 */
export interface BlacklistEntry {
  id: string;
  user_id: string;
  reason: string;
  created_at: string;
}

// ============================================
// GRADING SYSTEM TYPES
// ============================================

/**
 * Input payload sent to the Python grading script
 */
export interface GradingScriptInput {
  difficulty: string;
  execution_time_ms: number;
  code: string;
  optimal_loc: number;
  expected_complexity?: string;
  user_complexity?: string;
}

/**
 * Output returned by the Python grading script
 * Matches the exact shape from scripts/grade_submission.py
 */
export interface GradingScriptOutput {
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
 * Difficulty tier configuration
 */
export interface DifficultyConfig {
  basePoints: number;
  timeWeight: number;
  locWeight: number;
}

export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  easy: { basePoints: 10, timeWeight: 0.6, locWeight: 0.4 },
  medium: { basePoints: 20, timeWeight: 0.6, locWeight: 0.4 },
  hard: { basePoints: 30, timeWeight: 0.6, locWeight: 0.4 },
};

/**
 * LOC counter input
 */
export interface LOCCountInput {
  code: string;
  language: string;
}

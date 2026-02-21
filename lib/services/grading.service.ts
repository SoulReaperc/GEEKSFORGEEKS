import type { GradingScriptInput, GradingScriptOutput } from '@/types';

// --------------------------------------------------
// WEIGHTS & CONFIGURATION
// --------------------------------------------------

const WEIGHTS = {
  execution_speed: 0.6,
  lines_of_code: 0.4,
} as const;

const MAX_MARKS: Record<string, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

// --------------------------------------------------
// SCORING FUNCTIONS (ported from grading_algorithm.py)
// --------------------------------------------------

function calculateSpeedScore(speedMs: number, maxSpeedMarks: number): number {
  if (speedMs <= 2) return maxSpeedMarks;
  if (speedMs <= 3) return maxSpeedMarks * 0.75;
  return maxSpeedMarks * 0.5;
}

function calculateLocScore(actualLoc: number, expectedLoc: number, maxLocMarks: number): number {
  if (actualLoc <= expectedLoc) return maxLocMarks;

  const ratio = actualLoc / expectedLoc;
  if (ratio <= 1.25) return maxLocMarks;
  if (ratio <= 1.5) return maxLocMarks * 0.8;
  if (ratio <= 1.75) return maxLocMarks * 0.5;
  return maxLocMarks * 0.25;
}

function calculateTotalScore(
  difficulty: string,
  speedMs: number,
  actualLoc: number,
  expectedLoc: number,
): GradingScriptOutput {
  const totalMarks = MAX_MARKS[difficulty.toLowerCase()] ?? MAX_MARKS['easy']!;
  const maxSpeedMarks = totalMarks * WEIGHTS.execution_speed;
  const maxLocMarks = totalMarks * WEIGHTS.lines_of_code;

  const speedScore = calculateSpeedScore(speedMs, maxSpeedMarks);
  const locScore = calculateLocScore(actualLoc, expectedLoc, maxLocMarks);
  const totalScore = Math.round((speedScore + locScore) * 100) / 100;

  return {
    total_score: totalScore,
    max_marks: totalMarks,
    details: {
      execution_speed: {
        score: Math.round(speedScore * 100) / 100,
        max: Math.round(maxSpeedMarks * 100) / 100,
      },
      lines_of_code: {
        score: Math.round(locScore * 100) / 100,
        max: Math.round(maxLocMarks * 100) / 100,
      },
    },
  };
}

// --------------------------------------------------
// LOC COUNTER (ported from grade_submission.py)
// --------------------------------------------------

/**
 * Count non-empty, non-comment lines of code.
 * Handles language-specific comment styles including multi-line comments.
 */
export function countEffectiveLOC(code: string, language = 'python'): number {
  if (!code) return 0;

  let processed = code;
  const lang = language.toLowerCase();

  let singleLineComment: string | null = null;
  let multiLineRegex: RegExp | null = null;

  if (['javascript', 'java', 'c', 'cpp', 'c++'].includes(lang)) {
    singleLineComment = '//';
    multiLineRegex = /\/\*[\s\S]*?\*\//g;
  } else if (lang === 'python') {
    singleLineComment = '#';
  }

  // Remove multi-line comments
  if (multiLineRegex) {
    processed = processed.replace(multiLineRegex, '');
  }

  let count = 0;
  for (const line of processed.split('\n')) {
    let content = line.trim();
    if (!content) continue;

    // Strip trailing single-line comments
    if (singleLineComment && content.includes(singleLineComment)) {
      content = content.split(singleLineComment)[0]!.trim();
    }

    if (content) count++;
  }
  return count;
}

// --------------------------------------------------
// PUBLIC API
// --------------------------------------------------

/**
 * Calculates a score for a submission — pure TypeScript, no subprocess.
 */
export async function calculateScore(input: GradingScriptInput): Promise<GradingScriptOutput> {
  const actualLoc = countEffectiveLOC(input.code);

  return calculateTotalScore(
    input.difficulty,
    input.execution_time_ms,
    actualLoc,
    input.optimal_loc,
  );
}

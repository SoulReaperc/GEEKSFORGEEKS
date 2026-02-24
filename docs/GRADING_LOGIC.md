# GeeksforGeeks SRMIST Chapter - Grading Logic Documentation v2

> **Audience:** Developers & System Maintainers  
> **Version:** 2.0  
> **Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [TypeScript Implementation](#typescript-implementation)
3. [Workflow](#workflow)
4. [`grade_submission.py`](#grade_submissionpy) *(legacy reference)*
5. [`grading_algorithm.py`](#grading_algorithmpy) *(legacy reference)*
6. [How to Use](#how-to-use)

---

## Overview

The grading system automatically evaluates code submissions for practice problems and challenges. It provides a score based on two key metrics: **execution speed** and **lines of code (LOC)**.

> **v2 Update:** The grading logic has been **fully ported to TypeScript** in `lib/services/grading.service.ts`. The Python scripts (`scripts/grade_submission.py`, `scripts/grading_algorithm.py`) are retained for reference but are **no longer called at runtime**.

---

## TypeScript Implementation

**File:** `lib/services/grading.service.ts`

The TypeScript port eliminates the Python subprocess overhead, providing faster and more reliable grading.

### Public API

#### `countEffectiveLOC(code: string, language?: string): number`

Counts non-empty, non-comment lines of code. Handles:
- Python: strips `#` single-line comments
- JavaScript / Java / C / C++: strips `//` single-line and `/* … */` multi-line blocks

```typescript
import { countEffectiveLOC } from '@/lib/services/grading.service'

countEffectiveLOC('# comment\nx = 1\n', 'python') // → 1
countEffectiveLOC('// comment\nconst x = 1;\n/* block */\n', 'javascript') // → 1
```

#### `calculateScore(input: GradingScriptInput): Promise<GradingScriptOutput>`

Grades a submission. Calls `countEffectiveLOC` internally and computes speed + LOC scores.

```typescript
import { calculateScore } from '@/lib/services/grading.service'

const result = await calculateScore({
  difficulty: 'easy',
  execution_time_ms: 1,
  code: 'x = 1',
  optimal_loc: 10,
})
// result.total_score  → 10
// result.max_marks    → 10
// result.details.execution_speed.score → 6
// result.details.lines_of_code.score   → 4
```

### Scoring Algorithm

#### Maximum Marks by Difficulty

| Difficulty | Max Marks |
|------------|-----------|
| Easy | 10 |
| Medium | 20 |
| Hard | 30 |

#### Parameter Weights

| Component | Weight |
|-----------|--------|
| Execution Speed | 60% |
| Lines of Code | 40% |

#### Speed Score (`calculateSpeedScore`)

| Execution Time | Score |
|----------------|-------|
| ≤ 2 ms | 100% of speed marks |
| ≤ 3 ms | 75% of speed marks |
| > 3 ms | 50% of speed marks |

#### LOC Score (`calculateLocScore`)

| `actual_loc / optimal_loc` | Score |
|---------------------------|-------|
| ≤ 1.25 | 100% of LOC marks |
| ≤ 1.50 | 80% of LOC marks |
| ≤ 1.75 | 50% of LOC marks |
| > 1.75 | 25% of LOC marks |

### Output Shape

```typescript
interface GradingScriptOutput {
  total_score: number   // rounded to 2 dp
  max_marks: number
  details: {
    execution_speed: { score: number; max: number }
    lines_of_code:   { score: number; max: number }
  }
}
```

---

## Workflow

```
┌───────────────────────────────────────────┐
│              1. Submission                │
│   (POST /api/code/submit — withAuth)      │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│    2. Zod validation (codeRequestSchema)  │
│    3. ExecutionService: verifyAllTestCases│
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│   4. GradingService.calculateScore()      │
│   (pure TypeScript, no subprocess)        │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│   5. SubmissionRepository.createSubmission│
│      / updateSubmission                   │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│   6. Response sent immediately            │
│   7. after(): handlePointsUpdate()        │
│      (deferred ranking recalculation)     │
└───────────────────────────────────────────┘
```

---

## `grade_submission.py` *(legacy — no longer called at runtime)*

### Purpose

This script was the original Python entry point for the grading system. The logic has been fully ported to `lib/services/grading.service.ts` and this file is kept for reference only.

### Input

The script expects a JSON object, which can be provided in two ways:
1. As a **raw string** via `stdin`.
2. As a **Base64 encoded string** using the `--input-base64` command-line argument.

**JSON Input Schema:**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `difficulty` | `string` | Yes | Problem difficulty ("easy", "medium", "hard") |
| `execution_time_ms` | `number` | Yes | Code execution time in milliseconds |
| `code` | `string` | Yes | The user's submitted code |
| `language` | `string` | Yes | The language of the code (e.g., "python", "javascript") |
| `optimal_loc` | `number` | Yes | The expected lines of code for an ideal solution |

**Example Input:**
```json
{
  "difficulty": "easy",
  "execution_time_ms": 1.5,
  "code": "def hello():\n  print('Hello, World!')",
  "language": "python",
  "optimal_loc": 2
}
```

### Core Logic

#### `count_lines_of_code(code_str, language)`
This is the most critical function in the script. It intelligently counts the "logical" lines of code by:
1.  **Removing multi-line comments** (e.g., `/* ... */` for JavaScript, Java, C/C++).
2.  **Ignoring empty or whitespace-only lines.**
3.  **Stripping single-line comments** (e.g., `#` for Python, `//` for others) from each line before checking if it's empty.

This ensures that comments and blank lines do not unfairly penalize a user's score.

#### `main()`
The main function orchestrates the entire process:
1.  Reads and parses the input JSON.
2.  Calls `count_lines_of_code()` to determine the `actual_loc`.
3.  Imports `calculate_total_score` from `grading_algorithm.py`.
4.  Calls the scoring function with all the required parameters: `difficulty`, `speed_ms`, `actual_loc`, and `expected_loc`.
5.  Prints the final, detailed score as a JSON object to `stdout`.

### Output

The script outputs the JSON result from `grading_algorithm.py` directly to `stdout`.

---

## `grading_algorithm.py` *(legacy — no longer called at runtime)*

### Purpose

This script was the original pure-Python scoring module. Its logic is now implemented in `lib/services/grading.service.ts` (`calculateSpeedScore`, `calculateLocScore`, `calculateTotalScore`).

### Input

The script is executed as a command-line tool that takes a single JSON string argument with the following structure:

**JSON Input Schema:**
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `difficulty` | `string` | Yes | Problem difficulty ("easy", "medium", "hard") |
| `speed_ms` | `number` | Yes | Execution time in milliseconds |
| `actual_loc` | `number` | Yes | Actual lines of code in the submission |
| `expected_loc` | `number` | Yes | Expected lines of code for the problem |

### Scoring Model

#### Maximum Marks
The total possible score depends on the problem's difficulty:
- **Easy:** 10 marks
- **Medium:** 20 marks
- **Hard:** 30 marks

#### Parameter Weights
The final score is a weighted sum of two components:
- **Execution Speed:** 60% of total marks
- **Lines of Code (LOC):** 40% of total marks

#### `calculate_speed_score(speed_ms, max_speed_marks)`
The speed score is calculated based on strict thresholds:
- **≤ 2ms:** 100% of available speed marks
- **≤ 3ms:** 75% of available speed marks
- **≥ 4ms:** 50% of available speed marks

#### `calculate_loc_score(actual_loc, expected_loc, max_loc_marks)`
The LOC score is more lenient, allowing for some overhead:
- **`actual_loc` ≤ `expected_loc` * 1.25:** 100% of available LOC marks (allows 25% overhead)
- **`actual_loc` ≤ `expected_loc` * 1.50:** 80% of available LOC marks
- **`actual_loc` ≤ `expected_loc` * 1.75:** 50% of available LOC marks
- **`actual_loc` > `expected_loc` * 1.75:** 25% of available LOC marks

### Output

The script prints a JSON object to `stdout` detailing the final score.

**Example Output:**
```json
{
    "total_score": 8.5,
    "max_marks": 10,
    "details": {
        "execution_speed": {
            "score": 4.5,
            "max": 6.0
        },
        "lines_of_code": {
            "score": 4.0,
            "max": 4.0
        }
    }
}
```

---

## How to Use

To run the grading process from the command line, you would typically pipe a JSON object into `grade_submission.py`.

**Example Command:**
```bash
cat submission.json | python scripts/grade_submission.py
```

Alternatively, using the base64 argument:
```bash
INPUT_B64=$(cat submission.json | base64 -w 0)
python scripts/grade_submission.py --input-base64 $INPUT_B64
```

---
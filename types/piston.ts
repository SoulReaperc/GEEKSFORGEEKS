// ============================================
// PISTON CODE EXECUTION API TYPES
// ============================================

/**
 * Piston /api/v2/piston/execute request body
 */
export interface PistonExecuteRequest {
	language: string;
	version: string;
	files: PistonFile[];
	stdin?: string;
	args?: string[];
	run_timeout?: number;
}

export interface PistonFile {
	content: string;
}

/**
 * Piston /api/v2/piston/execute response body
 */
export interface PistonExecuteResponse {
	language: string;
	version: string;
	run: PistonRunResult;
	compile?: PistonCompileResult;
}

export interface PistonRunResult {
	stdout: string;
	stderr: string;
	output: string;
	code: number;
	signal: string | null;
}

export interface PistonCompileResult {
	stdout: string;
	stderr: string;
	output: string;
	code: number;
	signal: string | null;
}

/**
 * Language configuration entry
 */
export interface LanguageConfig {
	language: string;
	version: string;
	aliases?: string[];
}

/**
 * Circuit breaker state for Piston API resilience
 */
export type CircuitBreakerState = "closed" | "open" | "half_open";

export interface CircuitBreakerStatus {
	state: CircuitBreakerState;
	failureCount: number;
	lastFailureTime?: number;
	nextRetryTime?: number;
}

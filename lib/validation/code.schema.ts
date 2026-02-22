import { z } from "zod";

/**
 * Whitelist of supported languages for code execution.
 */
const SUPPORTED_LANGUAGES = [
	"javascript",
	"python",
	"cpp",
	"js",
	"py",
	"c++",
	"java",
] as const;

/**
 * Schema for code execution and submission requests.
 * Enforces payload size limits and language whitelist.
 */
export const codeRequestSchema = z.object({
	code: z
		.string()
		.min(1, "Code cannot be empty")
		.max(50_000, "Code exceeds maximum length of 50,000 characters"),
	language: z
		.string()
		.refine(
			(val): val is (typeof SUPPORTED_LANGUAGES)[number] =>
				SUPPORTED_LANGUAGES.includes(
					val.toLowerCase() as (typeof SUPPORTED_LANGUAGES)[number],
				),
			{
				message: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`,
			},
		),
	problemSlug: z
		.string()
		.min(1, "Problem slug is required")
		.max(200, "Problem slug too long")
		.regex(/^[a-zA-Z0-9_-]+$/, "Invalid problem slug format"),
});

export type CodeRequest = z.infer<typeof codeRequestSchema>;

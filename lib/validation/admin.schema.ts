import { z } from "zod";

export const updateProfileSchema = z.object({
	bio: z.string().max(2000).optional(),
	socialLinks: z.record(z.string(), z.string()).optional(),
});

export const godModeSchema = z.object({
	action: z.enum(["create", "update", "delete", "publish"]),
	contentType: z.string().optional(),
	entryId: z.string().optional(),
	data: z.record(z.string(), z.unknown()).optional(),
});

export const memberSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, "Name is required"),
	role: z.string().min(1, "Role is required"),
	team: z.string().min(1, "Team is required"),
	year: z.string().min(1, "Year is required"),
	order: z.number().optional(),
	bio: z.string().optional(),
	email: z.string().email("Invalid email").optional().or(z.literal("")),
	github: z.string().optional(),
	linkedin: z.string().optional(),
	instagram: z.string().optional(),
	coLead: z.string().optional(),
	generalMembers: z.string().optional(),
	photoId: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type GodModeInput = z.infer<typeof godModeSchema>;
export type MemberSchemaInput = z.infer<typeof memberSchema>;

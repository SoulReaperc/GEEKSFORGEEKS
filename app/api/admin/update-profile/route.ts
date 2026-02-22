import { NextResponse } from "next/server";
import {
	contentfulManagementClient,
	ENVIRONMENT_ID,
	SPACE_ID,
} from "@/lib/contentful-admin";
import {
	handleApiError,
	ValidationError,
} from "@/lib/middleware/error.middleware";
import { withAuth } from "@/lib/middleware/with-auth";
import { updateProfileSchema } from "@/lib/validation/admin.schema";

export const POST = withAuth(async (request, user) => {
	try {
		const body = await request.json();

		const parsed = updateProfileSchema.safeParse(body);
		if (!parsed.success) {
			throw new ValidationError(
				parsed.error.issues[0]?.message ?? "Invalid request",
			);
		}
		const { bio, socialLinks } = parsed.data;

		const space = await contentfulManagementClient.getSpace(SPACE_ID);
		const environment = await space.getEnvironment(ENVIRONMENT_ID);

		// Query for MemberProfile by authenticated user's email
		const entries = await environment.getEntries({
			content_type: "memberProfile",
			"fields.email": user.email,
			limit: 1,
		});

		if (entries.total === 0) {
			return NextResponse.json(
				{ error: "Forbidden: Profile not found" },
				{ status: 403 },
			);
		}

		const entry = entries.items[0]!;
		const locale = "en-US";

		if (bio) {
			entry.fields.bio = { [locale]: bio };
		}
		if (socialLinks) {
			entry.fields.socialLinks = { [locale]: socialLinks };
		}

		const updatedEntry = await entry.update();
		await updatedEntry.publish();

		return NextResponse.json({ success: true, entry: updatedEntry });
	} catch (error: unknown) {
		return handleApiError(error);
	}
});

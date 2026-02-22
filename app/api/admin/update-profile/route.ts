import { NextResponse } from "next/server";
import {
	contentfulManagementClient,
	ENVIRONMENT_ID,
	SPACE_ID,
} from "@/lib/contentful-admin";
import { handleApiError } from "@/lib/middleware/error.middleware";
import { requireAuth } from "@/lib/services/auth.service";

export async function POST(request: Request) {
	try {
		const user = await requireAuth();

		const body = await request.json();
		const { bio, socialLinks } = body;

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
}

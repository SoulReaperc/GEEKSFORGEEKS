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
import { withSuperAdmin } from "@/lib/middleware/with-auth";
import { godModeSchema } from "@/lib/validation/admin.schema";

export const POST = withSuperAdmin(async (request) => {
	try {
		const body = await request.json();

		const parsed = godModeSchema.safeParse(body);
		if (!parsed.success) {
			throw new ValidationError(
				parsed.error.issues[0]?.message ?? "Invalid request",
			);
		}
		const { action, contentType, entryId, data } = parsed.data;

		const space = await contentfulManagementClient.getSpace(SPACE_ID);
		const environment = await space.getEnvironment(ENVIRONMENT_ID);

		let result;

		switch (action) {
			case "create": {
				if (!contentType) throw new Error("ContentType is required for create");
				if (!data) throw new Error("Data is required for create");
				result = await environment.createEntry(contentType, { fields: data as Record<string, unknown> });
				break;
			}

			case "update": {
				if (!entryId) throw new Error("EntryId is required for update");
				if (!data) throw new Error("Data is required for update");
				const entryToUpdate = await environment.getEntry(entryId);
				Object.keys(data).forEach((key) => {
					entryToUpdate.fields[key] = data[key];
				});
				result = await entryToUpdate.update();
				break;
			}

			case "delete": {
				if (!entryId) throw new Error("EntryId is required for delete");
				const entryToDelete = await environment.getEntry(entryId);
				if (entryToDelete.isPublished()) {
					await entryToDelete.unpublish();
				}
				await entryToDelete.delete();
				result = { success: true, id: entryId };
				break;
			}

			case "publish": {
				if (!entryId) throw new Error("EntryId is required for publish");
				const entryToPublish = await environment.getEntry(entryId);
				result = await entryToPublish.publish();
				break;
			}

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}

		return NextResponse.json({ success: true, result });
	} catch (error: unknown) {
		return handleApiError(error);
	}
});

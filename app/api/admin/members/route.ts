import { NextResponse } from "next/server";
import {
	handleApiError,
	ValidationError,
} from "@/lib/middleware/error.middleware";
import { adminRatelimit, applyRateLimit } from "@/lib/middleware/rate-limit";
import { withAdmin } from "@/lib/middleware/with-auth";
import {
	getEnvironment,
	mapMemberFields,
	processAndPublishAsset,
} from "@/lib/services/contentful-admin.service";
import { memberSchema } from "@/lib/validation/admin.schema";

export const POST = withAdmin(async (request, user) => {
	try {
		const rateLimitResponse = await applyRateLimit(adminRatelimit, user.email);
		if (rateLimitResponse) return rateLimitResponse;

		const formData = await request.formData();
		const action = formData.get("action") as string;
		const memberData = formData.get("member") as string;
		const file = formData.get("file") as File | null;

		if (!memberData) throw new Error("Missing member data");
		const rawMember = JSON.parse(memberData);

		const parsed = memberSchema.safeParse(rawMember);
		if (!parsed.success) {
			throw new ValidationError(
				parsed.error.issues[0]?.message ?? "Invalid member data",
			);
		}
		const member = { ...parsed.data, id: rawMember.id as string | undefined };

		const environment = await getEnvironment();

		let photoId = member.photoId;
		if (file) {
			const asset = await processAndPublishAsset(
				file,
				`${member.name} Profile`,
			);
			photoId = asset.id;
		}

		if (action === "create") {
			const fields = mapMemberFields(member, photoId);
			const entry = await environment.createEntry("memberProfile", { fields });
			const published = await entry.publish();
			return NextResponse.json({ success: true, data: published });
		} else if (action === "update") {
			if (!member.id) throw new Error("Member ID required for update");

			const entry = await environment.getEntry(member.id);
			const fields = mapMemberFields(member, photoId);

			Object.keys(fields).forEach((key) => {
				entry.fields[key] = fields[key];
			});

			// Clean up deleted optional fields
			const optionalFields = ["email", "github", "linkedin", "instagram"];
			optionalFields.forEach((field) => {
				if (Object.hasOwn(member, field) && !member[field]) {
					delete entry.fields[field];
				}
			});

			const updated = await entry.update();
			const published = await updated.publish();
			return NextResponse.json({ success: true, data: published });
		} else if (action === "delete") {
			const { id } = member;
			if (!id) throw new Error("ID required for delete");

			const entry = await environment.getEntry(id);
			if (entry.isPublished()) {
				await entry.unpublish();
			}
			await entry.delete();
			return NextResponse.json({ success: true });
		}

		return NextResponse.json(
			{ success: false, error: "Invalid action" },
			{ status: 400 },
		);
	} catch (error: unknown) {
		return handleApiError(error);
	}
});

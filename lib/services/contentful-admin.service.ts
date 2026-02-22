import {
	contentfulManagementClient,
	ENVIRONMENT_ID,
	SPACE_ID,
} from "@/lib/contentful-admin";

/**
 * Gets a Contentful Management environment instance.
 */
export async function getEnvironment() {
	const space = await contentfulManagementClient.getSpace(SPACE_ID);
	return space.getEnvironment(ENVIRONMENT_ID);
}

/**
 * Creates a Contentful Rich Text document from a plain string.
 */
export function createRichText(text: string) {
	return {
		nodeType: "document",
		data: {},
		content: text.split("\n\n").map((para) => ({
			nodeType: "paragraph",
			data: {},
			content: [
				{
					nodeType: "text",
					value: para,
					marks: [] as unknown[],
					data: {},
				},
			],
		})),
	};
}

/**
 * Uploads a file to Contentful and publishes the asset.
 * Polls for processing completion with retries.
 */
export async function processAndPublishAsset(
	file: File,
	title: string,
): Promise<{ id: string }> {
	const environment = await getEnvironment();
	const arrayBuffer = await file.arrayBuffer();

	const upload = await environment.createUpload({ file: arrayBuffer });

	let asset = await environment.createAsset({
		fields: {
			title: { "en-US": title },
			file: {
				"en-US": {
					fileName: file.name,
					contentType: file.type,
					uploadFrom: {
						sys: { type: "Link", linkType: "Upload", id: upload.sys.id },
					},
				},
			},
		},
	});

	asset = await asset.processForAllLocales();

	// Poll for processing completion
	let retries = 5;
	while (retries > 0) {
		try {
			asset = await environment.getAsset(asset.sys.id);
			if (asset.fields.file["en-US"]?.url) {
				asset = await asset.publish();
				break;
			}
		} catch {
			// Ignore, wait and retry
		}
		await new Promise((r) => setTimeout(r, 1000));
		retries--;
	}

	return { id: asset.sys.id };
}

/**
 * Input shape for a member profile entry.
 */
export interface MemberInput {
	name: string;
	role: string;
	team: string;
	year: string;
	order?: number;
	bio?: string;
	email?: string;
	github?: string;
	linkedin?: string;
	instagram?: string;
	coLead?: string;
	generalMembers?: string;
}

/**
 * Maps a member input to Contentful localized fields.
 */
export function mapMemberFields(
	m: MemberInput,
	photoAssetId?: string,
): Record<string, { "en-US": unknown }> {
	const fields: Record<string, { "en-US": unknown }> = {
		name: { "en-US": m.name },
		role: { "en-US": m.role },
		team: { "en-US": m.team },
		year: { "en-US": m.year },
		order: { "en-US": m.order || 99 },
		bio: { "en-US": createRichText(m.bio || "") },
	};

	if (m.email) fields["email"] = { "en-US": m.email };
	if (m.github) fields["github"] = { "en-US": m.github };
	if (m.linkedin) fields["linkedin"] = { "en-US": m.linkedin };
	if (m.instagram) fields["instagram"] = { "en-US": m.instagram };
	if (m.coLead) fields["coLead"] = { "en-US": m.coLead };
	if (m.generalMembers)
		fields["generalMembers"] = { "en-US": m.generalMembers };

	if (photoAssetId) {
		fields["photo"] = {
			"en-US": { sys: { type: "Link", linkType: "Asset", id: photoAssetId } },
		};
	}

	return fields;
}

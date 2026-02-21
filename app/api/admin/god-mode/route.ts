import { NextResponse } from 'next/server';
import { contentfulManagementClient, SPACE_ID, ENVIRONMENT_ID } from '@/lib/contentful-admin';
import { requireAuth, isSuperAdmin, AuthError } from '@/lib/services/auth.service';
import { handleApiError } from '@/lib/middleware/error.middleware';

export async function POST(request: Request) {
    try {
        const user = await requireAuth();

        if (!isSuperAdmin(user.email)) {
            throw new AuthError('Forbidden: God Mode Access Denied', 403);
        }

        const body = await request.json();
        const { action, contentType, entryId, data } = body;

        const space = await contentfulManagementClient.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        let result;

        switch (action) {
            case 'create':
                if (!contentType) throw new Error('ContentType is required for create');
                result = await environment.createEntry(contentType, { fields: data });
                break;

            case 'update': {
                if (!entryId) throw new Error('EntryId is required for update');
                const entryToUpdate = await environment.getEntry(entryId);
                Object.keys(data).forEach(key => {
                    entryToUpdate.fields[key] = data[key];
                });
                result = await entryToUpdate.update();
                break;
            }

            case 'delete': {
                if (!entryId) throw new Error('EntryId is required for delete');
                const entryToDelete = await environment.getEntry(entryId);
                if (entryToDelete.isPublished()) {
                    await entryToDelete.unpublish();
                }
                await entryToDelete.delete();
                result = { success: true, id: entryId };
                break;
            }

            case 'publish': {
                if (!entryId) throw new Error('EntryId is required for publish');
                const entryToPublish = await environment.getEntry(entryId);
                result = await entryToPublish.publish();
                break;
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true, result });

    } catch (error: unknown) {
        return handleApiError(error);
    }
}

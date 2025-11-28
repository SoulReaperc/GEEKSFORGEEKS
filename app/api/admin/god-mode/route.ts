import { NextResponse } from 'next/server';
import { contentfulManagementClient, SPACE_ID, ENVIRONMENT_ID } from '@/lib/contentful-admin';

const SUPER_ADMINS = ['admin@club.com', 'chairperson@club.com'];

export async function POST(request: Request) {
    try {
        // 1. Mock Authentication & Authorization
        const mockEmail = request.headers.get('x-mock-user-email');

        if (!mockEmail || !SUPER_ADMINS.includes(mockEmail)) {
            return NextResponse.json({ error: 'Forbidden: God Mode Access Denied' }, { status: 403 });
        }

        const body = await request.json();
        const { action, contentType, entryId, data } = body;

        const space = await contentfulManagementClient.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        let result;

        switch (action) {
            case 'create':
                if (!contentType) throw new Error('ContentType is required for create');
                result = await environment.createEntry(contentType, {
                    fields: data,
                });
                break;

            case 'update':
                if (!entryId) throw new Error('EntryId is required for update');
                const entryToUpdate = await environment.getEntry(entryId);
                // Merge data into fields
                Object.keys(data).forEach(key => {
                    // Assuming data is in the format { fieldName: { 'en-US': value } } or just { fieldName: value }
                    // For simplicity in God Mode, let's assume the admin sends full localized structure or we map it.
                    // Let's assume the admin sends { fieldName: { 'en-US': value } } for maximum control.
                    entryToUpdate.fields[key] = data[key];
                });
                result = await entryToUpdate.update();
                break;

            case 'delete':
                if (!entryId) throw new Error('EntryId is required for delete');
                const entryToDelete = await environment.getEntry(entryId);
                // Unpublish first if published
                if (entryToDelete.isPublished()) {
                    await entryToDelete.unpublish();
                }
                await entryToDelete.delete();
                result = { success: true, id: entryId };
                break;

            case 'publish':
                if (!entryId) throw new Error('EntryId is required for publish');
                const entryToPublish = await environment.getEntry(entryId);
                result = await entryToPublish.publish();
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true, result });

    } catch (error: any) {
        console.error('God Mode Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

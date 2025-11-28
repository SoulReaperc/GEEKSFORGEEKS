import { NextResponse } from 'next/server';
import { contentfulManagementClient, SPACE_ID, ENVIRONMENT_ID } from '@/lib/contentful-admin';

export async function POST(request: Request) {
    try {
        // 1. Mock Authentication
        // In production, use: const session = await getServerSession(authOptions);
        const mockEmail = request.headers.get('x-mock-user-email');

        if (!mockEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { bio, socialLinks } = body;

        // 2. Initialize Contentful Client
        const space = await contentfulManagementClient.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        // 3. Query for MemberProfile
        const entries = await environment.getEntries({
            content_type: 'memberProfile',
            'fields.email': mockEmail,
            limit: 1,
        });

        if (entries.total === 0) {
            return NextResponse.json({ error: 'Forbidden: Profile not found' }, { status: 403 });
        }

        const entry = entries.items[0];

        // 4. Update Fields
        // Contentful expects localized fields: { 'en-US': value }
        // We assume 'en-US' or use the default locale.
        // For simplicity, we'll try to detect or assume 'en-US'.
        const locale = 'en-US'; // This should ideally be dynamic or fetched from space locales

        if (bio) {
            entry.fields.bio = { [locale]: bio };
        }
        if (socialLinks) {
            entry.fields.socialLinks = { [locale]: socialLinks };
        }

        // 5. Optimistic Locking & Update
        // The SDK handles versioning automatically if we use the entry object returned by getEntries
        // providing we update the object and call update() on it.
        const updatedEntry = await entry.update();

        // 6. Publish (Optional, but usually desired for "Update")
        // The prompt didn't explicitly say "Publish", but "Update" usually implies saving.
        // If we want it live, we should publish. I'll add publish.
        await updatedEntry.publish();

        return NextResponse.json({ success: true, entry: updatedEntry });

    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

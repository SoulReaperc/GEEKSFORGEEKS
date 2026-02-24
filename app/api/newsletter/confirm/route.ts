import { NextResponse } from "next/server";
import {
	confirmSubscriber,
	findSubscriberByToken,
} from "@/lib/repositories/newsletter.repository";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get("token");

		if (!token) {
			return NextResponse.redirect(
				`${process.env.NEXT_PUBLIC_SITE_URL}/pages/blog? error=invalid_token`,
			);
		}

		const subscriber = await findSubscriberByToken(token);

		if (!subscriber) {
			return NextResponse.redirect(
				`${process.env.NEXT_PUBLIC_SITE_URL}/pages/blog?error=invalid_token`,
			);
		}

		await confirmSubscriber(token);

		return NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_SITE_URL}/pages/blog?confirmed=true`,
		);
	} catch (error) {
		console.error("Confirmation error:", error);
		return NextResponse.redirect(
			`${process.env.NEXT_PUBLIC_SITE_URL}/pages/blog? error=server_error`,
		);
	}
}

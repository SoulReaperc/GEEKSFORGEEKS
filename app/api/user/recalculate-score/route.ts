import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/middleware/error.middleware";
import { updateUserPoints } from "@/lib/repositories/profile.repository";
import { requireAuth } from "@/lib/services/auth.service";
import { createClient } from "@/lib/supabase-server";

// Recalculates the user's total score from scratch (workaround for buggy trigger)
export async function POST() {
	try {
		const user = await requireAuth();
		const supabase = await createClient();

		// Fetch all submissions
		const { data: submissions, error: submissionsError } = await supabase
			.from("user_submissions")
			.select("problem_slug, points_awarded")
			.eq("user_id", user.id);

		if (submissionsError) {
			throw submissionsError;
		}

		// Keep best score per problem
		const bestScores = new Map<string, number>();
		for (const sub of submissions) {
			const slug = sub.problem_slug as string;
			const score = (sub.points_awarded as number) || 0;
			if (!bestScores.has(slug) || score > bestScores.get(slug)!) {
				bestScores.set(slug, score);
			}
		}

		let totalPoints = 0;
		for (const score of bestScores.values()) {
			totalPoints += score;
		}

		await updateUserPoints(user.id, totalPoints);

		return NextResponse.json({
			success: true,
			message: "Score recalculated successfully.",
			new_total_points: totalPoints,
		});
	} catch (error: unknown) {
		return handleApiError(error);
	}
}

import { createClient } from "@/lib/supabase-server";

/**
 * Gets the current total_points for a user profile.
 */
export async function getUserPoints(userId: string): Promise<number> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("profiles")
		.select("total_points")
		.eq("id", userId)
		.single();

	if (error) {
		throw new Error("Error fetching profile: " + error.message);
	}

	return data?.total_points ?? 0;
}

/**
 * Updates the total_points for a user profile.
 */
export async function updateUserPoints(
	userId: string,
	totalPoints: number,
): Promise<void> {
	const supabase = await createClient();

	const { error } = await supabase
		.from("profiles")
		.update({ total_points: totalPoints })
		.eq("id", userId);

	if (error) {
		throw new Error("Error updating profile points: " + error.message);
	}
}

/**
 * Recalculates and updates rankings for all users.
 * Uses a single query to fetch ordered users, then batch updates.
 */
export async function updateAllRankings(): Promise<void> {
	const supabase = await createClient();

	const { data: allUsers, error } = await supabase
		.from("profiles")
		.select("id, total_points")
		.order("total_points", { ascending: false });

	if (error) {
		console.error("Error fetching users for ranking:", error);
		return;
	}

	if (!allUsers || allUsers.length === 0) return;

	// Batch update ranks
	const updates = allUsers.map((user, i) => ({
		id: user.id as string,
		rank: `#${i + 1}`,
	}));

	// Use parallel updates with concurrency limit
	const BATCH_SIZE = 50;
	for (let i = 0; i < updates.length; i += BATCH_SIZE) {
		const batch = updates.slice(i, i + BATCH_SIZE);
		await Promise.all(
			batch.map(({ id, rank }) =>
				supabase.from("profiles").update({ rank }).eq("id", id),
			),
		);
	}

	console.log(`Updated rankings for ${allUsers.length} users`);
}

/**
 * Handles the full points update logic for a submission.
 * Compares new vs existing points and updates only if improved.
 */
export async function handlePointsUpdate(
	userId: string,
	problemSlug: string,
	newPoints: number,
	existingPoints: number | null,
): Promise<void> {
	const currentTotalPoints = await getUserPoints(userId);

	if (existingPoints !== null) {
		// Existing submission — only update if better
		if (newPoints > existingPoints) {
			const pointsDelta = newPoints - existingPoints;
			await updateUserPoints(userId, currentTotalPoints + pointsDelta);
		}
	} else {
		// First submission for this problem
		await updateUserPoints(userId, currentTotalPoints + newPoints);
	}
}

import React from 'react';
import { createClient } from '@/lib/supabase-server';
import LeaderboardClient from './LeaderboardClient';

export const revalidate = 60; // Cache for 60 seconds

async function getFullLeaderboard() {
    try {
        const supabase = await createClient();

        const { data } = await supabase
            .from('profiles')
            .select('username, avatar_url, total_points, rank')
            .order('total_points', { ascending: false })
            .limit(50);

        return data || [];
    } catch (e) {
        console.error("Leaderboard error:", e);
        return [];
    }
}

export default async function LeaderboardPage() {
    const leaderboard = await getFullLeaderboard();

    return <LeaderboardClient leaderboard={leaderboard} />;
}

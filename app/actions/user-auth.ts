'use server'

import { createClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export async function sendOtp(email: string) {
    if (!email) {
        return { error: 'Email is required' };
    }

    // 1. Check Whitelist (Use Admin Client)
    const supabaseAdmin = await createAdminClient();

    // Check if email is in whitelist
    const { data: whitelistEntry, error: whitelistError } = await supabaseAdmin
        .from('challenge_whitelist')
        .select('email')
        .eq('email', email)
        .single();

    if (whitelistError || !whitelistEntry) {
        console.error("Whitelist check failed:", whitelistError);
        return { error: 'Access Denied: You are not in the challenge whitelist. Please contact an admin.' };
    }

    // 2. If Whitelisted, send OTP
    const supabase = await createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true, // Allow creation if whitelisted (Auth users table)
        },
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return { error: 'Failed to send OTP. Please try again.' };
    }

    return { success: true };
}

export async function verifyOtp(email: string, otp: string) {
    if (!email || !otp) {
        return { error: 'Email and OTP are required' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true, session: data.session };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
}

import { createClient } from '@/lib/supabase-server';

/**
 * Fetches an existing submission for a user and problem.
 */
export async function findSubmission(userId: string, problemSlug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('points_awarded')
    .eq('user_id', userId)
    .eq('problem_slug', problemSlug)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error('Error fetching existing submission: ' + error.message);
  }

  return data;
}

/**
 * Creates a new submission record.
 */
export async function createSubmission(params: {
  userId: string;
  problemSlug: string;
  code: string;
  language: string;
  runtime: number;
  pointsAwarded: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('submissions')
    .insert({
      user_id: params.userId,
      problem_slug: params.problemSlug,
      code: params.code,
      language: params.language,
      status: 'Passed',
      runtime: params.runtime,
      points_awarded: params.pointsAwarded,
    });

  if (error) {
    throw new Error('Error inserting submission: ' + error.message);
  }
}

/**
 * Updates an existing submission with better results.
 */
export async function updateSubmission(params: {
  userId: string;
  problemSlug: string;
  code: string;
  language: string;
  runtime: number;
  pointsAwarded: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('submissions')
    .update({
      code: params.code,
      language: params.language,
      status: 'Passed',
      runtime: params.runtime,
      points_awarded: params.pointsAwarded,
    })
    .eq('user_id', params.userId)
    .eq('problem_slug', params.problemSlug);

  if (error) {
    throw new Error('Error updating submission: ' + error.message);
  }
}

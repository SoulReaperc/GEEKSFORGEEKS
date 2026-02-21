import { createAdminClient } from '@/lib/supabase-server';

/**
 * Newsletter subscriber record shape.
 */
export interface NewsletterSubscriber {
  email: string;
  is_active: boolean;
  confirmed: boolean;
  unsubscribe_token: string;
  confirmed_at?: string;
  unsubscribed_at?: string;
}

/**
 * Finds a subscriber by email.
 */
export async function findSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error('Error fetching subscriber: ' + error.message);
  }

  return data as NewsletterSubscriber | null;
}

/**
 * Finds a subscriber by their unsubscribe token.
 */
export async function findSubscriberByToken(token: string): Promise<NewsletterSubscriber | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .eq('unsubscribe_token', token)
    .single();

  if (error) {
    return null;
  }

  return data as NewsletterSubscriber | null;
}

/**
 * Creates a new newsletter subscriber.
 * Returns the created record (with generated unsubscribe_token).
 */
export async function createSubscriber(email: string): Promise<NewsletterSubscriber> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email, is_active: true, confirmed: false })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to subscribe: ' + error.message);
  }

  return data as NewsletterSubscriber;
}

/**
 * Confirms a subscriber's email address.
 */
export async function confirmSubscriber(token: string): Promise<void> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({
      confirmed: true,
      is_active: true,
      confirmed_at: new Date().toISOString(),
    })
    .eq('unsubscribe_token', token);

  if (error) {
    throw new Error('Error confirming subscriber: ' + error.message);
  }
}

/**
 * Unsubscribes a user by their unsubscribe token.
 */
export async function unsubscribe(token: string): Promise<void> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({
      is_active: false,
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('unsubscribe_token', token);

  if (error) {
    throw new Error('Error unsubscribing: ' + error.message);
  }
}

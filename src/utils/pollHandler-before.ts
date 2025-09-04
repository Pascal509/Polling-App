// Original handleSubmit function - BEFORE refactoring
// This is the snapshot for comparison purposes

import { createClient } from '@/lib/supabase/client';

export const handleSubmitBefore = async (
  e: React.FormEvent,
  user: any,
  title: string,
  description: string,
  options: string[],
  pollType: string,
  isAnonymous: boolean,
  isPublic: boolean,
  requiresAuth: boolean,
  expiresAt: string,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
  router: any
) => {
  e.preventDefault();
  if (!user) {
    setError("You must be logged in to create a poll");
    return;
  }

  const validOptions = options.filter((o) => o.trim() !== "");
  if (!title.trim() || validOptions.length < 2) {
    setError("Poll must have a title and at least 2 options");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const supabase = createClient();
    const expiresAtValue = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Insert poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert([
        {
          title: title.trim(),
          description: description.trim() || null,
          creator_id: user.id,
          poll_type: pollType,
          is_anonymous: isAnonymous,
          is_public: isPublic,
          requires_auth: requiresAuth,
          expires_at: expiresAtValue,
        },
      ])
      .select()
      .single();

    if (pollError) throw pollError;

    // Insert poll options
    const { error: optionError } = await supabase.from("poll_options").insert(
      validOptions.map((opt, index) => ({
        poll_id: poll.id,
        option_text: opt.trim(),
        option_order: index,
      }))
    );

    if (optionError) throw optionError;

    // Initialize analytics
    await supabase.from("poll_analytics").insert({
      poll_id: poll.id,
      total_votes: 0,
      unique_voters: 0,
      views: 0,
      shares: 0,
    });

    router.push(`/polls/${poll.id}`);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

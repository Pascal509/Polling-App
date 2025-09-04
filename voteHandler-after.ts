// Refactored handleSubmit function - AFTER optimization
// Improved for readability and performance

import { createClient } from '@/lib/supabase/client';

// Types for better type safety
interface PollData {
  title: string;
  description: string | null;
  creator_id: string;
  poll_type: string;
  is_anonymous: boolean;
  is_public: boolean;
  requires_auth: boolean;
  expires_at: string;
}

interface PollOption {
  poll_id: string;
  option_text: string;
  option_order: number;
}

interface PollAnalytics {
  poll_id: string;
  total_votes: number;
  unique_voters: number;
  views: number;
  shares: number;
}

// Validation functions for better separation of concerns
const validateUser = (user: any): string | null => {
  if (!user) return "You must be logged in to create a poll";
  return null;
};

const validatePollData = (title: string, options: string[]): string | null => {
  const validOptions = options.filter((o) => o.trim() !== "");
  if (!title.trim()) return "Poll must have a title";
  if (validOptions.length < 2) return "Poll must have at least 2 options";
  return null;
};

const getExpirationDate = (expiresAt: string): string => {
  return expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
};

const preparePollData = (
  title: string,
  description: string,
  user: any,
  pollType: string,
  isAnonymous: boolean,
  isPublic: boolean,
  requiresAuth: boolean,
  expiresAt: string
): PollData => ({
  title: title.trim(),
  description: description.trim() || null,
  creator_id: user.id,
  poll_type: pollType,
  is_anonymous: isAnonymous,
  is_public: isPublic,
  requires_auth: requiresAuth,
  expires_at: getExpirationDate(expiresAt),
});

const preparePollOptions = (options: string[], pollId: string): PollOption[] => {
  return options
    .filter((o) => o.trim() !== "")
    .map((opt, index) => ({
      poll_id: pollId,
      option_text: opt.trim(),
      option_order: index,
    }));
};

const preparePollAnalytics = (pollId: string): PollAnalytics => ({
  poll_id: pollId,
  total_votes: 0,
  unique_voters: 0,
  views: 0,
  shares: 0,
});

// Main refactored function
export const handleSubmitAfter = async (
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
  
  // Early validation
  const userError = validateUser(user);
  if (userError) {
    setError(userError);
    return;
  }

  const validationError = validatePollData(title, options);
  if (validationError) {
    setError(validationError);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const supabase = createClient();
    
    // Prepare data
    const pollData = preparePollData(title, description, user, pollType, isAnonymous, isPublic, requiresAuth, expiresAt);
    
    // Insert poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert([pollData])
      .select()
      .single();

    if (pollError) throw pollError;

    // Prepare related data
    const pollOptions = preparePollOptions(options, poll.id);
    const pollAnalytics = preparePollAnalytics(poll.id);

    // Parallel database operations for better performance
    const [optionResult, analyticsResult] = await Promise.all([
      supabase.from("poll_options").insert(pollOptions),
      supabase.from("poll_analytics").insert(pollAnalytics)
    ]);

    if (optionResult.error) throw optionResult.error;
    if (analyticsResult.error) throw analyticsResult.error;

    router.push(`/polls/${poll.id}`);
  } catch (err: any) {
    setError(err.message || "An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};

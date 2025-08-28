"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@supabase/supabase-js";

// setup supabase client (or import from your utils)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreatePollPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]); // default 2 empty options
  const [expiresAt, setExpiresAt] = useState(""); // NEW: store expiry input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddOption = () => setOptions([...options, ""]);
  const handleOptionChange = (i: number, value: string) => {
    const newOptions = [...options];
    newOptions[i] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("You must be logged in to create a poll");
    if (!title.trim() || options.filter((o) => o.trim()).length < 2) {
      return setError("Poll must have a title and at least 2 options");
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ fallback expiry = now + 7 days
      const expiresAtValue =
        expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // 1. Insert poll
      const { data: poll, error: pollError } = await supabase
        .from("polls")
        .insert([
          {
            title,
            description,
            creator_id: user.id,
            expires_at: expiresAtValue,
          },
        ])
        .select()
        .single();

      if (pollError) throw pollError;

      // 2. Insert poll options
      const validOptions = options.filter((o) => o.trim() !== "");
      const { error: optionError } = await supabase.from("poll_options").insert(
        validOptions.map((opt) => ({
          poll_id: poll.id,
          option_text: opt,
        }))
      );

      if (optionError) throw optionError;

      router.push("/"); // redirect to home (or poll page)
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create a New Poll</h1>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Poll Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* ✅ Expiration Date input */}
        <div>
          <label className="block font-medium mb-1">Expires At</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <p className="text-sm text-gray-500">
            Leave empty to default to 7 days from now.
          </p>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Options</h2>
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              className="w-full border p-2 rounded mb-2"
              required={i < 2} // first 2 must be filled
            />
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            + Add Option
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </form>
    </main>
  );
}

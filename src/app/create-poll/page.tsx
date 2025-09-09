"use client";

import { useState, FC, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@supabase/supabase-js";

// --- Constants ---
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_OPTIONS = 2;

// --- Supabase Client ---
// Ideally, this would be in a separate file (e.g., src/lib/supabase.ts)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Type Definitions ---
interface PollOption {
  text: string;
}

// --- Reusable UI Components ---

interface InputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  className?: string;
}

const Input: FC<InputProps> = ({ type = "text", ...props }) => (
  <input {...props} type={type} />
);

const TextArea: FC<InputProps> = (props) => <textarea {...props} />;

interface ButtonProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Button: FC<ButtonProps> = ({
  type = "button",
  children,
  ...props
}) => (
  <button {...props} type={type}>
    {children}
  </button>
);

// --- Poll Creation Components ---

interface OptionInputProps {
  option: PollOption;
  index: number;
  handleOptionChange: (index: number, value: string) => void;
}

const OptionInput: FC<OptionInputProps> = ({
  option,
  index,
  handleOptionChange,
}) => (
  <Input
    value={option.text}
    onChange={(e) => handleOptionChange(index, e.target.value)}
    placeholder={`Option ${index + 1}`}
    required={index < MIN_OPTIONS}
    className="w-full border p-2 rounded mb-2"
  />
);

const CreatePollPage: FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<PollOption[]>([
    { text: "" },
    { text: "" },
  ]);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddOption = () => {
    setOptions([...options, { text: "" }]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { text: value };
    setOptions(newOptions);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a poll.");
      return;
    }

    const validOptions = options.filter((o) => o.text.trim());
    if (!title.trim() || validOptions.length < MIN_OPTIONS) {
      setError(`A poll must have a title and at least ${MIN_OPTIONS} options.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const expiresAtValue =
        expiresAt || new Date(Date.now() + SEVEN_DAYS_IN_MS).toISOString();

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

      const { error: optionError } = await supabase.from("poll_options").insert(
        validOptions.map((opt) => ({
          poll_id: poll.id,
          option_text: opt.text,
        }))
      );

      if (optionError) throw optionError;

      router.push("/");
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
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Poll Title"
          required
          className="w-full border p-2 rounded"
        />

        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full border p-2 rounded"
        />

        <div>
          <label className="block font-medium mb-1">Expires At</label>
          <Input
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
          {options.map((option, i) => (
            <OptionInput
              key={i}
              option={option}
              index={i}
              handleOptionChange={handleOptionChange}
            />
          ))}
          <Button
            onClick={handleAddOption}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            + Add Option
          </Button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Creating..." : "Create Poll"}
        </Button>
      </form>
    </main>
  );
};

export default CreatePollPage;
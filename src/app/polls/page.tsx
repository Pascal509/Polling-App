"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Poll = {
  id: string;
  title: string;
  description: string;
  created_at: string;
};

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    const fetchPolls = async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("id, title, description, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) setPolls(data);
    };
    fetchPolls();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Polls</h1>
      {polls.length === 0 ? (
        <p>No polls yet. Be the first to <Link href="/create-poll" className="text-blue-500 underline">create one</Link>!</p>
      ) : (
        <ul className="space-y-4">
          {polls.map((poll) => (
            <li key={poll.id} className="border p-4 rounded shadow-sm">
              <h2 className="text-lg font-semibold">{poll.title}</h2>
              <p className="text-gray-600">{poll.description}</p>
              <Link href={`/polls/${poll.id}`} className="text-blue-500 underline mt-2 inline-block">
                View & Vote
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

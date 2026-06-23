import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("forum_threads")
    .select("id, title, body, author_name, pinned, created_at, forum_replies(count)")
    .eq("visible", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Errore" }, { status: 500 });

  const threads = (data ?? []).map((t) => ({
    id: String(t.id),
    title: t.title,
    content: t.body,
    authorName: t.author_name,
    pinned: t.pinned,
    replyCount: (t.forum_replies as unknown as { count: number }[])[0]?.count ?? 0,
    createdAt: t.created_at,
  }));

  return NextResponse.json({ threads });
}

import { createClient } from "@/lib/supabase/server";
import { getPublicStreamConfig } from "@/lib/stream/get-public-stream-config";

type RecentSongRequest = {
  id: string;
  name_alias: string;
  song_title: string;
  artist_name: string;
  status: string;
  created_at: string;
};

type RecentContactMessage = {
  id: string;
  name: string;
  business_name: string | null;
  email: string | null;
  message_type: string;
  status: string;
  created_at: string;
};

type RecentBlogPost = {
  id: string;
  title: string;
  slug: string;
  is_visible: boolean;
  published_at: string | null;
  created_at: string;
};

export type AdminDashboardSummary = {
  metrics: {
    sponsorsCount: number;
    activeAssetsCount: number;
    songRequestsCount: number;
    contactMessagesCount: number;
    blogPostsCount: number;
  };
  stream: {
    status: "live" | "offline" | "upcoming" | "replay";
    title: string | null;
  };
  recentSongRequests: RecentSongRequest[];
  recentContactMessages: RecentContactMessage[];
  recentBlogPosts: RecentBlogPost[];
};

async function getTableCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string
) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error(`Error contando ${table}:`, error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const supabase = await createClient();

  const [
    sponsorsCount,
    activeAssetsCount,
    songRequestsCount,
    contactMessagesCount,
    blogPostsCount,
    recentSongRequestsResult,
    recentContactMessagesResult,
    recentBlogPostsResult,
    stream,
  ] = await Promise.all([
    getTableCount(supabase, "sponsors"),
    getTableCount(supabase, "v_active_sponsor_assets"),
    getTableCount(supabase, "song_requests"),
    getTableCount(supabase, "contact_messages"),
    getTableCount(supabase, "blog_posts"),

    supabase
      .from("song_requests")
      .select("id, name_alias, song_title, artist_name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("contact_messages")
      .select("id, name, business_name, email, message_type, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("blog_posts")
      .select("id, title, slug, is_visible, published_at, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    getPublicStreamConfig(),
  ]);

  if (recentSongRequestsResult.error) {
    console.error(
      "Error cargando pedidos recientes:",
      recentSongRequestsResult.error.message
    );
  }

  if (recentContactMessagesResult.error) {
    console.error(
      "Error cargando contactos recientes:",
      recentContactMessagesResult.error.message
    );
  }

  if (recentBlogPostsResult.error) {
    console.error(
      "Error cargando posts recientes:",
      recentBlogPostsResult.error.message
    );
  }

  return {
    metrics: {
      sponsorsCount,
      activeAssetsCount,
      songRequestsCount,
      contactMessagesCount,
      blogPostsCount,
    },
    stream: {
      status: stream?.status ?? "offline",
      title: stream?.title ?? null,
    },
    recentSongRequests:
      (recentSongRequestsResult.data as RecentSongRequest[] | null) ?? [],
    recentContactMessages:
      (recentContactMessagesResult.data as RecentContactMessage[] | null) ?? [],
    recentBlogPosts:
      (recentBlogPostsResult.data as RecentBlogPost[] | null) ?? [],
  };
}
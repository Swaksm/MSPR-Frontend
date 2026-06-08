"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, MessageCircle, Plus, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/lib/i18n-context";

const API = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";

interface Post {
  id: number;
  user_id: number;
  user_name: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

function PostCard({ post, userId, onDelete, onLike }: {
  post: Post;
  userId: number;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {post.user_name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{post.user_name}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
          </div>
        </div>
        {post.user_id === userId && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {post.content && (
        <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
      )}

      {post.media_url && post.media_type === "image" && (
        <img
          src={post.media_url}
          alt="media"
          className="w-full rounded-xl object-cover max-h-72"
        />
      )}
      {post.media_url && post.media_type === "video" && (
        <video
          src={post.media_url}
          controls
          className="w-full rounded-xl max-h-72"
        />
      )}

      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-sm transition-all active:scale-95 ${
            post.liked_by_me ? "text-red-500" : "text-muted-foreground hover:text-red-400"
          }`}
        >
          <Heart className={`w-4 h-4 ${post.liked_by_me ? "fill-red-500" : ""}`} />
          <span>{post.likes_count}</span>
        </button>

        <Link
          href={`/dashboard/social/${post.id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments_count}</span>
        </Link>
      </div>
    </div>
  );
}

export default function SocialFeedPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [userId, setUserId] = useState<number>(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    if (!uid) { router.replace("/login"); return; }
    setUserId(parseInt(uid));
  }, [router]);

  const loadPosts = useCallback(async (reset = false) => {
    if (!userId) return;
    const currentOffset = reset ? 0 : offset;
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const res = await apiFetch(
        `${API}/social/posts?user_id=${userId}&limit=${LIMIT}&offset=${currentOffset}`
      );
      const data: Post[] = await res.json();
      setPosts(prev => reset ? data : [...prev, ...data]);
      setOffset(currentOffset + data.length);
      setHasMore(data.length === LIMIT);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId, offset]);

  useEffect(() => {
    if (userId) loadPosts(true);
  }, [userId]);

  const handleLike = async (postId: number) => {
    await apiFetch(`${API}/social/posts/${postId}/like?user_id=${userId}`, { method: "POST" });
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked_by_me: !p.liked_by_me, likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ));
  };

  const handleDelete = async (postId: number) => {
    await apiFetch(`${API}/social/posts/${postId}?user_id=${userId}`, { method: "DELETE" });
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Communauté</h1>
        <Link href="/dashboard/social/create">
          <Button size="sm" className="rounded-xl gap-1.5">
            <Plus className="w-4 h-4" />
            Publier
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse space-y-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-2 bg-muted rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <p className="font-semibold text-foreground">Aucune publication</p>
          <p className="text-sm text-muted-foreground">Sois le premier à partager !</p>
          <Link href="/dashboard/social/create">
            <Button className="rounded-xl mt-2">Créer une publication</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                userId={userId}
                onDelete={handleDelete}
                onLike={handleLike}
              />
            ))}
          </div>

          {hasMore && (
            <Button
              variant="outline"
              className="w-full rounded-xl gap-2"
              onClick={() => loadPosts(false)}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Voir plus</>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

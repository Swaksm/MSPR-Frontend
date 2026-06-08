"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Heart, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";

interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

interface Post {
  id: number;
  user_id: number;
  user_name: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  likes_count: number;
  liked_by_me: boolean;
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [userId, setUserId] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    const name = localStorage.getItem("user_name") || "Utilisateur";
    if (!uid) { router.replace("/login"); return; }
    setUserId(parseInt(uid));
    setUserName(name);
  }, [router]);

  useEffect(() => {
    if (!userId || !postId) return;
    apiFetch(`${API}/social/posts/${postId}?user_id=${userId}`)
      .then(r => r.json()).then(setPost);
    apiFetch(`${API}/social/posts/${postId}/comments`)
      .then(r => r.json()).then(setComments);
  }, [userId, postId]);

  const handleLike = async () => {
    if (!post) return;
    await apiFetch(`${API}/social/posts/${post.id}/like?user_id=${userId}`, { method: "POST" });
    setPost(p => p ? {
      ...p,
      liked_by_me: !p.liked_by_me,
      likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1,
    } : p);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    const res = await apiFetch(`${API}/social/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, user_name: userName, content: newComment }),
    });
    const created = await res.json();
    setComments(prev => [...prev, { ...created, user_id: userId, user_name: userName, content: newComment }]);
    setNewComment("");
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: number) => {
    await apiFetch(`${API}/social/comments/${commentId}?user_id=${userId}`, { method: "DELETE" });
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  if (!post) return (
    <div className="max-w-md mx-auto px-5 pt-6">
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-24 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Publication</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{post.user_name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-sm">{post.user_name}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
          </div>
        </div>
        {post.content && <p className="text-sm text-foreground">{post.content}</p>}
        {post.media_url && post.media_type === "image" && (
          <img src={post.media_url} className="w-full rounded-xl max-h-72 object-cover" alt="" />
        )}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-all active:scale-95 ${
            post.liked_by_me ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          <Heart className={`w-4 h-4 ${post.liked_by_me ? "fill-red-500" : ""}`} />
          <span>{post.likes_count}</span>
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">{comments.length} commentaire{comments.length > 1 ? "s" : ""}</p>
        {comments.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-xl p-3 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xs">{c.user_name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">{c.user_name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                  {c.user_id === userId && (
                    <button onClick={() => handleDeleteComment(c.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground mt-0.5">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleComment}
        className="fixed bottom-20 left-0 right-0 px-5 max-w-md mx-auto flex gap-2"
      >
        <input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire…"
          className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
        />
        <Button type="submit" size="sm" disabled={!newComment.trim() || submitting} className="rounded-xl px-3">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

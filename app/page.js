"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Trash2, ExternalLink, BookmarkPlus, LogOut, Loader2, Bookmark, Globe } from "lucide-react";

export default function Home() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (err) {
      console.error("Error fetching bookmarks:", err.message);
    }
  }, [supabase]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;

        setUser(user);
        if (user) {
          await fetchBookmarks();
        }
      } catch (err) {
        console.error("Session check failed:", err.message);
      } finally {
        setLoading(false);
      }
    };

    initApp();

    const channel = supabase
      .channel("realtime-bookmarks")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => {
              // Safety: Prevent duplicates if Optimistic UI already added it
              const exists = prev.some(b => b.id === payload.new.id);
              if (exists) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === "DELETE") {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchBookmarks]);


  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : ''
        }
      });
      if (error) throw error;
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBookmarks([]);
  };


  const addBookmark = async (e) => {
    e.preventDefault();
    if (!title || !url || !user) return;


    const { data, error } = await supabase
      .from("bookmarks")
      .insert([{ title, url, user_id: user.id }])
      .select();

    if (!error && data) {

      setBookmarks((prev) => [data[0], ...prev]);
      setTitle("");
      setUrl("");
    } else {
      console.error("Insert error:", error?.message);
    }
  };

  const deleteBookmark = async (id) => {
    try {

      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };


  if (loading) return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
      <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Synchronizing Vault</p>
    </div>
  );


  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500">
            <Globe size={32} />
          </div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">SmartMarks</h1>
          <p className="text-slate-500 text-sm mb-8">Your private, real-time link vault.</p>
          <button
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-4 font-bold text-black transition-all hover:bg-slate-200 active:scale-95 shadow-lg shadow-white/5"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] pb-20 text-slate-100 flex flex-col items-center font-sans">
      <nav className="w-full sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-black text-blue-500 text-lg italic tracking-tighter">
            <Bookmark size={20} className="fill-blue-500/20" />
            <span>SMARTMARKS</span>
          </div>
          <button onClick={handleLogout} className="text-[10px] font-black text-slate-500 uppercase hover:text-red-400 transition-colors flex items-center gap-2 border border-slate-800 px-3 py-1.5 rounded-full bg-slate-900/50">
            <LogOut size={12} /> Logout
          </button>
        </div>
      </nav>

      <main className="w-full max-w-xl px-6 mt-10">
        <section className="mb-10 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
          <h2 className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Quick Add</h2>
          <form onSubmit={addBookmark} className="space-y-4">
            <input
              type="text" placeholder="Title (e.g. GitHub)"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              required
            />
            <input
              type="url" placeholder="URL (https://...)"
              value={url} onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              required
            />
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-black text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 active:scale-[0.98] transition-all">
              <BookmarkPlus size={18} /> SAVE TO VAULT
            </button>
          </form>
        </section>

        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Stored Links</h2>
          <span className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-[10px] font-black text-blue-400 shadow-inner">
            {bookmarks.length} ITEMS
          </span>
        </div>

        <div className="space-y-3">
          {bookmarks.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-800 py-20 text-slate-700 bg-slate-900/20">
              <Bookmark size={40} className="mb-4 opacity-5" />
              <p className="font-black text-[10px] tracking-widest uppercase">Vault is empty</p>
            </div>
          )}

          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all hover:border-slate-600 hover:bg-slate-800/30">
              <div className="min-w-0 pr-4">
                <h3 className="truncate font-bold text-slate-100 text-sm group-hover:text-blue-400 transition-colors mb-1">{bookmark.title}</h3>
                <a
                  href={bookmark.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-blue-400 transition-colors truncate"
                >
                  <span className="truncate italic opacity-80">{bookmark.url}</span>
                  <ExternalLink size={10} className="flex-shrink-0" />
                </a>
              </div>
              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="rounded-xl p-3 text-slate-600 transition-all hover:bg-red-950/30 hover:text-red-500 active:scale-90"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

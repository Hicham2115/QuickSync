"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import { MessageSquare, Send, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { EmpAvatar } from "./shared/EmpAvatar";

/* ── types ───────────────────────────────────────────── */
interface Conversation {
  contact_id: number;
  contact_name: string;
  contact_avatar: string | null;
  last_message: string;
  last_at: string;
  unread: number;
}

interface ChatMessage {
  id: number;
  body: string;
  mine: boolean;
  read_at: string | null;
  created_at: string;
  date: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

/* ── Chat component ──────────────────────────────────── */
export function Chat() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [contactId, setContactId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try { return (await api.get("/api/admin/users")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
  });

  const { data: conversations = [], isLoading: loadingConvs } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      try { return (await api.get("/api/messages/conversations")).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    refetchInterval: 5000,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ["thread", contactId],
    queryFn: async () => {
      try { return (await api.get(`/api/messages/${contactId}`)).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur");
        throw err;
      }
    },
    enabled: !!contactId,
    refetchInterval: 3000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      try { return (await api.post(`/api/messages/${contactId}`, { body: text })).data; }
      catch (err) {
        if (axios.isAxiosError(err)) throw new Error(err.response?.data?.message ?? "Erreur d'envoi.");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread", contactId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setBody("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !contactId) return;
    sendMutation.mutate(body.trim());
  };

  const selectContact = (id: number) => {
    setContactId(id);
    queryClient.setQueryData<Conversation[]>(["conversations"], (old = []) =>
      old.map(c => c.contact_id === id ? { ...c, unread: 0 } : c)
    );
  };

  const contactIds = new Set(conversations.map(c => c.contact_id));
  const newContacts = allUsers.filter(u => u.id !== user?.id && !contactIds.has(u.id));
  const activeContact = conversations.find(c => c.contact_id === contactId)
    ?? (contactId ? {
      contact_id: contactId,
      contact_name: allUsers.find(u => u.id === contactId)?.name ?? "Utilisateur",
      contact_avatar: null, last_message: "", last_at: "", unread: 0,
    } : null);

  const filteredConvs = conversations.filter(c =>
    c.contact_name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredNew = newContacts.filter(u =>
    (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const grouped = messages.reduce<Record<string, ChatMessage[]>>((acc, m) => {
    (acc[m.date] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="font-display text-[22px] font-semibold text-ink-900" style={{ letterSpacing: "-0.02em" }}>
          Messagerie interne
        </h1>
        <p className="font-sans text-[13px] text-warm-500 mt-0.5">
          Échangez directement avec vos collègues
        </p>
      </div>

      {/* Chat panel */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 rounded-xl border border-warm-200 bg-white overflow-hidden"
        style={{ minHeight: "62vh", boxShadow: "0 1px 2px rgba(15,23,41,.06)" }}
      >

        {/* Left — conversations sidebar */}
        <div className="flex flex-col border-r border-warm-200" style={{ maxHeight: "68vh" }}>

          {/* Search */}
          <div className="px-4 py-3.5" style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-300 pointer-events-none" aria-hidden="true" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full pl-8 pr-3 py-2 rounded-lg border font-sans text-[13px] text-ink-900 placeholder:text-warm-300 outline-none transition-colors"
                style={{ borderColor: "#DEDED8", background: "#fff" }}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loadingConvs ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3.5 flex items-center gap-3" style={{ borderBottom: "1px solid #F0EFE9" }}>
                  <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-24 mb-1.5" />
                    <Skeleton className="h-2.5 w-32" />
                  </div>
                </div>
              ))
            ) : (
              <>
                {filteredConvs.map(c => (
                  <button
                    key={c.contact_id}
                    onClick={() => selectContact(c.contact_id)}
                    className="w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors hover:bg-warm-50 cursor-pointer"
                    style={{
                      borderBottom: "1px solid #F0EFE9",
                      background: contactId === c.contact_id ? "#F4F4F0" : undefined,
                      borderLeft: contactId === c.contact_id ? "3px solid #6366F1" : "3px solid transparent",
                    }}
                  >
                    <EmpAvatar name={c.contact_name} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans text-[13px] font-semibold text-ink-900 truncate">{c.contact_name}</span>
                        {c.unread > 0 && (
                          <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-sans text-[10px] font-bold text-white" style={{ background: "#4338CA" }}>
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-[11px] text-warm-400 truncate mt-0.5">{c.last_message}</p>
                    </div>
                  </button>
                ))}

                {filteredNew.length > 0 && (
                  <>
                    <div className="px-4 py-2.5" style={{ background: "#FAFAFA", borderBottom: "1px solid #F0EFE9" }}>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-warm-400">Nouvelle conversation</span>
                    </div>
                    {filteredNew.map(u => (
                      <button
                        key={u.id}
                        onClick={() => selectContact(u.id)}
                        className="w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors hover:bg-warm-50 cursor-pointer"
                        style={{
                          borderBottom: "1px solid #F0EFE9",
                          background: contactId === u.id ? "#F4F4F0" : undefined,
                          borderLeft: contactId === u.id ? "3px solid #6366F1" : "3px solid transparent",
                        }}
                      >
                        <EmpAvatar name={u.name} avatar={u.avatar} size={36} />
                        <div className="flex-1 min-w-0">
                          <span className="font-sans text-[13px] font-medium text-ink-900">{u.name}</span>
                          <p className="font-sans text-[11px] text-warm-400 mt-0.5 capitalize">{u.role}</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {filteredConvs.length === 0 && filteredNew.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 gap-2 text-warm-300">
                    <MessageSquare size={28} aria-hidden="true" />
                    <p className="font-sans text-[12px]">Aucun résultat</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right — thread */}
        <div className="lg:col-span-2 flex flex-col" style={{ maxHeight: "68vh" }}>
          {!contactId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-warm-300">
              <MessageSquare size={40} aria-hidden="true" />
              <p className="font-sans text-[13px]">Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              {/* Contact header */}
              <div className="px-6 py-4 flex items-center gap-3 shrink-0" style={{ borderBottom: "1px solid #DEDED8", background: "#FAFAFA" }}>
                {activeContact && (
                  <EmpAvatar name={activeContact.contact_name} avatar={activeContact.contact_avatar} size={36} />
                )}
                <div>
                  <p className="font-sans text-[14px] font-semibold text-ink-900">{activeContact?.contact_name}</p>
                  <p className="font-sans text-[11px] text-warm-400">Membre de l'équipe</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                {loadingMessages ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}>
                        <Skeleton className="h-10 w-48 rounded-2xl" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-warm-300 py-16">
                    <MessageSquare size={30} aria-hidden="true" />
                    <p className="font-sans text-[12px]">Commencez la conversation</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([date, msgs]) => (
                    <div key={date} className="flex flex-col gap-2">
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px" style={{ background: "#F0EFE9" }} />
                        <span className="font-mono text-[10px] text-warm-400 shrink-0">{date}</span>
                        <div className="flex-1 h-px" style={{ background: "#F0EFE9" }} />
                      </div>
                      {msgs.map(m => (
                        <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className="max-w-[72%] px-4 py-2.5 font-sans text-[13px] leading-relaxed"
                            style={m.mine ? {
                              background: "linear-gradient(140deg,#6366F1,#4338CA)",
                              color: "#fff",
                              borderRadius: "18px 18px 4px 18px",
                              boxShadow: "0 1px 4px rgba(99,102,241,.22)",
                            } : {
                              background: "#F4F4F2",
                              color: "#1A1F2E",
                              borderRadius: "18px 18px 18px 4px",
                            }}
                          >
                            {m.body}
                            <div className={`font-mono text-[10px] mt-1 text-right ${m.mine ? "text-indigo-200" : "text-warm-400"}`}>
                              {m.created_at}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="px-5 py-3.5 flex items-center gap-3 shrink-0"
                style={{ borderTop: "1px solid #DEDED8", background: "#FAFAFA" }}
              >
                <input
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Écrivez un message…"
                  className="flex-1 px-4 py-2.5 rounded-xl border font-sans text-[13px] text-ink-900 placeholder:text-warm-300 outline-none transition-colors"
                  style={{ borderColor: "#DEDED8", background: "#fff" }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                  }}
                />
                <button
                  type="submit"
                  disabled={!body.trim() || sendMutation.isPending}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer disabled:opacity-40 transition-opacity shrink-0"
                  style={{ background: "linear-gradient(140deg,#6366F1,#4338CA)", boxShadow: "0 2px 8px rgba(99,102,241,.28)" }}
                >
                  <Send size={15} color="#fff" aria-hidden="true" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

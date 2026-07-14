"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { ORModel, DEFAULT_SHORTLIST } from "@/lib/openrouter/models";
import { startMatch } from "@/app/actions";
import { Search, Loader2, AlertCircle, ArrowRight, Check, Sparkles, Brain, Cpu, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";

interface ModelSelectorProps {
  models: ORModel[];
}

// Helper to fake extra premium data since OpenRouter API doesn't provide these reliably
function getPremiumStats(model: ORModel) {
  const isReasoning = model.name.toLowerCase().includes("instruct") || model.name.toLowerCase().includes("r1") || model.name.toLowerCase().includes("o1");
  const speed = model.context_length < 32000 ? "Ultra-fast" : model.context_length > 100000 ? "Heavy" : "Balanced";
  const popularity = DEFAULT_SHORTLIST.includes(model.id) ? "Top Pick" : null;
  const initial = model.provider.charAt(0).toUpperCase();
  return { isReasoning, speed, popularity, initial };
}

export function ModelSelector({ models }: ModelSelectorProps) {
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState<string | null>(null);

  const [whiteModel, setWhiteModel] = useState<string>(DEFAULT_SHORTLIST[0]);
  const [blackModel, setBlackModel] = useState<string>(DEFAULT_SHORTLIST[1]);
  const [activeSelection, setActiveSelection] = useState<"white" | "black">("white");

  const [mode, setMode] = useState<"ai_vs_ai" | "human_vs_ai">("ai_vs_ai");
  const [humanColor, setHumanColor] = useState<"white" | "black">("white");

  const [recentModels, setRecentModels] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentModels");
      if (stored) setRecentModels(JSON.parse(stored));
    } catch { }
  }, []);

  const handleSelect = (id: string) => {
    if (mode === "human_vs_ai") {
      if (humanColor === "white") setBlackModel(id);
      else setWhiteModel(id);
    } else {
      if (activeSelection === "white") setWhiteModel(id);
      else setBlackModel(id);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "human_vs_ai" && !user) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`
        }
      });
      return;
    }

    const actualWhite = mode === "human_vs_ai" && humanColor === "white" ? "human" : whiteModel;
    const actualBlack = mode === "human_vs_ai" && humanColor === "black" ? "human" : blackModel;

    const newRecent = [actualWhite, actualBlack, ...recentModels]
      .filter((v, i, a) => v !== "human" && a.indexOf(v) === i)
      .slice(0, 5);
    setRecentModels(newRecent);
    localStorage.setItem("recentModels", JSON.stringify(newRecent));

    startTransition(async () => {
      const formData = new FormData();
      formData.append("mode", mode);
      formData.append("whiteModel", actualWhite);
      formData.append("blackModel", actualBlack);

      const res = await startMatch(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  const providers = Array.from(new Set(models.map(m => m.provider))).sort();

  const showFullCatalog = search.length > 0 || providerFilter !== null;
  const displayModels = useMemo(() => {
    return showFullCatalog
      ? models.filter(m => {
        if (providerFilter === "FREE" && !m.is_free) return false;
        if (providerFilter && providerFilter !== "FREE" && m.provider !== providerFilter) return false;
        if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.id.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      : models.filter(m => DEFAULT_SHORTLIST.includes(m.id));
  }, [models, showFullCatalog, providerFilter, search]);

  const getModelDetails = (id: string) => models.find(m => m.id === id) || { id, name: id, provider: "unknown", context_length: 0, is_free: false } as ORModel;

  const renderActiveCard = (player: "white" | "black", id: string) => {
    const isHuman = mode === "human_vs_ai" && humanColor === player;
    const model = isHuman ? null : getModelDetails(id);
    const stats = model ? getPremiumStats(model) : null;
    const isTarget = mode === "human_vs_ai" ? (humanColor !== player) : (activeSelection === player);

    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        onClick={() => {
          if (mode === "human_vs_ai") setHumanColor(player === "white" ? "white" : "black");
          else setActiveSelection(player);
        }}
        className={`relative flex-1 p-6 rounded-2xl cursor-pointer border backdrop-blur-xl transition-all duration-500 overflow-hidden ${isTarget
            ? "border-amber-500/50 bg-charcoal-800/80 shadow-[0_8px_32px_-8px_rgba(212,175,55,0.2)]"
            : "border-charcoal-700/50 bg-charcoal-900/40 hover:border-charcoal-500/50"
          }`}
      >
        {isTarget && (
          <motion.div
            layoutId="active-glow"
            className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 to-transparent blur-xl pointer-events-none"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        <div className="relative z-10 flex items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-display font-bold shadow-inner border ${isTarget ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-charcoal-800 text-charcoal-300 border-charcoal-700"
            }`}>
            {isHuman ? <UserIcon /> : stats?.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-charcoal-400 mb-1.5 flex items-center gap-2">
              {player} MODEL {isTarget && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <div className={`font-display font-bold text-xl truncate mb-2 ${isTarget ? "text-amber-500" : "text-charcoal-100"}`}>
              {isHuman ? "Human Player" : model?.name}
            </div>
            {!isHuman && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono text-charcoal-500 flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> {(model!.context_length / 1000).toFixed(0)}k</span>
                <span className="text-xs font-mono text-charcoal-500 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> {stats?.speed}</span>
                {model?.is_free && <span className="text-[0.65rem] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Free</span>}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-16 pb-32">

      {/* Mode Toggle (Segmented Control) */}
      <div className="flex justify-center">
        <div className="flex bg-charcoal-900/80 backdrop-blur-md rounded-full p-1.5 border border-white/5 shadow-2xl relative">
          <button
            onClick={() => { setMode("ai_vs_ai"); setActiveSelection("white"); }}
            className={`relative px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-colors z-10 ${mode === "ai_vs_ai" ? "text-amber-950" : "text-charcoal-400 hover:text-charcoal-200"}`}
          >
            {mode === "ai_vs_ai" && <motion.div layoutId="mode-bg" className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full -z-10 shadow-lg" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            AI vs AI
          </button>
          <button
            onClick={() => setMode("human_vs_ai")}
            className={`relative px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-colors z-10 ${mode === "human_vs_ai" ? "text-amber-950" : "text-charcoal-400 hover:text-charcoal-200"}`}
          >
            {mode === "human_vs_ai" && <motion.div layoutId="mode-bg" className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full -z-10 shadow-lg" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            Human vs AI
          </button>
        </div>
      </div>

      {/* VS Section */}
      <div className="flex flex-col lg:flex-row items-center gap-6 relative">
        {renderActiveCard("white", whiteModel)}

        {/* Animated VS Circle */}
        <div className="relative shrink-0 w-20 h-20 flex items-center justify-center z-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-amber-500/30 border-dashed"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-2 rounded-full bg-amber-500/10 blur-md"
          />
          <div className="w-14 h-14 bg-charcoal-900 border border-amber-500/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <span className="font-display font-black italic text-amber-500 text-lg">VS</span>
          </div>
        </div>

        {renderActiveCard("black", blackModel)}
      </div>

      {/* CTA Button */}
      <div className="flex flex-col items-center">
        <motion.button
          whileHover={{ y: -2, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(212,175,55,0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          disabled={isPending}
          className="group relative w-full max-w-md h-20 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-amber-950 font-bold overflow-hidden disabled:opacity-50 disabled:pointer-events-none shadow-[0_10px_30px_-10px_rgba(212,175,55,0.3)] transition-all"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="flex items-center gap-3 text-xl tracking-wide uppercase">
              {isPending ? <Loader2 className="animate-spin w-6 h-6" /> : (mode === "human_vs_ai" && !user ? "Continue with Google to Play" : "Spawn Arena")}
              {!isPending && <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />}
            </div>
            <span className="text-amber-950/70 text-xs font-semibold mt-1">
              {mode === "human_vs_ai" && !user ? "Sign in required for human matches" : "Start autonomous AI battle"}
            </span>
          </div>
        </motion.button>

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-200 flex items-start gap-3 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <div>
              <strong className="block text-sm mb-1 text-red-300">Validation Failed</strong>
              <span className="text-xs font-mono opacity-80">{error}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Catalog Section */}
      <div className="flex flex-col gap-8 bg-charcoal-900/30 rounded-[32px] p-8 md:p-12 border border-white/5 backdrop-blur-3xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-display font-bold text-charcoal-100">
              {mode === "human_vs_ai" ? "Select AI Opponent" : (activeSelection === "white" ? "Select White Model" : "Select Black Model")}
            </h2>
            <span className="px-3 py-1 bg-charcoal-800 border border-charcoal-700 text-charcoal-400 text-xs font-bold rounded-full uppercase tracking-wider shadow-inner">
              {displayModels.length} Models
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500 group-focus-within:text-amber-500 transition-colors z-10" />
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-charcoal-950 border border-charcoal-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none text-charcoal-100 placeholder:text-charcoal-600 transition-all shadow-inner relative z-0"
              />
              <div className="absolute inset-0 rounded-xl bg-amber-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={providerFilter || ""}
                onChange={e => setProviderFilter(e.target.value || null)}
                className="w-full sm:w-56 h-12 px-4 rounded-xl bg-charcoal-950 border border-charcoal-800 focus:border-amber-500/50 outline-none text-charcoal-200 appearance-none font-medium shadow-inner cursor-pointer hover:border-charcoal-600 transition-colors"
              >
                <option value="">🌐 All Providers</option>
                <option value="FREE">💰 Free Models</option>
                {providers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {displayModels.map(m => {
              let isSelected = false;
              if (mode === "human_vs_ai") {
                isSelected = (humanColor === "white" ? blackModel === m.id : whiteModel === m.id);
              } else {
                isSelected = activeSelection === "white" ? whiteModel === m.id : blackModel === m.id;
              }
              const stats = getPremiumStats(m);

              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4, backgroundColor: "rgba(23, 23, 23, 1)" }}
                  onClick={() => handleSelect(m.id)}
                  className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${isSelected
                      ? "bg-charcoal-800 border-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                      : "bg-charcoal-950 border-charcoal-800/50 hover:border-amber-500/30"
                    }`}
                >
                  {/* Subtle Background Glow on Hover */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col h-full gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-display font-bold shrink-0 border ${isSelected ? "bg-amber-500/20 text-amber-500 border-amber-500/40" : "bg-charcoal-800 text-charcoal-300 border-charcoal-700 group-hover:border-amber-500/30"
                          }`}>
                          {stats.initial}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-charcoal-100 line-clamp-1 group-hover:text-amber-500 transition-colors" title={m.name}>
                            {m.name}
                          </h3>
                          <p className="text-[0.7rem] uppercase tracking-wider text-charcoal-400 font-semibold">{m.provider}</p>
                        </div>
                      </div>

                      {isSelected ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                          <Check className="w-3.5 h-3.5 text-amber-950 stroke-[3]" />
                        </motion.div>
                      ) : (
                        stats.popularity && (
                          <div className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md text-[0.65rem] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {stats.popularity}
                          </div>
                        )
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-charcoal-800/50">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-charcoal-900 border border-charcoal-800 text-charcoal-300 text-xs font-mono">
                        <Cpu className="w-3 h-3 text-charcoal-500" />
                        {(m.context_length / 1000).toFixed(0)}k
                      </div>

                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-charcoal-900 border border-charcoal-800 text-charcoal-300 text-xs font-mono">
                        <Zap className="w-3 h-3 text-amber-500/70" />
                        {stats.speed}
                      </div>

                      {stats.isReasoning && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-charcoal-900 border border-charcoal-800 text-charcoal-300 text-xs font-mono">
                          <Brain className="w-3 h-3 text-purple-400" />
                          Think
                        </div>
                      )}

                      {m.is_free && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-xs font-mono ml-auto">
                          Free
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

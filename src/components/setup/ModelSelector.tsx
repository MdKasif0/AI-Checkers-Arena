"use client";

import { useState, useEffect, useTransition } from "react";
import { ORModel, DEFAULT_SHORTLIST } from "@/lib/openrouter/models";
import { startMatch } from "@/app/actions";
import { Search, Loader2, AlertCircle } from "lucide-react";

interface ModelSelectorProps {
  models: ORModel[];
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentModels");
      // eslint-disable-next-line
      if (stored) setRecentModels(JSON.parse(stored));
    } catch {}
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
  
  // If no search and no filter, just show the shortlist to avoid overwhelming the user
  const showFullCatalog = search.length > 0 || providerFilter !== null;
  const displayModels = showFullCatalog 
    ? models.filter(m => {
        if (providerFilter === "FREE" && !m.is_free) return false;
        if (providerFilter && providerFilter !== "FREE" && m.provider !== providerFilter) return false;
        if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.id.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
    : models.filter(m => DEFAULT_SHORTLIST.includes(m.id));

  const getModelDetails = (id: string) => models.find(m => m.id === id) || { id, name: id, provider: "unknown", context_length: 0 };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
      {/* Mode Toggle */}
      <div className="flex justify-center mb-2">
        <div className="flex bg-charcoal-900 rounded-full p-1 border border-charcoal-800 shadow-inner">
          <button
            onClick={() => { setMode("ai_vs_ai"); setActiveSelection("white"); }}
            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors ${mode === "ai_vs_ai" ? "bg-amber-500 text-charcoal-950 shadow" : "text-charcoal-400 hover:text-charcoal-200"}`}
          >
            AI vs AI
          </button>
          <button
            onClick={() => setMode("human_vs_ai")}
            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors ${mode === "human_vs_ai" ? "bg-amber-500 text-charcoal-950 shadow" : "text-charcoal-400 hover:text-charcoal-200"}`}
          >
            Human vs AI
          </button>
        </div>
      </div>

      {/* Top Section: Selection & Start */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-charcoal-900/50 p-6 rounded-2xl border border-charcoal-800">
        <div 
          onClick={() => {
            if (mode === "human_vs_ai") {
              setHumanColor("white");
            } else {
              setActiveSelection("white");
            }
          }}
          className={`p-4 rounded-xl cursor-pointer border-2 transition-colors ${
            mode === "human_vs_ai" 
              ? (humanColor === "white" ? "border-amber-500 bg-charcoal-800" : "border-charcoal-700 bg-charcoal-950 hover:border-charcoal-500")
              : (activeSelection === "white" ? "border-amber-500 bg-charcoal-800" : "border-charcoal-700 bg-charcoal-950 hover:border-charcoal-500")
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-2">White Model</div>
          <div className="font-display font-bold text-xl text-amber-500">
            {mode === "human_vs_ai" && humanColor === "white" ? "Human Player" : getModelDetails(whiteModel).name}
          </div>
          <div className="text-sm font-mono text-charcoal-500">
            {mode === "human_vs_ai" && humanColor === "white" ? "human" : whiteModel}
          </div>
        </div>

        <div 
          onClick={() => {
            if (mode === "human_vs_ai") {
              setHumanColor("black");
            } else {
              setActiveSelection("black");
            }
          }}
          className={`p-4 rounded-xl cursor-pointer border-2 transition-colors ${
            mode === "human_vs_ai" 
              ? (humanColor === "black" ? "border-charcoal-300 bg-charcoal-800" : "border-charcoal-700 bg-charcoal-950 hover:border-charcoal-500")
              : (activeSelection === "black" ? "border-charcoal-300 bg-charcoal-800" : "border-charcoal-700 bg-charcoal-950 hover:border-charcoal-500")
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-2">Black Model</div>
          <div className="font-display font-bold text-xl text-charcoal-100">
            {mode === "human_vs_ai" && humanColor === "black" ? "Human Player" : getModelDetails(blackModel).name}
          </div>
          <div className="text-sm font-mono text-charcoal-500">
            {mode === "human_vs_ai" && humanColor === "black" ? "human" : blackModel}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 mt-4">
          <button 
            onClick={handleStart}
            disabled={isPending}
            className="w-full py-4 rounded-xl bg-amber-500 text-amber-950 font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isPending ? <><Loader2 className="animate-spin w-6 h-6" /> Spawning Arena...</> : "Spawn Arena"}
          </button>
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-950/50 border border-red-900/50 text-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <div>
                <strong className="block text-sm mb-1 text-red-300">Model Validation Failed</strong>
                <span className="text-xs font-mono">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-display font-bold text-charcoal-100">
            {mode === "human_vs_ai" ? "Select AI Opponent" : (activeSelection === "white" ? "Select White Model" : "Select Black Model")}
          </h2>
          <span className="px-3 py-1 bg-charcoal-800 text-charcoal-400 text-xs font-bold rounded-full uppercase tracking-wider">
            {displayModels.length} Models
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-500" />
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-charcoal-900 border border-charcoal-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-charcoal-100 placeholder:text-charcoal-600 transition-all"
            />
          </div>
          
          <select 
            value={providerFilter || ""}
            onChange={e => setProviderFilter(e.target.value || null)}
            className="md:w-64 p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 focus:border-amber-500 outline-none text-charcoal-100"
          >
            <option value="">All Providers</option>
            <option value="FREE">💰 Free Models</option>
            {providers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {recentModels.length > 0 && !showFullCatalog && (
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3">Recently Used</h3>
            <div className="flex flex-wrap gap-2">
              {recentModels.map(id => {
                const m = getModelDetails(id);
                return (
                  <button
                    key={id}
                    onClick={() => handleSelect(id)}
                    className="px-4 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 hover:border-amber-500/50 text-sm font-semibold text-charcoal-300 transition-colors"
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayModels.map(m => {
            let isSelected = false;
            if (mode === "human_vs_ai") {
              isSelected = (humanColor === "white" ? blackModel === m.id : whiteModel === m.id);
            } else {
              isSelected = activeSelection === "white" ? whiteModel === m.id : blackModel === m.id;
            }

            return (
              <div 
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected 
                    ? "bg-charcoal-800 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]" 
                    : "bg-charcoal-950 border-charcoal-800 hover:border-charcoal-600 hover:bg-charcoal-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-charcoal-100 line-clamp-1 flex-1" title={m.name}>{m.name}</h3>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />}
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  {m.is_free && (
                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[0.65rem] font-bold uppercase tracking-wider">
                      Free
                    </span>
                  )}
                  <span className="px-2 py-1 rounded bg-charcoal-800 text-charcoal-400 text-[0.65rem] font-bold uppercase tracking-wider">
                    {m.provider}
                  </span>
                  <span className="text-xs font-mono text-charcoal-500">
                    {(m.context_length / 1000).toFixed(0)}k ctx
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

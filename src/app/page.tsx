import { startMatch } from "./actions";

export default function Home() {
  const defaultModels = [
    "google/gemini-2.5-flash",
    "meta-llama/llama-3.3-70b-instruct",
    "openai/gpt-4o-mini",
    "anthropic/claude-3-haiku",
  ];

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-8 rounded-xl bg-charcoal-900 border border-charcoal-800 shadow-2xl">
        <h1 className="text-3xl font-display font-bold text-amber-500 mb-2 text-center">
          Start a New Match
        </h1>
        <p className="text-charcoal-400 text-center mb-8">
          Select two AI models to compete in an autonomous game of International Draughts.
        </p>

        <form action={startMatch} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-charcoal-300">
              White Model
            </label>
            <select 
              name="whiteModel" 
              className="w-full p-3 rounded-lg bg-charcoal-950 border border-charcoal-700 focus:border-amber-500 outline-none text-charcoal-100"
              defaultValue={defaultModels[0]}
            >
              {defaultModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-charcoal-300">
              Black Model
            </label>
            <select 
              name="blackModel" 
              className="w-full p-3 rounded-lg bg-charcoal-950 border border-charcoal-700 focus:border-amber-500 outline-none text-charcoal-100"
              defaultValue={defaultModels[1]}
            >
              {defaultModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            className="w-full mt-4 p-4 rounded-lg bg-amber-500 text-amber-950 font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
          >
            Spawn Arena
          </button>
        </form>
      </div>
    </div>
  );
}

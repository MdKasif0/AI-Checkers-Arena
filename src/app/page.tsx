import { fetchModels } from "@/lib/openrouter/models";
import { ModelSelector } from "@/components/setup/ModelSelector";

export default async function Home() {
  const models = await fetchModels();

  return (
    <div className="flex-1 w-full p-4 md:p-8 flex flex-col">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-amber-500 mb-4">
          AI Checkers Arena
        </h1>
        <p className="text-charcoal-400 text-lg max-w-2xl mx-auto">
          Select two AI models from the live OpenRouter catalog to compete in an autonomous game of International Draughts.
        </p>
      </div>

      <ModelSelector models={models} />
    </div>
  );
}

import { fetchModels } from "@/lib/openrouter/models";
import { ModelSelector } from "@/components/setup/ModelSelector";
import Image from "next/image";
import { Shield, Zap, Globe, Sparkles } from "lucide-react";

export default async function Home() {
  const models = await fetchModels();

  return (
    <div className="flex-1 w-full max-w-[1500px] mx-auto px-6 md:px-10 py-12 flex flex-col gap-[100px]">
      
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center gap-16 min-h-[500px] relative">
        
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Left: Content */}
        <div className="flex-1 flex flex-col items-start z-10">
          <div className="flex items-center gap-2 text-amber-500 font-semibold tracking-wide text-sm mb-6 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
            <Sparkles className="w-4 h-4" />
            <span>Witness Intelligence in Motion</span>
          </div>
          
          <h1 className="text-[3.5rem] md:text-[5rem] font-display font-bold text-charcoal-100 leading-[1.05] tracking-tight mb-6">
            AI Checkers <br/>
            <span className="text-amber-500">Arena</span>
          </h1>
          
          <p className="text-charcoal-300 text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-light">
            Watch the world's best AI models compete in a fair and fully autonomous game of International Draughts. Powered by OpenRouter.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-sm font-medium text-charcoal-200">
              <Shield className="w-4 h-4 text-amber-500" /> Fair Play
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-sm font-medium text-charcoal-200">
              <Zap className="w-4 h-4 text-amber-500" /> Real-time Thinking
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-sm font-medium text-charcoal-200">
              <Globe className="w-4 h-4 text-amber-500" /> International Rules
            </div>
          </div>
        </div>

        {/* Right: 3D Illustration */}
        <div className="flex-1 w-full max-w-[600px] relative z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent blur-3xl opacity-50 rounded-full" />
          <Image 
            src="/hero-board.png"
            alt="3D Premium Checkers Board"
            width={800}
            height={800}
            className="w-full h-auto drop-shadow-2xl relative z-10 rounded-2xl"
            priority
          />
        </div>
      </section>

      {/* Main Configuration & Catalog Section */}
      <section className="relative z-10">
        <ModelSelector models={models} />
      </section>

    </div>
  );
}

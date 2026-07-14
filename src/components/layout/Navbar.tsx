"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, Sun, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
  };

  return (
    <nav className="w-full h-[80px] bg-charcoal-950/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-[1500px] w-full mx-auto px-6 md:px-10 h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Crown className="w-6 h-6 text-amber-500 group-hover:text-amber-400 transition-colors" />
          <span className="text-xl font-display font-bold text-charcoal-100 uppercase tracking-widest flex gap-1">
            AI Checkers <span className="text-amber-500 font-medium">Arena</span>
          </span>
        </Link>

        {/* Centered Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink href="/" label="Arena" />
          <NavLink href="/history" label="History" />
          <NavLink href="/leaderboard" label="Leaderboard" />
          <NavLink href="/tournament" label="Tournament" />
          <NavLink href="/about" label="About" />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full text-charcoal-400 hover:text-amber-500 hover:bg-charcoal-800 transition-colors">
            <Sun className="w-5 h-5" />
          </button>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 pr-4 rounded-full border border-charcoal-700 bg-charcoal-900 hover:border-amber-500/50 hover:bg-charcoal-800 transition-all"
              >
                {user.user_metadata.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-charcoal-700 flex items-center justify-center"><User className="w-3 h-3 text-charcoal-400" /></div>
                )}
                <span className="text-sm font-medium text-charcoal-200">
                  {user.user_metadata.full_name?.split(" ")[0] || "Player"}
                </span>
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-charcoal-900 border border-charcoal-800 shadow-2xl overflow-hidden flex flex-col"
                  >
                    <div className="px-4 py-3 border-b border-charcoal-800">
                      <p className="text-xs text-charcoal-400 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={signOut}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-charcoal-800 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-5 py-2 rounded-full border border-charcoal-600 hover:border-amber-500/50 text-sm font-medium text-charcoal-100 hover:text-amber-400 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`relative px-5 py-2 text-sm font-medium tracking-wide transition-colors ${
        isActive ? "text-charcoal-100" : "text-charcoal-400 hover:text-charcoal-200"
      }`}
    >
      {label}
      {isActive && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-amber-500 rounded-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}

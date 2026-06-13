"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("operator@urbanpulse.ai");
    const [password, setPassword] = useState("demo123");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Wait 1 second to simulate network latency for the demo
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (email !== "operator@urbanpulse.ai" && email !== "commuter@urbanpulse.ai") {
                throw new Error("Invalid demo credentials.");
            }

            // Simulate setting JWT
            localStorage.setItem("urbanpulse_token", "demo_jwt_token_123");
            localStorage.setItem("urbanpulse_role", email.split('@')[0]);

            router.push("/");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-blue-500/30">
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/-0.1278,51.5074,12,0/1200x800?access_token=pk.eyJ1IjoiZHVtbXkiLCJhIjoiY2R1bW15In0.dummy')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
            
            <div className="w-full max-w-md relative z-10">
                <div className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                            <Activity className="w-8 h-8 text-blue-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">UrbanPulse AI</h1>
                        <p className="text-zinc-400 text-sm mt-1">Predictive Transit Intelligence</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3 mt-6 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? "Authenticating..." : "Sign In to Control Center"}
                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                        <p className="text-xs text-zinc-500 mb-3">Demo Accounts</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => setEmail("operator@urbanpulse.ai")} className="text-sm text-zinc-400 hover:text-white transition-colors">
                                operator@urbanpulse.ai
                            </button>
                            <button onClick={() => setEmail("commuter@urbanpulse.ai")} className="text-sm text-zinc-400 hover:text-white transition-colors">
                                commuter@urbanpulse.ai
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

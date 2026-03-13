"use client";

import Link from "next/link";
import { ArrowRight, Activity, Brain, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 z-0" />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/30 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/20 blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 z-10 relative">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-emerald-400 text-sm font-medium backdrop-blur-sm"
                    >
                        <Activity size={16} />
                        <span>AI-Powered Diagnostics</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-white"
                    >
                        Detect Lung Nodules with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Precision AI</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed"
                    >
                        Advanced 3D U-Net Deep Learning architecture for automated localization and malignancy classification of pulmonary nodules in CT scans.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4 pt-4"
                    >
                        <Link href="/analyze">
                            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[200px] h-12 text-lg shadow-lg shadow-emerald-500/20">
                                Start Analysis <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/performance">
                            <Button variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white min-w-[200px] h-12 text-lg">
                                View Metrics
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats / Features Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left"
                    >
                        <FeatureCard
                            icon={<Brain className="h-6 w-6 text-emerald-400" />}
                            title="3D Deep Learning"
                            desc="Analyzes full volumetric data using 3D U-Net architectures, preserving spatial context."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-6 w-6 text-cyan-400" />}
                            title="High Sensitivity"
                            desc="Achieves 94.2% sensitivity with significant reduction in false positives (3 FPs/scan)."
                        />
                        <FeatureCard
                            icon={<Activity className="h-6 w-6 text-purple-400" />}
                            title="Instant Triage"
                            desc="Acts as a second reader to clear normal scans quickly and highlight suspicious regions."
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-colors">
            <div className="mb-4 p-3 rounded-lg bg-slate-900/50 w-fit">{icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{desc}</p>
        </div>
    );
}

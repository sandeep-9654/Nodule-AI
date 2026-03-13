"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, Play, Pause, AlertTriangle, CheckCircle2, Scan, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import VolumeVisualizer from "@/components/VolumeVisualizer";

export default function AnalyzePage() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultsReady, setResultsReady] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const startAnalysis = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setProgress(0);
        setResultsReady(false);

        const progressInterval = setInterval(() => {
            setProgress((prev) => Math.min(prev + 5, 90));
        }, 300);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("http://127.0.0.1:5001/predict", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Analysis failed");
            }

            const data = await response.json();
            console.log("Inference Result:", data);
            setResults(data);

            clearInterval(progressInterval);
            setProgress(100);
            setTimeout(() => {
                setIsAnalyzing(false);
                setResultsReady(true);
            }, 500);
        } catch (error: any) {
            console.error(error);
            clearInterval(progressInterval);
            setIsAnalyzing(false);
            alert(error.message || "Analysis failed. Ensure backend is running on port 5001.");
        }
    };

    const isMalignant = results?.is_malignant;

    return (
        <div className="p-8 h-full flex flex-col gap-6 max-w-[1600px] mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Analyze CT Patch</h1>
                <p className="text-slate-400">Upload a .npy 3D patch file (LUNA-22 format) for malignancy classification</p>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">

                {/* Left Panel: Upload & Visualization */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div
                        className="flex-1 rounded-2xl bg-slate-900 border border-slate-700 relative overflow-hidden flex items-center justify-center group"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        {!file ? (
                            <div className="text-center p-10 transition-transform group-hover:scale-105">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <UploadCloud className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">Drag & Drop 3D Patch</h3>
                                <p className="text-slate-500 mb-6">Upload a .npy file (3D numpy array, e.g. 128×128×64)</p>
                                <input
                                    type="file"
                                    className="hidden"
                                    id="file-upload"
                                    accept=".npy"
                                    onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                                />
                                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                                    Browse Files
                                </Button>
                            </div>
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                                {resultsReady ? (
                                    <div className="flex flex-col w-full h-full p-4 gap-4">
                                        {/* Classification Result Visualization - 3D Volume */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="w-full flex-1 relative min-h-[350px]"
                                        >
                                            <VolumeVisualizer 
                                                isMalignant={isMalignant} 
                                                probability={results?.malignancy_prob || "0%"}
                                                statusText={results?.message || "Analysis Complete"}
                                            />
                                        </motion.div>

                                        {/* Diagnostic description moved to the bottom */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="mt-auto"
                                        >
                                            {results?.description && (
                                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/60 shadow-lg text-left">
                                                    <p className="text-slate-300 text-sm leading-relaxed">
                                                        {results.description}
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Scan className="w-16 h-16 text-emerald-500 animate-pulse mb-4" />
                                        <p className="text-emerald-400 font-medium">Ready to Process</p>
                                        <p className="text-slate-500 text-sm">{file.name}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Analysis Overlay */}
                        <AnimatePresence>
                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                                    <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                                        <motion.div
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-emerald-400 font-mono">CLASSIFYING NODULE... {progress}%</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Model Info Bar */}
                    <div className="h-16 bg-slate-900 border border-slate-700 rounded-xl flex items-center px-6 gap-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>LightweightUNet3D</span>
                        </div>
                        <div className="h-6 w-px bg-slate-700" />
                        <span className="text-xs text-slate-500 font-mono">LUNA-22 (ISMI) Dataset</span>
                        <div className="h-6 w-px bg-slate-700" />
                        <span className="text-xs text-slate-500 font-mono">Input: 64×64×32</span>
                        <div className="h-6 w-px bg-slate-700" />
                        <span className="text-xs text-slate-500 font-mono">Binary Classification</span>
                    </div>
                </div>

                {/* Right Panel: Results */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Activity className="text-emerald-500" />
                        Classification Results
                    </h2>

                    {!resultsReady ? (
                        <div className="flex flex-1 flex-col items-center justify-center text-center p-8 border border-dashed border-slate-700 rounded-xl bg-slate-900/50">
                            <Scan className="w-12 h-12 text-slate-700 mb-4" />
                            <p className="text-slate-500 text-sm">Upload a .npy patch file and run classification.</p>
                            <Button
                                className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600"
                                disabled={!file || isAnalyzing}
                                onClick={startAnalysis}
                            >
                                {isAnalyzing ? "Processing..." : "Run AI Classification"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Primary Result */}
                            <div className={cn(
                                "p-4 rounded-xl border",
                                isMalignant
                                    ? "bg-red-500/10 border-red-500/20"
                                    : "bg-emerald-500/10 border-emerald-500/20"
                            )}>
                                <div className="flex items-start justify-between">
                                    <div className={cn(
                                        "flex items-center gap-2 font-semibold",
                                        isMalignant ? "text-red-400" : "text-emerald-400"
                                    )}>
                                        {isMalignant ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                                        <span>{results?.message || "Analysis Complete"}</span>
                                    </div>
                                    <span className={cn(
                                        "text-xs px-2 py-1 rounded",
                                        isMalignant
                                            ? "bg-red-500/20 text-red-300"
                                            : "bg-emerald-500/20 text-emerald-300"
                                    )}>
                                        {results?.confidence_level || "Unknown"} Confidence
                                    </span>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <p className="text-slate-500 text-xs uppercase mb-1">Malignancy Probability</p>
                                    <p className={cn(
                                        "text-lg font-mono font-bold",
                                        isMalignant ? "text-red-400" : "text-emerald-400"
                                    )}>
                                        {results?.malignancy_prob || "0%"}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <p className="text-slate-500 text-xs uppercase mb-1">Classification</p>
                                    <p className={cn(
                                        "text-lg font-bold",
                                        isMalignant ? "text-red-400" : "text-emerald-400"
                                    )}>
                                        {isMalignant ? "Malignant" : "Benign"}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <p className="text-slate-500 text-xs uppercase mb-1">Model</p>
                                    <p className="text-slate-300 text-sm">{results?.model || "LightweightUNet3D"}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <p className="text-slate-500 text-xs uppercase mb-1">Dataset</p>
                                    <p className="text-slate-300 text-sm">{results?.dataset || "LUNA-22"}</p>
                                </div>
                            </div>

                            {/* File Info */}
                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <p className="text-slate-500 text-xs uppercase mb-1">File</p>
                                <p className="text-slate-300 text-sm font-mono truncate">{results?.filename || file?.name}</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-800">
                                <Button variant="outline" className="w-full text-slate-400" onClick={() => { setFile(null); setResultsReady(false); setResults(null); }}>
                                    Analyze Another Patch
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}

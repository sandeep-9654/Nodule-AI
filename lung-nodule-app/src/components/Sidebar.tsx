"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileScan, BarChart3, Info, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarData() {
    const pathname = usePathname();

    const NAV_ITEMS = [
        { label: "Overview", href: "/", icon: LayoutDashboard },
        { label: "Analyze", href: "/analyze", icon: FileScan },
        { label: "Performance", href: "/performance", icon: BarChart3 },
        { label: "Project Info", href: "/info", icon: Info },
    ];

    return (
        <aside className="w-64 h-full border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex-col md:flex hidden">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Pill className="text-white h-6 w-6" />
                </div>
                <div>
                    <h1 className="font-bold text-white tracking-tight">Nodule AI</h1>
                    <p className="text-xs text-slate-500 font-medium">Volumetric CT Scan</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 group",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent"
                            )}
                        >
                            <item.icon size={20} className={cn(isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 m-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-emerald-400">System Online</span>
                </div>
                <div className="text-xs text-slate-500">
                    v2.4.0 (Stable) <br />
                    GPU: Active
                </div>
            </div>
        </aside>
    );
}

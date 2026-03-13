"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const frocData = [
    { fps: 0.125, sens: 0.65 },
    { fps: 0.25, sens: 0.78 },
    { fps: 0.5, sens: 0.85 },
    { fps: 1, sens: 0.895 },
    { fps: 2, sens: 0.92 },
    { fps: 3, sens: 0.942 },
    { fps: 4, sens: 0.95 },
    { fps: 8, sens: 0.965 },
];

const comparisonData = [
    { name: 'Manual', accuracy: 72, time: 100 },
    { name: '2D CNN', accuracy: 84, time: 45 },
    { name: '3D U-Net (Ours)', accuracy: 94.7, time: 15 },
];

export default function PerformancePage() {
    return (
        <div className="p-8 pb-20 max-w-[1600px] mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Model Performance</h1>
                <p className="text-slate-400">Evaluation metrics on LUNA16 dataset (888 scans).</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Sensitivity"
                    value="94.2%"
                    desc="@ 3 False Positives/scan"
                    trend="+12% vs 2D"
                />
                <MetricCard
                    title="Specificity"
                    value="96.1%"
                    desc="True Negative Rate"
                />
                <MetricCard
                    title="False Positives"
                    value="1.79"
                    desc="Average per scan"
                    trend="-94% vs Traditional"
                    trendGood={true}
                />
                <MetricCard
                    title="Inference Time"
                    value="12s"
                    desc="Per full volume"
                />
            </div>

            <Tabs defaultValue="froc" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-700">
                    <TabsTrigger value="froc">FROC Analysis</TabsTrigger>
                    <TabsTrigger value="comparison">System Comparison</TabsTrigger>
                </TabsList>

                <TabsContent value="froc" className="mt-6">
                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Free-Response ROC Curve</CardTitle>
                            <CardDescription>Sensitivity vs False Positives per Scan</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={frocData} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis
                                        dataKey="fps"
                                        label={{ value: 'False Positives / Scan', position: 'insideBottom', offset: -20, fill: '#94a3b8' }}
                                        stroke="#94a3b8"
                                    />
                                    <YAxis
                                        label={{ value: 'Sensitivity', angle: -90, position: 'insideLeft', offset: -10, fill: '#94a3b8' }}
                                        stroke="#94a3b8"
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sens"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="comparison" className="mt-6">
                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Benchmark Comparison</CardTitle>
                            <CardDescription>Accuracy vs Processing Time (Normalized)</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" stroke="#94a3b8" />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                                    <Tooltip
                                        cursor={{ fill: '#334155', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="accuracy" name="Accuracy (%)" fill="#10b981" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="time" name="Time Cost (Inv)" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function MetricCard({ title, value, desc, trend, trendGood }: { title: string, value: string, desc: string, trend?: string, trendGood?: boolean }) {
    return (
        <Card className="bg-slate-900 border-slate-700 hover:border-emerald-500/50 transition-colors">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-white mb-1">{value}</div>
                <p className="text-xs text-slate-500">{desc}</p>

                {trend && (
                    <div className={cn("mt-4 text-xs font-semibold px-2 py-1 rounded w-fit", trendGood ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-300")}>
                        {trend}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

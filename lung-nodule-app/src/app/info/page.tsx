import { ShieldCheck, Crosshair, Cpu } from "lucide-react";

export default function InfoPage() {
    return (
        <div className="p-8 h-full flex flex-col gap-6 max-w-[1600px] mx-auto overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Project Information</h1>
                <p className="text-slate-400">Details about Nodule AI and the Team behind it</p>
            </header>

            <div className="space-y-8">
                {/* Title & Paper section */}
                <section className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 leading-tight">
                        Volumetric CT Scan Analysis for Pulmonary Nodule Detection and Malignancy Classification Using 3D CNN Architectures
                    </h2>

                    <div className="space-y-6 text-slate-300 leading-relaxed">
                        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                            <h3 className="text-emerald-400 font-semibold mb-2">Developed By Team 14</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-3">
                                <div>
                                    <p className="font-medium text-slate-200">J. Ravindra Babu</p>
                                    <p className="text-slate-500 text-xs">Assistant Professor, Dept. of CSE–Data Science</p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-200">B. Sandeep Raghavendra</p>
                                    <p className="text-slate-500 text-xs">B. Tech Student, Dept. of CSE–Data Science</p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-200">A. Jaswanth kumar</p>
                                    <p className="text-slate-500 text-xs">B. Tech Student</p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-200">G. Vignan</p>
                                    <p className="text-slate-500 text-xs">B. Tech Student</p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-200">J. Ganesh</p>
                                    <p className="text-slate-500 text-xs">B. Tech Student</p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-200">K. Madhu</p>
                                    <p className="text-slate-500 text-xs">B. Tech Student</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-4 border-t border-slate-800 pt-3">
                                KKR & KSR INSTITUTE OF TECHNOLOGY AND SCIENCES, GUNTUR
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <ShieldCheck className="text-emerald-500 h-5 w-5" />
                                Abstract
                            </h3>
                            <p>
                                Lung cancer is a leading cause of cancer-related deaths worldwide. Early detection significantly improves survival rates. While doctors traditionally examine 2D CT scan slices individually to find pulmonary nodules, this process is difficult and time-consuming.
                            </p>
                            <p className="mt-3">
                                This project introduces a computer-aided diagnosis system that uses <strong>3D Convolutional Neural Networks (3D CNNs)</strong> to analyze entire lung volumes simultaneously. By utilizing volumetric data (voxels) instead of 2D pixels, the 3D approach better captures the shape, texture, and precise locations of malignant cells, providing a comprehensive and highly accurate nodule detection tool.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Workflow Section */}
                <section className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Cpu className="text-cyan-500 h-5 w-5" />
                        System Workflow
                    </h3>

                    <div className="grid gap-4">
                        <div className="flex gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800 flex items-center justify-center font-bold text-emerald-400">1</div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Preprocessing</h4>
                                <p className="text-sm text-slate-400">Normalizing and segmenting lung volumes from datasets like LUNA16 to focus specifically on the Region of Interest (ROI).</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-cyan-900/30 border border-cyan-800 flex items-center justify-center font-bold text-cyan-400">2</div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Nodule Detection</h4>
                                <p className="text-sm text-slate-400">Utilizing a 3D Region Proposal Network (RPN) or 3D U-Net architectures to precisely locate potential nodules within the full lung volume.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-purple-900/30 border border-purple-800 flex items-center justify-center font-bold text-purple-400">3</div>
                            <div>
                                <h4 className="text-white font-medium mb-1">Classification</h4>
                                <p className="text-sm text-slate-400">Implementing a robust 3D CNN classifier to evaluate the detected regions and label nodules as benign or malignant based on probability score thresholds.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="mt-8 text-center text-sm text-slate-600 pb-8">
                Created as a modern computer-aided diagnosis system to assist medical professionals in early lung cancer detection.
            </footer>
        </div>
    );
}
